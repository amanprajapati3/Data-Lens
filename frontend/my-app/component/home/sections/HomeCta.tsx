import Link from "next/link";
import Image from "next/image";
import { FaImage, FaLink, FaShieldHalved } from "react-icons/fa6";
import ScrollReveal from "@/component/shared/ScrollReveal";

export default function HomeCta() {
  return (
    <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-12">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-zinc-900 px-4 py-10 text-white shadow-xl shadow-blue-950/15 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
        
        {/* Full-width & Full-height Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1650327034273-d4df5b99f854?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
          alt=""
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover"
        />

        {/* Minimal Gradient Overlay for Content Readability */}
        <div 
          aria-hidden="true" 
          className="absolute inset-0 bg-gradient-to-r from-blue-950/85 via-blue-900/50 to-blue-950/30" 
        />

        {/* Content Container */}
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <ScrollReveal
            as="div"
            direction="left"
            mobileDirection="up"
            distance={18}
            duration={0.7}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-950/70 border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100 backdrop-blur-md">
              <FaShieldHalved aria-hidden="true" className="h-3.5 w-3.5" />
              Data work, made simpler
            </span>
            <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight text-white [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)] sm:text-4xl">
              Ready to get more from your data?
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-100 sm:text-base [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)] font-medium">
              Start with a webpage or image and see how easy it is to turn
              scattered information into a clear result.
            </p>
          </ScrollReveal>
          <ScrollReveal
            as="div"
            direction="right"
            mobileDirection="up"
            distance={18}
            delay={0.1}
            duration={0.7}
            className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row"
          >
            <Link
              href="/data-extract?mode=url"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-900 transition-all shadow-md hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900 sm:w-auto"
            >
              <FaLink aria-hidden="true" className="h-4 w-4" />
              Extract from URL
            </Link>
            <Link
              href="/data-extract?mode=image"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/60 bg-blue-950/60 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-blue-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900 sm:w-auto"
            >
              <FaImage aria-hidden="true" className="h-4 w-4" />
              Extract from image
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}