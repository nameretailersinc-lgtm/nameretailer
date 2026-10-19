export type Author = {
  slug: string;
  name: string;
  /** Owner-supplied biography. Leave empty until supplied; the page stays noindex without it. */
  bio?: string;
  jobTitle?: string;
};

// Author identity and biography supplied by the owner on October 19, 2026.
export const authors: Author[] = [
  { slug: "zuhoor-uddin", name: "Zuhoor Uddin" },
  {
    slug: "fahad-shaikh",
    name: "Fahad Shaikh",
    bio: "Fahad Shaikh is the owner of THE Promoters FZC, NameRetailer.com and YourMainDomain.com.",
    jobTitle: "Owner",
  },
];

export const authorByName = (name?: string) =>
  authors.find((author) => author.name === name);
export const authorBySlug = (slug: string) =>
  authors.find((author) => author.slug === slug);
export const authorPath = (author: Author) => `/authors/${author.slug}/`;
