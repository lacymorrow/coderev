import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth";
import { getPullRequestDetail } from "@/server/services/coderev/coderev-service";
import {
  buildSystemPrompt,
  buildUserMessage,
} from "@/server/services/coderev/coderev-prompt";

// GitHub username: alphanumeric + hyphens, 1-39 chars
// Repo name: alphanumeric + dots, hyphens, underscores, 1-100 chars
const requestSchema = z.object({
  owner: z.string().min(1).max(39).regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/),
  repo: z.string().min(1).max(100).regex(/^[a-zA-Z0-9._-]+$/),
  pr: z.number().int().positive(),
});

const reviewResultSchema = z.object({
  summary: z.string(),
  chunks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      explanation: z.string(),
      purpose: z.string(),
      importance: z.number().min(0).max(10),
      importanceReason: z.string(),
      files: z.array(z.string()),
      diff: z.string(),
    }),
  ),
  stats: z.object({
    filesChanged: z.number(),
    additions: z.number(),
    deletions: z.number(),
  }),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { owner, repo, pr } = parsed.data;

    // Fetch PR diff using the user's GitHub token
    const { pr: prInfo, diff } = await getPullRequestDetail(
      session.user.id,
      owner,
      repo,
      pr,
    );

    if (!diff || diff.length === 0) {
      return NextResponse.json(
        { error: "PR has no diff content" },
        { status: 400 },
      );
    }

    const systemPrompt = buildSystemPrompt();
    const userMessage = buildUserMessage(prInfo, diff);

    // Use Vercel AI SDK with Anthropic provider
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      prompt: userMessage,
      maxOutputTokens: 8192,
      temperature: 0.2,
      abortSignal: AbortSignal.timeout(90_000),
    });

    // Parse and validate the JSON response
    let rawJson: unknown;
    try {
      rawJson = JSON.parse(text);
    } catch {
      // Try to extract JSON from the response if wrapped in other text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        rawJson = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json(
          { error: "Failed to parse AI response" },
          { status: 502 },
        );
      }
    }

    const validated = reviewResultSchema.safeParse(rawJson);
    if (!validated.success) {
      console.error("[coderev/analyze] Invalid AI response shape:", validated.error.issues);
      return NextResponse.json(
        { error: "AI returned invalid structure", details: validated.error.issues },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, data: validated.data });
  } catch (error) {
    console.error("[coderev/analyze]", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Analysis failed",
      },
      { status: 500 },
    );
  }
}
