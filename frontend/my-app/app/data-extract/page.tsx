import ExtractionWorkspace from "@/component/extractor/ExtractionWorkspace";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Website and Image Data Extraction",
  description:
    "Extract structured data from a webpage URL or screenshot with Data Lens. Review the results and export website data as JSON.",
  path: "/data-extract",
});

interface DataExtractPageProps {
  searchParams: Promise<{ mode?: string | string[] }>;
}

export default async function DataExtractPage({
  searchParams,
}: DataExtractPageProps) {
  const { mode } = await searchParams;
  const modeParam = Array.isArray(mode) ? mode[0] : mode;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <ExtractionWorkspace modeParam={modeParam} />
    </div>
  );
}
