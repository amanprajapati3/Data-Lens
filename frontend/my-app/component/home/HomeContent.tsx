import AboutPreview from "./sections/AboutPreview";
import ChooseUsPreview from "./sections/ChooseUsPreview";
import HowItWorks from "./sections/HowItWorks";
import HomeCta from "./sections/HomeCta";
import HomeExtraction from "./sections/HomeExtraction";

export default function HomeContent() {
  return (
    <main className="bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <HomeExtraction />
      <AboutPreview />
      <ChooseUsPreview />
      <HowItWorks />
      <HomeCta />
    </main>
  );
}
