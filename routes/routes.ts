import express, { Request, Response } from "express";
import getOctoKit from "../utils/octokit";
import { getAccessToken } from "../services/auth";
import base64 from "base-64";

export interface UserInterface {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company: null;
  blog: string;
  location: null;
  email: string;
  hireable: null;
  bio: string;
  twitter_username: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: Date;
  updated_at: Date;
}

const router = express.Router();

/**
 * When the user hits the /api/auth endpoint, it checks if the user is already logged in via GitHub
 * If the user is already logged in then it gives an appropriate response with 200 stauts
 * else it returns a status of 404 with suitable message
 */
router.get("/api/auth/", (req: Request, res: Response) => {
  const code = req.cookies["github-access-token"];

  if (code) {
    return res.status(200).json({ message: "User is already logged in!" });
  } else {
    return res.status(401).json({ message: "User is not logged in!" });
  }
});

/**
 * /api/auth/github - GitHub callback url
 *
 * When the user hits the /api/auth/github endpoint, we extract the code from the Request object
 * and set it as a httpOnly cookie and redirect to the homepage.
 *
 * This way we can check if the user is logged in through the httpOnly cookie in the
 * subsequent requests
 */
router.get("/api/auth/github", async (req: Request, res: Response) => {
  const code = req.query.code;

  if (!code) {
    throw new Error("No code!!");
  }

  const accessToken = await getAccessToken<typeof code>(code);
  res.cookie("github-access-token", accessToken, {
    httpOnly: true,
  });

  return res.redirect("http://localhost:3000");
});

/**
 * This controller will check if the user already has a "zettel-notes" repo in
 * his GiHub profile or not.
 */
router.get("/api/check/zettel-repo", async (req: Request, res: Response) => {
  const token = req.cookies["github-access-token"];
  if (!token) {
    throw new Error("No Token!");
  }

  const client = getOctoKit(token);
  const { data: user } = await client.request("GET /user", {});

  console.log(user.email);

  try {
    /**
     * Check if the 'zettel-backup' repo exists
     *
     * If the repo doesn't exists, an error will be thrown
     * and a new 'zettel-backup' will be created along with a backup.json file in it, in the catch block
     *
     * If the repo exists, just return the backup.json file's content.
     */
    const repo = await client.request(
      `GET /repos/${user.login}/zettel-backup`,
      {
        owner: user.login,
        repo: "zettel-backup",
      }
    );

    const { data: backupContent } = await client.request(
      `GET /repos/${user.login}/zettel-backup/contents/backup.json`,
      {
        owner: user.login,
        repo: "zettel-backup",
        path: "backup.json",
      }
    );

    return res.json({ backupContent: base64.decode(backupContent.content) });
  } catch (err) {
    /**
     * If "zettel-repo" doesn't exists, create one with the backup.json file
     */
    const repo = await client.request(`POST /user/repos`, {
      name: "zettel-backup",
      private: true,
    });

    await client.request(
      `PUT /repos/${user.login}/zettel-backup/contents/backup.json`,
      {
        owner: user.login,
        repo: "zettel-backup",
        path: "README.md",
        message: "🚀 first commit",
        committer: {
          name: user.login,
          email: user.email,
        },
        content: base64.encode(JSON.stringify([])),
      }
    );
    console.log("File written 👍");
    res.status(200).json({ backupContent: JSON.stringify([]) });
  }
});

export default router;
