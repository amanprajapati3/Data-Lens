import { CheckCircle2 } from "lucide-react";
import ScrollReveal from "@/component/shared/ScrollReveal";

export interface LegalSection {
  heading: string;
  points: string[];
}

interface LegalContentProps {
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
}

export default function LegalContent({
  updatedAt,
  intro,
  sections,
}: LegalContentProps) {
  return (
    <div className="bg-zinc-50 dark:bg-black">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal as="div" direction="up" distance={16}>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Last updated: {updatedAt}
            </p>
            <p className="mt-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">
              {intro}
            </p>
          </ScrollReveal>

          <div className="mt-10 space-y-10">
            {sections.map((section, index) => (
              <ScrollReveal
                as="section"
                key={section.heading}
                direction="up"
                distance={14}
                index={index}
                staggerChildren={0.07}
                duration={0.6}
                className="border-t border-gray-200 pt-8 first:border-t-0 first:pt-0 dark:border-gray-800"
              >
                <h2 className="flex items-baseline gap-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.heading}
                </h2>
                <ul className="mt-4 space-y-3">
                  {section.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
                        aria-hidden
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
