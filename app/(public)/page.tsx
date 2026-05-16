import Hero from "@/features/public/components/hero-section";
import ReviewSection from "@/features/public/components/review-section";
import ServicesBento from "@/features/public/components/services-section";
import WhyChoiceUs from "@/features/public/components/about-section";
import ContactSection from "@/features/public/components/contact-section";
export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyChoiceUs />
      <ServicesBento />
      <ReviewSection />
      <ContactSection />
    </>
  );
}
