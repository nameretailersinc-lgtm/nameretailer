import type { ArticleDraft } from "./types";
export const geoMeasurement: ArticleDraft[] = [
  {
    cluster: "GEO",
    title: "What GEO means for a small content team",
    answer:
      "Generative engine optimization describes work aimed at visibility in generative search and answer experiences. For a small team, start with useful original explanations, clear source boundaries and technically accessible pages. Treat GEO as a planning objective rather than a universal platform standard or a guaranteed citation service.",
    example:
      "A fictional business has useful product workflows but a vague blog full of slogans. The team can explain a real configuration decision with an example and evidence, then link it from the relevant product page. Calling the slogan page 'GEO ready' would not supply the missing answer or establish that any engine had discovered it.",
    steps: [
      "Choose a reader problem that the team can explain accurately. Identify what original operational detail or approved evidence can make the answer useful.",
      "Prepare the page with clear headings, sources and honest attribution. Separate drafting assistance from subject-matter review and do not invent first-hand experience.",
      "Define an observation plan for the platforms that matter. Record actual appearances and referrals separately from the work performed to prepare the content.",
    ],
    avoid:
      "Avoid treating one engine's requirements as a rule for all assistants. Google's current guide describes AEO and GEO as labels for AI-search visibility work while emphasizing foundational SEO. That perspective is not a promise that a specific content format will be selected elsewhere.",
    question: "Do I need a separate GEO version of every article?",
    response:
      "Not by default. Improve the useful primary article and avoid creating duplicates without a distinct reader need.",
    source: {
      label: "Google: generative AI optimization guide",
      url: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide",
    },
  },
  {
    cluster: "GEO",
    title: "Build an evidence inventory before writing brand claims",
    answer:
      "Inventory the evidence a brand actually possesses before writing claims about clients, outcomes or verification. Record permission, source and scope beside each item. An attractive design reference can show how evidence might be displayed, but it cannot supply the underlying business facts.",
    example:
      "A fictional landing-page mockup contains client logos and growth charts. The owner confirms that evidence will be supplied later. The team can prepare components and a submission checklist, but should not copy the mockup's names or percentages into live claims. The inventory shows what is approved, pending and unavailable.",
    steps: [
      "List proposed claims and the exact supporting material required. For a testimonial, include the approved quote, attribution and publication permission.",
      "For a growth figure, record the period, starting value, ending value, measurement method and any relevant campaign context. Keep the original source available for review.",
      "Publish only the approved scope. When evidence is pending, use useful explanatory content or omit the claim rather than adding decorative proof.",
    ],
    avoid:
      "Avoid treating owner confirmation that proof exists as permission to invent its details. Likewise, an editorial guide should not imply that every listed publisher has passed a process that has not been defined and completed. Keep verification wording tied to specific checks.",
    question: "Can stock client logos stand in for pending evidence?",
    response:
      "No. Use only approved identities and permissions; a design asset does not establish a client relationship.",
  },
  {
    cluster: "GEO",
    title: "Keep organization information consistent across content",
    answer:
      "Use the same legitimate brand name, contact details and service boundaries across the website. Consistency helps readers understand who is responsible for the content. It should reflect real business information, not an invented identity or a set of profiles created to simulate independent endorsements.",
    example:
      "A fictional rebuild changes an agency mockup to a publication marketplace. The team updates the header, About page, footer and article byline together. It does not leave a 'free SEO audit' offer in one section while describing placement planning elsewhere. The organizational identity is real; a fictional staff author is unnecessary.",
    steps: [
      "Maintain a small approved brand-information record with name, contact details, address and actual offer. Note which fields have owner confirmation.",
      "Compare visible page copy, sharing metadata and organizational structured data against that record. Fix contradictions rather than hiding them in a disclaimer.",
      "Review linked profiles and contact routes for actual ownership and relevance. Omit credentials, awards or partnerships that do not have supporting evidence.",
    ],
    avoid:
      "Avoid changing brand terminology solely to target more keywords or using an organization schema entry to imply legal or professional credentials. This journal attributes organizational guides to Name Retailer with AI assistance disclosed, not to invented experts.",
    question: "Should every article have a different named author?",
    response:
      "Only when those are actual authors with legitimate attribution. Organizational authorship is preferable to fictional staff identities.",
  },
  {
    cluster: "GEO",
    title: "Original observations versus hypothetical examples",
    answer:
      "Separate what you directly observed from what you propose as a teaching example. Original observations need a method and scope; hypothetical examples need an explicit label. Both can help a reader, but they should not be presented as the same kind of evidence.",
    example:
      "A fictional editor says 'we reviewed four sample pages' only if that review occurred and its notes exist. A scenario about a clinic choosing a publication can illustrate audience fit without claiming a client project. The difference matters when a paragraph is excerpted into an answer or social preview without the rest of the article.",
    steps: [
      "Label each example as observed, owner-supplied, sourced or hypothetical during drafting. Keep the label in the published wording when misunderstanding would matter.",
      "For observations, record the sample, date and method. Explain limitations rather than extending a small check to the entire market.",
      "For hypothetical examples, use only the assumptions required to explain the decision. Avoid adding invented outcomes, endorsements or external validation.",
    ],
    avoid:
      "Avoid presenting an AI-generated scenario as first-hand professional experience. A clear illustrative worksheet can stand on its own without a fictional success claim. When real evidence becomes available, revise the example deliberately and preserve the actual source and approval details.",
    question: "Are hypothetical examples useful in professional guides?",
    response:
      "Yes. They can demonstrate a workflow when clearly labeled and not passed off as client evidence or measured results.",
  },
  {
    cluster: "GEO",
    title: "A citation-ready claim has a clear source boundary",
    answer:
      "Write factual claims so the reader can distinguish the supported statement from your interpretation. Link to the exact document that supplies the fact, then label any recommendation as your own guidance. Citation-friendly writing is a clarity practice, not a promise that an AI system will cite the page.",
    example:
      "A fictional article links to official image-format documentation but recommends comparing the actual encoded bytes in a local workflow. The format support claim belongs to the documentation; the comparison worksheet is the article's own practical suggestion. Combining them into 'the documentation proves our conversion always saves 60%' would cross the evidence boundary.",
    steps: [
      "Identify the smallest factual statement the source directly supports. Avoid attaching the source to a paragraph full of additional unsupported conclusions.",
      "State the relevant conditions and observation date when information changes. Keep source names descriptive so readers know what they will open.",
      "Separate your suggested process from the sourced fact. Explain why the process is useful without implying the source endorsed your particular service.",
    ],
    avoid:
      "Avoid using a reputable domain as decoration for unrelated marketing claims. Do not copy long passages or replace original reasoning with a string of citations. A professional explanation combines accurate evidence with useful context and an honest description of uncertainty.",
    question: "Does citing an official document endorse my business?",
    response:
      "No. It supports a specific fact when relevant; it does not imply a partnership, certification or endorsement.",
  },
  {
    cluster: "GEO",
    title: "GEO content planning without publishing query duplicates",
    answer:
      "Plan content around distinct problems, not every variant of a possible generated query. Use one complete explanation when several questions share the same answer. A library becomes more useful when pages have clear roles and meaningful differences, rather than a large number of nearly identical openings.",
    example:
      "A fictional content map includes 'guest-post budget,' 'placement costs' and 'how to budget guest posts.' Those phrases may lead to one practical budget worksheet. A writing-scope comparison can be a separate article because it addresses different responsibilities. The map should make that distinction before the team expands the archive.",
    steps: [
      "Group candidate topics by the decision or output they support. Write a one-line promise for each proposed page and check for overlap.",
      "Assign subquestions to the article that can answer them most naturally. Link to distinct workflows rather than manufacturing separate pages for synonyms.",
      "Review additions for original value: a new example, a different decision, useful evidence or a working tool. Merge weak duplicates before publication.",
    ],
    avoid:
      "Avoid setting a page-count target without an editorial purpose for each article. Google's AI optimization guide warns against separate content for every variation created primarily to manipulate visibility. This library uses distinct workflow topics, and its owner review remains a real release gate.",
    question: "Will more URLs automatically improve AI-search visibility?",
    response:
      "No. Quantity alone does not establish relevance or quality; each page should earn its place by helping a reader.",
    source: {
      label: "Google: content planning for AI Search",
      url: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide",
    },
  },
  {
    cluster: "GEO",
    title: "A fair comparison-page brief for a brand website",
    answer:
      "Use consistent criteria, dated evidence and explicit unknowns when comparing options. Explain the perspective of the publishing brand rather than implying independent neutrality. A fair comparison can describe trade-offs without inventing competitor weaknesses or declaring a winner from incomplete information.",
    example:
      "A fictional publication marketplace compares placement-only and writing-inclusive workflows. It can show who drafts, edits and approves the article without naming an unreviewed competitor. If actual providers are compared later, the team needs current authorized details and a consistent scope rather than a chart of unsupported checkmarks.",
    steps: [
      "Choose criteria tied to the reader's decision and apply them equally. Record whether each field is observed, supplied or unavailable.",
      "State the comparison date, scope and the brand's relationship to the subject. Let readers see the perspective from which the page is written.",
      "Explain trade-offs and edge cases in text. Offer a next step that helps the reader clarify missing information rather than pressuring a purchase.",
    ],
    avoid:
      "Avoid negative claims about another business without reliable evidence or invented review ratings in structured data. A table full of favorable checks is not a methodology. Preserve uncertainty and update the comparison when a material feature or commercial term changes.",
    question: "Can a brand publish a comparison fairly?",
    response:
      "Yes, when it uses transparent criteria, accurate evidence and a clear statement of its perspective and limitations.",
  },
  {
    cluster: "GEO",
    title: "AI crawler access needs a documented product-specific policy",
    answer:
      "Decide crawler access from the product and purpose you actually intend to support. Search discovery, assistant retrieval and model-training controls are not necessarily the same. Review each relevant provider's current documentation rather than applying a universal 'AI access' rule inferred from a tool name.",
    example:
      "A fictional business wants its public help articles discoverable but keeps accounts and unpublished drafts private. The team inventories actual endpoints and controls before changing crawler rules. It does not assume that a robots directive provides access control or that adding an AI text file authorizes private content to be retrieved.",
    steps: [
      "List the public content and the discovery products that matter to the business. Keep private account and admin data outside the public-content plan.",
      "Read the applicable provider documentation and identify the stated role of each crawler or control. Record the documentation date for changing policies.",
      "Test the deployed rules and authentication boundaries. Document the intended behavior separately from actual discovery observations.",
    ],
    avoid:
      "Avoid describing robots.txt as a security barrier or claiming that a special file guarantees AI inclusion. Google's AI features documentation does not require a new AI text file or special schema for those features. Other products need their own current review.",
    question: "Can I use one generic AI rule for every platform?",
    response:
      "Do not assume so. Determine the product, purpose and current documented control for each platform you intend to support.",
    source: {
      label: "Google: controls for AI features",
      url: "https://developers.google.com/search/docs/appearance/ai-features",
    },
  },
  {
    cluster: "GEO",
    title: "Record generative-search appearances as observations",
    answer:
      "Log an appearance with its platform, exact prompt, date, settings and cited URL. Treat it as an observed response under those conditions, not a permanent rank. A reproducible record helps the team compare changes without claiming visibility across users, locations or repeated prompts it did not test.",
    example:
      "A fictional reviewer sees an article linked in one answer and absent in another. The log stores both prompts and timestamps, not just the flattering screenshot. The team can examine whether the answers addressed different tasks or cited different pages, while avoiding a claim that the brand 'owns' the topic in generative search.",
    steps: [
      "Define a small, stable prompt set based on real reader tasks. Record the platform and test conditions before the first observation.",
      "Capture cited URLs and relevant response context, with a privacy-safe record of the test. Keep missing appearances in the dataset instead of deleting them.",
      "Compare repeated observations under similar conditions and report the sample size. Separate cited appearances from actual referral visits and business outcomes.",
    ],
    avoid:
      "Avoid inventing a universal generative-search rank or interpreting a single response as market share. Do not store private user prompts unnecessarily. If a third-party monitoring tool supplies a score, retain its methodology and label it as that provider's measure.",
    question: "Does one citation prove a permanent position?",
    response:
      "No. It is one observed response; repeated, scoped measurement is needed to understand a pattern.",
  },
  {
    cluster: "GEO",
    title: "A GEO experiment brief with a useful stopping rule",
    answer:
      "Choose one content improvement, define what you will observe and decide when to review the result before starting. Keep the experiment small enough to explain its limitations. The objective can include clearer answers and better reader outcomes even when generative-search appearances are sparse or variable.",
    example:
      "A fictional team revises a confusing comparison page by adding a direct answer and a real decision table. It records the edit date and observes the same prompt set for a defined period. If other campaigns or product changes occur, the team notes those confounders rather than assigning every later visit to the rewrite.",
    steps: [
      "State the hypothesis in specific terms: which reader problem the edit addresses and what observable behavior would support the improvement.",
      "Record the baseline, change and review window. Keep the test conditions consistent and preserve the old version for editorial comparison.",
      "Use the stopping rule to decide whether to keep, revise or abandon the change. Report inconclusive results honestly instead of stretching a weak observation into a success claim.",
    ],
    avoid:
      "Avoid running many unrelated edits simultaneously and then attributing the result to one heading. Do not promise a causal SEO or AI-search benefit from a small uncontrolled test. Treat measured outcomes, reader feedback and implementation quality as separate evidence.",
    question: "What if the experiment produces too little data?",
    response:
      "Call it inconclusive, preserve the useful editorial improvement when justified, and revise the measurement plan without inventing a positive result.",
  },
  {
    cluster: "Measurement",
    title: "A practical SEO measurement plan before publishing",
    answer:
      "Define the business question, metric and observation source before publishing a campaign report. Separate discovery, visits and completed actions so the report does not imply that they are interchangeable. A measurement plan should also specify unavailable data and the limits of attribution.",
    example:
      "A fictional article receives search impressions, a smaller number of clicks and a few contact requests. Those are different events. The team should not call every impression a customer or attribute every inquiry to the article without a reliable path. A simple plan establishes how each stage will be counted before results arrive.",
    steps: [
      "Choose one primary question, such as whether qualified readers reach a relevant guide. Name the metric, source and reporting period that can answer it.",
      "Define how downstream actions will be recorded, with appropriate privacy and consent decisions. Avoid collecting information unrelated to the business question.",
      "Record baseline conditions and major concurrent changes. In the report, keep observations separate from explanations that remain hypotheses.",
    ],
    avoid:
      "Avoid designing the measurement after seeing which number looks best. Do not present traffic growth as revenue growth or a planning cart as a completed order. This rebuild does not collect payments, so its saved selections cannot be reported as purchase conversions.",
    question: "Is a traffic increase enough to demonstrate business growth?",
    response:
      "No. Define and measure the relevant business action separately, and describe the attribution limits.",
  },
  {
    cluster: "Measurement",
    title: "Search Console and analytics answer different questions",
    answer:
      "Use Search Console for the search visibility and click information it provides, and analytics for the on-site behavior your implementation actually measures. The datasets have different scopes and methods. Investigate discrepancies rather than forcing their totals to match or treating either one as a complete account of user intent.",
    example:
      "A fictional report shows search clicks that differ from recorded analytics sessions. The team checks reporting windows, timezone, consent behavior and metric definitions before diagnosing a traffic problem. It does not fill the gap with invented sessions or imply that an exact reconciliation is always possible from the available data.",
    steps: [
      "Write down each metric's source, period and definition. Align comparison windows and note differences that cannot be removed by changing the date selector.",
      "Inspect tracking implementation and consent-related behavior when interpreting on-site counts. Confirm what events are actually emitted and received.",
      "Report each source in its own context. Use a narrative explanation for discrepancies instead of combining incomparable totals into one authoritative number.",
    ],
    avoid:
      "Avoid inferring that a lower analytics count automatically proves a lost visitor or broken site. Measurement boundaries can differ. Verify access and configuration safely, and do not place private account identifiers or user-level records in a public article.",
    question: "Which dataset should I use for every SEO decision?",
    response:
      "Neither alone. Choose the source appropriate to the question and retain its scope and measurement limitations.",
    source: {
      label: "Google: getting started with Search Console",
      url: "https://developers.google.com/search/docs/monitor-debug/search-console-start",
    },
  },
  {
    cluster: "Measurement",
    title: "Calculate percentage growth without hiding the baseline",
    answer:
      "Report the starting value, ending value, period and calculation alongside a percentage change. A large percentage can come from a very small baseline, and a zero baseline needs special handling. The number should help the reader understand the observation rather than make a chart look dramatic.",
    example:
      "In an explicitly fictional worksheet, visits rise from 20 to 30. The increase is 10 visits, or 50% relative to the starting value. A second example rises from 2,000 to 3,000 and also produces 50%. Showing the absolute values prevents the identical percentage from implying identical business impact.",
    steps: [
      "Use comparable periods and the same metric definition. Record the actual source values before applying any formula or formatting.",
      "For a nonzero starting value, calculate (ending minus starting) divided by starting, multiplied by 100. Report the absolute difference as well.",
      "If the baseline is zero, describe the change from zero in absolute terms rather than dividing by zero. Add sample size and context when interpreting small counts.",
    ],
    avoid:
      "Avoid using illustrative growth examples as client results or presenting a percentage without its denominator. Do not imply causation from a change alone. The same observed increase may coincide with advertising, seasonality, product changes or measurement changes that require separate investigation.",
    question: "Can I report 100% growth from zero to one?",
    response:
      "Not using the standard relative-change formula. Report that the count increased from zero to one and explain the baseline.",
  },
  {
    cluster: "Measurement",
    title: "Keep missing metrics separate from zero",
    answer:
      "Represent an unavailable observation as missing, not as a measured zero. Zero is a real value; missing means the evidence is not present. This distinction affects sorting, filtering, averages and the decisions readers make from a comparison table.",
    example:
      "A fictional imported publication has no traffic value, while another has a supplied traffic value of zero. Filling both cells with zero would make the first look measured. It would also distort a later average. The marketplace should show 'Unavailable' for the first and retain the explicit zero only when the dataset truly supplies it.",
    steps: [
      "Preserve a nullable representation in the data model and a readable unavailable label in the interface. Do not repair empty cells with invented values.",
      "Decide how each filter treats missing records and explain that behavior. A minimum-score filter can exclude unavailable values without claiming they scored below the threshold.",
      "When aggregating, report the count of available observations and the number missing. Keep the denominator visible so a mean does not appear to cover the entire catalog.",
    ],
    avoid:
      "Avoid describing a complete-looking table as fully measured when source cells were filled by a default. Imported metrics remain owner-supplied unless a provider and observation date are established. An active status controls visibility, not the reliability of the metric.",
    question:
      "Should missing scores be displayed as zero to simplify the table?",
    response:
      "No. Use an unavailable state and make filter behavior clear; zero and missing carry different meanings.",
  },
  {
    cluster: "Measurement",
    title: "A referral-traffic worksheet for publication campaigns",
    answer:
      "Track actual referred visits separately from publication-wide traffic estimates. Record the article or referring domain, reporting period and the measurement source. A placement's presence on a site does not establish how many readers clicked through or what they did after arriving.",
    example:
      "A fictional article sits on a publication with a large estimated audience but sends only a small observed number of visits. The team logs those visits honestly and checks the destination's usefulness. It does not multiply the publication estimate by an assumed click rate and report the result as measured referral traffic.",
    steps: [
      "Define the referral source and observation window before reporting. Confirm which analytics fields or campaign identifiers are actually available in the deployed implementation.",
      "Review landing-page behavior and relevant downstream actions. Keep measurement privacy-safe and do not infer identity from a referring domain.",
      "Report observed visits and actions with the attribution limits. Compare campaigns only when the scope and periods are sufficiently similar.",
    ],
    avoid:
      "Avoid assuming that every direct visit after publication came from the article or that every referred visit was a qualified lead. Some sources and journeys will remain unobserved. State those gaps instead of inventing a complete attribution story.",
    question: "Can estimated publication traffic stand in for referred visits?",
    response:
      "No. The estimate describes its stated scope; referral visits require separate observed measurement.",
  },
  {
    cluster: "Measurement",
    title: "A content experiment log that records confounders",
    answer:
      "Record the page change, timing, measurement window and other events that might influence the outcome. An experiment log should make alternative explanations visible. This is especially important when content edits happen alongside product launches, advertising or a website migration.",
    example:
      "A fictional team rewrites a guide and starts a paid campaign in the same week. Later traffic rises. The log records both changes, so the report does not attribute the entire increase to the article's direct answer. The rewrite may still improve usability, but the available observations do not isolate its traffic effect.",
    steps: [
      "Save the previous version and describe the specific edit. Avoid vague change labels such as 'full SEO optimization' that cannot be independently inspected.",
      "Record concurrent campaigns, tracking changes, outages and publication events. Note whether the comparison period contains a different seasonal or operational context.",
      "Review the result with those conditions in view. Distinguish a correlated change from a causal conclusion and mark inconclusive tests explicitly.",
    ],
    avoid:
      "Avoid deleting negative periods or moving the reporting window after seeing the outcome. Do not use an uncontrolled before-and-after comparison as proof that one small copy change caused business growth. A trustworthy log includes observations that challenge the preferred explanation.",
    question: "Should I keep an experiment that did not improve the metric?",
    response:
      "Keep the record. Decide whether the change still serves readers, and report the measured result without reframing it as an unsupported win.",
  },
  {
    cluster: "Measurement",
    title: "Report keyword ideas without invented demand metrics",
    answer:
      "Label brainstorming outputs as ideas unless a licensed data source supplies actual measurements. A generated phrase is not evidence of search volume, difficulty or competition. Keep the planning value of the idea while making the absence of demand data clear.",
    example:
      "A fictional local tool suggests 'how to choose guest-post publications' from a seed topic. The editor can use it to explore a reader question. Adding '12,000 searches' or a difficulty score would require a real source and observation period; the brainstorming function has not measured either.",
    steps: [
      "Record where the phrase came from: support question, editorial idea, provider report or local pattern generation. Preserve that provenance in the planning sheet.",
      "Group ideas by useful reader task and compare them with existing articles. Avoid creating duplicate pages for minor wording changes.",
      "If demand metrics are needed, obtain authorized provider data and keep its date, geography and measurement definition. Do not combine estimates from different scopes without explanation.",
    ],
    avoid:
      "Avoid describing deterministic suggestions as search-engine autocomplete or AI research when no such service was called. The current tool supplies local intent and question patterns only. That capability can still be useful if its output is presented honestly.",
    question: "Do local suggestions include real search volumes?",
    response:
      "No. They are brainstorming prompts; live demand metrics need a legitimate provider and an explicitly sourced report.",
  },
  {
    cluster: "Measurement",
    title: "A backlink-report quality check before analysis",
    answer:
      "Inspect a backlink export's source, collection date, URL fields and link attributes before drawing conclusions. The analyzer can count rows and referring domains, but those counts inherit the report's coverage and freshness. They do not establish that every link is still live or relevant.",
    example:
      "A fictional CSV has duplicate source URLs, missing rel values and a few malformed URLs. Local analysis can report each of those conditions instead of assigning an authority score. The team needs the provider's report date and scope before comparing it with another export or describing it as a current competitor backlink profile.",
    steps: [
      "Confirm that the report includes a recognizable source URL column and document its origin. Keep the original export unchanged for later inspection.",
      "Count valid rows, distinct source URLs and referring domains separately. Review invalid entries and distinguish a missing link qualification field from an explicit follow link.",
      "Compare exports only with a clear understanding of their collection dates and scope. Use live provider access when a refreshed observation is essential.",
    ],
    avoid:
      "Avoid equating many report rows with high-quality links or guaranteed ranking strength. Duplicate URLs and multiple links from one domain have different meanings. The local analyzer does not crawl the sites, verify availability or create backlinks.",
    question: "Does uploading a CSV verify every backlink is live?",
    response:
      "No. It analyzes the supplied report; live availability and provider freshness require a separate check.",
  },
  {
    cluster: "Measurement",
    title: "Choose a reporting window before evaluating content",
    answer:
      "Select a reporting window that fits the question, and disclose why that period is useful. Keep comparison periods consistent and note material differences. A narrow favorable window can make ordinary variation look like a durable improvement, especially when the underlying counts are small.",
    example:
      "A fictional guide receives a one-day spike after a newsletter mention. A weekly report shows the spike clearly; a monthly comparison provides different context. Both can be valid observations, but neither should silently become proof of sustained search growth. The report names the newsletter event and preserves the actual period.",
    steps: [
      "State the decision the report should inform and choose the window before reviewing the result. Keep the metric and timezone consistent across periods.",
      "Record campaigns, outages and major content or tracking changes inside each window. Explain whether the periods are genuinely comparable.",
      "Show absolute counts and the relevant denominator alongside changes. Add enough historical context to distinguish a short event from a repeated pattern.",
    ],
    avoid:
      "Avoid changing the window until a positive percentage appears or comparing a partial month with a complete month without labeling it. Do not hide low sample sizes behind polished charts. The chart should communicate the observation, not manufacture confidence.",
    question: "Is the longest reporting window always best?",
    response:
      "No. Choose the period for the decision, retain important context and make its limits visible.",
  },
  {
    cluster: "Measurement",
    title: "Turn an SEO report into a useful next-action list",
    answer:
      "End a report with actions tied to actual observations and unresolved questions. Separate fixes you can verify from experiments whose outcome remains uncertain. A useful next-action list gives each item an owner, a reason and a check that can confirm completion.",
    example:
      "A fictional report finds a broken related link, an undated traffic field and a confusing writing-tier explanation. The link has a concrete repair and retest. The metric needs source information, not a guessed value. The writing copy needs an editorial review. These are different actions even though they appear in one SEO report.",
    steps: [
      "Translate each observation into a specific task and note the affected URL or data field. Avoid broad instructions such as 'improve authority' without an actionable scope.",
      "Assign responsibility and a completion check. Keep owner approvals and external provider needs visible rather than hiding them inside a technical task.",
      "Prioritize by reader impact and risk, then review the result. Record which issues were resolved and which remain blocked by missing evidence or access.",
    ],
    avoid:
      "Avoid promising outcomes that the action cannot guarantee. Fixing a broken link can restore navigation; it does not prove a ranking increase. Preserve a distinction between implementation completion, editorial approval and measured performance in the final handoff.",
    question: "Should every report end with a traffic-growth promise?",
    response:
      "No. End with justified actions and a measurement plan; report later outcomes only when reliable evidence is available.",
  },
];
