import {
  Breadcrumb,
  BreadcrumbHome,
  Breadcrumbs,
  BreadcrumbSeparator,
} from "@/components/breadcrumbs";
import { NextPageLink } from "@/components/next-page-link";
import { SidebarLayoutContent } from "@/components/sidebar-layout";
import { formatSectionLabel } from "@/utils/section-label";
import TableOfContents from "@/components/table-of-contents";
import { Video } from "@/components/video-player";
import { siteConfig } from "@/config/site";
import { getLesson } from "@/data/lessons";
import { getAllContent, getContent } from "@/lib/content";
import { getContentComponent } from "@/lib/content-server";
import { getArticleSchema } from "@/utils/article-schema";
import { getBreadcrumbSchema } from "@/utils/breadcrumb-schema";
import { getFAQSchema, parseFAQFromMarkdown } from "@/utils/faq-schema";
import { mergeMetadata, normalizeKeywords } from "@/utils/frontmatter";
import {
  getHowToSchema,
  parseHowToStepsFromMarkdown,
} from "@/utils/howto-schema";
import { absoluteUrl, getLearningResourceSchema } from "@/utils/seo";
import fs from "fs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import path from "path";
import { Fragment } from "react";
function escapeJsonLd(data: unknown) {
  if (data === null || data === undefined) return "";
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export async function generateStaticParams() {
  const content = await getAllContent();

  return content.map((item) => ({
    category: item.category.toLowerCase(),
    slug: item.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const content = await getContent(slug, category);

  if (!content) return {};

  return mergeMetadata({
    fm: content,
    path: `/${category}/${slug}`,
  });
}

// Add JSON-LD structured data
function generateContentStructuredData(content: any) {
  if (!content) return null;

  if (content.contentType === "lesson") {
    return getLearningResourceSchema({
      name: content.title || "",
      description: content.desc || content.description || "",
    });
  } else {
    return getArticleSchema({
      name: content.title || "",
      description: content.desc || content.description || "",
      url: absoluteUrl(content.href),
      category: content.category,
      tags: normalizeKeywords(content.tags),
      datePublished: content.createdAt,
      dateModified: content.updatedAt || content.createdAt,
      author: content.author
        ? {
            name: content.author,
            url: siteConfig.url,
            image: content.authorImage,
          }
        : undefined,
      image: content.image,
    });
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const content = await getContent(slug, category);

  if (!content) {
    notFound();
  }

  const isLesson = content.origin === "lessons";
  const Content = await getContentComponent(
    content.origin,
    content.folder,
    slug,
  );

  // For breadcrumbs/navigation, we still need module context if it's a lesson
  const lessonData = isLesson ? await getLesson(slug) : null;
  const structuredData = generateContentStructuredData(content);

  // Origin → its real landing page route. Used as the deepest *linked* node
  // in the breadcrumb trail; the label between it and the page title comes
  // from frontmatter (group → category) so we never hardcode IA names.
  const ORIGIN_LANDING: Record<string, { label: string; href: string }> = {
    lessons: { label: "Products", href: "/products" },
    docs: { label: "Docs", href: "/docs" },
    solutions: { label: "Solutions", href: "/solutions" },
    articles: { label: "Solutions", href: "/solutions" },
  };
  const originLanding =
    ORIGIN_LANDING[content.origin] ?? {
      label: formatSectionLabel(content.origin),
      href: `/${content.origin}`,
    };

  // Build the trail dynamically from the content's own metadata:
  //   Home > {Origin landing} > {Category} > [{Group}] > {Page title}
  // The category step is skipped when it would duplicate the origin label
  // (e.g. solutions content where origin=solutions and category=solutions).
  const categoryLabel = formatSectionLabel(content.category);
  const breadcrumbTrail: Array<{
    name: string;
    href?: string;
  }> = [{ name: originLanding.label, href: originLanding.href }];

  if (
    categoryLabel.toLowerCase() !== originLanding.label.toLowerCase() &&
    content.category.toLowerCase() !== content.origin.toLowerCase()
  ) {
    breadcrumbTrail.push({ name: categoryLabel });
  }

  if (content.group) {
    breadcrumbTrail.push({ name: content.group });
  }

  breadcrumbTrail.push({ name: content.title || "" });

  const breadcrumbItems = [
    { name: "Home", url: absoluteUrl() },
    ...breadcrumbTrail.map((step) => ({
      name: step.name,
      url: step.href ? absoluteUrl(step.href) : absoluteUrl(content.href),
    })),
  ];
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

  // HowTo/FAQ schemas
  let howToSchema = null;
  let faqSchema = null;

  // 1. FAQ schema: Prioritize frontmatter array, then parse MDX
  if (content.faq && content.faq.length > 0) {
    faqSchema = getFAQSchema({
      faqs: content.faq,
      name: content.title || "",
      description: content.desc || content.description || "",
    });
  }

  try {
    const safeFolder = content.folder ?? "";
    const filePath = path.join(
      process.cwd(),
      "src/data",
      content.origin,
      content.folder === content.origin ? "" : safeFolder,
      `${slug}.mdx`,
    );
    const mdxContent = fs.readFileSync(filePath, "utf-8");

    const steps = parseHowToStepsFromMarkdown(mdxContent);
    if (steps.length >= 2) {
      howToSchema = getHowToSchema({
        name: content.title || "",
        description: content.desc || content.description || "",
        steps,
      });
    }

    // Only parse FAQ from markdown if not already found in frontmatter
    if (!faqSchema) {
      const faqs = parseFAQFromMarkdown(mdxContent);
      if (faqs.length > 0) {
        faqSchema = getFAQSchema({
          faqs,
          name: content.title || "",
          description: content.desc || content.description || "",
        });
      }
    }
  } catch (e: any) {
    if (e.code !== "ENOENT") {
      console.warn(
        `[Structured Data] Failed to parse MDX for ${category}/${slug}:`,
        e.message,
      );
    }
  }

  return (
    <SidebarLayoutContent
      breadcrumbs={
        <Breadcrumbs>
          <BreadcrumbHome />
          {breadcrumbTrail.map((step, idx) => (
            <Fragment key={`${idx}-${step.name}`}>
              <BreadcrumbSeparator />
              {step.href ? (
                <Breadcrumb href={step.href}>{step.name}</Breadcrumb>
              ) : (
                <Breadcrumb>{step.name}</Breadcrumb>
              )}
            </Fragment>
          ))}
        </Breadcrumbs>
      }
    >
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: escapeJsonLd(structuredData) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: escapeJsonLd(breadcrumbSchema) }}
      />
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: escapeJsonLd(howToSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: escapeJsonLd(faqSchema) }}
        />
      )}

      {/* Content area */}
      <div className="mx-auto flex max-w-2xl gap-x-10 pt-6 pb-10 sm:pt-8 sm:pb-14 lg:max-w-5xl">
        <div className="w-full flex-1">
          {content.lastVerified && (
            <p
              className={
                "mb-6 flex flex-wrap items-center justify-end gap-2 " +
                "border-b border-gray-200 pb-4 text-sm text-gray-700 " +
                "dark:border-white/10 dark:text-gray-400"
              }
            >
              Last verified{" "}
              <time dateTime={content.lastVerified}>
                {new Date(content.lastVerified).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </time>
            </p>
          )}
          <div id="content" className="prose">
            <Content />
          </div>
        </div>
        <div className="hidden w-66 lg:block">
          <TableOfContents contentId="content" />
        </div>
      </div>

      {/* Next page link - lessons only */}
      {isLesson && lessonData && (
        <div className="mx-auto max-w-4xl">
          <div className="mt-16 border-t border-gray-200 pt-8 dark:border-white/10">
            {lessonData.next ? (
              <NextPageLink
                title={lessonData.next.title}
                description={lessonData.next.description}
                href={`/${lessonData.next.category}/${lessonData.next.id}`}
              />
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You've reached the end of this module.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </SidebarLayoutContent>
  );
}
