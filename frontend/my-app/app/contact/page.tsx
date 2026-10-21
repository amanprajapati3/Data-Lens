import React from 'react';
import PageBanner from "@/component/layout/PageBanner";
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import ScrollReveal from "@/component/shared/ScrollReveal";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Contact",
  description:
    "Contact Data Lens for questions or feedback about website extraction, image extraction, and its online data tools.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* 1. BREADCRUMB BANNER */}
      <PageBanner
        title="Get in Touch With Us"
        currentPath="/contact"
        image="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80"
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Contact Us" },
        ]}
      />

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        
        {/* TWO COLUMN SECTION: LEFT (BADGE, TITLE, PARA + LOCATION CARDS) & RIGHT (FORM) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT SIDE: Badge, Title, One Line Para, Location Cards */}
          <ScrollReveal
            as="div"
            direction="left"
            mobileDirection="up"
            distance={18}
            className="lg:col-span-5 space-y-8"
          >
            <div className="space-y-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-500/20">
                Contact & Support
              </span>
              <h2 className="text-3xl font-bold tracking-tight">
                We&apos;d Love to Hear From You
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Have questions about custom data extraction pipelines or API pricing? Send us a message!
              </p>
            </div>

            {/* Location & Contact Details Cards */}
            <div className="space-y-4">
              <ScrollReveal
                as="div"
                direction="up"
                distance={12}
                index={0}
                staggerChildren={0.1}
                className="flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
              >
                <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500 shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Phone Support</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">+91 7217814501</p>
                  <p className="text-xs text-zinc-500 mt-1">Mon-Fri from 9am to 6pm EST</p>
                </div>
              </ScrollReveal>

              <ScrollReveal
                as="div"
                direction="up"
                distance={12}
                index={1}
                staggerChildren={0.1}
                className="flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
              >
                <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500 shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Email Inquiry</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">amanprajapati9871@gmail.com</p>
                  <p className="text-xs text-zinc-500 mt-1">Typical response within 2 hours</p>
                </div>
              </ScrollReveal>

              <ScrollReveal
                as="div"
                direction="up"
                distance={12}
                index={2}
                staggerChildren={0.1}
                className="flex items-start space-x-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
              >
                <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Headquarters</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">100 Tech Blvd, Suite 400</p>
                  <p className="text-xs text-zinc-500 mt-1">San Francisco, CA 94107</p>
                </div>
              </ScrollReveal>
            </div>
          </ScrollReveal>

          {/* RIGHT SIDE: Interactive Contact Form */}
          <ScrollReveal
            as="div"
            direction="right"
            mobileDirection="up"
            distance={18}
            className="lg:col-span-7 bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <h3 className="text-xl font-bold mb-6">Send Us a Message</h3>
            <form className="space-y-4" >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Your Name</label>
                  <input 
                    id="contact-name"
                    type="text" 
                    placeholder="John Doe"  required
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Your Email</label>
                  <input 
                    id="contact-email"
                    type="email" 
                    placeholder="john@example.com" required
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Subject / Extractor Type</label>
                <select id="contact-subject" className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option>URL Scraping API</option>
                  <option>Image OCR Data Extraction</option>
                  <option>Enterprise Custom Integration</option>
                  <option>General Support</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Message</label>
                <textarea 
                  id="contact-message"
                  rows={4} required
                  placeholder="Tell us about your extraction requirements..." 
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button 
                type="submit" 
                className="w-full cursor-pointer py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
              >
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </ScrollReveal>

        </div>

        {/* BELOW IT: FULL-WIDTH GOOGLE MAP */}
        <ScrollReveal
          as="div"
          direction="up"
          distance={16}
          className="pt-8"
        >
          <div className="w-full h-80 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <iframe 
              title="Office Location Map" 
              className="w-full h-full border-0  contrast-125"
              src="https://maps.google.com/maps?q=37.78772897975765,-122.3986816846819&z=16&output=embed"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen={false} 
              loading="lazy" 
            />
          </div>
          </ScrollReveal>

      </main>
    </div>
  );
}
