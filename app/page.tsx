import { Hero, LandingHeader } from "@/components/landing/Hero";
import { Audiences, Facts, Faq, FinalCall, Footer, HowItWorks, MadeForHer, Safety } from "@/components/landing/Sections";

export default function Landing() {
  return (
    // The landing page stays in day colours whatever the system theme; the app itself follows dark and night mode.
    <div data-theme="light" className="flex min-h-dvh flex-col overflow-x-clip bg-paper text-ink">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <Facts />
        <HowItWorks />
        <MadeForHer />
        <Audiences />
        <Safety />
        <Faq />
        <FinalCall />
      </main>
      <Footer />
    </div>
  );
}
