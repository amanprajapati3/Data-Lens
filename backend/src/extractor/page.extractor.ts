import * as cheerio from "cheerio";

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

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .trim();
}

export function extractPageData(
  html: string,
  pageUrl: string
): PageData {
  const $ = cheerio.load(html);

  const title = cleanText(
    $("title").first().text()
  );

  const description = cleanText(
    $('meta[name="description"]')
      .attr("content") || ""
  );

  const canonical =
    $('link[rel="canonical"]')
      .attr("href") || null;

  const h1: string[] = [];
  const h2: string[] = [];
  const h3: string[] = [];

  $("h1").each((_index, element) => {
    const text = cleanText(
      $(element).text()
    );

    if (text) {
      h1.push(text);
    }
  });

  $("h2").each((_index, element) => {
    const text = cleanText(
      $(element).text()
    );

    if (text) {
      h2.push(text);
    }
  });

  $("h3").each((_index, element) => {
    const text = cleanText(
      $(element).text()
    );

    if (text) {
      h3.push(text);
    }
  });

  const paragraphs: string[] = [];

  $("p").each((_index, element) => {
    const text = cleanText(
      $(element).text()
    );

    if (text) {
      paragraphs.push(text);
    }
  });

  const links: PageData["links"] = [];

  $("a[href]").each((_index, element) => {
    const href =
      $(element).attr("href");

    if (!href) {
      return;
    }

    try {
      const absoluteUrl =
        new URL(
          href,
          pageUrl
        ).href;

      links.push({
        text: cleanText(
          $(element).text()
        ),
        url: absoluteUrl,
      });
    } catch {
      // Ignore invalid URLs.
    }
  });

  const images: PageData["images"] = [];

  $("img[src]").each((_index, element) => {
    const src =
      $(element).attr("src");

    if (!src) {
      return;
    }

    try {
      const absoluteUrl =
        new URL(
          src,
          pageUrl
        ).href;

      images.push({
        src: absoluteUrl,
        alt: cleanText(
          $(element).attr("alt") || ""
        ),
      });
    } catch {
      // Ignore invalid image URLs.
    }
  });

  return {
    url: pageUrl,

    title,

    meta: {
      description,
      canonical,
    },

    headings: {
      h1,
      h2,
      h3,
    },

    content: {
      paragraphs,
    },

    links,

    images,
  };
}