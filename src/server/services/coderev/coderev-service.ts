import { Octokit } from "@octokit/rest";
import { auth } from "@/server/auth";
import { getGitHubAccessToken } from "@/server/services/github/github-token-service";
import type { PRInfo, RepoInfo } from "./coderev-types";

async function getUserOctokit(userId?: string): Promise<Octokit> {
  if (!userId) {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }
    userId = session.user.id;
  }

  const token = await getGitHubAccessToken(userId);
  if (!token) {
    throw new Error("GitHub not connected. Please connect your GitHub account.");
  }

  return new Octokit({ auth: token });
}

export async function listUserRepos(
  userId: string,
  search?: string,
): Promise<RepoInfo[]> {
  const octokit = await getUserOctokit(userId);

  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 30,
    type: "all",
  });

  let repos = data;
  if (search) {
    const q = search.toLowerCase();
    repos = repos.filter(
      (r) =>
        r.full_name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q),
    );
  }

  return repos.map((r) => ({
    owner: r.owner.login,
    name: r.name,
    fullName: r.full_name,
    description: r.description,
    isPrivate: r.private,
  }));
}

export async function listPullRequests(
  userId: string,
  owner: string,
  repo: string,
): Promise<PRInfo[]> {
  const octokit = await getUserOctokit(userId);

  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state: "all",
    sort: "updated",
    per_page: 30,
  });

  return data.map((pr) => ({
    number: pr.number,
    title: pr.title,
    author: pr.user?.login ?? "unknown",
    authorAvatar: pr.user?.avatar_url ?? "",
    state: pr.state,
    createdAt: pr.created_at,
    additions: 0,
    deletions: 0,
    changedFiles: 0,
    htmlUrl: pr.html_url,
    body: pr.body,
  }));
}

export async function getPullRequestDetail(
  userId: string,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<{ pr: PRInfo; diff: string }> {
  const octokit = await getUserOctokit(userId);

  const [prResponse, diffResponse] = await Promise.all([
    octokit.pulls.get({ owner, repo, pull_number: prNumber }),
    octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
      mediaType: { format: "diff" },
    }),
  ]);

  const pr = prResponse.data;

  return {
    pr: {
      number: pr.number,
      title: pr.title,
      author: pr.user?.login ?? "unknown",
      authorAvatar: pr.user?.avatar_url ?? "",
      state: pr.state,
      createdAt: pr.created_at,
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changed_files,
      htmlUrl: pr.html_url,
      body: pr.body,
    },
    // The diff response with format: "diff" returns raw text as data
    diff: diffResponse.data as unknown as string,
  };
}
