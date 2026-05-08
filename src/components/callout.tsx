import { clsx } from "clsx";
import type { ReactNode } from "react";

type CalloutVariant = "note" | "tip" | "warning" | "important";

const VARIANT_STYLES: Record<
  CalloutVariant,
  { container: string; label: string; icon: ReactNode; defaultTitle: string }
> = {
  note: {
    container:
      "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-100",
    label: "text-blue-700 dark:text-blue-300",
    defaultTitle: "Note",
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        className="h-4 w-4 shrink-0"
      >
        <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM7.25 4.5a.75.75 0 0 1 1.5 0v.5a.75.75 0 0 1-1.5 0v-.5Zm0 3.5a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0V8Z" />
      </svg>
    ),
  },
  tip: {
    container:
      "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100",
    label: "text-emerald-700 dark:text-emerald-300",
    defaultTitle: "Tip",
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        className="h-4 w-4 shrink-0"
      >
        <path d="M8 1.5a4.75 4.75 0 0 0-3 8.42v1.33A1.25 1.25 0 0 0 6.25 12.5h3.5a1.25 1.25 0 0 0 1.25-1.25V9.92A4.75 4.75 0 0 0 8 1.5Zm-1.75 12a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 0 1.5H7a.75.75 0 0 1-.75-.75Z" />
      </svg>
    ),
  },
  warning: {
    container:
      "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100",
    label: "text-amber-700 dark:text-amber-300",
    defaultTitle: "Warning",
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        className="h-4 w-4 shrink-0"
      >
        <path d="M7.13 2.32a1 1 0 0 1 1.74 0l5.5 9.5A1 1 0 0 1 13.5 13.3H2.5a1 1 0 0 1-.87-1.5l5.5-9.5ZM7.25 6a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0V6Zm.75 6a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" />
      </svg>
    ),
  },
  important: {
    container:
      "border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-100",
    label: "text-rose-700 dark:text-rose-300",
    defaultTitle: "Important",
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        className="h-4 w-4 shrink-0"
      >
        <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm-.75 3a.75.75 0 0 1 1.5 0v4.25a.75.75 0 0 1-1.5 0V4.5Zm.75 7.6a.95.95 0 1 0 0-1.9.95.95 0 0 0 0 1.9Z" />
      </svg>
    ),
  },
};

export function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
}) {
  const styles = VARIANT_STYLES[variant];
  const headingText = title ?? styles.defaultTitle;

  return (
    <aside
      role="note"
      className={clsx(
        "my-6 rounded-lg border px-4 py-3 text-sm not-prose",
        styles.container,
      )}
    >
      <div
        className={clsx(
          "flex items-center gap-x-2 font-semibold uppercase tracking-wide text-xs mb-1",
          styles.label,
        )}
      >
        {styles.icon}
        <span>{headingText}</span>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
