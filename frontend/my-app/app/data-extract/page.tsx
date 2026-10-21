"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import ExtractionWorkspace from "@/component/extractor/ExtractionWorkspace";

function ExtractionFlow() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <ExtractionWorkspace modeParam={modeParam} />
    </div>
  );
}

export default function DataExtractPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 dark:bg-black" aria-hidden />
      }
    >
      <ExtractionFlow />
    </Suspense>
  );
}
