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
    <div
      data-feedback-entry
      className="mx-auto flex w-full max-w-[1920px] justify-end px-4 pt-2 sm:px-6 sm:pt-3 xl:px-8 2xl:px-12"
    >
      <FeedbackEntryLink className="inline-flex min-h-11 max-w-full items-center rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" />
    </div>
  );
}
