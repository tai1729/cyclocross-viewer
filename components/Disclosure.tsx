"use client";

import {
  forwardRef,
  useId,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DisclosureProps
  extends Omit<React.ComponentPropsWithoutRef<"details">, "children" | "open" | "onToggle"> {
  summary: ReactNode;
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  summaryRef?: Ref<HTMLElement>;
  summaryClassName?: string;
  contentClassName?: string;
}

export const Disclosure = forwardRef<HTMLDetailsElement, DisclosureProps>(
  function Disclosure(
    {
      summary,
      children,
      open,
      onOpenChange,
      summaryRef,
      summaryClassName,
      contentClassName,
      className,
      ...detailsProps
    },
    ref,
  ) {
    const generatedId = useId();
    const contentId = `disclosure-content-${generatedId.replaceAll(":", "")}`;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isOpen = open ?? uncontrolledOpen;

    return (
      <details
        {...detailsProps}
        ref={ref}
        open={isOpen}
        onToggle={(event) => {
          const nextOpen = event.currentTarget.open;
          setUncontrolledOpen(nextOpen);
          onOpenChange?.(nextOpen);
        }}
        className={cn(
          "min-w-0 overflow-hidden rounded-lg border border-border bg-card text-card-foreground",
          className,
        )}
      >
        <summary
          ref={summaryRef}
          aria-controls={contentId}
          aria-expanded={isOpen}
          className={cn(
            "flex min-h-11 w-full cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50",
            "[&::-webkit-details-marker]:hidden open:border-b open:border-border",
            summaryClassName,
          )}
        >
          <span className="flex min-w-0 flex-1 items-center justify-between gap-3 break-words">
            {summary}
          </span>
          {isOpen ? (
            <ChevronUp aria-hidden="true" className="size-4 shrink-0" />
          ) : (
            <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
          )}
        </summary>
        <div id={contentId} className={cn("min-w-0", contentClassName)}>
          {children}
        </div>
      </details>
    );
  },
);

Disclosure.displayName = "Disclosure";
