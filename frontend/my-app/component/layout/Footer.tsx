import Link from "next/link";
import { Database } from "lucide-react";
import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/amanprajapati3", Icon: FaGithub },
  { label: "X (Twitter)", href: "#", Icon: FaXTwitter },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/aman-prajapati-020135314/", Icon: FaLinkedinIn },
  { label: "Instagram", href: "https://www.instagram.com/_sid501?objf=MTl4bWhhbDMyZjVibw==", Icon: FaInstagram }
] as const;

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Data Extract", href: "/data-extract" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Choose Us", href: "/choose-us" },
] as const;

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
] as const;

const linkClass =
  "inline-flex items-center gap-2 text-sm text-gray-600 transition-all duration-300 hover:translate-x-1 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Database className="h-5 w-5" />
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Data Lens
              </span>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Data Lens turns any website or screenshot into clean, structured JSON
              in seconds. Paste a URL or drop an image and get developer-ready data
              you can ship straight into your workflow.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:bg-blue-600 dark:hover:text-white dark:focus:ring-offset-gray-950"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
              Navigation
            </h4>
            <nav aria-label="Footer navigation">
              <ul className="space-y-3">
                {NAV_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className={linkClass}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
              Legal
            </h4>
            <nav aria-label="Legal navigation">
              <ul className="space-y-3">
                {LEGAL_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className={linkClass}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-6 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:flex-row sm:text-left">
          <p>© 2026 DataLens. All rights reserved.</p>
          <p>
            Developed by{" "}
            <span className="font-medium text-gray-700 dark:text-gray-200">
              Aman Prajapati
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
