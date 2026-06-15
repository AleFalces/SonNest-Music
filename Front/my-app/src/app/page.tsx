import CallToActionSection from "@/components/landingHome/CallToActionSection";
import FeaturesSection from "@/components/landingHome/FeaturesSection";
import HeroSection from "@/components/landingHome/HeroSection";
import HowItWorksSection from "@/components/landingHome/HowItWorksSection";
import TestimonialsSection from "@/components/landingHome/TestimonialsSection";

export default function Home() {
  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CallToActionSection />
    </main>
  );
}
