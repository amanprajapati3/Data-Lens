/**
 * Types and JSON schema for the
 * image extraction feature.
 *
 * POST /api/image-extract
 *
 * The types below describe the exact
 * response contract so the API always
 * returns the same structure, even when
 * the model returns partial data.
 */

/*
 * Upload limits
 */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const MAX_IMAGE_SIZE_LABEL = "5 MB";

export const IMAGE_FIELD_NAME = "image";

export const ALLOWED_IMAGE_MIME_TYPES: readonly string[] = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/*
 * The model used to read the screenshot.
 */
export const IMAGE_MODEL = "gemini-2.5-flash";

/*
 * Item level shapes
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

export interface CtaItem {
  text: string;
  style: CtaStyle;
  href: string | null;
  placement: string | null;
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

/*
 * The extracted data itself
 */
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

/*
 * The full success response
 */
export interface ImageExtractionResponse {
  success: true;
  data: ImageExtractionData;
}

/*
 * Sections of the response in the order
 * they are rendered. The client uses this
 * to build the result view without
 * hardcoding field names.
 */
export const IMAGE_RESULT_SECTIONS: readonly {
  key: keyof Omit<ImageExtractionData, "source">;
  label: string;
  kind: "text" | "list" | "group";
}[] = [
  {
    key: "page",
    label: "Page",
    kind: "group",
  },
  {
    key: "headings",
    label: "Headings",
    kind: "group",
  },
  {
    key: "content",
    label: "Content",
    kind: "group",
  },
  {
    key: "navigation",
    label: "Navigation",
    kind: "list",
  },
  {
    key: "buttons",
    label: "Buttons",
    kind: "list",
  },
  {
    key: "links",
    label: "Links",
    kind: "list",
  },
  {
    key: "statistics",
    label: "Statistics",
    kind: "list",
  },
  {
    key: "sections",
    label: "Sections",
    kind: "list",
  },
  {
    key: "forms",
    label: "Forms",
    kind: "list",
  },
  {
    key: "images",
    label: "Images",
    kind: "list",
  },
  {
    key: "contact",
    label: "Contact",
    kind: "list",
  },
  {
    key: "social",
    label: "Social",
    kind: "list",
  },
  {
    key: "ctas",
    label: "CTAs",
    kind: "list",
  },
];

/*
 * The error response
 */
export interface ImageExtractionErrorResponse {
  success: false;
  message: string;
}

/**
 * JSON schema describing the data
 * the model must return.
 *
 * This is sent to Gemini as
 * `responseJsonSchema`, so it stays
 * inside the subset the Gemini API
 * accepts:
 *
 * - every object sets `properties`
 *   and lists every property in
 *   `required`
 * - a value that may be missing is
 *   marked with `nullable`
 * - item objects are written out in
 *   full instead of using
 *   `$defs` and `$ref`
 */
export const IMAGE_EXTRACTION_SCHEMA = {
  type: "object",
  required: [
    "page",
    "headings",
    "content",
    "navigation",
    "buttons",
    "links",
    "statistics",
    "sections",
    "forms",
    "images",
    "contact",
    "social",
    "ctas",
  ],
  propertyOrdering: [
    "page",
    "headings",
    "content",
    "navigation",
    "buttons",
    "links",
    "statistics",
    "sections",
    "forms",
    "images",
    "contact",
    "social",
    "ctas",
  ],
  properties: {
    page: {
      type: "object",
      required: ["title", "description"],
      properties: {
        title: {
          type: "string",
          nullable: true,
          description:
            "The visible browser tab title or main on-page title. Null when not visible.",
        },
        description: {
          type: "string",
          nullable: true,
          description:
            "The short page description, tagline or meta description visible in the screenshot. Null when not present.",
        },
      },
    },
    headings: {
      type: "object",
      required: ["h1", "h2", "h3"],
      properties: {
        h1: {
          type: "array",
          items: { type: "string" },
          description: "All visible H1 headings, in reading order.",
        },
        h2: {
          type: "array",
          items: { type: "string" },
          description: "All visible H2 headings, in reading order.",
        },
        h3: {
          type: "array",
          items: { type: "string" },
          description:
            "All visible H3 headings, in reading order. Omit non-heading sublabels.",
        },
      },
    },
    content: {
      type: "object",
      required: ["paragraphs"],
      properties: {
        paragraphs: {
          type: "array",
          items: { type: "string" },
          description:
            "Visible body paragraph text, in reading order. Exclude headings, buttons and navigation labels.",
        },
      },
    },
    navigation: {
      type: "array",
      description: "Navigation, menu and breadcrumb entries.",
      items: {
        type: "object",
        required: ["label", "href", "location"],
        properties: {
          label: {
            type: "string",
            description: "The visible navigation label.",
          },
          href: {
            type: "string",
            nullable: true,
            description:
              "The link target when it can be read from the screenshot. Null otherwise.",
          },
          location: {
            type: "string",
            enum: ["header", "sidebar", "footer", "menu", "other"],
            description: "Where the navigation entry appears.",
          },
        },
      },
    },
    buttons: {
      type: "array",
      description: "Visible buttons and clickable controls.",
      items: {
        type: "object",
        required: ["text", "style", "purpose"],
        properties: {
          text: {
            type: "string",
            description: "The visible button label.",
          },
          style: {
            type: "string",
            enum: ["primary", "secondary", "link", "other"],
            description: "The visual prominence of the button.",
          },
          purpose: {
            type: "string",
            nullable: true,
            description:
              "What the button appears to do, for example opens a signup dialog. Null when unclear.",
          },
        },
      },
    },
    links: {
      type: "array",
      description: "Visible hyperlinks that are not navigation or buttons.",
      items: {
        type: "object",
        required: ["text", "url"],
        properties: {
          text: {
            type: "string",
            description: "The visible link text.",
          },
          url: {
            type: "string",
            nullable: true,
            description:
              "The link target when visible, including the status bar URL when shown. Null otherwise.",
          },
        },
      },
    },
    statistics: {
      type: "array",
      description:
        "Visible numbers, counters, percentages, metrics and KPI values.",
      items: {
        type: "object",
        required: ["label", "value", "context"],
        properties: {
          label: {
            type: "string",
            description: "The name of the metric or statistic.",
          },
          value: {
            type: "string",
            description: "The numeric value exactly as displayed.",
          },
          context: {
            type: "string",
            nullable: true,
            description:
              "Extra surrounding explanation such as a time period or footnote. Null when absent.",
          },
        },
      },
    },
    sections: {
      type: "array",
      description: "Distinct page sections, panels and cards.",
      items: {
        type: "object",
        required: ["title", "description", "type", "items"],
        properties: {
          title: {
            type: "string",
            nullable: true,
            description: "The section or card heading. Null when untitled.",
          },
          description: {
            type: "string",
            nullable: true,
            description:
              "A short summary of the section content. Null when there is none.",
          },
          type: {
            type: "string",
            nullable: true,
            description:
              "The kind of section, for example pricing, testimonial, faq, hero or feature grid. Null when unclear.",
          },
          items: {
            type: "array",
            items: { type: "string" },
            description:
              "The individual entries inside the section, for example plan names or feature bullet points.",
          },
        },
      },
    },
    forms: {
      type: "array",
      description: "Visible forms and their input fields.",
      items: {
        type: "object",
        required: ["name", "action", "fields"],
        properties: {
          name: {
            type: "string",
            nullable: true,
            description: "The visible form name or heading. Null when unnamed.",
          },
          action: {
            type: "string",
            nullable: true,
            description: "The submit target when visible. Null otherwise.",
          },
          fields: {
            type: "array",
            description: "The visible input fields of the form.",
            items: {
              type: "object",
              required: ["name", "label", "type", "placeholder", "required"],
              properties: {
                name: {
                  type: "string",
                  nullable: true,
                  description:
                    "The field name attribute when readable. Null otherwise.",
                },
                label: {
                  type: "string",
                  nullable: true,
                  description:
                    "The visible field label or placeholder text. Null when absent.",
                },
                type: {
                  type: "string",
                  enum: [
                    "text",
                    "email",
                    "password",
                    "number",
                    "tel",
                    "url",
                    "search",
                    "textarea",
                    "select",
                    "checkbox",
                    "radio",
                    "file",
                    "date",
                    "submit",
                    "other",
                  ],
                  description: "The kind of input control.",
                },
                placeholder: {
                  type: "string",
                  nullable: true,
                  description:
                    "The visible placeholder text. Null when absent.",
                },
                required: {
                  type: "boolean",
                  nullable: true,
                  description:
                    "Whether the field is visibly marked as required. Null when it cannot be determined.",
                },
              },
            },
          },
        },
      },
    },
    images: {
      type: "array",
      description: "Visible images, illustrations, icons and logos.",
      items: {
        type: "object",
        required: ["description", "alt", "context"],
        properties: {
          description: {
            type: "string",
            nullable: true,
            description:
              "What the image shows. Null when it is a pure decorative element.",
          },
          alt: {
            type: "string",
            nullable: true,
            description: "The visible alt text or caption. Null when absent.",
          },
          context: {
            type: "string",
            nullable: true,
            description:
              "Where the image appears, for example in a hero or an avatar row. Null when unclear.",
          },
        },
      },
    },
    contact: {
      type: "array",
      description:
        "Visible contact details such as email addresses, phone numbers and postal addresses.",
      items: {
        type: "object",
        required: ["type", "value", "label"],
        properties: {
          type: {
            type: "string",
            enum: ["email", "phone", "address", "other"],
            description: "The kind of contact detail.",
          },
          value: {
            type: "string",
            description: "The contact value exactly as visible.",
          },
          label: {
            type: "string",
            nullable: true,
            description: "The visible surrounding label. Null when absent.",
          },
        },
      },
    },
    social: {
      type: "array",
      description: "Visible social media platform references and handles.",
      items: {
        type: "object",
        required: ["platform", "handle", "url"],
        properties: {
          platform: {
            type: "string",
            description:
              "The social platform name, for example Facebook, X, LinkedIn, Instagram or YouTube.",
          },
          handle: {
            type: "string",
            nullable: true,
            description:
              "The visible account name or handle. Null when absent.",
          },
          url: {
            type: "string",
            nullable: true,
            description: "The visible profile URL. Null when absent.",
          },
        },
      },
    },
    ctas: {
      type: "array",
      description:
        "Visible calls to action: the prominent elements that ask the visitor to sign up, buy, subscribe, download, call or contact.",
      items: {
        type: "object",
        required: ["text", "style", "href", "placement"],
        properties: {
          text: {
            type: "string",
            description: "The visible call to action wording.",
          },
          style: {
            type: "string",
            enum: ["primary", "secondary", "link", "banner", "other"],
            description: "How the call to action is presented.",
          },
          href: {
            type: "string",
            nullable: true,
            description:
              "The link target when it can be read from the screenshot. Null otherwise.",
          },
          placement: {
            type: "string",
            nullable: true,
            description:
              "Where the call to action appears, for example hero, header, pricing table or footer. Null when unclear.",
          },
        },
      },
    },
  },
} as const;
