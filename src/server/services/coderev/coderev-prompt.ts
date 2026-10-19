import type { PRInfo } from "./coderev-types";

const MAX_DIFF_SIZE = 100_000; // 100KB

export function buildSystemPrompt(): string {
  return `You are a senior code reviewer. Analyze the PR diff and produce a structured review.

Your job:
1. Group the raw git hunks into SEMANTIC chunks — logical units of change that may span multiple files. For example, a function rename in one file plus updated imports in three others = one chunk.
2. For each chunk, explain what the code does and why it matters in the codebase.
3. Score each chunk's importance from 0 to 10:
   - 0-2: Trivial (whitespace, formatting, comments, version bumps, dependency updates)
   - 3-4: Low-risk structural (renames, reorganization, import changes)
   - 5-6: Moderate (new features, logic changes, configuration changes)
   - 7-8: High-risk (security-sensitive code, error handling, auth logic, data mutations)
   - 9-10: Critical issues (bugs, security vulnerabilities, data loss risks, broken error handling, race conditions)

Respond with ONLY valid JSON matching this exact structure (no markdown, no code fences):
{
  "summary": "1-2 sentence overall PR summary",
  "chunks": [
    {
      "id": "chunk-1",
      "title": "Short descriptive title",
      "explanation": "What this code change does",
      "purpose": "Why this matters in the codebase context",
      "importance": 7,
      "importanceReason": "Why this score",
      "files": ["src/file1.ts", "src/file2.ts"],
      "diff": "the raw unified diff text for just this chunk"
    }
  ],
  "stats": {
    "filesChanged": 5,
    "additions": 120,
    "deletions": 30
  }
}

Sort chunks by importance descending (most important first).
Each chunk's "diff" field should contain the relevant unified diff hunks for that chunk.
The "files" array should list all files involved in that semantic chunk.`;
}

export function buildUserMessage(pr: PRInfo, diff: string): string {
  let truncated = false;
  let processedDiff = diff;

  if (diff.length > MAX_DIFF_SIZE) {
    processedDiff = diff.slice(0, MAX_DIFF_SIZE);
    // Cut at the last complete file boundary
    const lastFileHeader = processedDiff.lastIndexOf("\ndiff --git ");
    if (lastFileHeader > 0) {
      processedDiff = processedDiff.slice(0, lastFileHeader);
    }
    truncated = true;
  }

  let message = `## PR #${pr.number}: ${pr.title}
**Author:** ${pr.author}
**Changed files:** ${pr.changedFiles} | **+${pr.additions}** / **-${pr.deletions}**`;

  if (pr.body) {
    message += `\n\n**Description:**\n${pr.body.slice(0, 2000)}`;
  }

  if (truncated) {
    message += `\n\n> Note: This diff was truncated to ~100KB. Some files at the end may be missing.`;
  }

  message += `\n\n## Diff\n\n${processedDiff}`;

  return message;
}
