import type { Metadata } from "next";
import {
  ToolHero,
  ToolSteps,
  ToolsNext,
  ToolsShell,
} from "@/components/tools/presentation";
import { WordCounter } from "@/components/tools/word-counter";
import { tools } from "@/lib/tools/catalog";
import {
  breadcrumbSchema,
  jsonLdGraph,
  serializeJsonLd,
  webApplicationNode,
} from "@/lib/seo/structured-data";
export const metadata: Metadata = {
  title: "Word Counter – Free Online Tool",
  description:
    "Count words, Unicode characters, paragraphs and estimated reading time locally in your browser. A free Name Retailer tool for writers and SEO teams.",
};
export default function Page() {
  const tool = tools.find((entry) => entry.slug === "word-counter")!;
  return (
    <ToolsShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            jsonLdGraph(
              breadcrumbSchema([
                ["Home", "/"],
                ["Free tools", "/seo-tools/"],
                [tool.title, `/${tool.slug}/`],
              ]),
              webApplicationNode(tool),
            ),
          ),
        }}
      />
      <ToolHero tool={tool} />
      <WordCounter />
      <ToolSteps tool={tool} />
      <section className="reference-tool-faq" id="tool-faq">
        <div className="reference-section-heading">
          <div>
            <p className="eyebrow">Common questions</p>
            <h2>A few useful details.</h2>
          </div>
        </div>
        {[
          [
            "Does this tool upload my text?",
            "No. Counting happens in this browser tab. We do not send the input to a server, save it in local storage or include it in copied summaries.",
          ],
          [
            "Why can word counts differ between tools?",
            "This tool uses the browser’s Unicode word segmentation and counts segments identified as words. Different tools may use different rules for punctuation, numbers and languages.",
          ],
          [
            "How is reading time calculated?",
            "We divide the word count by 200 words per minute and round up. This is an estimate, not an individual reader measurement.",
          ],
          [
            "What counts as a paragraph?",
            "Each nonempty line is counted as a paragraph. Empty lines and whitespace-only lines are ignored. Characters count Unicode code points, including spaces and line breaks.",
          ],
        ].map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
      <ToolsNext />
    </ToolsShell>
  );
}
