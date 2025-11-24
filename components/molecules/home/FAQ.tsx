"use client";

import { useState } from "react";
import { HelpCircle } from "@/assets/icons/index";
import { faqs } from "@/data";
import Accordion from "@/components/atoms/Accordion";
import Link from "@/components/atoms/Link";
import { Button } from "@/components/ui/button";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const INITIAL_COUNT = 4;

  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleShowMore = () => {
    setVisibleCount(faqs.length);
  };

  const handleShowLess = () => {
    setVisibleCount(INITIAL_COUNT);
    setOpenIndex(0);
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 bg-secondary/30 border border-secondary/50 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4">
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm text-primary font-medium">
              Got Questions?
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-accent px-4">
            Frequently Asked Questions
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
            Find answers to common questions about our URL shortening service
          </p>
        </div>

        {/* FAQ Items */}
        <Accordion
          faqs={faqs.slice(0, visibleCount)}
          openIndex={openIndex}
          toggleFAQ={toggleFAQ}
        />

        {/* More / Less Button */}
        <div className="text-center mt-6 sm:mt-8">
          {visibleCount < faqs.length ? (
            <Button onClick={handleShowMore} size="lg" className="rounded-full">
              Show More
            </Button>
          ) : (
            <Button
              onClick={handleShowLess}
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              Show Less
            </Button>
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-8 sm:mt-12 text-center px-4">
          <div className="inline-flex items-center gap-2 bg-muted/60 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-border">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Still have questions?{" "}
              <Link
                href={"/signin"}
                className="text-primary hover:text-primary/80 font-semibold underline-offset-4 hover:underline"
              >
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
