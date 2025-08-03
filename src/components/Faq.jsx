import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Why is there a $1 charge?",
    answer:
      "The $1 charge helps verify real users, reduce spam, and support the cost of keeping this platform running. It also gives you lifetime access to your report and updates. If you don’t qualify for any benefit, it’s fully refundable.",
  },
  {
    question: "Is this a government website?",
    answer:
      "No. We’re an independent service that helps seniors easily check what programs they may qualify for. All listed programs are legitimate and widely available.",
  },
  {
    question: "What kind of benefits can I expect?",
    answer:
      "Depending on your answers, you may see programs like food cards, healthcare savings, accident compensation, debt relief options, and other senior support programs.",
  },
  {
    question: "How long will it take to receive my benefits report?",
    answer:
      "Your report is generated instantly using AI, right after you complete the check. You’ll get it sent to your email within seconds. It’s fast, secure, and ready when you are.",
  },
  {
    question: "Is my information safe?",
    answer:
      "Yes. Your information is encrypted and never sold or shared. We take privacy and security seriously.",
  },
  {
    question: "Can I share this with a friend or family member?",
    answer:
      "Yes, if they’re 65 or older, they can also complete the check and receive their own personalized benefits report for $1 as well.",
  },
  {
    question: "Can I get a refund if I don’t qualify?",
    answer:
      "Yes. If you don’t qualify for any program or you're not satisfied for any other reason, we refund the $1 automatically.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="max-w-2xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center text-[#005e54] mb-8">
        Frequently Asked Questions
      </h2>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-[#005e54] rounded-2xl overflow-hidden shadow-md transition-all"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between text-left px-6 py-4 bg-white hover:bg-[#f0fdfa] transition duration-300"
            >
              <span className="text-base font-semibold text-[#005e54]">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-[#005e54] transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`px-6 bg-[#f9f9f6] text-sm text-gray-700 transition-all duration-300 overflow-hidden ${
                openIndex === index ? "max-h-96 py-4" : "max-h-0"
              }`}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
