import FAQ from "@/components/molecules/home/FAQ";
import Features from "@/components/molecules/home/Features";
import Hero from "@/components/molecules/home/Hero";
import Pricing from "@/components/molecules/home/Pricing";
import Testimonials from "@/components/molecules/home/Testimonials";

export default function Home() {
  return (
    <div className="container mx-auto">
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
    </div>
  );
}


