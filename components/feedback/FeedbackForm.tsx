"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import {
  getFeedbackCategoryOptions,
  validateFeedbackContext,
  type FeedbackCategory,
  type FeedbackContext,
} from "@/lib/feedback/feedbackSchema";
import { buildFeedbackContext, getFeedbackReturnPath } from "@/lib/feedback/context";
import { FEEDBACK_SNAPSHOT_STORAGE_KEY } from "@/components/feedback/FeedbackEntry";

const CATEGORY_ERROR_ID = "feedback-category-error";
const MESSAGE_ERROR_ID = "feedback-message-error";
const CONTACT_ERROR_ID = "feedback-contact-error";
const MESSAGE_HINT_ID = "feedback-message-hint";

type FieldErrors = Partial<Record<"category" | "message" | "contactEmail", string>>;

interface StoredFeedbackSnapshot {
  context?: unknown;
  returnTo?: unknown;
}

interface FeedbackFormState {
  context: FeedbackContext;
  returnTo: string;
  fromEntry: boolean;
}

function clearFeedbackSnapshot(): void {
  try {
    window.sessionStorage.removeItem(FEEDBACK_SNAPSHOT_STORAGE_KEY);
  } catch {
    // Session storage is best-effort.
  }
}

function readFeedbackFormState(): FeedbackFormState {
  const fallback: FeedbackFormState = {
    context: buildFeedbackContext(),
    returnTo: "/",
    fromEntry: false,
  };

  try {
    const raw = window.sessionStorage.getItem(FEEDBACK_SNAPSHOT_STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as StoredFeedbackSnapshot;
    const context = validateFeedbackContext(parsed.context);
    const returnTo = typeof parsed.returnTo === "string" ? parsed.returnTo : "/";
    if (!context || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
      clearFeedbackSnapshot();
      return fallback;
    }

    return {
      context,
      returnTo: getFeedbackReturnPath(returnTo),
      fromEntry: true,
    };
  } catch {
    clearFeedbackSnapshot();
    return fallback;
  }
}

function formUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function firstErrorField(errors: FieldErrors): keyof FieldErrors | undefined {
  return errors.category ? "category" : errors.message ? "message" : errors.contactEmail ? "contactEmail" : undefined;
}

function emailLooksValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function FeedbackForm() {
  const [category, setCategory] = useState<FeedbackCategory | "">("");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [formState, setFormState] = useState<FeedbackFormState>(() => ({
    context: buildFeedbackContext({ location: { pathname: "/feedback", search: "" } }),
    returnTo: "/",
    fromEntry: false,
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLElement>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  useEffect(() => {
    startTransition(() => setFormState(readFeedbackFormState()));
  }, []);

  useEffect(() => {
    if (submitError) errorSummaryRef.current?.focus();
  }, [submitError]);

  useEffect(() => {
    if (isSuccess) successRef.current?.focus();
  }, [isSuccess]);

  function focusField(field: keyof FieldErrors | undefined) {
    if (field === "category") categoryRef.current?.focus();
    if (field === "message") messageRef.current?.focus();
    if (field === "contactEmail") contactRef.current?.focus();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSending || isSuccess) return;

    const nextErrors: FieldErrors = {};
    const trimmedMessage = message.trim();
    const trimmedContact = contactEmail.trim();
    if (!category) nextErrors.category = "カテゴリーを選択してください。";
    if ([...trimmedMessage].length < 1 || [...trimmedMessage].length > 4000 || /^[\s\p{Cc}\p{Cf}]*$/u.test(trimmedMessage)) {
      nextErrors.message = "内容を1〜4000文字で入力してください。";
    }
    if (trimmedContact && ([...trimmedContact].length > 254 || !emailLooksValid(trimmedContact))) {
      nextErrors.contactEmail = "連絡先の形式を確認してください。";
    }

    setErrors(nextErrors);
    setSubmitError("");
    const firstInvalid = firstErrorField(nextErrors);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    const idempotencyKey = idempotencyKeyRef.current ?? formUuid();
    idempotencyKeyRef.current = idempotencyKey;
    const payload = {
      schemaVersion: 1 as const,
      category: category as FeedbackCategory,
      message: trimmedMessage,
      ...(trimmedContact ? { contactEmail: trimmedContact } : {}),
      context: formState.context,
      website: websiteRef.current?.value ?? "",
    };

    setIsSending(true);
    void fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) throw new Error("feedback request failed");
        clearFeedbackSnapshot();
        setIsSuccess(true);
      })
      .catch(() => {
        setSubmitError("送信できませんでした。入力内容を確認して、もう一度お試しください。");
      })
      .finally(() => {
        setIsSending(false);
      });
  }

  function handleReturn(event: React.MouseEvent<HTMLAnchorElement>) {
    clearFeedbackSnapshot();
    if (!formState.fromEntry || typeof window === "undefined") return;
    event.preventDefault();
    window.history.back();
  }

  if (isSuccess) {
    return (
      <section
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="rounded-xl border border-good/30 bg-good-soft p-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <p className="font-medium">ご意見・不具合を送信しました。ご協力ありがとうございます。</p>
        <a
          href={formState.returnTo}
          onClick={handleReturn}
          className="mt-4 inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-primary underline-offset-4 outline-none hover:bg-background hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          表示中の画面に戻る
        </a>
      </section>
    );
  }

  const categoryDescribedBy = errors.category ? CATEGORY_ERROR_ID : undefined;
  const messageDescribedBy = errors.message ? `${MESSAGE_HINT_ID} ${MESSAGE_ERROR_ID}` : MESSAGE_HINT_ID;
  const contactDescribedBy = errors.contactEmail ? CONTACT_ERROR_ID : undefined;

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={isSending} className="flex flex-col gap-6">
      <div
        ref={errorSummaryRef}
        tabIndex={-1}
        role="alert"
        aria-live="polite"
        className={submitError ? "rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive outline-none focus-visible:ring-3 focus-visible:ring-ring/50" : "sr-only"}
      >
        {submitError}
      </div>

      <fieldset disabled={isSending} className="flex flex-col gap-5 disabled:opacity-75">
        <div className="flex flex-col gap-2">
          <label htmlFor="feedback-category" className="text-sm font-medium">どんな内容ですか？</label>
          <select
            ref={categoryRef}
            id="feedback-category"
            name="category"
            required
            value={category}
            onChange={(event) => setCategory(event.target.value as FeedbackCategory | "")}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={categoryDescribedBy}
            className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          >
            <option value="">選択してください</option>
            {getFeedbackCategoryOptions().map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.category && <p id={CATEGORY_ERROR_ID} className="text-sm text-destructive">{errors.category}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="feedback-message" className="text-sm font-medium">内容を教えてください。</label>
          <textarea
            ref={messageRef}
            id="feedback-message"
            name="message"
            required
            maxLength={4000}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={messageDescribedBy}
            className="min-h-36 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          />
          <p id={MESSAGE_HINT_ID} className="text-sm text-muted-foreground">何をしようとして、何が起きたかを短く教えてください。（1〜4000文字）</p>
          {errors.message && <p id={MESSAGE_ERROR_ID} className="text-sm text-destructive">{errors.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="feedback-contact" className="text-sm font-medium">返信が必要な場合の連絡先（任意）</label>
          <input
            ref={contactRef}
            id="feedback-contact"
            name="contactEmail"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            aria-invalid={Boolean(errors.contactEmail)}
            aria-describedby={contactDescribedBy}
            className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          />
          {errors.contactEmail && <p id={CONTACT_ERROR_ID} className="text-sm text-destructive">{errors.contactEmail}</p>}
        </div>

        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="feedback-website">Website</label>
          <input ref={websiteRef} id="feedback-website" name="website" tabIndex={-1} aria-hidden="true" autoComplete="off" defaultValue="" />
        </div>
      </fieldset>

      <p className="text-sm leading-relaxed text-muted-foreground">
        このフォームは匿名で送信できます。入力したカテゴリー・内容と、問題の確認に必要な表示中の画面状態（大会・カテゴリー・選手ID・表示指標・比較設定・画面サイズ・ブラウザ種別・アプリ版）を送信します。返信が必要な場合のみ連絡先を入力してください。個人を追跡するID、Cookie、広告ID、スクリーンショットは送信しません。匿名送信は後から特定・削除できない場合があります。
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={isSending} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50">
          {isSending ? "送信中…" : "送信する"}
        </button>
        <a href={formState.returnTo} onClick={handleReturn} className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-medium text-primary underline-offset-4 outline-none hover:bg-muted hover:underline focus-visible:ring-3 focus-visible:ring-ring/50">
          戻る
        </a>
      </div>
      <div aria-live="polite" className="sr-only">{isSending ? "送信中…" : submitError}</div>
    </form>
  );
}
