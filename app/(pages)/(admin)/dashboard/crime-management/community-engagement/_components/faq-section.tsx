"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function FAQSection() {
  const faqs = [
    {
      question: "How do I report a non-emergency incident?",
      answer:
        "You can use the 'Report an Incident' form on this portal, call the non-emergency number at 555-123-4567, or visit your local police station in person.",
    },
    {
      question: "How can I join a Neighborhood Watch group?",
      answer:
        "Check the 'Neighborhood Watch' section for groups in your area. You can contact the coordinator directly or click 'Start or Join a Group' for more information.",
    },
    {
      question: "What should I do if I witness a crime?",
      answer:
        "If it's an emergency or crime in progress, call 911 immediately. For non-emergencies, use the non-emergency line or the reporting form on this portal.",
    },
    {
      question: "How can I request extra patrols in my neighborhood?",
      answer:
        "Contact your local precinct or submit a request through the 'Community Feedback' section of this portal.",
    },
  ]

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="mt-4 space-y-2">
      {faqs.map((faq, index) => (
        <div key={index} className="border rounded-lg overflow-hidden">
          <button
            className="flex justify-between items-center w-full p-3 text-left text-sm font-medium"
            onClick={() => toggleFAQ(index)}
          >
            {faq.question}
            <ChevronDown className={`h-4 w-4 transition-transform ${openIndex === index ? "rotate-180" : ""}`} />
          </button>
          {openIndex === index && <div className="px-3 pb-3 text-xs text-muted-foreground">{faq.answer}</div>}
        </div>
      ))}

      <button className="w-full text-sm text-primary mt-2 py-1">View All FAQs</button>
    </div>
  )
}
