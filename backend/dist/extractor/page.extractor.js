"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPageData = extractPageData;
const cheerio = __importStar(require("cheerio"));
function cleanText(text) {
    return text
        .replace(/\s+/g, " ")
        .trim();
}
function extractPageData(html, pageUrl) {
    const $ = cheerio.load(html);
    const title = cleanText($("title").first().text());
    const description = cleanText($('meta[name="description"]')
        .attr("content") || "");
    const canonical = $('link[rel="canonical"]')
        .attr("href") || null;
    const h1 = [];
    const h2 = [];
    const h3 = [];
    $("h1").each((_index, element) => {
        const text = cleanText($(element).text());
        if (text) {
            h1.push(text);
        }
    });
    $("h2").each((_index, element) => {
        const text = cleanText($(element).text());
        if (text) {
            h2.push(text);
        }
    });
    $("h3").each((_index, element) => {
        const text = cleanText($(element).text());
        if (text) {
            h3.push(text);
        }
    });
    const paragraphs = [];
    $("p").each((_index, element) => {
        const text = cleanText($(element).text());
        if (text) {
            paragraphs.push(text);
        }
    });
    const links = [];
    $("a[href]").each((_index, element) => {
        const href = $(element).attr("href");
        if (!href) {
            return;
        }
        try {
            const absoluteUrl = new URL(href, pageUrl).href;
            links.push({
                text: cleanText($(element).text()),
                url: absoluteUrl,
            });
        }
        catch {
            // Ignore invalid URLs.
        }
    });
    const images = [];
    $("img[src]").each((_index, element) => {
        const src = $(element).attr("src");
        if (!src) {
            return;
        }
        try {
            const absoluteUrl = new URL(src, pageUrl).href;
            images.push({
                src: absoluteUrl,
                alt: cleanText($(element).attr("alt") || ""),
            });
        }
        catch {
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
