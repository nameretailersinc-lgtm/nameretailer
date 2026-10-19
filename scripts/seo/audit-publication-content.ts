import "dotenv/config";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { Document } from "mongodb";
import { activePublicationFilter } from "../../lib/commerce/publication-profiles";
import { productStore } from "../../lib/commerce/products";
import { PROFILE_RULE, hasPublicationProfile, publicationHost, publicationPath } from "../../lib/commerce/publication-pages";
import { concise } from "../../lib/seo/page-metadata";

// Read-only census plus deterministic stratified sample, using public visibility.
try {
  console.log("Connecting for read-only publication census.");
  const { products } = await productStore();
  const active = await activePublicationFilter();
  const baseline = JSON.parse(await readFile("reports/publication-content-audit.json", "utf8")) as { auditedAt: string; sample: Array<{ id: string }> };
  if (baseline.sample.length < 100 || baseline.sample.some(row => !/^[a-f0-9-]{36}$/i.test(row.id))) throw new Error("Invalid baseline sample");
  console.log("Refreshing the recorded stratified sample; aggregating population statistics on MongoDB.");
  const rows = await products.find({ $and: [active, { id: { $in: baseline.sample.map(row => row.id) } }] }, { timeoutMS: 30000, projection: {
    _id: 0, id: 1, domain: 1, category: 1, country: 1, language: 1,
    priceCents: 1, metrics: 1, metricsUpdatedAt: 1, linkType: 1,
    turnaround: 1, requirements: 1, updatedAt: 1, needsReview: 1, publicationContent: 1,
  }}).sort({ domain: 1, id: 1 }).maxTimeMS(30000).toArray();
  if (rows.length !== baseline.sample.length) throw new Error("Sample membership changed; resampling required");
  console.log(`Loaded ${rows.length} sampled records; no writes to MongoDB.`);
  const textFields = ["category", "country", "language", "linkType", "turnaround", "requirements", "metricsUpdatedAt"] as const;
  const metricKeys = ["da", "dr", "tf", "ur", "traffic", "referringDomains", "backlinks", "spamScore"] as const;
  const present = (path: string) => ({ $and: [{ $ne: [{ $ifNull: [path, null] }, null] }, { $ne: [path, ""] }] });
  const facets: Record<string, Document[]> = Object.fromEntries(textFields.map(key => [key, [
    { $match: { $expr: present(`$${key}`) } }, { $group: { _id: { $trim: { input: `$${key}` } }, count: { $sum: 1 } } },
  ]]));
  facets.total = [{ $count: "value" }];
  facets.metrics = [{ $group: { _id: null, ...Object.fromEntries(metricKeys.map(key => [key, { $sum: { $cond: [{ $isNumber: `$metrics.${key}` }, 1, 0] } }])) } }];
  facets.flags = [{ $group: { _id: null, needsReview: { $sum: { $cond: ["$needsReview", 1, 0] } }, editorial: { $sum: { $cond: [{ $ne: [{ $ifNull: ["$publicationContent", null] }, null] }, 1, 0] } }, reviewed: { $sum: { $cond: [{ $eq: ["$publicationContent.state", "reviewed"] }, 1, 0] } } } }];
  facets.priceBand = [{ $group: { _id: { $switch: { branches: [{ case: { $lte: ["$priceCents", 5000] }, then: "up-to-50" }, { case: { $lte: ["$priceCents", 15000] }, then: "50-to-150" }, { case: { $lte: ["$priceCents", 50000] }, then: "150-to-500" }], default: "over-500" } }, count: { $sum: 1 } } }];
  facets.completeness = [{ $project: { score: { $add: [...textFields.map(key => `$${key}`), ...metricKeys.map(key => `$metrics.${key}`)].map(path => ({ $cond: [present(path), 1, 0] })) } } }, { $group: { _id: "$score", count: { $sum: 1 } } }];
  type Counts = Array<{ _id: string | number; count: number }>;
  const [census] = await products.aggregate<Record<string, Counts> & { total: Array<{ value: number }>; metrics: Array<Record<string, number>>; flags: Array<{ needsReview: number; editorial: number; reviewed: number }> }>([
    { $match: active },
    { $project: { category: 1, country: 1, language: 1, linkType: 1, turnaround: 1, requirements: 1, metricsUpdatedAt: 1, metrics: 1, priceCents: 1, needsReview: 1, publicationContent: 1 } },
    { $facet: facets },
  ], { maxTimeMS: 30000, timeoutMS: 40000 }).toArray();
  const total = census.total[0]?.value || 0;
  const frequencies = Object.fromEntries(textFields.map(key => [key, new Map(census[key].map(row => [String(row._id), row.count]))]));
  console.log(`Aggregated ${total} active/committed listings.`);
  const band = (cents: number) => cents <= 5000 ? "up-to-50" : cents <= 15000 ? "50-to-150" : cents <= 50000 ? "150-to-500" : "over-500";
  const completeness = (row: typeof rows[number]) => [row.category, row.country, row.language, row.linkType, row.turnaround, row.requirements, row.metricsUpdatedAt, ...Object.values(row.metrics || {})].filter((v) => v !== null && v !== undefined && v !== "").length;
  const usd = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
  const number = (value: number) => value.toLocaleString("en-US");
  const metadata = (row: typeof rows[number]) => {
    const host = publicationHost(row.domain, false)!;
    const facts = [ `${usd(row.priceCents)} placement`, row.metrics.dr !== null ? `supplied DR ${row.metrics.dr}` : null, row.metrics.traffic !== null ? `about ${number(row.metrics.traffic)} monthly visits` : null ].filter(Boolean).join(", ");
    return { title: concise(`${host} Guest Post: Price, DR and Traffic`, 60), description: concise(`Guest post on ${host}: ${facts}. Compare listing details before you order.`, 155) };
  };
  const sample = rows.map((row) => {
    const current = metadata(row);
    return { id: row.id, path: publicationPath(row), domain: row.domain, category: row.category, country: row.country, language: row.language, priceCents: row.priceCents, priceBand: band(row.priceCents), completeness: completeness(row), metrics: row.metrics, metricsUpdatedAt: row.metricsUpdatedAt || null, linkType: row.linkType, turnaround: row.turnaround, requirements: row.requirements, updatedAt: row.updatedAt, currentEligible: hasPublicationProfile(row), currentTitle: current.title, currentDescription: current.description };
  });
  const eligible = (await products.find({ $and: [active, { category: { $nin: [...PROFILE_RULE.excludedCategories] }, "metrics.traffic": { $gte: PROFILE_RULE.minTraffic }, "metrics.dr": { $gte: PROFILE_RULE.minDr }, "metrics.da": { $gte: PROFILE_RULE.minDa } }] }, { projection: { _id: 0, id: 1, domain: 1, category: 1, country: 1, language: 1, priceCents: 1, metrics: 1, requirements: 1, metricsUpdatedAt: 1 }, timeoutMS: 30000 }).maxTimeMS(20000).toArray()).filter(hasPublicationProfile);
  const frequencyReport = Object.fromEntries(textFields.map((key) => [key, {
    present: [...frequencies[key].values()].reduce((a,b) => a+b, 0),
    missing: total - [...frequencies[key].values()].reduce((a,b) => a+b, 0),
    distinctNonempty: frequencies[key].size,
    mostRepeated: [...frequencies[key]].sort((a,b) => b[1]-a[1]).slice(0, key === "requirements" ? 8 : 3).map(([value, count]) => ({ value, count })),
  }]));
  const distribution = (values: Array<string | number>) => Object.fromEntries(
    [...values.reduce((counts, value) => counts.set(String(value), (counts.get(String(value)) || 0) + 1), new Map<string, number>())].sort(([a], [b]) => a.localeCompare(b)),
  );
  console.log("Aggregating raw import completeness on MongoDB; raw records are not exported.");
  type SourceSummary = { _id: string; present: number; distinctNonempty: number; placeholdersOrZeros: number; singletonValues: number; maxRepetitions: number; mostRepeated: Array<{ value: string; count: number }> };
  const sourceSummaries = await products.aggregate<SourceSummary>([
    { $match: active },
    { $project: { pairs: { $objectToArray: { $ifNull: ["$source", {}] } } } },
    { $unwind: "$pairs" },
    { $project: { field: "$pairs.k", value: { $trim: { input: { $convert: { input: "$pairs.v", to: "string", onError: "", onNull: "" } } } } } },
    { $group: { _id: { field: "$field", value: "$value" }, count: { $sum: 1 } } },
    { $group: {
      _id: "$_id.field",
      present: { $sum: { $cond: [{ $ne: ["$_id.value", ""] }, "$count", 0] } },
      distinctNonempty: { $sum: { $cond: [{ $ne: ["$_id.value", ""] }, 1, 0] } },
      placeholdersOrZeros: { $sum: { $cond: [{ $or: [
        { $eq: [{ $toLower: "$_id.value" }, { $toLower: "$_id.field" }] },
        { $in: [{ $toLower: "$_id.value" }, ["n/a", "na", "null", "none", "undefined", "-"]] },
        { $regexMatch: { input: "$_id.value", regex: "^0(?:\\.0+)?$" } },
      ] }, "$count", 0] } },
      singletonValues: { $sum: { $cond: [{ $and: [{ $ne: ["$_id.value", ""] }, { $eq: ["$count", 1] }] }, 1, 0] } },
      maxRepetitions: { $max: { $cond: [{ $ne: ["$_id.value", ""] }, "$count", 0] } },
      mostRepeated: { $topN: { n: 4, sortBy: { count: -1, "_id.value": 1 }, output: { value: "$_id.value", count: "$count" } } },
    } },
  ], { maxTimeMS: 45000, timeoutMS: 60000, allowDiskUse: true }).toArray();
  const sourceColumnNames = sourceSummaries.map(row => row._id).sort();
  const sourceFields = Object.fromEntries(sourceSummaries.sort((a,b) => a._id.localeCompare(b._id)).map(row => [row._id, {
    present: row.present, missing: total - row.present, distinctNonempty: row.distinctNonempty,
    placeholdersOrZeros: row.placeholdersOrZeros, singletonValues: row.singletonValues, maxRepetitions: row.maxRepetitions,
    // Hashes prove repetition, not licensing, accuracy or publisher-specific substance.
    mostRepeatedFingerprints: row.mostRepeated.filter(item => item.value).slice(0, 3).map(({ value, count }) => ({ sha256: createHash("sha256").update(value).digest("hex"), characters: value.length, count })),
  }]));
  const uniqueRequirement = (row: typeof rows[number]) => (row.requirements || "").trim().length >= 40 && (frequencies.requirements.get(row.requirements.trim()) || 0) <= 3;
  const report = {
    auditedAt: new Date().toISOString(),
    scope: "Read-only active/committed catalogue census and deterministic stratified sample. Existing indexing rule unchanged at audit time. Supplied fields are not verified publisher/audience evidence.",
    total,
    existingEligible: eligible.length,
    existingNoindex: total - eligible.length,
    eligibleWithDistinctRequirements: eligible.filter(uniqueRequirement).length,
    eligibleWithMetricDate: eligible.filter((r) => !!r.metricsUpdatedAt).length,
    needsReview: census.flags[0]?.needsReview || 0,
    sourceColumnNames,
    sourceFields,
    storedEditorialContent: {
      present: census.flags[0]?.editorial || 0,
      reviewedState: census.flags[0]?.reviewed || 0,
      note: "Presence or a state label is not independent verification. No draft is promoted by this audit.",
    },
    fields: frequencyReport,
    completenessDefinition: { denominator: textFields.length + Object.keys(rows[0]?.metrics || {}).length, fields: [...textFields, ...Object.keys(rows[0]?.metrics || {}).map(k => `metrics.${k}`)], note: "Nonempty supplied fields only; not an editorial quality or verification score. Identity and price are reported separately." },
    populationDistributions: Object.fromEntries(["category", "country", "language", "priceBand", "completeness"].map(key => [key, Object.fromEntries(census[key].map(row => [String(row._id), row.count]))])),
    metrics: Object.fromEntries(metricKeys.map(key => [key, census.metrics[0]?.[key] || 0])),
    sampleSize: sample.length,
    samplingMethod: "Replays the recorded deterministic stratified sample by ID for comparable HTML observations. Original selection: first domain-sorted record per category/country; 12 from each completeness tail; 12 metric candidates; 8 sections; 8 per price band; spaced records if fewer than 160; deduplicate by ID. Not a random or prevalence-weighted sample. Population completeness uses fresh database aggregates, never sample prevalence.",
    sampleSeedAuditedAt: baseline.auditedAt,
    sampleCoverageGaps: { categories: census.category.map(row => String(row._id)).filter(value => !sample.some(row => row.category === value)), countries: census.country.map(row => String(row._id)).filter(value => !sample.some(row => row.country === value)) },
    sampleDistributions: { category: distribution(sample.map(r => r.category)), country: distribution(sample.map(r => r.country)), language: distribution(sample.map(r => r.language)), priceBand: distribution(sample.map(r => r.priceBand)), completeness: distribution(sample.map(r => r.completeness)), metricEligible: sample.filter(r => r.currentEligible).length, sections: sample.filter(r => !publicationHost(r.domain)).length },
    sampleCoverage: { categories: new Set(sample.map(r=>r.category)).size, countries: new Set(sample.map(r=>r.country)).size, priceBands: [...new Set(sample.map(r=>r.priceBand))], completenessMin: Math.min(...sample.map(r=>r.completeness)), completenessMax: Math.max(...sample.map(r=>r.completeness)) },
    similarity: {
      exactDuplicateTitleCount: sample.length - new Set(sample.map(r=>r.currentTitle)).size,
      exactDuplicateDescriptionCount: sample.length - new Set(sample.map(r=>r.currentDescription)).size,
      descriptionTemplate: "One shared sentence pattern; host, price, supplied DR and traffic are substitutions. Unique metadata strings do not establish unique editorial information.",
      repeatedHeadingTemplate: ["Listing details", "Questions about {host}", "How does this price compare?", "What to check before ordering"],
      limitations: "These initial metadata values are deterministic reconstructions of the inspected route; HTTP sample results are audited separately. Distinct requirements use an explicit >=40-character / <=3-identical-record heuristic, not a quality verdict.",
    },
    sample,
  };
  await mkdir("reports", { recursive: true });
  await writeFile("reports/publication-content-audit.json", JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify({ total: report.total, existingEligible: report.existingEligible, existingNoindex: report.existingNoindex, sampleSize: sample.length, coverage: report.sampleCoverage, fields: Object.fromEntries(textFields.map(k => [k, { present: frequencyReport[k].present, distinct: frequencyReport[k].distinctNonempty }])), eligibleWithDistinctRequirements: report.eligibleWithDistinctRequirements, sourceColumnNames: report.sourceColumnNames }, null, 2));
  process.exit(0);
} catch {
  console.error("Read-only publication audit failed. Check private database/network configuration; no records changed.");
  process.exit(1);
}
