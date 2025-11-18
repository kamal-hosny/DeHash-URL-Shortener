import { ChevronDown } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

interface AccordionProps {
  faqs: FAQ[];
  openIndex: number | null;
  toggleFAQ: (index: number) => void;
}

const Accordion = ({ faqs, openIndex, toggleFAQ }: AccordionProps) => {
  return (
    <>
      <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`
                group relative
                rounded-2xl
                backdrop-blur-xl
                border border-border/50
                overflow-hidden
                transition-all duration-300
                bg-gradient-to-br from-card/60 to-card/40
                ${
                  openIndex === index
                    ? "shadow-lg border-primary/50"
                    : "hover:shadow-md hover:border-border"
                }
              `}
            >
              {/* Question Button */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 flex items-center justify-between gap-4 text-left group-hover:bg-muted/30 transition-colors"
              >
                <span className="font-semibold text-lg text-foreground pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`
                    w-5 h-5 text-muted-foreground flex-shrink-0
                    transition-transform duration-300
                    ${openIndex === index ? "rotate-180" : ""}
                  `}
                />
              </button>

              {/* Answer */}
              <div
                className={`
                  overflow-hidden transition-all duration-300
                  ${openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                `}
              >
                <div className="px-6 pb-6 pt-0">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>

              {/* Decorative Glow */}
              {openIndex === index && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              )}
            </div>
          ))}
        </div>
    </>
  )
}

export default Accordion