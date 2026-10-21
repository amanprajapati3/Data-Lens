import PageBanner from "@/component/layout/PageBanner";
import LegalContent, { type LegalSection } from "@/component/legal/LegalContent";
import { createPageMetadata } from "@/lib/seo";

const sections: LegalSection[] = [
  {
    heading: "Acceptance of Terms",
    points: [
      "By accessing or using Data Lens, you agree to be bound by these Terms & Conditions.",
      "If you do not agree with any part of these terms, please do not use the service.",
      "You must be at least 16 years old to use the service.",
    ],
  },
  {
    heading: "Use of the Service",
    points: [
      "Data Lens is provided for lawful data extraction and research purposes only.",
      "You agree not to use the service to scrape, store, or process content in violation of any applicable law.",
      "You must respect the terms of service and robots directives of any website you extract.",
    ],
  },
  {
    heading: "Intellectual Property",
    points: [
      "The Data Lens name, logo, and interface are our intellectual property.",
      "Extracted content remains the property of its original owners.",
      "You are responsible for ensuring you have the right to use any data you extract.",
    ],
  },
  {
    heading: "Limitation of Liability",
    points: [
      "The service is provided on an \"as is\" and \"as available\" basis.",
      "We do not guarantee that extraction results will be accurate, complete, or uninterrupted.",
      "We are not liable for any indirect, incidental, or consequential damages arising from use of the service.",
    ],
  },
  {
    heading: "Service Availability",
    points: [
      "We may modify, suspend, or discontinue any part of the service at any time.",
      "Scheduled maintenance or unforeseen outages may temporarily interrupt access.",
      "We are not liable for any loss resulting from downtime or service changes.",
    ],
  },
  {
    heading: "Changes to These Terms",
    points: [
      "We may update these terms from time to time to reflect service or legal changes.",
      "Continued use of the service after changes constitutes acceptance of the revised terms.",
      "The date of the latest revision is always shown at the top of this page.",
    ],
  },
];

export const metadata = createPageMetadata({
  title: "Terms and Conditions",
  description:
    "Review the terms for using Data Lens website extraction, image extraction, JSON editing, conversion, and compression tools.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageBanner
        title="Terms & Conditions"
        currentPath="/terms"
        subtitle="Please read these terms carefully before using Data Lens. They set out the rules for using our service."
        image="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1600&q=80"
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Terms & Conditions" },
        ]}
      />
      <LegalContent
        updatedAt="October 17, 2026"
        intro="These Terms & Conditions govern your access to and use of the Data Lens website and tools. By using the service, you accept these terms in full."
        sections={sections}
      />
    </>
  );
}
