import ImageConverter from "@/component/converters/ImageConverter";
import ScrollReveal from "@/component/shared/ScrollReveal";

export const metadata = {
  title: "Image & PDF Converter | Data Lens",
  description:
    "Convert images between formats, combine images into a PDF, or render PDF pages as images in your browser.",
};

export default function ImageConvertPage() {
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
              Image Tool
            </span>
            <h2 className="text-3xl font-bold tracking-tight">
              Convert images and PDFs
            </h2>
            <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
              Convert image formats, combine multiple images into a PDF, or
              save PDF pages as individual images—all directly in your browser.
            </p>
          </div>

          <ImageConverter />
        </ScrollReveal>
      </main>
    </div>
  );
}
