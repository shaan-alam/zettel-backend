import express, { Request, Response } from "express";
import getOctoKit from "../utils/octokit";
import { getAccessToken, getGithubUser } from "../services/auth";
import base64 from "base-64";
import { getBackupFromGithub } from "../services/backup";
import { BackupInterface, UserInterface } from "../types/index";

const router = express.Router();

/**
 * When the user hits the /api/auth endpoint, it checks if the user is already logged in via GitHub
 * If the user is already logged in then it returns the currently logged in user and the backup content
 * to the front end else it returns a status of 401 with suitable message
 *
 * The endpoint "/api/auth" and "api/check/repo/zettel-backup" are not merged because in some cases
 * if there is an error in creating the repo on the server, then we probably also might not
 * be able to login the user.
 */
router.get("/api/auth/", async (req: Request, res: Response) => {
  const token = req.cookies["github-access-token"];

  try {
    const user = await getGithubUser(token);

    if (user) {
      return res.json({
        user,
      });
    } else {
      return res
        .status(401)
        .json({ message: "You are not logged in bitch 🖕" });
    }
  } catch (err) {
    console.log(err);
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
 * This controller will check if the user already has a "zettel-backup" repo in
 * his GiHub profile or not.
 */
router.get("/api/check/zettel-repo", async (req: Request, res: Response) => {
  const token = req.cookies["github-access-token"];
  if (!token) {
    throw new Error("No Token!");
  }

  const client = getOctoKit(token);
  const user = await getGithubUser(token);

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
      `GET /repos/${user?.login}/zettel-backup`,
      {
        owner: user?.login,
        repo: "zettel-backup",
      }
    );

    const backupContent = await getBackupFromGithub(token);

    return res.json({ backupContent: base64.decode(backupContent?.content) });
  } catch (err) {
    /**
     * If "zettel-repo" doesn't exists, create one with the backup.json file
     */
    const repo = await client.request(`POST /user/repos`, {
      name: "zettel-backup",
      private: true,
    });

    await client.request(
      `PUT /repos/${user?.login}/zettel-backup/contents/backup.json`,
      {
        owner: user?.login,
        repo: "zettel-backup",
        path: "README.md",
        message: "🚀 first commit",
        committer: {
          name: user?.login,
          email: user?.email,
        },
        content: base64.encode(JSON.stringify([])),
      }
    );

    console.log("File written 👍");
    res.status(200).json({ backupContent: JSON.stringify([]) });
  }
});

router.get("/api/backup", async (req: Request, res: Response) => {
  const token = req.cookies["github-access-token"];
  if (!token) {
    throw new Error("No Token!");
  }

  try {
    const backupContent = await getBackupFromGithub(token);

    return res.json({ backupContent: base64.decode(backupContent.content) });
  } catch (err) {
    res.status(404).json({ message: "No Backup data found!" });
  }
});

/**
 * This endpoint will return all the notes associated to a particular category
 */
router.get("/api/backup/:categoryId", async (req: Request, res: Response) => {
  const token = req.cookies["github-access-token"];
  if (!token) {
    throw new Error("No token!");
  }

  const { categoryId } = req.params;
  let filteredNotes;
  try {
    const backupContent = await getBackupFromGithub(token);
    const { notes }: BackupInterface = JSON.parse(
      base64.decode(backupContent.content)
    );
    if (categoryId === "all_notes") {
      filteredNotes = notes;
    } else {
      filteredNotes = notes.filter((note) => note.category === categoryId);
    }

    return res.json({ notes: filteredNotes });
  } catch (err) {
    console.log(err);
    res.status(404).json({ notes: [], message: "No notes found" });
  }
});

router.get("/api/backup/categories", async (req: Request, res: Response) => {
  const token = req.cookies["github-access-token"];
  if (!token) {
    throw new Error("No Token!");
  }

  try {
    const backupContent = await getBackupFromGithub(token);
    const { categories }: BackupInterface = JSON.parse(
      base64.decode(backupContent.content)
    );

    return res.json({ categories });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "No categories found!" });
  }
});

export default router;
