import Link from "next/link";
import { Image as ImageIcon, Link2 } from "lucide-react";
import ScrollReveal from "@/component/shared/ScrollReveal";
import ThemeAwareHeroVideo from "./ThemeAwareHeroVideo";

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center overflow-hidden bg-black">
      <ThemeAwareHeroVideo />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-20 text-center text-white sm:px-6 lg:px-8">
        <ScrollReveal
          as="span"
          direction="up"
          distance={20}
          duration={0.6}
          className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur sm:text-sm"
        >
          AI-Powered Data Extraction
        </ScrollReveal>

        <ScrollReveal
          as="h1"
          direction="up"
          distance={24}
          delay={0.08}
          duration={0.65}
          className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
        >
          Turn Any Website or Image Into Clean JSON
        </ScrollReveal>

        <ScrollReveal
          as="p"
          direction="up"
          distance={24}
          delay={0.16}
          duration={0.65}
          className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-200 sm:text-lg"
        >
          Paste a link or drop a screenshot and let Data Lens structure the data
          for you in seconds — no code, no manual copy-paste.
        </ScrollReveal>

        <ScrollReveal
          as="div"
          direction="up"
          distance={20}
          delay={0.24}
          duration={0.65}
          className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4"
        >
          <Link
            href="/data-extract?mode=image"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black sm:text-base"
          >
            <ImageIcon className="h-5 w-5" />
            Extract from Image
          </Link>
          <Link
            href="/data-extract?mode=url"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black sm:text-base"
          >
            <Link2 className="h-5 w-5" />
            Extract from URL
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
