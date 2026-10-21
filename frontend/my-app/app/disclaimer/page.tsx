import PageBanner from "@/component/layout/PageBanner";
import LegalContent, { type LegalSection } from "@/component/legal/LegalContent";
import { createPageMetadata } from "@/lib/seo";

const sections: LegalSection[] = [
  {
    heading: "General Information",
    points: [
      "The content provided by Data Lens is for general informational purposes only.",
      "All information is provided in good faith, but we make no warranty of any kind regarding its accuracy.",
      "Any reliance you place on the extracted data is strictly at your own risk.",
    ],
  },
  {
    heading: "Accuracy of Extracted Data",
    points: [
      "Automated extraction can introduce errors, omissions, or formatting differences.",
      "Always verify critical data against the original source before relying on it.",
      "We are not responsible for decisions made based on extracted results.",
    ],
  },
  {
    heading: "External Links",
    points: [
      "The service may reference or extract content from third-party websites.",
      "We do not control and are not responsible for the content of external sites.",
      "Links shown in extracted data do not imply endorsement of those sites.",
    ],
  },
  {
    heading: "Professional Advice",
    points: [
      "Data Lens does not provide legal, financial, or professional advice.",
      "Extracted data should not be treated as a substitute for professional guidance.",
      "Consult a qualified professional before acting on any extracted information.",
    ],
  },
  {
    heading: "Consent",
    points: [
      "By using Data Lens, you consent to this disclaimer and agree to its terms.",
      "If you do not agree, please discontinue use of the service.",
      "This disclaimer may be updated at any time without prior notice.",
    ],
  },
];

export const metadata = createPageMetadata({
  title: "Disclaimer",
  description:
    "Understand the limitations of automated website and image extraction and the outputs provided by Data Lens.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <>
      <PageBanner
        title="Disclaimer"
        currentPath="/disclaimer"
        subtitle="Please review this disclaimer to understand the limitations of the data provided by Data Lens."
        image="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80"
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Disclaimer" },
        ]}
      />
      <LegalContent
        updatedAt="October 17, 2026"
        intro="The information and extracted data provided by Data Lens are offered for general informational purposes. This disclaimer outlines the limits of our responsibility regarding that content."
        sections={sections}
      />
    </>
  );
}
