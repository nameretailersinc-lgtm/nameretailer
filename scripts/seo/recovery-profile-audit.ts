import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { profileSitemapEntries } from "../../lib/commerce/publication-profiles";
import {
  publicationPath,
  hasPublicationProfile,
} from "../../lib/commerce/publication-pages";
import { publicationPresentation } from "../../lib/commerce/publication-presentation";
import { concise } from "../../lib/seo/page-metadata";
try {
  const profiles = await profileSitemapEntries();
  const rows = profiles.map((profile) => {
    const view = publicationPresentation(profile);
    return {
      url: `https://nameretailer.com${publicationPath(profile)}`,
      eligible: hasPublicationProfile(profile),
      title: concise(view.title, 60),
      description: view.description,
      missing: view.missing,
      reviewedContent: !!profile.publicationContent,
      fields: {
        country: !!profile.country,
        language: !!profile.language,
        traffic: profile.metrics.traffic !== null,
        requirements: !!profile.requirements,
      },
    };
  });
  const duplicate = (key: "title" | "description") => {
    const groups = new Map<string, string[]>();
    for (const row of rows)
      groups.set(row[key], [...(groups.get(row[key]) || []), row.url]);
    return [...groups.entries()]
      .filter(([, urls]) => urls.length > 1)
      .map(([value, urls]) => ({ value, urls }));
  };
  await mkdir(".local/seo-recovery", { recursive: true });
  const summary = {
    profiles: rows.length,
    reviewed: rows.filter((r) => r.reviewedContent).length,
    duplicateTitles: duplicate("title"),
    duplicateDescriptions: duplicate("description"),
    rows,
  };
  await writeFile(
    ".local/seo-recovery/profile-audit.json",
    JSON.stringify(summary, null, 2),
  );
  console.log(
    JSON.stringify({
      profiles: rows.length,
      reviewed: summary.reviewed,
      duplicateTitles: summary.duplicateTitles.length,
      duplicateDescriptions: summary.duplicateDescriptions.length,
    }),
  );
  process.exit(0);
} catch (error) {
  console.error(
    JSON.stringify({
      errorType: error instanceof Error ? error.name : "Unknown",
      note: "Read-only profile audit failed; no data changed.",
    }),
  );
  process.exit(1);
}
