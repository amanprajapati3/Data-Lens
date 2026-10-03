export interface WebsiteData {
  website: {
    url: string;
    domain: string;
    crawledAt: string;
  };

  pages: PageData[];

summary: {
  pagesDiscovered: number;
  pagesCrawled: number;
  pagesFailed: number;
  totalLinks: number;
  totalImages: number;
};
}

export interface PageData {
  url: string;

  title: string;

  meta: {
    description: string;
    canonical: string | null;
  };

  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };

  content: {
    paragraphs: string[];
  };

  links: {
    text: string;
    url: string;
  }[];

  images: {
    src: string;
    alt: string;
  }[];
}