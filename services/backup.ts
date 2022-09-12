import getOctoKit from "../utils/octokit";
import { getGithubUser } from "./auth";
 

export const getBackupFromGithub = async (token: string) => {
  const client = getOctoKit(token);
  const githubUser = await getGithubUser(token);

  try {
    const { data } = await client.request(
      `GET /repos/${githubUser?.login}/zettel-backup/contents/backup.json`,
      {
        owner: githubUser?.login,
        repo: "zettel-backup",
        path: "backup.json",
      }
    );

    return data;
  } catch (err) {
    console.log(err);
    console.log("Error getting backup data from github");
  }
};
