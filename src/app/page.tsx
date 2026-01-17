import {
  LandingHeader,
  HeroSection,
  FeaturesSection,
  TemplatesSection,
  TestimonialsSection,
  CTASection,
  LandingFooter,
} from "@/components/landing";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <TemplatesSection />
      <TestimonialsSection />
      <CTASection />
      <LandingFooter />
    </main>
  );
}
