import { Base64 } from "js-base64";

export async function getGithubReadme(url: string): Promise<string> {
  try {
    // Extract owner and repo from GitHub URL
    const urlParts = url.replace("https://github.com/", "").split("/");
    const owner = urlParts[0];
    const repo = urlParts[1];

    if (!owner || !repo) {
      throw new Error("Invalid GitHub URL format");
    }

    // Fetch README content using GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch README: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // GitHub returns content in base64
    const content = Base64.decode(data.content);
    return content;
  } catch (error) {
    console.error("Error fetching GitHub README:", error);
    throw error;
  }
}
