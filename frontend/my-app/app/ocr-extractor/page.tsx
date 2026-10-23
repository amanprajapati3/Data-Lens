import OcrExtractor from "@/component/converters/OcrExtractor";
import ScrollReveal from "@/component/shared/ScrollReveal";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "OCR Extractor",
  description:
    "Extract text from images and PDFs while keeping headings, pretitles, lists, tables, and icons. Copy the result as clean Markdown.",
  path: "/ocr-extractor",
});

export default function OcrExtractorPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <ScrollReveal
          as="div"
          direction="up"
          distance={18}
          className="flex flex-col gap-6"
        >
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-500/20 dark:bg-emerald-950 dark:text-emerald-300">
              AI Tool
            </span>
            <h1 className="text-3xl font-bold tracking-tight">
              Extract text from images and PDFs
            </h1>
            <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
              Upload a screenshot, scan, photo, or PDF and get the content back
              as structured Markdown. Headings, pretitles, lists, tables, and
              meaningful icons keep their place so the result is ready to copy.
            </p>
          </div>

          <OcrExtractor />
        </ScrollReveal>
      </main>
    </div>
  );
}
