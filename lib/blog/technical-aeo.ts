import type { ArticleDraft } from "./types";
export const technicalAeo: ArticleDraft[] = [
  {
    cluster: "Technical SEO",
    title: "A canonical URL checklist for a rebuilt website",
    answer:
      "Choose the intended public URL for each article and make its canonical metadata consistent with that destination. A canonical identifies the preferred equivalent version; it is not a shortcut for merging unrelated pages. Review URL choices before migration rather than relying on whatever route happens to render first.",
    example:
      "A fictional guide can be reached at both an old category path and a new blog path. The migration team first confirms that the content is genuinely equivalent, then records the preferred destination and checks its response. If the old page covered a different subject, pointing both canonicals at one guide would hide an unresolved content decision.",
    steps: [
      "List the old URL, new URL and equivalence reason in a mapping sheet. Mark ambiguous matches for editorial review instead of assigning the home page as a default.",
      "Inspect the destination's title, main heading and canonical value. Use a complete public URL without tracking parameters or a fragment.",
      "Test the final deployment separately from the preview. Keep redirect activation, sitemap updates and indexing approval as coordinated release steps.",
    ],
    avoid:
      "Avoid canonicalizing all paginated pages or filtered views to an unrelated article. A hint does not guarantee that a search engine will select that URL. This rebuild remains noindex during development; canonical metadata does not override that restriction or activate a migration.",
    question: "Does a canonical tag replace a redirect?",
    response:
      "No. They serve different purposes. Decide equivalence and migration behavior explicitly before enabling either strategy.",
    source: {
      label: "Google: canonical URLs",
      url: "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls",
    },
  },
  {
    cluster: "Technical SEO",
    title: "Internal links that make an article library easier to use",
    answer:
      "Link to the next explanation a reader is likely to need, using text that describes the destination. A related-reading list should connect different useful tasks rather than repeat the same question on several pages. Build navigation from the reader's decision path, not an arbitrary link quota.",
    example:
      "A fictional article about placement budgeting links to a writing-package comparison because the two tasks are related but not identical. It does not need links to every image converter. The library can also link back to a marketplace hub, allowing the reader to apply the worksheet after understanding its assumptions.",
    steps: [
      "For each article, identify one prerequisite and one useful next task. Check whether those topics already have a stable published page before adding a new one.",
      "Use descriptive anchor text and a real href. Review the destination without relying on a visual card or click handler alone to explain where it goes.",
      "Periodically check links after slug changes and archive decisions. Replace or remove stale destinations rather than leaving a related-reading section full of errors.",
    ],
    avoid:
      "Avoid adding unrelated links merely to inflate the count or using the same vague 'click here' label for multiple destinations. A link should help someone understand what happens next. Keep private admin, account and utility URLs out of editorial discovery paths.",
    question: "How many related links should an article have?",
    response:
      "Enough to support a real next step without overwhelming the reader. Choose relevance rather than a fixed numerical target.",
    source: {
      label: "Google: crawlable links and anchor text",
      url: "https://developers.google.com/search/docs/crawling-indexing/links-crawlable",
    },
  },
  {
    cluster: "Technical SEO",
    title: "Noindex and robots.txt are different controls",
    answer:
      "Use the correct control for the actual goal: managing crawler access is different from excluding a page from search indexing. Google's documentation distinguishes robots.txt from a noindex directive. A development preview should have an explicit indexing policy, not an accidental combination of unrelated rules.",
    example:
      "A fictional staging article contains noindex metadata and has not been approved for launch. Removing a robots.txt block alone would not make that article indexable. Conversely, blocking a public URL's crawl is not a reliable substitute for an exclusion directive. The release checklist needs to inspect both controls and document the intended result.",
    steps: [
      "Write down whether the environment is a private preview, public utility page or approved search landing page. Keep that decision visible to the release team.",
      "Inspect the response headers, rendered metadata and crawler rules for the exact URL. Do not assume a parent layout or deployment setting is the only source of directives.",
      "After approved production changes, verify the live response and allow time for recrawling. Keep a record of the actual directive observed, not just the intended setting.",
    ],
    avoid:
      "Avoid removing preview protections to demonstrate that a page is SEO-ready. This rebuild keeps public previews noindex until the migration and editorial release are approved. A useful article structure is preparation for discovery, not evidence that discovery has already happened.",
    question: "Does allowing a crawl guarantee indexing?",
    response:
      "No. Crawling permission and indexing eligibility are only parts of the process; indexing and serving are not guaranteed.",
    source: {
      label: "Google: noindex behavior",
      url: "https://developers.google.com/search/docs/crawling-indexing/block-indexing",
    },
  },
  {
    cluster: "Technical SEO",
    title: "Plan a sitemap around approved public pages",
    answer:
      "Build a sitemap from the public URLs you actually want discovered, with accurate modification information. Keep drafts, private account pages and utility endpoints out of the list. A sitemap is a discovery aid, not proof that an article has been crawled, indexed or ranked.",
    example:
      "A fictional rebuild has an active catalog, a private cart and an unfinished policy page. The launch team should not include all three merely because their routes exist. The sitemap decision follows the approved public indexing plan, while a human-readable page directory can still help visitors navigate useful preview pages.",
    steps: [
      "Separate route existence from indexing approval. Create an explicit inventory of public pages, their canonical destinations and their launch readiness.",
      "Generate entries from that inventory or published content records. Record real substantive modification dates rather than stamping every URL with the current date on each request.",
      "Check sample URLs and the submitted file on the final host. Monitor discovery and indexing through appropriate tools instead of interpreting submission as completion.",
    ],
    avoid:
      "Avoid listing every filter combination or copying private route names into the sitemap. Do not enable production discovery for a preview simply because more articles were added. This project's migration settings remain separate from its new content and tool implementation.",
    question: "Is a page directory the same as an XML sitemap?",
    response:
      "No. A page directory serves visitors; an XML sitemap supplies discovery information to crawlers.",
    source: {
      label: "Google: sitemap overview",
      url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview",
    },
  },
  {
    cluster: "Technical SEO",
    title: "A structured-data review checklist for blog articles",
    answer:
      "Make structured data describe the article readers can actually see. Use the real title, actual publication history and legitimate author entity. Validate syntax and inspect the rendered page together; passing a JSON parser does not establish that the markup is accurate or eligible for a search feature.",
    example:
      "A fictional brand publishes an organizational guide, not a named expert's report. Its Article markup should not invent a person, credentials or a review score. If the visible page discloses AI assistance and a pending owner review, the structured data must not imply a separate expert approval that never occurred.",
    steps: [
      "Compare headline, author, dates and image information with the visible article. Use an organizational author when that is the true attribution rather than creating a fictional staff biography.",
      "Check JSON-LD syntax and basic fields locally. Then use the applicable official testing tool when preparing a public release; different validators check different things.",
      "Remove properties unsupported by the page or evidence. Confirm the canonical URL and ensure any linked author information identifies the actual author entity.",
    ],
    avoid:
      "Avoid using structured data as hidden advertising or adding fabricated aggregate ratings. This rebuild's local schema checker is intentionally a structural aid, not a full vocabulary or rich-results certification. Search engines can decline special presentation even for valid markup.",
    question: "Can an organization be an article author?",
    response:
      "Yes. Use the legitimate organizational identity and an identifying URL when that matches the visible byline.",
    source: {
      label: "Google: article structured data",
      url: "https://developers.google.com/search/docs/appearance/structured-data/article",
    },
  },
  {
    cluster: "Technical SEO",
    title: "Check server-rendered article content before launch",
    answer:
      "Inspect the HTML returned for an article as well as the hydrated browser page. The title, main answer and navigation should be available in a stable, understandable form. A route that looks correct only after a client-side request needs a separate discovery and failure-state review.",
    example:
      "A fictional journal shows cards after JavaScript loads, but an article endpoint returns an empty main element when its database request fails. The team tests both the successful server response and the unavailable state. It avoids replacing missing content with a generic success page that would obscure the failure.",
    steps: [
      "Fetch a representative article response and inspect the main heading, body and links. Compare that output with what a browser user sees after hydration.",
      "Test missing and unpublished slugs. They should not expose drafts or silently render an unrelated article under the requested URL.",
      "Check metadata, canonical information and structured data against the same content record. Confirm behavior after an editor updates or archives the record.",
    ],
    avoid:
      "Avoid assuming server rendering alone makes a page discoverable or performant. Crawler access, indexing directives and content quality still need review. Keep implementation claims specific: say that tested content appears in returned HTML rather than claiming guaranteed search visibility.",
    question: "Does server rendering guarantee indexing?",
    response:
      "No. It can make content available in the response, but discovery, access and indexing decisions remain separate.",
    source: {
      label: "Google: JavaScript SEO basics",
      url: "https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics",
    },
  },
  {
    cluster: "Technical SEO",
    title: "A responsive article-page QA checklist",
    answer:
      "Check an article at narrow mobile, tablet and desktop widths with the same content and interactions. Readability depends on line length, spacing, headings and working controls, not just a lack of horizontal scrolling. Test the sidebar and tables with real long titles rather than a short sample.",
    example:
      "A fictional guide uses a desktop table of publication criteria. On a small screen the table should remain understandable without pushing the entire page wider. The contents list can move above the article rather than shrinking the text. A 320-pixel test with the longest heading will expose issues a desktop screenshot cannot show.",
    steps: [
      "Test common narrow and wide viewport sizes and the exact layout breakpoints. Look for clipped buttons, overflowing URLs and headings that compete with the page title.",
      "Use keyboard navigation to reach the contents links, article actions and footer. Keep visible focus states and meaningful link labels on every layout.",
      "Check a long article and a short one with images unavailable. Verify that reading order remains sensible when the desktop sidebar stacks into the mobile flow.",
    ],
    avoid:
      "Avoid calling a design pixel-perfect after inspecting only one screenshot. Supplied references guide the typography, color and hierarchy, but real content lengths and responsive behavior require their own checks. Preserve accessible labels even when a compact visual design is used.",
    question: "Should mobile text be much smaller to fit the design?",
    response:
      "No. Reflow the layout and simplify spacing before shrinking essential reading text to fit a desktop arrangement.",
  },
  {
    cluster: "Technical SEO",
    title: "Choose image dimensions and formats deliberately",
    answer:
      "Prepare images for their actual display size and inspect the encoded result. Format, quality, transparency and source dimensions affect the trade-off; converting a file does not guarantee a smaller output. Keep the original available so a lossy conversion is reversible at the asset level.",
    example:
      "A fictional article uses a small transparent diagram and a large photograph. PNG may preserve the diagram cleanly, while a WebP copy of the photograph can be compared at several quality settings. Re-encoding a compressed source as PNG may increase its size, so the editor compares actual bytes and visual detail rather than relying on a format slogan.",
    steps: [
      "Record the source dimensions and the intended rendered width. Resize a copy when a very large source adds no useful detail to the page.",
      "Choose a supported output format and quality setting. Preserve transparency when needed, and inspect edges, labels and gradients in the exported file.",
      "Check output dimensions, file size and contextual alt treatment. Use responsive image markup where appropriate, and reserve layout space to reduce unexpected movement.",
    ],
    avoid:
      "Avoid promising a universal compression percentage or assuming higher quality creates a smaller file. Browser conversion can remove metadata and change color; review the export before replacing a production asset. Animated input may become a still image in a canvas-based workflow.",
    question: "Is converting JPG to PNG a compression strategy?",
    response:
      "Not necessarily. PNG output can be larger; compare the actual result and choose the format for the content's needs.",
    source: {
      label: "Google: image SEO practices",
      url: "https://developers.google.com/search/docs/appearance/google-images",
    },
  },
  {
    cluster: "Technical SEO",
    title: "Measure page experience with a repeatable test setup",
    answer:
      "Define the page, device conditions and metric before comparing performance results. A faster-looking screenshot is not a measurement. Use a repeatable lab setup for debugging, and distinguish those observations from actual user field data when available.",
    example:
      "A fictional article adds a decorative hero image. A desktop test on a warm cache looks quick, but a mobile cold-cache test reveals delayed content. The team records both conditions and checks whether the image has appropriate dimensions and loading behavior. The goal is a usable reading experience, not a single flattering score.",
    steps: [
      "Choose representative pages and record browser, viewport, connection conditions and cache state. Repeat tests under comparable conditions before interpreting a change.",
      "Investigate the elements associated with slow loading or unexpected movement. Prefer a specific improvement, such as reserving image space, over unexplained broad optimization claims.",
      "Report lab and field evidence separately. Include the test date and limitations so a stakeholder can distinguish a controlled check from real-user experience.",
    ],
    avoid:
      "Avoid treating one performance score as a guarantee of search rankings or user satisfaction. Core Web Vitals are part of a broader page-experience review. The article should still be readable, accessible and useful after any performance-focused change.",
    question: "Can I compare two scores from different test conditions?",
    response:
      "Only cautiously. Keep the conditions consistent or explain why the difference may reflect the setup rather than the page change.",
    source: {
      label: "Google: Core Web Vitals and Search",
      url: "https://developers.google.com/search/docs/appearance/core-web-vitals",
    },
  },
  {
    cluster: "Technical SEO",
    title: "A WordPress-to-Next.js content migration worksheet",
    answer:
      "Separate migration decisions into content equivalence, URL mapping, metadata, media and release behavior. A new interface is not a complete migration if valuable old pages and destinations remain unaccounted for. Review the old inventory before switching hosts or enabling redirects.",
    example:
      "A fictional WordPress archive contains a how-to article, an outdated promotion and a tool page. The how-to may need an equivalent new article; the promotion needs an editorial retirement decision; the tool needs functional testing. Redirecting all three to a general blog index would conceal these different requirements and disappoint returning readers.",
    steps: [
      "Inventory old URLs with their purpose, traffic evidence when available and editorial status. Assign a proposed action and responsible reviewer to each important route.",
      "Check equivalence between old and new content. Preserve useful assets, attribution and relevant metadata while fixing unsupported or outdated claims.",
      "Test response behavior and the approved mapping before cutover. Keep rollback, indexing controls and post-launch monitoring in the release plan rather than treating them as design tasks.",
    ],
    avoid:
      "Avoid claiming the old archive has been migrated when new original articles were merely added. This journal expansion is new content; it does not recreate the full legacy archive or automatically activate redirects. Owner approval is still required for the actual production migration.",
    question: "Do 60 new posts replace a legacy migration audit?",
    response:
      "No. New content and legacy URL preservation are separate workstreams, and each needs its own evidence and release decision.",
    source: {
      label: "Google: site moves with URL changes",
      url: "https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes",
    },
  },
  {
    cluster: "AEO",
    title: "What AEO means in a practical content workflow",
    answer:
      "Answer engine optimization is a label for work aimed at making useful answers easier to understand and discover in answer-oriented experiences. In this journal, the practical workflow is reader-focused: identify a real question, answer it accurately and make the supporting evidence clear. The label does not guarantee inclusion anywhere.",
    example:
      "A fictional customer asks how to compare writing tiers. A useful answer distinguishes word count from research and revision scope, then offers a worksheet. Renaming the same generic sales pitch an 'AEO article' would not solve that task. The content should help a person even if no answer engine ever cites it.",
    steps: [
      "Collect a specific reader question and the context that changes its answer. Keep operational questions separate from unanswerable outcome promises.",
      "Draft a direct answer with necessary qualifications, followed by an original example. Cite external factual claims where a current authoritative source is needed.",
      "Review whether the page helps the reader act. Make the next step clear and keep actual discovery observations separate from the content preparation work.",
    ],
    avoid:
      "Avoid describing AEO as a separate certification, a hidden markup recipe or guaranteed placement in an AI answer. Different products have different retrieval and display behavior. Focus on controllable editorial quality and report measured appearances only when you actually observed them.",
    question: "Is AEO a guarantee that an assistant will cite my page?",
    response:
      "No. It describes an optimization objective, not a promised citation or a universal platform requirement.",
  },
  {
    cluster: "AEO",
    title: "Build a question map before drafting answer-led content",
    answer:
      "Group related questions by the decisions they support, then assign one useful page to each distinct task. A question map should expose gaps and duplication, not become a mandate to publish every wording variation. Start with a manageable set grounded in the reader's workflow.",
    example:
      "A fictional marketplace support team sees questions about writing costs, placement costs and whether a cart is an order. Those are distinct topics. 'How much is writing?' and 'What does article writing cost?' may belong on the same page. The map helps the editor avoid producing two nearly identical explanations.",
    steps: [
      "Capture question wording and the context in which it arose. Mark whether it came from a real request, an editorial hypothesis or a research exercise.",
      "Cluster questions by task and shared answer. Give each cluster a primary page and identify useful subquestions that fit inside it.",
      "Review the map against the existing library. Improve a relevant page before adding a new one whose only difference is a synonym in the title.",
    ],
    avoid:
      "Avoid representing brainstormed questions as measured search demand or observed customer volume. A local keyword tool can suggest directions, but it does not supply live query data. Record that distinction so editorial planning is not mistaken for market evidence.",
    question: "Should every question get its own URL?",
    response:
      "No. Combine questions that share an answer and create separate pages only when the reader task and useful content are genuinely different.",
  },
  {
    cluster: "AEO",
    title: "Definitions that remain useful outside their paragraph",
    answer:
      "Define a term with its category, distinguishing meaning and important limitation. Keep the wording understandable when quoted alone. A useful definition should explain the concept without pretending that a shorthand label replaces the details needed to apply it.",
    example:
      "A fictional metrics article defines an imported score as a value supplied in the owner dataset, not a live measurement. That distinction remains understandable outside the article. A vague definition such as 'a powerful authority indicator' would add persuasion but leave the reader unsure about source, timing and scope.",
    steps: [
      "Name the term and explain what kind of thing it is. Avoid defining it entirely through another unexplained abbreviation.",
      "Add the distinction most likely to prevent a mistaken decision. For a tool result, say whether it is a conversion, estimate, stored observation or live measurement.",
      "Use a small example and link to the fuller explanation. Read the definition without its heading to check that the wording still identifies the subject clearly.",
    ],
    avoid:
      "Avoid inserting promotional claims into definitions or leaving out the condition that makes the statement accurate. A concise answer can still carry uncertainty. Do not imply that a particular phrasing forces an answer engine to select or repeat it.",
    question:
      "Should I remove every qualification to make a definition shorter?",
    response:
      "No. Keep qualifications that affect meaning; remove repetition and jargon instead.",
  },
  {
    cluster: "AEO",
    title: "Comparison tables that preserve meaningful differences",
    answer:
      "Choose comparison columns from the reader's decision, and label unavailable information explicitly. A table should make differences easier to inspect without flattening distinct services into one score. Include scope and source context when a number could otherwise look more comparable than it really is.",
    example:
      "A fictional publication comparison includes topic, writing scope, placement price and metric date. Two sites can have similar prices but different revision responsibilities. A reader can now see the missing editorial answer rather than treating the cheaper row as automatically better. These are planning criteria, not a validated publisher ranking model.",
    steps: [
      "List the questions the reader must answer before choosing. Turn only the repeatable fields into columns, keeping nuanced explanations nearby.",
      "Use consistent units and distinguish missing, not applicable and zero. Do not hide a missing writing option behind an apparently complete total.",
      "Check the table on a narrow screen and with assistive technology. Preserve headings and a clear relationship between each field and its publication.",
    ],
    avoid:
      "Avoid calculating a single 'best' score from unrelated authority, traffic and price inputs without an explicit justified model. A professional comparison can show trade-offs and uncertainty rather than announce a winner. Add narrative context when the table alone cannot explain a material difference.",
    question: "Is a comparison table enough to recommend a publication?",
    response:
      "No. It organizes evidence; editorial fit and unresolved commercial details still need judgment.",
  },
  {
    cluster: "AEO",
    title: "Use examples to make an answer actionable",
    answer:
      "Place an example where the reader must apply a distinction or make a decision. Label invented scenarios clearly and do not turn them into testimonials or campaign evidence. The purpose is to demonstrate reasoning, not to borrow credibility from a fictional success story.",
    example:
      "A fictional buyer compares an $80 placement-only quote with a $140 writing-inclusive quote. The example can show which fields remain unknown without claiming either offer exists. It teaches the comparison process. A sentence saying the buyer achieved a 300% increase would add an unsupported result unrelated to the worksheet's function.",
    steps: [
      "Choose a scenario that exposes the decision the reader is likely to face. Include only the details needed to make the reasoning concrete.",
      "State which assumptions are illustrative and which facts come from a source. Keep example numbers separate from current prices or measured outcomes.",
      "Walk through the decision and its remaining unknowns. End by explaining what additional evidence would change the choice.",
    ],
    avoid:
      "Avoid using stock avatars, brand logos or fictional names to imply an actual client endorsement. An honest worked example can be professional and persuasive without pretending it happened. Preserve the scenario label if the example is reused in a short answer or a social card.",
    question: "Can I use invented numbers in a worked example?",
    response:
      "Yes, when they are clearly illustrative and are not presented as real prices, forecasts, evidence or customer results.",
  },
  {
    cluster: "AEO",
    title: "Keep important answers available as readable text",
    answer:
      "Put essential explanations in readable page text, not only in decorative graphics or screenshots. Images can support understanding, but the main answer and critical qualifications should remain accessible without them. This also makes editorial correction and reuse more straightforward.",
    example:
      "A fictional article uses a checklist illustration with four green checks. The visible body should still explain audience fit, source dates and commercial scope. If the image fails to load, the reader can complete the review from the text. Decorative artwork can then contribute to the supplied design without carrying the whole answer.",
    steps: [
      "Identify which information a reader needs to act correctly. Place that information in the article body with clear headings and sensible reading order.",
      "Use images for demonstrations, supporting diagrams or decoration. Add contextual text alternatives and visible explanations when the image contains essential information.",
      "Test the page with images disabled or unavailable. Check whether the direct answer, warnings and next step still make sense.",
    ],
    avoid:
      "Avoid turning long paragraphs into image assets merely to preserve a screenshot's visual layout. It can make text harder to read, adapt or translate. Design fidelity should preserve the reference's hierarchy while keeping the actual content usable at different widths.",
    question:
      "Should every hero illustration repeat the article's entire answer?",
    response:
      "No. Keep the answer in text and let the illustration support the page without becoming its only source of information.",
  },
  {
    cluster: "AEO",
    title: "How to audit an answer for unsupported certainty",
    answer:
      "Look for absolute wording, hidden assumptions and conclusions that exceed the available evidence. Replace certainty with the most accurate scope you can support. An answer can remain direct while acknowledging that a provider, date, approval or measurement is unavailable.",
    example:
      "A fictional tool page says 'all scores are verified and current' even though it reads an undated imported catalog. The audit changes that to 'owner-supplied catalog scores; provider and observation dates unavailable.' The second sentence is more useful because it tells the reader what the result actually represents.",
    steps: [
      "Highlight words such as guaranteed, verified, always, current and best. Ask what evidence would be required for each use in the actual context.",
      "Check numerical and outcome claims separately. Confirm the period, denominator and source rather than relying on an attractive chart or headline.",
      "Rewrite the answer to distinguish observations, recommendations and unknowns. Keep the qualification close to the claim so it is not lost in a footer disclaimer.",
    ],
    avoid:
      "Avoid adding a general disclaimer while leaving the misleading claim unchanged. A caveat elsewhere cannot make a fabricated score or testimonial genuine. Remove unsupported details and describe the actual tool capability or editorial observation in the sentence itself.",
    question: "Will more cautious wording make an answer unhelpful?",
    response:
      "Not if it remains specific. State what is known, what is unavailable and what the reader can do next.",
  },
  {
    cluster: "AEO",
    title: "Plan useful follow-up answers without duplicating pages",
    answer:
      "Add follow-up questions when they help the reader advance from the primary answer to a related decision. Keep them in the same article when they depend on the same explanation. Create a separate page only when the new task needs its own substantial answer and examples.",
    example:
      "A fictional guide to choosing an image format can answer whether transparency matters in a short section. A detailed tutorial on cropping coordinates has a different task and a working tool, so it deserves its own destination. Publishing separate pages for 'PNG or WebP?' and 'WebP versus PNG?' would likely repeat the same comparison.",
    steps: [
      "Write the primary question and the next decision a reader may face. Identify whether the follow-up adds a new workflow or simply clarifies the existing answer.",
      "Use a subsection for dependent clarifications and a related link for genuinely different tasks. Make the relationship visible in the link wording.",
      "Review new pages against the library before publication. Merge overlapping explanations instead of manufacturing variations to increase the article count.",
    ],
    avoid:
      "Avoid promising that covering a certain number of follow-ups will trigger answer-engine visibility. The editorial goal is a complete reader journey, not a formula. Keep the library focused enough that a visitor can find the right article without navigating several near-duplicates.",
    question: "How do I decide between a subsection and a new post?",
    response:
      "Choose a subsection for the same task; choose a new post when the reader needs a meaningfully different answer and workflow.",
  },
  {
    cluster: "AEO",
    title: "AEO readiness is not the same as indexing approval",
    answer:
      "Treat answer clarity, factual review and indexing approval as separate gates. A well-structured preview article can be ready for owner review while still intentionally excluded from search. Do not remove launch protections merely because headings, metadata and direct answers have been added.",
    example:
      "A fictional journal has 60 new guides with readable examples and related links. The owner still needs to approve editorial details and the migration team must review legacy destinations. Keeping the preview noindex lets those reviews happen without describing the new library as a completed public search launch.",
    steps: [
      "Review the content for useful answers and honest attribution. Record unresolved evidence or policy questions that require owner input.",
      "Check technical metadata and page behavior without changing the environment's indexing policy. Validate that previews and drafts remain appropriately protected.",
      "Use an explicit release checklist for production approval. Recheck the live environment after deployment rather than assuming local metadata is the final behavior.",
    ],
    avoid:
      "Avoid saying 'SEO optimized' as though it proves discovery or rankings. In Google's AI search documentation, technical eligibility still requires indexing and snippet eligibility; meeting requirements does not guarantee selection. This rebuild's noindex preview is not yet eligible for that public discovery path.",
    question: "Will a noindex preview appear as a Google AI supporting link?",
    response:
      "It should not be treated as eligible. Approve the production indexing plan separately from preparing the content.",
    source: {
      label: "Google: AI features eligibility",
      url: "https://developers.google.com/search/docs/appearance/ai-features",
    },
  },
  {
    cluster: "AEO",
    title: "An answer-quality review sheet for editors",
    answer:
      "Review an answer by asking whether it is correct, understandable, sufficiently complete and useful for the stated reader. Use concrete notes rather than a mysterious aggregate quality score. A review sheet should identify the revision needed and the evidence that would close each issue.",
    example:
      "A fictional definition is clear but omits that a metric is undated. Another answer has a source but no actionable next step. The editor records those as different issues: add the observation-date limitation, and add a relevant decision checklist. A single score of '92 quality' would not explain either correction.",
    steps: [
      "Read the title and direct answer together. Confirm that they address the same question and that the answer retains its essential conditions when quoted alone.",
      "Check the example, steps and sources for consistency. Mark invented scenarios, missing evidence and claims that need a current primary reference.",
      "Test the page as a reader: can you complete the task, and do you know what remains unknown? Assign specific revisions and a real review owner.",
    ],
    avoid:
      "Avoid calling a content audit an expert certification unless an actual qualified reviewer performed that role. AI-assisted drafts can support editorial work, but a functioning template and automated checks do not establish lived experience or independent subject-matter review.",
    question: "Can automated checks replace the editor's judgment?",
    response:
      "No. They can catch structure and missing fields; usefulness, accuracy, permission and context require editorial review.",
  },
];
