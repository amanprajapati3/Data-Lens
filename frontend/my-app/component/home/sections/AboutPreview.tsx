import Link from "next/link";
import {
  FaArrowRight,
  FaCheck,
  FaDatabase,
  FaFileLines,
  FaGlobe,
  FaImage,
  FaLink,
} from "react-icons/fa6";
import ScrollReveal from "@/component/shared/ScrollReveal";

const BENEFITS = [
  "Extract from a webpage URL or an image",
  "Turn unstructured content into useful data",
  "Get started without a complicated setup",
];

const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950";

export default function AboutPreview() {
  return (
    <section
      aria-labelledby="about-preview-title"
      className="px-4 py-8 md:py-12 sm:px-6  lg:px-8 "
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <ScrollReveal
          as="div"
          direction="left"
          mobileDirection="up"
          distance={20}
          duration={0.7}
        >
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            About Data Lens
          </span>
          <h2
            id="about-preview-title"
            className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Make useful data easier to reach.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:text-lg">
            Data Lens helps you turn information on webpages and images into
            structured data. Spend less time copying details by hand and more
            time putting them to work.
          </p>
          <ul className="mt-6 space-y-3">
            {BENEFITS.map((benefit, index) => (
              <ScrollReveal
                as="li"
                key={benefit}
                direction="up"
                distance={12}
                index={index}
                staggerChildren={0.08}
                duration={0.5}
                className="flex items-start gap-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:text-base"
              >
                <FaCheck
                  aria-hidden="true"
                  className="mt-1 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400"
                />
                {benefit}
              </ScrollReveal>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/about" className={buttonClass}>
              Learn about us
              <FaArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/data-extract"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:border-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-blue-400 dark:hover:text-blue-300 dark:focus-visible:ring-offset-zinc-950"
            >
              Try data extraction
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal
          as="div"
          direction="right"
          mobileDirection="up"
          distance={20}
          duration={0.7}
          className="relative mx-auto w-full max-w-xl"
        >
          <div
            aria-hidden="true"
            className="absolute -inset-5 rounded-[2rem] bg-blue-100/70 blur-2xl dark:bg-blue-950/30"
          />
          <div className="relative rounded-3xl border border-zinc-200 bg-white p-5 shadow-xl shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-5 dark:border-zinc-800">
              <div>
                <p className="text-lg font-semibold">A clearer path to data</p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  From source to structured output
                </p>
              </div>
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                <FaDatabase aria-hidden="true" className="h-8 w-8" />
              </span>
            </div>
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/70">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm dark:bg-zinc-900 dark:text-blue-300">
                  <FaGlobe aria-hidden="true" className="h-8 w-8"/>
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Website or image</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Bring the source you need
                  </p>
                </div>
                <FaArrowRight
                  aria-hidden="true"
                  className="ml-auto h-5 w-5 shrink-0 text-zinc-700"
                />
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm dark:bg-zinc-900 dark:text-blue-300">
                  <FaFileLines aria-hidden="true"  className="h-8 w-8"/>
                </span>
                <div className="hidden min-w-0 sm:block">
                  <p className="text-sm font-semibold">Structured data</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Ready to review
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
                  <FaLink
                    aria-hidden="true"
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  />
                  <p className="mt-3 text-sm font-semibold">URL extraction</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                    Collect details from a webpage
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
                  <FaImage
                    aria-hidden="true"
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  />
                  <p className="mt-3 text-sm font-semibold">Image extraction</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                    Turn visual content into data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
