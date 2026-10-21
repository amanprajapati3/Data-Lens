import Hero from "@/component/home/Hero";
import HomeContent from "@/component/home/HomeContent";
import { createPageMetadata, serializeJsonLd, SITE_URL } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Website & Image Data Tools",
  description:
    "Extract structured data from a website or image, edit JSON, convert JSON and CSV, convert images and PDFs, and compress images online.",
  path: "/",
});

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Data Lens",
      url: SITE_URL,
      logo: `${SITE_URL}/datalens_logo.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Data Lens",
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#application`,
      name: "Data Lens",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      url: SITE_URL,
      description:
        "Web tools for website and image data extraction, JSON editing, JSON and CSV conversion, image and PDF conversion, and image compression.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <Hero />
      <HomeContent />
    </div>
  );
}
