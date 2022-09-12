import axios from "axios";
import getOctoKit from "../utils/octokit";

export const getAccessToken = async <T>(code: T) => {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

  try {
    const githubToken = await axios.post(
      `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`
    );

    const params = new URLSearchParams(githubToken.data);
    const accessToken = params.get("access_token");

    return accessToken;
  } catch (err) {
    console.log("Error getting User access token");
    throw err;
  }
};

export const getGithubUser = async (token: string) => {
  const client = getOctoKit(token);

  try {
    const { data: user } = await client.request("GET /user", {});
    return user;
  } catch (err) {
    console.log(err);
    console.log("Error getting user's data!!");
  }
};
