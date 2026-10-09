export type Author = {
  slug: string;
  name: string;
  /** Owner-supplied biography. Leave empty until supplied; the page stays noindex without it. */
  bio?: string;
  jobTitle?: string;
};

// TODO(owner): supply a short real biography and job title for each author. Do not invent them.
export const authors: Author[] = [
  { slug: "zuhoor-uddin", name: "Zuhoor Uddin" },
];

export const authorByName = (name?: string) =>
  authors.find((author) => author.name === name);
export const authorBySlug = (slug: string) =>
  authors.find((author) => author.slug === slug);
export const authorPath = (author: Author) => `/authors/${author.slug}/`;
