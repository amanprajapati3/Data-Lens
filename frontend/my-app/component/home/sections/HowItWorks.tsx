import { FaDatabase, FaFileLines, FaLink } from "react-icons/fa6";
import ScrollReveal from "@/component/shared/ScrollReveal";

const STEPS = [
  {
    icon: FaLink,
    title: "Choose a source",
    description: "Paste a webpage link or select an image to get started.",
  },
  {
    icon: FaDatabase,
    title: "Extract the data",
    description: "Let Data Lens process the content into a structured result.",
  },
  {
    icon: FaFileLines,
    title: "Review and use it",
    description: "Check your results and take the data into your workflow.",
  },
];

export default function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-title"
      className="px-4 py-8 sm:px-6 lg:px-8 md:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <ScrollReveal
            as="div"
            direction="left"
            mobileDirection="up"
            distance={18}
            className="max-w-2xl"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              How it works
            </span>
            <h2
              id="how-it-works-title"
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              From source to usable data in three steps.
            </h2>
          </ScrollReveal>
          <ScrollReveal
            as="p"
            direction="right"
            mobileDirection="up"
            distance={18}
            className="max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400 sm:text-base"
          >
            Whether you start with a link or an image, the process stays simple
            from beginning to end.
          </ScrollReveal>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <ScrollReveal
              as="article"
              key={title}
              direction="up"
              distance={18}
              index={index}
              staggerChildren={0.14}
              duration={0.65}
              className="relative rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                  <Icon aria-hidden="true" className="h-7 w-7" />
                </span>
                <span className="text-base font-semibold tabular-nums text-zinc-400 dark:text-zinc-500">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
