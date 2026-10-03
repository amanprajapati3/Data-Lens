import type { ApiSuccessResponse } from "@/types/api";

/*
 * URL extraction
 */

export interface WebsiteMeta {
  url: string;
  domain: string;
  crawledAt: string;
}

export interface CrawlSummary {
  pagesDiscovered: number;
  pagesCrawled: number;
  pagesFailed: number;
  totalLinks: number;
  totalImages: number;
}

export interface PageMeta {
  description: string;
  canonical: string | null;
}

export interface PageHeadings {
  h1: string[];
  h2: string[];
  h3: string[];
}

export interface PageContent {
  paragraphs: string[];
}

export interface PageLink {
  text: string;
  url: string;
}

export interface PageImage {
  src: string;
  alt: string;
}

export interface PageData {
  url: string;
  title: string;
  meta: PageMeta;
  headings: PageHeadings;
  content: PageContent;
  links: PageLink[];
  images: PageImage[];
}

export interface WebsiteData {
  website: WebsiteMeta;
  pages: PageData[];
  summary: CrawlSummary;
}

export interface FailedUrl {
  url: string;
  error: string;
}

/*
 * POST /api/crawl returns a job ID and only the summary.
 * The full WebsiteData (including pages) is not sent to the
 * client; it is retrieved later through the export endpoints.
 */

export interface CrawlData {
  website: WebsiteMeta;
  summary: CrawlSummary;
  failedUrls: FailedUrl[];
}

export interface CrawlResponse extends ApiSuccessResponse<CrawlData> {
  jobId: string;
}

/*
 * Image extraction
 */

export type NavigationLocation =
  | "header"
  | "sidebar"
  | "footer"
  | "menu"
  | "other";

export type ButtonStyle = "primary" | "secondary" | "link" | "other";

export type CtaStyle = "primary" | "secondary" | "link" | "banner" | "other";

export type FormFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "file"
  | "date"
  | "submit"
  | "other";

export type ContactType = "email" | "phone" | "address" | "other";

export interface NavigationItem {
  label: string;
  href: string | null;
  location: NavigationLocation;
}

export interface ButtonItem {
  text: string;
  style: ButtonStyle;
  purpose: string | null;
}

export interface LinkItem {
  text: string;
  url: string | null;
}

export interface StatisticItem {
  label: string;
  value: string;
  context: string | null;
}

export interface SectionItem {
  title: string | null;
  description: string | null;
  type: string | null;
  items: string[];
}

export interface FormFieldItem {
  name: string | null;
  label: string | null;
  type: FormFieldType;
  placeholder: string | null;
  required: boolean | null;
}

export interface FormItem {
  name: string | null;
  action: string | null;
  fields: FormFieldItem[];
}

export interface ImageItem {
  description: string | null;
  alt: string | null;
  context: string | null;
}

export interface ContactItem {
  type: ContactType;
  value: string;
  label: string | null;
}

export interface SocialItem {
  platform: string;
  handle: string | null;
  url: string | null;
}

export interface CtaItem {
  text: string;
  style: CtaStyle;
  href: string | null;
  placement: string | null;
}

export interface ImageExtractionData {
  source: {
    type: "image";
  };
  page: {
    title: string | null;
    description: string | null;
  };
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  content: {
    paragraphs: string[];
  };
  navigation: NavigationItem[];
  buttons: ButtonItem[];
  links: LinkItem[];
  statistics: StatisticItem[];
  sections: SectionItem[];
  forms: FormItem[];
  images: ImageItem[];
  contact: ContactItem[];
  social: SocialItem[];
  ctas: CtaItem[];
}

export type ImageExtractionResponse = ApiSuccessResponse<ImageExtractionData>;

/*
 * Current result
 */

export type ExtractionMode = "url" | "image";

export interface UrlExtractionResult {
  mode: "url";
  jobId: string;
  data: CrawlData;
}

export interface ImageExtractionResult {
  mode: "image";
  data: ImageExtractionData;
}

export type ExtractionResult = UrlExtractionResult | ImageExtractionResult;
