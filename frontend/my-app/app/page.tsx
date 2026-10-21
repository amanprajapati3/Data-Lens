import Hero from "@/component/home/Hero";
import HomeContent from "@/component/home/HomeContent";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Hero />
      <HomeContent />
    </div>
  );
}
