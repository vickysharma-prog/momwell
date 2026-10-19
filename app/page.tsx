import { Hero, LandingHeader } from "@/components/landing/Hero";
import { Audiences, Faq, FinalCall, Footer, Journey, MadeForHer, Pillars, SeeItWork, Stakes } from "@/components/landing/Sections";

export default function Landing() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-paper text-ink">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <Stakes />
        <Pillars />
        <Journey />
        <SeeItWork />
        <MadeForHer />
        <Audiences />
        <Faq />
        <FinalCall />
      </main>
      <Footer />
    </div>
  );
}
