const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
const validDate = (value?: string): value is string =>
  !!value && Number.isFinite(Date.parse(value));
export function EditorialByline({
  author,
  reviewer,
  publishedAt,
  updatedAt,
  hideMissingReviewer = false,
}: {
  author?: string;
  reviewer?: string;
  publishedAt?: string;
  updatedAt?: string;
  hideMissingReviewer?: boolean;
}) {
  // TODO(owner): supply approved identities when absent. No invented attribution.
  return (
    <div className="reference-article-meta journal-meta">
      <span>
        {author ? `Author: ${author}` : "Author details are not published."}
      </span>
      {reviewer ? (
        <span>Reviewer: {reviewer}</span>
      ) : (
        !hideMissingReviewer && <span>Reviewer details are not published.</span>
      )}
      {validDate(publishedAt) && (
        <span>
          Published:{" "}
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
        </span>
      )}
      {validDate(updatedAt) && (
        <span>
          Last updated:{" "}
          <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
        </span>
      )}
    </div>
  );
}
