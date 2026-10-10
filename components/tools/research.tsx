import Link from "next/link";
import styles from "./research.module.css";
import { toolBySlug } from "@/lib/tools/catalog";

const comparisons = [
  [
    "word-counter",
    "Check an article's length",
    "Article text",
    "Word and character counts, paragraphs and estimated reading time. It does not assess factual accuracy.",
  ],
  [
    "keyword-density-checker",
    "Review keyword repetition",
    "Article text and a phrase",
    "Word frequency and exact phrase occurrences. There is no recommended density or ranking prediction.",
  ],
  [
    "image-alt-checker",
    "Check image descriptions",
    "Pasted HTML",
    "Missing and empty alt attributes. Review descriptive accuracy yourself; the tool does not crawl a website.",
  ],
  [
    "schema-markup-validator",
    "Check JSON-LD structure",
    "Pasted JSON-LD",
    "Syntax and common structural fields. Use Google's Rich Results Test for supported search features.",
  ],
  [
    "competitor-backlink-analyzer",
    "Compare a backlink report",
    "A CSV export from your provider",
    "Local report analysis. It does not discover new backlinks or check whether a link is still live.",
  ],
  [
    "bulk-domain-rating-checker",
    "Compare listed domains",
    "Domain names",
    "Owner-supplied marketplace scores. Missing domains have no result; scores are not live Ahrefs measurements.",
  ],
] as const;

export function ToolsResearch() {
  return (
    <section className={styles.research} aria-labelledby="seo-tools-comparison">
      <p className="tools-eyebrow">Choose by task</p>
      <h2 id="seo-tools-comparison">Compare SEO tools by input and result</h2>
      <p>
        The best tool for your task answers a specific question with data you
        can inspect. These free online SEO tools help prepare content and
        compare supplied reports. Use the table to choose an input, understand
        the result and decide what still needs a manual check.
      </p>
      <div
        className={styles.table}
        role="region"
        aria-label="SEO tools comparison"
        tabIndex={0}
      >
        <table>
          <caption>
            Content checks and research tools available on Name Retailer
          </caption>
          <thead>
            <tr>
              <th scope="col">Task and tool</th>
              <th scope="col">Input</th>
              <th scope="col">Result and scope</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map(([slug, task, input, result]) => (
              <tr key={slug}>
                <th scope="row">
                  {task}
                  <Link href={`/${slug}/`}>{toolBySlug(slug)!.title}</Link>
                </th>
                <td>{input}</td>
                <td>{result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.answers}>
        <section>
          <h3>What does SEO stand for?</h3>
          <p>
            SEO means search engine optimization: helping search engines
            understand your content and helping people find useful pages. A tool
            can assist with a defined task, such as checking text or markup. Its
            output still needs context, editorial judgment and a check against
            the page visitors actually see.
          </p>
        </section>
        <section>
          <h3>Which tools help check SEO content?</h3>
          <p>
            Start with the word counter for length, then use the keyword density
            checker to spot repetition. Check image descriptions and JSON-LD
            separately when preparing a page. These checks complement a manual
            review of sources, accuracy and audience fit; they do not produce an
            overall SEO quality score.
          </p>
        </section>
        <section>
          <h3>Can I check a site&apos;s traffic here?</h3>
          <p>
            You can compare supplied traffic estimates for listed publications
            in the{" "}
            <Link href="/guest-posting-sites/">guest posting directory</Link>.
            This catalogue does not measure current traffic for arbitrary
            websites. For a site you manage, use its analytics for visits and{" "}
            <a href="https://support.google.com/webmasters/answer/7576553?hl=en">
              Search Console
            </a>{" "}
            for Google Search clicks and impressions.
          </p>
        </section>
        <section>
          <h3>Can I check backlinks or Domain Authority here?</h3>
          <p>
            The backlink analyzer works with a CSV you supply, and the Domain
            Rating lookup uses marketplace records. Neither retrieves a live
            backlink index or a new Domain Authority score. Read the{" "}
            <Link href="/guides/da-vs-dr-and-traffic/">
              DA and DR comparison guide
            </Link>{" "}
            before comparing publisher-supplied scores.
          </p>
        </section>
      </div>
    </section>
  );
}
