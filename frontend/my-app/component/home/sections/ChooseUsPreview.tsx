import Link from "next/link";
import { FaArrowRight, FaBolt, FaCode, FaGlobe } from "react-icons/fa6";
import ScrollReveal from "@/component/shared/ScrollReveal";

const FEATURES = [
  {
    icon: FaBolt,
    title: "A simpler workflow",
    description:
      "Start an extraction in a few steps, without building a custom process for every source.",
  },
  {
    icon: FaGlobe,
    title: "Web and image input",
    description:
      "Choose the input that fits your task, whether it is a webpage or a screenshot.",
  },
  {
    icon: FaCode,
    title: "Structured results",
    description:
      "Work with organized output that is easier to review and use in your projects.",
  },
];

export default function ChooseUsPreview() {
  return (
    <section
      aria-labelledby="choose-us-preview-title"
      className="border-y border-zinc-200 bg-white px-4 py-8 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6 md:py-12 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <ScrollReveal
          as="div"
          direction="up"
          distance={18}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            Why choose Data Lens
          </span>
          <h2
            id="choose-us-preview-title"
            className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Less busywork. More useful results.
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:text-lg">
            Bring common data-extraction tasks into one straightforward
            workflow that works for both webpages and images.
          </p>
        </ScrollReveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }, index) => (
            <ScrollReveal
              as="article"
              key={title}
              direction="up"
              distance={18}
              index={index}
              staggerChildren={0.14}
              duration={0.65}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-300">
                <Icon aria-hidden="true" className="h-7 w-7" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal
          as="div"
          direction="up"
          distance={16}
          delay={0.12}
          className="mt-8 text-center"
        >
          <Link
            href="/choose-us"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:border-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-blue-400 dark:hover:text-blue-300 dark:focus-visible:ring-offset-zinc-950"
          >
            See why choose us
            <FaArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
