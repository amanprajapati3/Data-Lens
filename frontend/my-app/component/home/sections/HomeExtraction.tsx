import ExtractionWorkspace from "@/component/extractor/ExtractionWorkspace";
import ScrollReveal from "@/component/shared/ScrollReveal";

export default function HomeExtraction() {
  return (
    <section
      id="extract-data"
      aria-labelledby="home-extraction-title"
      className=" dark:border-zinc-800 dark:bg-black md:py-12 py-8"
    >
      <ScrollReveal
        as="div"
        direction="up"
        distance={24}
        className="mx-auto mb-8 max-w-3xl px-4 text-center sm:mb-10 sm:px-6 lg:px-8"
      >
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
          Start extracting
        </span>
        <h2
          id="home-extraction-title"
          className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Extract data right here
        </h2>
        <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:text-lg">
          Enter a website URL or upload an image to get structured data without
          leaving the homepage.
        </p>
      </ScrollReveal>

      <ExtractionWorkspace embedded />
    </section>
  );
}
