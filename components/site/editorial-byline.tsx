export function EditorialByline({author, reviewer, updatedAt}: {author?:string; reviewer?:string; updatedAt?:string}) {
  // TODO(owner): supply approved identities when absent. No invented attribution.
  return <div className="reference-article-meta journal-meta">
    <span>{author ? `Author: ${author}` : "Author details are not published."}</span>
    <span>{reviewer ? `Reviewer: ${reviewer}` : "Reviewer details are not published."}</span>
    {updatedAt && Number.isFinite(Date.parse(updatedAt)) && <span>Last updated: <time dateTime={updatedAt}>{new Date(updatedAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric",timeZone:"UTC"})}</time></span>}
  </div>;
}
