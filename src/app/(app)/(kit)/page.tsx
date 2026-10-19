import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { routes } from "@/config/routes";
import { getGitHubConnectionStatus } from "@/server/services/github/github-token-service";
import { ReviewDashboard } from "./_components/review-dashboard";
import { GitHubConnectCard } from "./_components/github-connect-card";

export const metadata = {
  title: "CodeRev - AI Code Review",
  description: "AI-powered code review that scores and explains PR changes",
};

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(routes.auth.signIn);
  }

  const { isConnected } = await getGitHubConnectionStatus(session.user.id);

  if (!isConnected) {
    return <GitHubConnectCard />;
  }

  return <ReviewDashboard />;
}
