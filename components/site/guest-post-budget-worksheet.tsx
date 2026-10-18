import Link from "next/link";
import { budgetWorksheetEditorial } from "@/lib/blog/editorial";

/** Add practical budget detail to the existing CMS article without rewriting it. */
export function GuestPostBudgetWorksheet() {
  return (
    <section className="reference-card">
      <h2>Fill in a complete placement budget</h2>
      <p>
        Worksheet guidance updated{" "}
        <time dateTime={budgetWorksheetEditorial.updatedAt}>
          October 18, 2026
        </time>
        . Record the currency, date and confirmed scope for each quote. Keep
        unknown costs marked unknown; an unavailable writing option is not free.
      </p>
      <p>
        <a href="/worksheets/guest-post-budget.csv" download>
          Download a blank guest post budget worksheet (CSV)
        </a>
        . Enter amounts in one currency and add only confirmed cost lines. The
        file is a recording template; it does not calculate totals or reserve
        publisher prices.
      </p>
      <div
        className="directory-table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Illustrative guest post budget"
      >
        <table className="directory-table">
          <caption>Hypothetical budget in USD, not publisher prices</caption>
          <thead>
            <tr>
              <th scope="col">Cost line</th>
              <th scope="col">Illustrative amount</th>
              <th scope="col">Confirm with</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Placement</th>
              <td>$90</td>
              <td>Current publisher quote</td>
            </tr>
            <tr>
              <th scope="row">Writing</th>
              <td>$60</td>
              <td>Agreed writer and scope</td>
            </tr>
            <tr>
              <th scope="row">Revisions</th>
              <td>$30</td>
              <td>Included rounds and any extra charge</td>
            </tr>
            <tr>
              <th scope="row">Internal coordination</th>
              <td>$20</td>
              <td>Your own time allowance</td>
            </tr>
            <tr>
              <th scope="row">Illustrative subtotal</th>
              <td>$200</td>
              <td>Actual confirmed costs before any other applicable fees</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3>Compare equal scopes</h3>
      <p>
        If one quote includes writing, do not add a separate writing charge
        again. Check image licensing, specialist review, applicable fees and any
        currency conversion before finalizing the total. Keep a contingency
        under your control separate from publisher charges. A saved placement
        plan is an organizational aid and does not confirm acceptance,
        availability or a final price.
      </p>
      <h3>Connect the budget to a decision</h3>
      <p>
        Record the reader action you want and the reporting period before
        spending. Compare{" "}
        <Link href="/guides/free-vs-paid-guest-posting/">
          free and paid contributions
        </Link>
        , review the <Link href="/guides/guest-post-cost/">cost guide</Link> and
        use the{" "}
        <Link href="/guides/measure-guest-posting-results/">
          results and ROI guide
        </Link>{" "}
        to distinguish observed business value from referral counts.
      </p>
    </section>
  );
}
