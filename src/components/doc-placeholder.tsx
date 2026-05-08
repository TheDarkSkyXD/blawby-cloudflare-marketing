import { clsx } from "clsx";

type DocPlaceholderKind = "screenshot" | "video" | "diagram";

const KIND_STYLES: Record<
  DocPlaceholderKind,
  { label: string; aspectClass: string; icon: React.ReactNode }
> = {
  screenshot: {
    label: "Screenshot",
    aspectClass: "aspect-video",
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <path d="M2.5 3.5A1.5 1.5 0 0 1 4 2h2.31a1 1 0 0 1 .85.47l.5.83A1 1 0 0 0 8.5 3.8H12a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 12 12.8H4a1.5 1.5 0 0 1-1.5-1.5V3.5Zm5.5 6.3a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      </svg>
    ),
  },
  video: {
    label: "Video",
    aspectClass: "aspect-video",
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h6A1.5 1.5 0 0 1 11 4.5v.94l3-1.7v8.52l-3-1.7v.94A1.5 1.5 0 0 1 9.5 13h-6A1.5 1.5 0 0 1 2 11.5v-7Z" />
      </svg>
    ),
  },
  diagram: {
    label: "Diagram",
    aspectClass: "aspect-[16/9]",
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <path d="M2.5 2.5a1 1 0 0 1 1-1H6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1v-2Zm6 0a1 1 0 0 1 1-1H12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9.5a1 1 0 0 1-1-1v-2ZM2.5 8.5a1 1 0 0 1 1-1H6a1 1 0 0 1 1 1V13a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V8.5Zm6 1.5a1 1 0 0 1 1-1H12a1 1 0 0 1 1 1V13a1 1 0 0 1-1 1H9.5a1 1 0 0 1-1-1v-3Z" />
      </svg>
    ),
  },
};

/**
 * Inline placeholder for a screenshot, video, or diagram that hasn't been
 * captured yet. Renders a styled stand-in with the eventual asset path so
 * the design team has a clear todo list, and removes the need for broken
 * <Image> tags or fragile markdown blockquotes.
 *
 * When the real asset lands at `src`, swap this for a normal MDX <img> or
 * <Video> tag — the path you wrote here matches what should ship.
 */
export function DocPlaceholder({
  kind = "screenshot",
  src,
  caption,
  description,
}: {
  kind?: DocPlaceholderKind;
  src: string;
  caption?: string;
  description?: string;
}) {
  const styles = KIND_STYLES[kind];

  return (
    <figure className="my-6 not-prose">
      <div
        className={clsx(
          "relative w-full overflow-hidden rounded-xl border border-dashed",
          "border-gray-300 bg-gray-50 text-gray-500",
          "dark:border-white/15 dark:bg-white/5 dark:text-gray-400",
          styles.aspectClass,
        )}
        role="img"
        aria-label={caption ?? `Placeholder for ${kind}: ${src}`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-2 p-6 text-center">
          <div className="flex items-center gap-x-2 text-xs font-semibold uppercase tracking-wider">
            {styles.icon}
            <span>{styles.label} placeholder</span>
          </div>
          {description && (
            <p className="max-w-sm text-sm leading-snug">{description}</p>
          )}
          <code className="mt-1 break-all rounded bg-gray-950/5 px-2 py-1 font-mono text-xs text-gray-700 dark:bg-white/10 dark:text-gray-200">
            {src}
          </code>
        </div>
      </div>
      {caption && (
        <figcaption className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
