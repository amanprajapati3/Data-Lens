"use client";

import type { ReactNode } from "react";

interface ResultSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function ResultSection({
  title,
  description,
  icon,
  children,
  className = "",
}: ResultSectionProps) {
  return (
    <section className={`flex flex-col gap-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex flex-col gap-2 px-6 pt-6 sm:flex-row sm:items-start sm:gap-4">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            {icon}
          </div>
        )}
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto px-6 pb-6">{children}</div>
    </section>
  );
}