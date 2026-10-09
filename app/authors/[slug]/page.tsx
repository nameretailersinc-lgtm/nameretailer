import Link from "next/link";
import { notFound } from "next/navigation";
import { InformationShell } from "@/components/site/information-page";
import { authorBySlug, authorPath, authors } from "@/lib/site/authors";
import { buyerGuides } from "@/lib/site/buyer-guides";
import { pageMetadata } from "@/lib/seo/page-metadata";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () =>
  authors.map((author) => ({ slug: author.slug }));

export async function generateMetadata({ params }: Props) {
  const author = authorBySlug((await params).slug);
  if (!author) notFound();
  return pageMetadata(
    {
      title: `${author.name} | Name Retailer`,
      description: `Guest-post buying guides written by ${author.name} for Name Retailer.`,
      // Stay out of the index until the owner supplies a real biography.
      ...(author.bio ? {} : { robots: { index: false, follow: true } }),
    },
    authorPath(author),
  );
}

export default async function Page({ params }: Props) {
  const author = authorBySlug((await params).slug);
  if (!author) notFound();
  const written = buyerGuides.filter(
    (guide) => guide.approved && guide.author === author.name,
  );
  return (
    <InformationShell
      path={authorPath(author)}
      parent={["Guides", "/guides/"]}
      title={author.name}
      label={author.name}
      description={
        author.bio ||
        `${author.name} writes guest-post buying guides for Name Retailer.`
      }
      active="guides"
      image="/01_guest_post_checklist.png"
    >
      {/* TODO(owner): biography, job title and real profile links are not published. */}
      {written.length > 0 && (
        <section className="reference-card">
          <h2>Guides by {author.name}</h2>
          <ul>
            {written.map((guide) => (
              <li key={guide.slug}>
                <Link href={`/guides/${guide.slug}/`}>{guide.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </InformationShell>
  );
}
