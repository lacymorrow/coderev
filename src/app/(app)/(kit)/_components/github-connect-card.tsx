"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/config/routes";

export const GitHubConnectCard = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Connect GitHub</CardTitle>
          <CardDescription>
            CodeRev needs access to your GitHub account to fetch pull requests
            and analyze code changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={routes.settings.index}>Connect GitHub Account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
