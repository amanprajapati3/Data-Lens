import ImageCompressor from "@/component/converters/ImageCompressor";
import ScrollReveal from "@/component/shared/ScrollReveal";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Image Compressor",
  description:
    "Compress images to a target file size in your browser, preview each result, and download files individually or as a ZIP.",
  path: "/image-compress",
});

export default function ImageCompressPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">
              Compress images to fit your needs
            </h1>
            <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
              Choose a target size, preview each result, and download images
              separately or as a ZIP. Your files are processed on your device.
            </p>
          </div>
          <ImageCompressor />
        </ScrollReveal>
      </main>
    </div>
  );
}
