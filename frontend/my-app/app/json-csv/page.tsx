import JsonCsvConverter from "@/component/converters/JsonCsvConverter";
import ScrollReveal from "@/component/shared/ScrollReveal";

export default function JsonCsvPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto max-w-7xl space-y-12 px-4 py-16 sm:px-6 lg:px-8">
        <ScrollReveal
          as="div"
          direction="up"
          distance={18}
          className="flex flex-col gap-6"
        >
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-500/20 dark:bg-emerald-950 dark:text-emerald-300">
              Converter Tool
            </span>
            <h2 className="text-3xl font-bold tracking-tight">
              Convert between JSON and CSV
            </h2>
            <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
              Paste your data on the left, pick a direction and press
              Convert. The result appears on the right, ready to copy or
              download as a file.
            </p>
          </div>

          <JsonCsvConverter />
        </ScrollReveal>
      </main>
    </div>
  );
}
