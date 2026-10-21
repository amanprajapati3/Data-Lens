import React from 'react';
import PageBanner from "@/component/layout/PageBanner";
import { 
  FaXTwitter, 
  FaLinkedin, 
  FaGithub, 
  FaGlobe 
} from 'react-icons/fa6';
import { FaRegCheckCircle } from "react-icons/fa";
import ScrollReveal from "@/component/shared/ScrollReveal";


export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* 1. BREADCRUMB BANNER */}
      <PageBanner
        title="About Our Extractor Platform"
        image="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80"
        crumbs={[
          { label: "Home", href: "/" },
          { label: "About Us" },
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
            Our Story & Mission
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Unlocking Unstructured Web & Visual Data in Seconds
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            We transform complex web pages and OCR image data into structured, actionable intelligence effortlessly.
          </p>
        </ScrollReveal>

        {/* 3. CONTENT WITH IMAGE, BULLETS & SOCIAL MEDIA CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Featured Image */}
          <ScrollReveal
            as="div"
            direction="left"
            mobileDirection="up"
            distance={18}
            className="relative rounded-2xl overflow-hidden shadow-2xl group"
          >
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80" 
              alt="Data Extraction Analytics" 
              className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-sm font-semibold text-emerald-400">Next-Gen OCR & Scraping Engine</p>
              <h3 className="text-xl font-bold">Precision Automated Data Pipeline</h3>
            </div>
          </ScrollReveal>

          {/* Right: Paragraph + Bullet Points */}
          <ScrollReveal
            as="div"
            direction="right"
            mobileDirection="up"
            distance={18}
            className="space-y-6"
          >
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Founded by data engineers and AI enthusiasts, our platform was built to eliminate manual copy-pasting and visual transcription. Whether you need to scrape live websites via standard URLs or extract tabular data from image screenshots, our engine processes requests instantly.
            </p>

            {/* Bullet Points */}
            <ul className="space-y-3">
              {[
                "Advanced AI-powered OCR for high-accuracy text-from-image recognition",
                "Automated URL DOM parser capable of scraping JavaScript-heavy web pages",
                "Clean export formats including JSON, CSV, Excel, and API endpoints",
                "Enterprise-grade data encryption and automated privacy wiping"
              ].map((point, index) => (
                <ScrollReveal
                  as="li"
                  key={index}
                  direction="up"
                  distance={10}
                  index={index}
                  staggerChildren={0.06}
                  className="flex items-start space-x-3"
                >
                  <FaRegCheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{point}</span>
                </ScrollReveal>
              ))}
            </ul>
          </ScrollReveal>
        </div>

        {/* Social Media & Community Cards */}
        <ScrollReveal
          as="div"
          direction="up"
          distance={18}
          className="pt-8 border-t border-zinc-200 dark:border-zinc-800"
        >
          <h3 className="text-center text-xl font-bold mb-8">Connect With Our Community</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Twitter / X', icon: FaXTwitter, desc: 'Follow for updates & news', link: '#', color: 'hover:border-sky-500' },
              { name: 'LinkedIn', icon: FaLinkedin, desc: 'Corporate news & articles', link: 'https://www.linkedin.com/in/aman-prajapati-020135314/', color: 'hover:border-blue-600' },
              { name: 'GitHub', icon: FaGithub, desc: 'Explore SDKs & API docs', link: 'https://github.com/amanprajapati3', color: 'hover:border-purple-500' },
              { name: 'Community Blog', icon: FaGlobe, desc: 'Read tech insights & guides', link: '#', color: 'hover:border-emerald-500' }
            ].map((social, idx) => (
              <ScrollReveal
                as="a"
                key={idx} 
                href={social.link}
                direction="up"
                distance={14}
                index={idx}
                staggerChildren={0.1}
                className={`p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all ${social.color} hover:shadow-lg group flex flex-col items-center text-center`}
              >
                <social.icon className="w-8 h-8 text-zinc-700 dark:text-zinc-300 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{social.name}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{social.desc}</p>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>

      </main>
    </div>
  );
}
