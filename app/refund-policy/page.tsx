import Link from "next/link";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import type { Metadata } from "next";
import { InformationShell } from "@/components/site/information-page";

// Owner-approved 2026-10-09: the policy published on the previous site (Wayback
// snapshot 2026-05-16), restored word for word except: contact email changed to
// info@nameretailer.com, the unfilled phone placeholder removed, effective date added.
// Do not change these terms without owner approval.
const effective = "2026-10-09";
const contact = "info@nameretailer.com";

const baseMetadata: Metadata = {
  title: "Refund Policy",
  description:
    "When Name Retailer refunds a guest post order: if the site owner rejects your request within one business day. Processing times and how to request a refund.",
  alternates: { canonical: "https://nameretailer.com/refund-policy/" },
};

export default function Page() {
  return (
    <InformationShell
      path="/refund-policy/"
      title="Refund Policy"
      label="Refund policy"
      description="At NameRetailer, we strive to provide a smooth and transparent experience for all our customers. Our services are designed to ensure quality, and while we do allow refunds in specific cases, it is important to understand our policies before making a purchase."
      active="help"
      image="/01_guest_post_checklist.png"
    >
      <div className="reference-information-sections">
        <section className="reference-card">
          <p>
            <strong>Effective date:</strong>{" "}
            <time dateTime={effective}>October 9, 2026</time>
          </p>
          <p>
            We request you to carefully read our refund policy to avoid any
            misunderstandings. By using our services, you agree to the following
            terms and conditions regarding refunds.
          </p>
        </section>
        <section className="reference-card">
          <h2>1. Refund Eligibility</h2>
          <p>
            A refund will only be granted if your request is denied by the site
            owner. This means:
          </p>
          <ul>
            <li>You submit a request for our service.</li>
            <li>The site owner reviews your request within 1 business day.</li>
            <li>
              If the site owner rejects or denies your request, we will issue a
              refund.
            </li>
          </ul>
          <p>
            If the site owner denies the link placement within 1 business day,
            your full amount will be refunded automatically. The refund will be
            processed back to your original payment method.
          </p>
        </section>
        <section className="reference-card">
          <h2>2. No Refunds After Link Approval</h2>
          <p>
            Once the site owner has approved your request, the process is
            considered final and non-reversible. After approval:
          </p>
          <ul>
            <li>
              The service has been successfully delivered, and no further
              refunds will be granted.
            </li>
            <li>
              Even if you change your mind later, we will not be able to issue a
              refund.
            </li>
          </ul>
          <p>
            We encourage customers to make informed decisions before proceeding
            with their purchase.
          </p>
          <p>
            Since our service involves digital transactions and approvals, it is
            not possible to revoke or undo a completed process. Therefore, all
            sales are final once the link is approved.
          </p>
        </section>
        <section className="reference-card">
          <h2>3. Refund Processing Time</h2>
          <p>
            If a refund is approved (due to site owner denial), it will be
            processed as follows:
          </p>
          <ul>
            <li>
              Refunds are typically issued within 3-5 business days after
              approval.
            </li>
            <li>
              The amount will be refunded via the same payment method used for
              the transaction.
            </li>
            <li>
              Depending on your bank or payment provider, it may take additional
              time for the refund to reflect in your account.
            </li>
          </ul>
          <p>
            If you do not receive the refund within the expected time frame,
            please check with your bank or payment provider before contacting
            us.
          </p>
        </section>
        <section className="reference-card">
          <h2>4. How to Request a Refund?</h2>
          <p>
            If your link request is denied and you believe you are eligible for
            a refund, please follow these steps:
          </p>
          <h3>Step 1: Contact Our Support Team</h3>
          <p>
            Email: <a href={`mailto:${contact}`}>{contact}</a>
          </p>
          <h3>Step 2: Provide the Following Details</h3>
          <ul>
            <li>Your Order ID</li>
            <li>
              Payment Details (last 4 digits of card/PayPal transaction ID)
            </li>
            <li>Reason for the refund request</li>
            <li>Any additional information regarding your order</li>
          </ul>
          <p>
            Our support team will verify your request and process the refund
            accordingly.
          </p>
        </section>
        <section className="reference-card">
          <h2>5. Important Notes</h2>
          <ul>
            <li>
              Refunds are only applicable if the site owner denies the request
              within 1 business day.
            </li>
            <li>
              If the site owner approves your request, the order is final, and
              no refund will be issued.
            </li>
            <li>
              We do not offer refunds due to personal reasons, change of mind,
              or late cancellations.
            </li>
            <li>
              Refunds may take additional time depending on your bank’s policies
              and processing speed.
            </li>
            <li>
              If you experience any issues, please reach out to our support team
              before disputing a transaction with your bank or payment provider.
            </li>
          </ul>
        </section>
        <section className="reference-card">
          <h2>6. Dispute Resolution</h2>
          <p>
            If you believe your refund request was unfairly denied, you may
            escalate your case by contacting our customer support team. We will
            review your case and provide a final decision based on our refund
            policy.
          </p>
          <p>
            We are committed to providing a fair and professional service, and
            we appreciate your cooperation in understanding our policies.
          </p>
        </section>
        <section className="reference-card">
          <h2>7. Contact Us</h2>
          <p>
            For any further questions regarding our refund policy, feel free to
            reach out:
          </p>
          <p>
            Email: <a href={`mailto:${contact}`}>{contact}</a>
          </p>
          <p>
            See also the <Link href="/help-center/">help center</Link>.
          </p>
        </section>
      </div>
    </InformationShell>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const facets = facetMetadata("/refund-policy/", await searchParams);
  return pageMetadata(
    {
      ...baseMetadata,
      alternates: facets.alternates,
      ...(facets.robots ? { robots: facets.robots } : {}),
    },
    "/refund-policy/",
  );
}
