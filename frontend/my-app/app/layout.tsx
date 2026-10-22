
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/component/layout/Header";
import Footer from "@/component/layout/Footer";
import SmoothScroll from "@/component/shared/SmoothScroll";
import ThemeInitializer from "@/component/shared/ThemeInitializer";
import { SITE_URL } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: "8jH1Rf5oUu2BG4kFIeh4BZn_wjiBPPY345Gjb1rJ3hI",
  },
  title: {
    default: "Data Lens | Web, Image & File Tools",
    template: "%s | Data Lens",
  },
  description:
    "Extract structured data from websites and images, edit JSON, convert JSON and CSV, convert images and PDFs, compress images, and manage ZIP files with Data Lens.",
  openGraph: {
    type: "website",
    siteName: "Data Lens",
    locale: "en_US",
    title: "Data Lens | Web, Image & File Tools",
    description:
      "Tools for website and image extraction, JSON editing, data conversion, image and PDF utilities, and ZIP files.",
    url: "/",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Lens | Web, Image & File Tools",
    description:
      "Tools for website and image extraction, JSON editing, data conversion, image and PDF utilities, and ZIP files.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeInitializer />
        <SmoothScroll />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
