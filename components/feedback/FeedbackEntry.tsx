"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { buildFeedbackContext, getFeedbackReturnPath, snapshotFeedbackContext } from "@/lib/feedback/context";

export const FEEDBACK_SNAPSHOT_STORAGE_KEY = "ajocc-feedback-snapshot";

interface FeedbackSnapshot {
  context: ReturnType<typeof snapshotFeedbackContext>;
  returnTo: string;
}

function isFeedbackPath(pathname: string | null): boolean {
  return pathname === "/feedback" || pathname?.startsWith("/feedback/") === true;
}

function saveFeedbackSnapshot(): void {
  if (typeof window === "undefined") return;

  const snapshot: FeedbackSnapshot = {
    context: snapshotFeedbackContext(buildFeedbackContext()),
    returnTo: getFeedbackReturnPath(window.location),
  };

  try {
    window.sessionStorage.setItem(FEEDBACK_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Private browsing or a full session store should not block feedback navigation.
  }
}

function clearFeedbackSnapshot(): void {
  try {
    window.sessionStorage.removeItem(FEEDBACK_SNAPSHOT_STORAGE_KEY);
  } catch {
    // Session storage is best-effort and never a prerequisite for the form.
  }
}

function FeedbackEntryLink({ className = "" }: { className?: string }) {
  const router = useRouter();

  return (
    <a
      href="/feedback"
      onClick={(event) => {
        event.preventDefault();
        saveFeedbackSnapshot();
        router.push("/feedback");
      }}
      className={className}
    >
      ご意見・不具合を送る
    </a>
  );
}

export function FeedbackEntry() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (isFeedbackPath(previousPathname.current) && !isFeedbackPath(pathname)) {
      clearFeedbackSnapshot();
    }
    previousPathname.current = pathname;
  }, [pathname]);

  if (isFeedbackPath(pathname)) return null;

  return (
    <>
      <FeedbackEntryLink
        className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 hidden min-h-10 items-center rounded-lg border border-border bg-card/95 px-3 text-sm font-medium text-foreground shadow-sm outline-none backdrop-blur-sm transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 lg:inline-flex"
      />
      <footer className="mt-auto border-t border-border/70 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto flex w-full max-w-[1600px] justify-end">
          <FeedbackEntryLink className="inline-flex min-h-11 max-w-full items-center rounded-lg px-3 text-sm font-medium text-primary underline-offset-4 outline-none hover:bg-muted hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" />
        </div>
      </footer>
    </>
  );
}
