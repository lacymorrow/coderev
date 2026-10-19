"use server";

import { z } from "zod";
import { auth } from "@/server/auth";
import {
  listUserRepos,
  listPullRequests,
} from "@/server/services/coderev/coderev-service";
import type { PRInfo, RepoInfo } from "@/server/services/coderev/coderev-types";

const githubOwnerSchema = z.string().min(1).max(39).regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/);
const githubRepoSchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9._-]+$/);

export async function getRepos(
  search?: string,
): Promise<{ success: boolean; data?: RepoInfo[]; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const repos = await listUserRepos(session.user.id, search);
    return { success: true, data: repos };
  } catch (error) {
    console.error("[getRepos]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch repos",
    };
  }
}

export async function getPullRequests(
  owner: string,
  repo: string,
): Promise<{ success: boolean; data?: PRInfo[]; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const ownerParsed = githubOwnerSchema.safeParse(owner);
    const repoParsed = githubRepoSchema.safeParse(repo);
    if (!ownerParsed.success || !repoParsed.success) {
      return { success: false, error: "Invalid repository" };
    }

    const prs = await listPullRequests(session.user.id, ownerParsed.data, repoParsed.data);
    return { success: true, data: prs };
  } catch (error) {
    console.error("[getPullRequests]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch PRs",
    };
  }
}
