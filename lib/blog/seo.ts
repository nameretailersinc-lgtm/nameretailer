import { publicArticle } from "./public-copy";
import type { CmsRecord } from "../cms/types";
import { blogContentUpdatedAt } from "./editorial";
import { bodyText, sanitizeBody } from "../cms/content";
import { blogArticleIndexable } from "./indexing-policy";
import { canonicalUrl, canonicalOrigin } from "../seo/metadata";
import { facetMetadata } from "../seo/facets";
import type { SearchParams } from "../commerce/marketplace-query";

/** Keep the public article's owner-approved index policy and sitemap in sync. */
export function blogSitemapEntry(record: CmsRecord) {
  record = publicArticle(record);
  if (
    record.collection !== "content" ||
    record.status !== "published" ||
    record.data.type !== "post" ||
    !/^blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug) ||
    record.slug.length > 235 ||
    !blogArticleIndexable(record) ||
    !bodyText(sanitizeBody(String(record.data.body || ""))).trim() ||
    canonicalUrl(record) !== `${canonicalOrigin}/${record.slug}/`
  )
    return null;
  const updatedAt = blogContentUpdatedAt(record);
  return {
    url: canonicalUrl(record),
    ...(Number.isFinite(Date.parse(updatedAt))
      ? { lastModified: new Date(updatedAt) }
      : {}),
  };
}

export function blogRouteMetadata(record: CmsRecord, params: SearchParams) {
  record = publicArticle(record);
  const facets = facetMetadata(`/${record.slug}/`, params);
  return {
    alternates: { canonical: canonicalUrl(record) },
    robots: {
      index:
        blogArticleIndexable(record) &&
        (facets.robots as { index: boolean }).index,
      follow: blogArticleIndexable(record)
        ? record.data.robotsFollow !== false
        : true,
    },
  };
}
