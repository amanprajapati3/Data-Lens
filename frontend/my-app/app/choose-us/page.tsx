import React from 'react';
import PageBanner from "@/component/layout/PageBanner";
import { 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Code2, 
  Check, 
  Layers, 
  BarChart3, 
  Clock 
} from 'lucide-react';
import ScrollReveal from "@/component/shared/ScrollReveal";

export default function ChooseUsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* 1. BREADCRUMB BANNER */}
      <PageBanner
        title="Why Choose Our Data Extractor"
        image="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80"
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Why Choose Us" },
        ]}
      />

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* 2. BADGE, TITLE & ONE-LINE PARAGRAPH */}
        <ScrollReveal
          as="div"
          direction="up"
          distance={18}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-500/20">
            Unrivaled Advantages
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Built for Speed, Accuracy, and Scale
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Discover why developers and businesses trust our engine to process millions of URLs and images every day.
          </p>
        </ScrollReveal>

        {/* 3. CONTENT WITH IMAGE & FEATURE CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Feature Highlights */}
          <ScrollReveal
            as="div"
            direction="left"
            mobileDirection="up"
            distance={18}
            className="lg:col-span-7 space-y-6"
          >
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-zinc-600 dark:text-zinc-300 mb-4">
                Traditional web scrapers break when web layouts update, and standard OCR tools fail on blurry or styled text. Our smart engine adapts in real-time, delivering clean, structured output without requiring custom parser scripts.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  { icon: Clock, title: "Sub-Second Latency", desc: "Extract data from links or images in under 500ms." },
                  { icon: ShieldCheck, title: "99.9% Extraction Accuracy", desc: "Proprietary AI filters out noise and format artifacts." },
                  { icon: Cpu, title: "Multi-Format Vision OCR", desc: "Recognizes tables, handwriting, and complex graphs." },
                  { icon: Code2, title: "Developer First APIs", desc: "REST & GraphQL APIs ready with SDKs for Node, Python, & Go." }
                ].map((feat, i) => (
                  <ScrollReveal
                    as="div"
                    key={i}
                    direction="up"
                    distance={10}
                    index={i}
                    staggerChildren={0.08}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <feat.icon className="w-5 h-5 text-emerald-500" />
                      <span className="font-semibold text-sm">{feat.title}</span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{feat.desc}</p>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Right Column: Visual Image Showcase */}
          <ScrollReveal
            as="div"
            direction="right"
            mobileDirection="up"
            distance={18}
            className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80" 
              alt="Data Infrastructure" 
              className="w-full h-[420px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="bg-emerald-500 text-black text-xs font-bold px-2 py-1 rounded mb-2 inline-block">High Performance</span>
              <h3 className="text-lg font-bold text-white">Scalable Cloud Scraping & OCR Infrastructure</h3>
            </div>
          </ScrollReveal>
        </div>

        {/* Feature Comparison Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScrollReveal
            as="div"
            direction="up"
            distance={14}
            index={0}
            staggerChildren={0.12}
            className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
          >
            <Layers className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Automated Schema Mapping</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No need to define selectors. Give us any URL or image, and our model automatically detects structured tables, lists, and metadata.
            </p>
          </ScrollReveal>

          <ScrollReveal
            as="div"
            direction="up"
            distance={14}
            index={1}
            staggerChildren={0.12}
            className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
          >
            <BarChart3 className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Batch Processing</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Process thousands of image URLs or webpage links simultaneously with our scalable queue system and instant webhook alerts.
            </p>
          </ScrollReveal>

          <ScrollReveal
            as="div"
            direction="up"
            distance={14}
            index={2}
            staggerChildren={0.12}
            className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
          >
            <ShieldCheck className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Anti-Bot & CAPTCHA Bypass</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Integrated rotating residential proxies ensure seamless data extraction without getting blocked by rate limits or security layers.
            </p>
          </ScrollReveal>
        </div>

      </main>
    </div>
  );
}
