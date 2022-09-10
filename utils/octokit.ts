import { Octokit } from "@octokit/rest";

export default function getOctoKit(accessToken: string | string[] | undefined) {
  const client = new Octokit({
    auth: accessToken,
  });

  return client;
}
