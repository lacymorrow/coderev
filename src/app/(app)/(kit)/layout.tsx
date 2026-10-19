import { type ReactNode, Suspense } from "react";
import Link from "next/link";
import { SuspenseFallback } from "@/components/primitives/suspense-fallback";

export default function CodeRevLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="m18 16 4-4-4-4" />
              <path d="m6 8-4 4 4 4" />
              <path d="m14.5 4-5 16" />
            </svg>
            CodeRev
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/settings"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Settings
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4">
        <Suspense fallback={<SuspenseFallback />}>{children}</Suspense>
      </main>
    </div>
  );
}
