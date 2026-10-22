"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Database,
  Image as ImageIcon,
  Link2,
  Menu,
  X,
} from "lucide-react";
import { GrGithub } from "react-icons/gr";
import ThemeToggle from "./ThemeToggle";

const EXTRACT_LINKS = [
  { label: "From Image", href: "/data-extract?mode=image", icon: ImageIcon },
  { label: "From URL", href: "/data-extract?mode=url", icon: Link2 },
] as const;

const TOOL_LINKS = [
  { label: "JSON ↔ CSV", href: "/json-csv" },
  { label: "Image Converter", href: "/image-convert" },
  { label: "Image Compress", href: "/image-compress" },
  { label: "ZIP & Unzip", href: "/zip-tool" },
] as const;

const navItemClass =
  "nav-hover rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300";

const activeNavItemClass =
  "bg-black text-white dark:bg-white dark:text-gray-800";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExtractOpen, setMobileExtractOpen] = useState(false);
  const isExtractorActive = pathname === "/data-extract";

  const isActivePage = (href: string) => pathname === href;
  const getNavItemClass = (isActive: boolean) =>
    `${navItemClass} ${isActive ? activeNavItemClass : ""}`;

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-gray-800 dark:bg-black/95 dark:supports-[backdrop-filter]:bg-black/80">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white sm:h-9 sm:w-9">
              <Database className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg">
                Data Lens
              </span>
            </div>
            <span className="ml-2 hidden rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 sm:inline-flex">
              Free Tool
            </span>
          </Link>

          <nav
            className="hidden flex-1 items-center justify-center gap-1 lg:flex"
            aria-label="Main navigation"
          >
            <Link
              href="/"
              className={getNavItemClass(isActivePage("/"))}
              aria-current={isActivePage("/") ? "page" : undefined}
            >
              Home
            </Link>

            <div className="group relative">
              <button
                type="button"
                className={`${getNavItemClass(isExtractorActive)} cursor-pointer inline-flex items-center gap-1.5`}
                aria-haspopup="true"
                aria-current={isExtractorActive ? "page" : undefined}
              >
                Data Extractor
                <ChevronDown className="h-4 w-4 transition-transform duration-300 ease-out group-hover:rotate-180 group-focus-within:rotate-180" />
              </button>
              <div className="invisible absolute left-1/2 top-full z-50 mt-2 w-52 -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-300 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-900">
                  {EXTRACT_LINKS.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                        <Icon className="h-4 w-4" />
                      </span>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {TOOL_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={getNavItemClass(isActivePage(href))}
                aria-current={isActivePage(href) ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href="https://github.com/amanprajapati3"
              className="hidden items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900 sm:inline-flex"
            >
              <span className="h-4 w-4">
                <GrGithub />
              </span>
              <span className="hidden lg:inline">GitHub</span>
            </a>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-[70] bg-black/50 transition-opacity duration-300 ease-out lg:hidden"
          />

          <aside
            className="fixed inset-y-0 left-0 z-[80] flex w-72 max-w-[85%] flex-col border-r border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-gray-800 dark:bg-gray-950 lg:hidden"
          >
            <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800 sm:h-16">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white sm:h-14 sm:w-14">
                <Database className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav
              className="flex flex-1 flex-col gap-1 overflow-y-auto p-4"
              aria-label="Mobile navigation"
            >
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className={`${getNavItemClass(isActivePage("/"))} px-3 py-2.5`}
                aria-current={isActivePage("/") ? "page" : undefined}
              >
                Home
              </Link>

              <div>
                <div className="flex items-center gap-1">
                  <Link
                    href="/data-extract"
                    onClick={() => setMobileOpen(false)}
                    className={`${getNavItemClass(isExtractorActive)} flex-1 px-3 py-2.5`}
                    aria-current={isExtractorActive ? "page" : undefined}
                  >
                    Data Extractor
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileExtractOpen((open) => !open)}
                    aria-label="Toggle data extractor options"
                    aria-expanded={mobileExtractOpen}
                    className={`${navItemClass} inline-flex px-3 py-2.5`}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ease-out ${
                        mobileExtractOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    mobileExtractOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-1 pl-6 pt-1">
                      {EXTRACT_LINKS.map(({ label, href, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {TOOL_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`${getNavItemClass(isActivePage(href))} px-3 py-2.5`}
                  aria-current={isActivePage(href) ? "page" : undefined}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
