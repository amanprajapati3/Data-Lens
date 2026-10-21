import Link from "next/link";
import ScrollReveal from "@/component/shared/ScrollReveal";
import { createBreadcrumbJsonLd, serializeJsonLd } from "@/lib/seo";

export interface Crumb {
  label: string;
  href?: string;
}

interface PageBannerProps {
  title: string;
  subtitle?: string;
  crumbs: Crumb[];
  currentPath: string;
  image?: string;
}

export default function PageBanner({
  title,
  subtitle,
  crumbs,
  currentPath,
}: PageBannerProps) {
  const breadcrumbJsonLd = createBreadcrumbJsonLd(crumbs, currentPath);

  return (
    <section className="relative overflow-hidden bg-zinc-900 px-4 py-28 text-white sm:px-6 sm:py-40 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd),
        }}
      />
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src="/198018-906226540_medium.mp4" type="video/mp4" />
      </video>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-900/65 to-zinc-900/40"
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center text-center">
        <ScrollReveal
          as="nav"
          direction="up"
          distance={12}
          className="flex flex-wrap items-center justify-center gap-2 text-sm text-zinc-400"
          aria-label="Breadcrumb"
        >
          {crumbs.map((crumb, index) => (
            <span
              key={`${crumb.label}-${index}`}
              className="flex items-center gap-2"
            >
              {index > 0 && <span aria-hidden>/</span>}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="transition-colors hover:text-white"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-emerald-400" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </ScrollReveal>

        <ScrollReveal
          as="h1"
          direction="up"
          distance={18}
          delay={0.06}
          className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl"
        >
          {title}
        </ScrollReveal>

        {subtitle && (
          <ScrollReveal
            as="p"
            direction="up"
            distance={16}
            delay={0.12}
            className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base"
          >
            {subtitle}
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
