import Link from "next/link";

export function ReadinessGuide() {
  return (
    <section
      className="reference-card readiness-guide"
      aria-labelledby="readiness-guide-title"
    >
      <span className="readiness-kicker">Understand your report</span>
      <h2 id="readiness-guide-title">
        What does an SEO, AEO and GEO checker do?
      </h2>
      <p>
        This free checker examines one page’s HTML for search metadata, answer
        structure and attribution signals. It groups 14 checks into three
        reports and explains what to review next. Enter a public URL or paste
        HTML to begin.
      </p>
      <div className="readiness-guide-grid">
        <article>
          <span>01 / SEO</span>
          <h3>Help search engines understand the page</h3>
          <p>
            Search engine optimization starts with a descriptive title, useful
            metadata, a clear main heading, canonical markup and image
            alternatives. Review indexing instructions before making smaller
            editorial changes.
          </p>
        </article>
        <article>
          <span>02 / AEO</span>
          <h3>Make answers easier to find</h3>
          <p>
            Answer engine optimization focuses on clear responses to real
            questions. This checklist looks for question headings, concise
            answers, scannable information and parseable structured data.
          </p>
        </article>
        <article>
          <span>03 / GEO</span>
          <h3>Make information easier to assess</h3>
          <p>
            Generative engine optimization considers how clearly a page explains
            and attributes its information. Review source links, author markup,
            dates and explanatory content, then verify their accuracy yourself.
          </p>
        </article>
      </div>
      <h2>Frequently asked questions</h2>
      <details open>
        <summary>How are the scores calculated?</summary>
        <p>
          Each detected signal has equal weight. A category score is the
          percentage of its checks that pass; the overall score counts all 14
          checks. These are structural checklist scores, not measurements of
          rankings, traffic, authority or AI visibility.
        </p>
      </details>
      <details>
        <summary>Can I check a URL instead of pasting HTML?</summary>
        <p>
          Yes. Choose Page URL and enter a public HTTP or HTTPS address. The
          server fetches the page HTML, follows a limited number of redirects
          and returns it for analysis. Pages requiring login or blocking
          automated access may need pasted HTML.
        </p>
      </details>
      <details>
        <summary>
          Does this checker predict AI citations or Google rankings?
        </summary>
        <p>
          No. Clear structure and attribution can make information easier to
          interpret, but these checks cannot predict placement in search
          results, AI answers or citations. Manually assess content accuracy,
          relevance and source credibility.
        </p>
      </details>
      <details>
        <summary>
          Does the tool inspect JavaScript content or Core Web Vitals?
        </summary>
        <p>
          No. It inspects the returned or pasted HTML without executing page
          scripts. It does not measure performance, rendered content, HTTP
          indexing headers, robots.txt, backlinks or actual search indexing.
        </p>
      </details>
      <details>
        <summary>What should I fix first?</summary>
        <p>
          Check unintended indexing blocks and the preferred canonical URL
          first. Then improve the title, description and main heading. Finally,
          review answer clarity, evidence and attribution. Only apply a
          recommendation when it suits the page’s purpose.
        </p>
      </details>
      <p>
        Continue with the{" "}
        <Link href="/schema-markup-validator/">schema markup validator</Link>,{" "}
        <Link href="/image-alt-checker/">image alt checker</Link> or{" "}
        <Link href="/seo-tools/">all SEO tools</Link>.
      </p>
    </section>
  );
}
