import PageBanner from "@/component/layout/PageBanner";
import LegalContent, { type LegalSection } from "@/component/legal/LegalContent";
import { createPageMetadata } from "@/lib/seo";

const sections: LegalSection[] = [
  {
    heading: "Information We Collect",
    points: [
      "Account details you provide, such as your name and email address when you contact us.",
      "Content you submit for extraction, including website URLs and uploaded screenshots.",
      "Technical data such as browser type, device information, and pages visited.",
    ],
  },
  {
    heading: "How We Use Your Information",
    points: [
      "To process your extraction requests and return structured results.",
      "To operate, maintain, and improve the Data Lens service.",
      "To respond to your questions, feedback, and support requests.",
      "To detect, prevent, and address technical or security issues.",
    ],
  },
  {
    heading: "Data Retention",
    points: [
      "Extraction results are retained only as long as needed to deliver the service.",
      "Uploaded files are processed in memory and are not stored permanently.",
      "You can request deletion of your data at any time by contacting us.",
    ],
  },
  {
    heading: "Cookies & Local Storage",
    points: [
      "We use local storage to remember your theme preference (light or dark).",
      "We do not use cookies for advertising or cross-site tracking.",
      "You can clear stored preferences at any time through your browser settings.",
    ],
  },
  {
    heading: "Data Sharing",
    points: [
      "We never sell your personal information to third parties.",
      "Data is shared only with trusted providers strictly necessary to run the service.",
      "We may disclose information when required by law or to protect our rights.",
    ],
  },
  {
    heading: "Your Rights",
    points: [
      "You have the right to access, correct, or delete your personal data.",
      "You may object to or restrict certain processing activities.",
      "To exercise these rights, contact us using the details on our contact page.",
    ],
  },
];

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "Read how Data Lens handles information submitted to its website and image extraction tools and how browser-based tools process your data.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageBanner
        title="Privacy Policy"
        currentPath="/privacy"
        subtitle="Your privacy matters. This policy explains what we collect, how we use it, and the choices you have."
        image="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80"
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy" },
        ]}
      />
      <LegalContent
        updatedAt="October 17, 2026"
        intro="Data Lens is committed to protecting your privacy. This Privacy Policy describes the information we collect when you use our website and tools, and how we handle that information responsibly."
        sections={sections}
      />
    </>
  );
}
