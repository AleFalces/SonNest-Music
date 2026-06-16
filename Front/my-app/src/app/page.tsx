import CallToActionSection from "@/components/landingHome/CallToActionSection";
import FeaturesSection from "@/components/landingHome/FeaturesSection";
import HeroSection from "@/components/landingHome/HeroSection";
import HowItWorksSection from "@/components/landingHome/HowItWorksSection";
import TestimonialsSection from "@/components/landingHome/TestimonialsSection";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <main className="w-full">
      <HeroSection />
      <Reveal>
        <FeaturesSection />
      </Reveal>
      <Reveal>
        <HowItWorksSection />
      </Reveal>
      <Reveal>
        <TestimonialsSection />
      </Reveal>
      <Reveal>
        <CallToActionSection />
      </Reveal>
    </main>
  );
}
