import { InformationShell } from "@/components/site/information-page";
import { commonQuestions } from "@/lib/site/pages";
export const metadata = {
  title: "Name Retailer frequently asked questions",
  description:
    "Answers about publication visibility, placement pricing, accounts, saved plans and the rebuild preview.",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <InformationShell
      title="A few useful answers."
      label="Frequently asked questions"
      description="Understand browsing, prices, metrics and the boundaries of this rebuild preview."
      active="help"
      image="/01_guest_post_checklist.png"
    >
      <section
        className="reference-tool-faq reference-information-next"
        aria-label="Marketplace questions"
      >
        {commonQuestions.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
    </InformationShell>
  );
}
