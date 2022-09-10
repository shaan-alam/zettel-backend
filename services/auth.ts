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

// export const getGitHubUser = async (accessToken: string | null) => {
//   const client = getOctoKit(accessToken);

//   try {
//     const { data } = await axios.get("http://api.github.com/user", {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     return data;
//   } catch (err) {
//     console.log("Cannot get user data");
//     throw err;
//   }
// };
