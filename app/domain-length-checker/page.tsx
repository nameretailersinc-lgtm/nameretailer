import Link from "next/link";
import { InformationShell } from "@/components/site/information-page";
import { DomainLengthChecker } from "@/components/tools/domain-length-checker";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import {
  jsonLdGraph,
  serializeJsonLd,
  webApplicationNode,
} from "@/lib/seo/structured-data";
import { toolBySlug } from "@/lib/tools/catalog";

const description =
  "Check domain name length and individual DNS labels, including internationalized names in ASCII. Free browser tool with clear limits and no lookup.";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return pageMetadata(
    {
      title: "Domain Name Length Checker | Name Retailer",
      description,
      ...facetMetadata("/domain-length-checker/", await searchParams),
    },
    "/domain-length-checker/",
  );
}
export default function Page() {
  return (
    <InformationShell
      path="/domain-length-checker/"
      title="Domain name length checker"
      label="Domain length checker"
      description={description}
      active="tools"
      parent={["SEO tools", "/seo-tools/"]}
      image="/02_content_metrics_panel.png"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            jsonLdGraph(
              webApplicationNode(toolBySlug("domain-length-checker")!),
            ),
          ),
        }}
      />
      <DomainLengthChecker />
      <section className="reference-card">
        <h2>How to check a name</h2>
        <ol>
          <li>Enter a bare domain such as example.com, without a URL path.</li>
          <li>
            Select Check length to see the complete ASCII hostname and each
            label.
          </li>
          <li>
            Compare the result with your shortlist, then verify registration
            eligibility with a registrar.
          </li>
        </ol>
        <p>
          example.com is 11 ASCII characters including its dot. Its labels are
          example (7) and com (3). Subdomains count as separate labels;
          shop.example.com is 16 characters.
        </p>
      </section>
      <section className="reference-card">
        <h2>Methodology and limitations</h2>
        <p>
          DNS permits up to 63 octets per label and 255 octets in wire format.
          For a hostname written with dots and without the final root dot, the
          corresponding maximum is 253 ASCII characters. This tool compares the
          ASCII form with those limits.
        </p>
        <p>
          Internationalized domains use the browser URL parser to convert
          Unicode into ASCII labels, often starting with xn--. For example,
          bücher.de becomes xn--bcher-kva.de (16 ASCII characters). The input
          character count uses Unicode code points, which may differ from
          visible symbols.
        </p>
        <p>
          This is a hostname length check. It does not consult a public suffix
          list, validate registry-specific rules or trademarks, check DNS, or
          determine availability, age, price or SEO quality. A syntactically
          acceptable name may use an unsupported extension. No input is sent to
          a lookup service.
        </p>
        <p>
          Source:{" "}
          <a href="https://www.rfc-editor.org/rfc/rfc1035#section-2.3.4">
            RFC 1035 DNS size limits
          </a>
          .
        </p>
      </section>
      <section className="reference-card">
        <h2>Common questions</h2>
        <h3>Is a shorter domain always better?</h3>
        <p>
          Shorter names can be easier to type, but a pronounceable and
          distinctive longer name may be easier to remember than an unclear
          abbreviation. Test your shortlist with real readers.
        </p>
        <h3>Does passing mean I can register it?</h3>
        <p>
          No. Check with a registrar for current availability and the
          extension’s registration rules. A DNS response, or its absence, does
          not prove registration availability.
        </p>
        <h3>Are internationalized names supported?</h3>
        <p>
          The tool shows the browser’s ASCII conversion and its length. Registry
          eligibility and visual similarity risks still need separate checks.
        </p>
        <p>
          <Link href="/domain-names/">Explore the domain planning hub</Link> or{" "}
          <Link href="/guides/choose-a-domain-name/">
            use the business domain naming checklist
          </Link>
          .
        </p>
      </section>
    </InformationShell>
  );
}
