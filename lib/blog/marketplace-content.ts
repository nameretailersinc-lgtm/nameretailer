import type { ArticleDraft } from "./types";
export const marketplaceContent: ArticleDraft[] = [
  {
    cluster: "Marketplace",
    title: "How to choose a guest-post publication for your audience",
    answer:
      "Choose a publication whose readers can use your article, then examine editorial fit, commercial terms and price. Start your shortlist with a specific audience rather than the highest available authority score. A relevant placement should make sense even without a predicted ranking benefit.",
    example:
      "Suppose you sell scheduling software for small clinics. A practical article on appointment reminders may fit a healthcare operations publication better than a general business site. Read several recent pieces and note whether the vocabulary, examples and reader questions resemble the conversations your customers actually have. This is a planning example, not evidence of a successful campaign.",
    steps: [
      "Write a one-sentence reader profile: their role, location, problem and familiarity with the subject. Use that sentence to decide whether a publication belongs on the shortlist.",
      "Review recent articles, author information and contact details. Record two examples that demonstrate topic fit, and note any gaps that need an editorial answer.",
      "Confirm article scope, link qualification, writing charges and approval rights before committing. Keep the reasons for selecting the publication alongside its quoted price.",
    ],
    avoid:
      "Do not turn an impressive score into a quality guarantee. A publication may have substantial historical links and still be unsuitable for your audience. If you cannot explain why a reader would want your proposed article, reconsider the placement before discussing a budget.",
    question: "Should I always choose the site with the highest score?",
    response:
      "No. Use scores as one comparison input after checking audience and editorial fit; they do not establish suitability on their own.",
  },
  {
    cluster: "Marketplace",
    title: "A practical guest-post budget worksheet",
    answer:
      "Build a placement budget from separate cost lines: publication, article preparation, revisions and any agreed fees. Compare complete quotes in the same currency. A low headline placement price is not necessarily a low total project cost when the writing and editorial scope differ.",
    example:
      "Imagine two illustrative quotes: one offers placement for $80 with writing billed separately; another includes a reviewed article for $140. These are invented worksheet amounts, not marketplace offers. Without knowing who drafts the article, how many revisions are included and whether your existing text is acceptable, the comparison is incomplete. Add those answers before choosing.",
    steps: [
      "Create columns for placement, writing, revisions, currency, applicable fees and total approved spend. Mark unknown amounts as unknown rather than quietly treating them as zero.",
      "Add a separate contingency line under your control. Do not describe it as a publisher charge or combine it with a promised delivery commitment.",
      "Save the dated quote and its scope. Reconfirm the final amount if the listing, requirements or draft changes before payment becomes available.",
    ],
    avoid:
      "Avoid comparing a placement-only quote with a full writing package as if they were identical. The current Name Retailer planning cart is not checkout, does not reserve a price and does not accept payment. Use it to organize selections while commercial details are confirmed.",
    question: "Does a missing writing price mean the writing is free?",
    response:
      "No. An unavailable writing option needs clarification; it is not a zero-cost service.",
  },
  {
    cluster: "Marketplace",
    title: "Domain Rating and Domain Authority: a comparison worksheet",
    answer:
      "Keep DR and DA in separate columns and record their provider and observation date. They are different proprietary metrics, not interchangeable grades or a shared quality scale. Use them to frame questions about a publication rather than to certify its content or audience.",
    example:
      "Consider an illustrative shortlist with two supplied scores and no collection date. You can compare the values as imported observations, but you cannot honestly call either one current. A better worksheet adds publication relevance, sample articles, price and source availability. Missing source information becomes an explicit follow-up item, not a reason to invent a measurement.",
    steps: [
      "Name each metric exactly as supplied. Include a provider field and an observation-date field next to it so an old report cannot silently become today's score.",
      "Review editorial and audience evidence independently. Describe what you observed on the publication instead of substituting a metric for that review.",
      "When a refreshed measurement matters, obtain it from the licensed provider or an authorized report. Preserve both old and new dates for a fair comparison.",
    ],
    avoid:
      "Do not average DR and DA into a new authority score or present missing values as zero. This rebuild's imported scores are owner-supplied; activation makes records visible, but does not independently validate those metrics. Explain that distinction when sharing a shortlist with a client.",
    question: "Can I call an imported score a live measurement?",
    response:
      "Only if its actual provider and observation time support that description. An undated imported value should be labeled as supplied data.",
  },
  {
    cluster: "Marketplace",
    title: "How to read a publication traffic estimate",
    answer:
      "Treat a traffic figure as an estimate with a scope, period and source. Before using it in a placement decision, ask whether it represents a whole domain, a subdomain or a page, and which audience or channel it includes. The number alone is not a readership guarantee.",
    example:
      "An illustrative catalog entry says 12,000 monthly visits but does not identify the provider. Your proposed article may sit in a small section of that site, and the estimate may not describe the readers who care about your topic. Record those unknowns and inspect the relevant section rather than assigning the article an expected visitor count.",
    steps: [
      "Copy the estimate together with its unit, collection date and provider. If any field is unavailable, retain that label in the worksheet you share with others.",
      "Check whether the site's geography, language and topical coverage match the intended reader. A large total does not answer those audience questions.",
      "Ask for a scoped report when traffic is central to the budget decision. Separate observed referral visits after publication from the earlier third-party estimate.",
    ],
    avoid:
      "Avoid projecting a fixed number of leads from a publication-wide estimate. That would require assumptions about article visibility, readership and conversion that the supplied metric does not provide. Do not multiply the estimate by a made-up conversion rate and label the result a forecast.",
    question: "Does estimated traffic equal article views?",
    response:
      "No. Record the scope of the estimate and measure actual article or referral activity separately when reliable access is available.",
  },
  {
    cluster: "Marketplace",
    title: "What to confirm in a guest-post placement brief",
    answer:
      "A useful placement brief makes content, approval, disclosure and cost responsibilities explicit. Write down who provides the text, what the publication can edit and what happens if the proposed subject is declined. The brief should reduce ambiguity before money or editorial work changes hands.",
    example:
      "A fictional outdoor retailer proposes a guide to repairing a rain jacket. The editor accepts practical tutorials but not product-list articles. A brief that merely says 'one guest post' leaves a preventable mismatch. An outline, audience statement, proposed resource link and disclosure question give the editor enough context to evaluate the actual article.",
    steps: [
      "Describe the target reader, proposed title and three points the article must cover. Add the evidence and images you can supply, including permission status.",
      "Document draft ownership, revision rounds and final approval. Ask whether a publication can change the link destination or wording during its edit.",
      "Confirm the complete quote, link attributes and actual delivery terms. Keep cancellation, replacement and removal questions open until the provider supplies approved terms.",
    ],
    avoid:
      "Do not fill unanswered commercial fields with assumptions. A planning document is not a contract or a payment receipt. Name Retailer checkout is not enabled in this rebuild, so saved placements remain planning items rather than confirmed orders or delivery commitments.",
    question: "Is a saved cart the same as an approved brief?",
    response:
      "No. A cart stores selections; an approved brief records the agreed editorial and commercial scope.",
  },
  {
    cluster: "Marketplace",
    title: "Paid-link disclosure: questions to ask before placement",
    answer:
      'Ask how the publication identifies commercial content and qualifies paid links before agreeing to a placement. Google\'s guidance uses rel="sponsored" for paid placements and also accepts nofollow. Link qualification and a reader-facing disclosure are separate questions; discuss both with the editor.',
    example:
      "A fictional gardening article includes a paid reference to a retailer's care guide. The buyer asks whether the link will use a commercial qualification and how the relationship will be explained to readers. This conversation belongs in the brief, not after publication. If the proposal instead promises undisclosed ranking influence, pause and reassess the arrangement.",
    steps: [
      "Tell the editor whether money, services or another commercial benefit is involved. Ask for the planned link attributes and the publication's disclosure approach in writing.",
      "Review the final article's wording and the actual anchor element when it is delivered. A sentence in an email does not prove that the published HTML matches the agreement.",
      "Keep a record of the publication URL, inspection date and any correction request. If the implementation differs, discuss the discrepancy without claiming a guaranteed SEO consequence.",
    ],
    avoid:
      "Avoid treating a 'dofollow' label as a purchase guarantee or a substitute for compliance review. Do not promise that a paid article will improve rankings. Applicable disclosure obligations may also depend on the circumstances; get appropriate advice when legal questions arise.",
    question: "Does a sponsorship note replace link qualification?",
    response:
      "No. Review the visible commercial disclosure and the link's HTML attributes separately.",
    source: {
      label: "Google: qualify outbound links",
      url: "https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links",
    },
  },
  {
    cluster: "Marketplace",
    title: "How to compare publication language and geography",
    answer:
      "Compare the language your reader uses with the publication's actual content and audience context. A country field helps organize a search, but does not prove where every reader lives. Inspect the relevant section and ask for audience evidence when geography is essential to the project.",
    example:
      "A fictional logistics business serves Spanish-speaking importers in two markets. A publication based in one country may still write for an international professional audience. Conversely, a locally registered domain may cover topics outside the buyer's market. Review vocabulary, examples and contact context before treating a country filter as the complete targeting plan.",
    steps: [
      "Define the intended language, market and business problem separately. This keeps a language match from being confused with geographic reach.",
      "Read recent relevant articles for local context: units, regulations mentioned, regional examples and the reader knowledge they assume. Record observations, not inferred demographics.",
      "If geographic readership determines the decision, request an appropriately scoped audience report. Label unavailable geography evidence clearly in the shortlist.",
    ],
    avoid:
      "Avoid describing a site's registration location or domain extension as proof of audience location. Do not translate a generic article and assume it now fits a different market. A relevant local reviewer can identify examples and wording that a country selector cannot evaluate.",
    question: "Is a country filter enough to target a market?",
    response:
      "No. Use it to narrow candidates, then assess language, editorial context and actual audience evidence.",
  },
  {
    cluster: "Marketplace",
    title: "An editorial review checklist for a publication shortlist",
    answer:
      "Review a sample of articles for usefulness, attribution, consistency and topical relevance. Keep concrete observations alongside the shortlist so another person can understand the decision. This is an editorial assessment, not a certification or a proprietary score calculated from a few visible pages.",
    example:
      "Imagine reviewing three recent articles and an older guide on a specialist design publication. One explains a real workflow with diagrams, another gives unsupported product claims and the third is unrelated sponsored material. Rather than labeling the whole site 'verified,' record those differences and ask how the proposed article would be reviewed and placed.",
    steps: [
      "Select samples from the section relevant to your topic, not only the home page. Note dates, authorship and whether the article answers a recognizable reader question.",
      "Check factual claims and source links in the sample. Record unavailable evidence and distinguish an original example from a claimed customer result.",
      "Ask about editing, corrections and placement visibility. Keep unanswered questions separate from the observations you can support with public URLs.",
    ],
    avoid:
      "Avoid drawing sweeping conclusions from one attractive article or one poor paragraph. A shortlist review has a limited sample and should say so. Likewise, owner-supplied marketplace metrics and an active status do not establish an independently audited editorial process.",
    question: "Can I label my shortlist review as publisher verification?",
    response:
      "Only if you define and actually complete a verification process. Otherwise describe the specific sample review you performed.",
  },
  {
    cluster: "Marketplace",
    title: "Placement-only versus article-writing packages",
    answer:
      "Compare placement and writing as distinct services. A writing tier describes the amount of text in an available option; it does not automatically define research, editing, images or revision scope. Confirm those responsibilities before comparing a prepared-article placement with a writing-inclusive quote.",
    example:
      "A fictional buyer already has a reviewed 700-word draft. Paying for a 750-word writing option may duplicate work, but the publication might require its own editorial rewrite. Another buyer has only a topic and needs research. Both buyers should ask different questions even when the catalog offers the same 500-, 750- and 1,000-word tiers.",
    steps: [
      "Record what you already have: outline, draft, evidence, images and permission. Tell the provider which assets are ready and which still need work.",
      "Ask what each available tier includes beyond word count. Clarify editing, sourcing, revision rounds and how additional work is priced.",
      "Compare the final placement-plus-writing total and keep unavailable options marked unavailable. Preserve the agreed brief with the chosen tier.",
    ],
    avoid:
      "Avoid choosing a word count because it sounds more SEO-friendly. Length should fit the reader's task and the publication's requirements. This preview's writing prices are optional add-ons; zero or missing imported prices are not silently offered as free writing.",
    question: "Will a longer writing tier rank better?",
    response:
      "No ranking outcome is promised. Choose enough space to answer the reader's question and meet the agreed editorial scope.",
  },
  {
    cluster: "Marketplace",
    title: "What to record after a placement is published",
    answer:
      "Create a delivery record with the actual article URL, publication date, final content and link details. Inspect the live result against the agreed brief before calling the work complete. Track corrections separately from traffic or search outcomes so delivery evidence is not confused with performance evidence.",
    example:
      "A fictional software buyer receives a published tutorial. The title is accurate, but the editor linked to an outdated resource. A delivery worksheet makes the mismatch visible: requested destination, observed destination, inspection date and correction status. None of those fields imply that the buyer gained leads or rankings from the article.",
    steps: [
      "Capture the canonical article URL and the visible publication information. Check that the article is accessible and that its subject matches the approved brief.",
      "Inspect the destination, anchor text and link attributes. Record the observed values rather than copying the original request into the delivery column.",
      "Log correction requests and the later inspection outcome. Add referral or inquiry measurements only when you have access to reliable measurement data.",
    ],
    avoid:
      "Avoid reporting 'delivered' before a live article exists or assuming that an accessible article is indexed. Do not claim permanent availability without an actual commitment. The rebuild's planning cart does not provide order tracking or fulfillment, so this worksheet describes a future operational process.",
    question: "Does a published URL prove ranking improvement?",
    response:
      "No. Publication is delivery evidence; rankings, referrals and conversions require separate observations and careful attribution.",
  },
  {
    cluster: "Content",
    title: "How to write a guest-post brief an editor can use",
    answer:
      "A usable brief names the reader, the problem, the proposed answer and the evidence available. Give the editor a clear scope with room for editorial judgment. A list of keywords alone does not explain what the article should help someone do or why the publication should carry it.",
    example:
      "For a fictional accounting audience, 'remote work productivity' is too broad. 'How a small accounting team can hand off unfinished client work across time zones' specifies a workflow. The writer can now request a handoff example, explain responsibility fields and distinguish a practical process from a generic productivity opinion.",
    steps: [
      "Write the audience and outcome in plain language. State what the reader should be able to decide or complete after finishing the article.",
      "Provide a short outline with evidence required for each section. Identify missing interviews, examples or product facts before assigning the draft.",
      "Add publication-specific requirements, image permissions, link context and revision ownership. Keep promotional requests separate from the editorial answer.",
    ],
    avoid:
      "Avoid asking the writer to repeat a phrase a fixed number of times or to manufacture expertise. If the brief requires customer outcomes, supply real approved evidence; otherwise use a clearly fictional working example. This keeps the article useful without implying an experience the author did not have.",
    question: "How detailed should the first brief be?",
    response:
      "Detailed enough to align audience, answer, evidence and scope. Resolve the important unknowns before drafting, then let the editor improve the structure.",
  },
  {
    cluster: "Content",
    title: "Match article structure to the reader's search intent",
    answer:
      "Structure the article around the task implied by the question. A reader comparing options needs criteria and trade-offs; someone learning a process needs ordered instructions and prerequisites. Start with that distinction rather than placing the same introductory essay on every subject.",
    example:
      "Two fictional questions involve image compression. 'What is WebP?' calls for a definition and format comparison. 'How do I reduce this image's file size?' calls for source preparation, quality settings and output inspection. Linking the second article to a working compression tool gives the reader a direct next step instead of another abstract explanation.",
    steps: [
      "Write down the question and identify the expected output: definition, comparison, checklist, troubleshooting decision or finished file. Choose headings that serve that output.",
      "Put necessary prerequisites before the steps. Include an example that demonstrates the decision rather than merely restating the section title.",
      "End with a relevant next action and the limits of the guidance. Remove tangents that do not help the reader complete the stated task.",
    ],
    avoid:
      "Avoid forcing every article into an identical number of headings or adding unrelated questions just to mention more keywords. A professional page can be short when the task is narrow, but it must still contain the information required to act confidently.",
    question: "Should all articles use a step-by-step format?",
    response:
      "No. Use steps for processes, criteria for comparisons and concise explanations for definitions; match the format to the question.",
  },
  {
    cluster: "Content",
    title: "Write a direct answer without losing important context",
    answer:
      "Begin with the shortest accurate answer, then add the conditions that affect how it applies. Directness should remove unnecessary setup, not uncertainty or exceptions. A useful opening lets the reader understand the conclusion and decide whether to keep reading the supporting detail.",
    example:
      "A fictional buyer asks whether a missing writing price means free content. The direct answer is 'No; that writing option is unavailable or needs clarification.' The following paragraph can explain separate placement pricing and confirmation steps. A long introduction about the value of content would delay the answer without helping the buyer interpret the field.",
    steps: [
      "Draft a two-sentence answer to the page's main question. Include a qualification in that answer when leaving it out would materially mislead the reader.",
      "Place an example immediately after the explanation if it makes the distinction easier to apply. Keep invented amounts or scenarios explicitly illustrative.",
      "Use later sections for evidence, alternatives and detailed steps. Read the opening alone to check that it remains truthful when quoted out of context.",
    ],
    avoid:
      "Avoid compressing a conditional answer into an absolute claim such as 'always works' or 'guaranteed.' Clear answers are easier to read, but clarity does not create evidence. Retain the actual limits of the recommendation even if the page is designed for quick scanning.",
    question: "How long should a direct answer be?",
    response:
      "As short as it can be without losing essential conditions. There is no universal sentence count that makes an answer eligible for a search feature.",
  },
  {
    cluster: "Content",
    title: "A source log for fact-checking content drafts",
    answer:
      "Keep a source log that connects each checkable claim to the exact supporting page, observation date and any relevant limitations. This makes review easier than a general bibliography with no claim mapping. Prefer first-hand documents when the article explains a product, policy or technical behavior.",
    example:
      "A fictional draft says an image tool processes files locally. Its source log should point to the implementation and network test, not a general privacy slogan. A separate statement about a search-engine rule needs that engine's documentation. The two claims use different evidence, even if they appear in the same paragraph.",
    steps: [
      "Highlight factual claims in the draft and give each one an evidence row. Record the precise supported statement rather than only the source domain.",
      "Check whether the document is current and whether its scope matches the wording. Revise the claim when the source supports a narrower statement.",
      "Keep interpretation separate from observation. When offering your own workflow recommendation, label it as guidance rather than attributing it to a source that never made it.",
    ],
    avoid:
      "Avoid treating citations as decoration or using a source title to justify unrelated claims. Do not copy a long passage when a short original explanation would serve the reader. For changing information, revisit the source during the next substantive editorial review.",
    question: "Does adding a source automatically prove the whole paragraph?",
    response:
      "No. The linked document must support the specific claim, and any extrapolation should remain clearly identified.",
  },
  {
    cluster: "Content",
    title: "Headlines that describe the article instead of overselling it",
    answer:
      "Write a headline that identifies the subject and the reader's task. Keep promises proportional to the article's evidence and scope. A specific, modest headline is more useful than a dramatic claim the body cannot support, especially when the page is shared without its full context.",
    example:
      "For a fictional planning guide, 'The ultimate secret to instant authority' promises something the article cannot establish. 'How to compare guest-post placement quotes' tells the reader exactly what is covered. The latter can support a worksheet, a worked example and a clear list of unknowns without relying on unverifiable growth claims.",
    steps: [
      "Describe the question the article answers, then remove adjectives that do not add information. Keep the distinctive subject visible even in a short display.",
      "Compare the title, page heading and opening paragraph. They should point to the same task rather than three competing promotional messages.",
      "Check every numerical or outcome promise in the headline against the body. Remove a claim when its evidence or timeframe is unavailable.",
    ],
    avoid:
      "Avoid adding the current year merely to make an unchanged article look fresh. Do not repeat near-identical phrases to fit more keywords. Google can select different title-link text; your job is to supply a clear preference that represents the page accurately.",
    question: "Can I guarantee that Google will show my exact title?",
    response:
      "No. Supply a descriptive page title and keep it consistent with the visible content; the search result title is determined automatically.",
    source: {
      label: "Google: title links",
      url: "https://developers.google.com/search/docs/appearance/title-link",
    },
  },
  {
    cluster: "Content",
    title: "Meta descriptions that help readers choose a page",
    answer:
      "Use the description to summarize the page's useful answer and scope. It should help someone decide whether the article matches their question, not stack synonyms or promise an outcome the page cannot deliver. Write a distinct description for each article instead of reusing a generic brand slogan.",
    example:
      "A fictional guide explains publication traffic estimates. 'Learn what a monthly traffic estimate does and does not tell you before comparing guest-post sites' is a relevant summary. 'Best traffic SEO authority growth cheap links' is not. The first describes a decision the article supports without suggesting a measured campaign result.",
    steps: [
      "Identify the article's central answer and the intended reader. Draft one concise summary that links those two ideas in ordinary language.",
      "Remove unsupported superlatives, repetitive keywords and details the article does not cover. Verify that the description still matches the page after editorial changes.",
      "Review it beside the title to avoid repeating the same sentence. Let the title name the task while the description adds a useful boundary or next step.",
    ],
    avoid:
      "Avoid treating a description as guaranteed search-result copy. Google may select a snippet from the page instead. Do not chase a fixed character count at the expense of clarity; concentrate on an accurate summary that remains understandable if display space is limited.",
    question: "Will the meta description always appear in search?",
    response:
      "No. It is a suggested summary; the search engine may generate a different snippet from relevant page content.",
    source: {
      label: "Google: snippets and meta descriptions",
      url: "https://developers.google.com/search/docs/appearance/snippet",
    },
  },
  {
    cluster: "Content",
    title: "How to write helpful FAQ answers",
    answer:
      "Use an FAQ for genuine unresolved questions that do not fit naturally into the main explanation. Each answer should stand on its own, state important conditions and direct the reader to detailed guidance when needed. An FAQ is a reader aid, not a collection of keyword variations.",
    example:
      "A fictional marketplace FAQ asks whether a saved placement is an order. A complete answer says it is a planning item, not a reservation or payment, and links to the current process. Repeating 'how to order guest posts' three ways would create noise while leaving the commercial boundary less clear.",
    steps: [
      "Collect questions from actual support requests, brief reviews or product decisions. If a question is editorially proposed rather than observed, do not call it a frequent customer question.",
      "Draft an answer that addresses the question directly. Include prerequisites and exceptions that would change what the reader should do next.",
      "Check that FAQ wording agrees with the product behavior and the rest of the article. Remove duplicated answers or merge them into the main section.",
    ],
    avoid:
      "Avoid inventing customer demand or describing FAQ markup as a guaranteed rich-result strategy. A visible question-and-answer section can be useful without any special search presentation. Keep the answer current when the product capability or commercial policy changes.",
    question: "Should I put every possible question in the FAQ?",
    response:
      "No. Keep the questions relevant and nonduplicative; move essential explanations into the main article where readers are more likely to need them.",
  },
  {
    cluster: "Content",
    title: "Image alt text: describe purpose, not every pixel",
    answer:
      "Write alt text around the image's purpose in the surrounding content. An informative diagram needs its meaningful information conveyed; a purely decorative image may use an empty alt attribute. Review context before assuming that every empty attribute is an error or that every nonempty one is helpful.",
    example:
      "A fictional tutorial shows a crop rectangle with a 20-pixel left offset. An alt description can state the rectangle's relevant position rather than listing the screen's colors. A leaf illustration beside the title adds mood but no instructional information; empty alt prevents it from becoming unnecessary reading noise. A linked image needs a separate check of the link's accessible name.",
    steps: [
      "Classify the image as informative, functional or decorative in this exact context. The same asset may need different treatment on another page.",
      "Describe the information or action the reader would otherwise miss. Put long diagram explanations in nearby visible text rather than forcing everything into one attribute.",
      "Inspect the page with images unavailable and review links or buttons containing images. Use an HTML alt checker to find missing attributes, then make the editorial judgment yourself.",
    ],
    avoid:
      "Avoid filling alt attributes with SEO keywords or accepting a generic filename as a description. Automated checks can identify missing or empty attributes, but cannot certify that the chosen words accurately convey the image's purpose.",
    question: "Is empty alt always wrong?",
    response:
      "No. It can be appropriate for a decorative image; informative and functional images need contextual review.",
    source: {
      label: "W3C: alt decision tree",
      url: "https://www.w3.org/WAI/tutorials/images/decision-tree/",
    },
  },
  {
    cluster: "Content",
    title: "A content-refresh decision log",
    answer:
      "Refresh an article when its answer, evidence or practical instructions need a substantive change. Keep a short log of what changed and why. Updating a date alone does not tell the reader that the guidance was actually reviewed or improved.",
    example:
      "A fictional tool guide still says only a word counter is available after image tools have launched. The refresh should update the capability description, screenshots and relevant links. If the guidance remains accurate but a reviewer checked it again, distinguish that review from a new publication or a major rewrite.",
    steps: [
      "Start with a concrete reason: changed product behavior, broken source, missing answer, confusing instruction or new approved evidence. Record the issue before editing.",
      "Review the affected sections and their internal links. Update examples when they no longer match the current interface or available data.",
      "Summarize the substantive changes and record an actual review date. Keep original publication history separate so returning readers understand what is new.",
    ],
    avoid:
      "Avoid adding unsupported results or switching dates to create an appearance of freshness. Do not revise unrelated paragraphs merely to claim a larger update. A good refresh makes a specific reader task easier or more accurate, and the change log should explain that improvement.",
    question: "Should every article get a new date each month?",
    response:
      "No. Record real publication, modification and review events; schedule a review based on the topic's change rate and importance.",
  },
  {
    cluster: "Content",
    title: "An editorial handoff checklist before publication",
    answer:
      "Before publication, hand over a complete package: approved text, checked sources, usable media, metadata and clear unresolved questions. The receiving editor should not have to infer permissions, authorship or commercial link treatment from scattered messages. A clean handoff makes responsibility visible.",
    example:
      "A fictional draft arrives with a screenshot but no permission note, an invented customer quote and a broken resource URL. The text may read smoothly, yet it is not ready. A handoff sheet would flag the screenshot's status, remove the unsupported quote and require the link to be checked before the editor schedules the article.",
    steps: [
      "Confirm the title, excerpt, body and sources agree. Identify who actually authored or supplied the material, including AI assistance when relevant.",
      "Check media permissions and contextual alt descriptions. Provide final files with the intended placement and avoid external assets the publication cannot legitimately use.",
      "List commercial disclosures, link qualifications and outstanding approvals. Assign each unresolved item an owner rather than silently moving it into production.",
    ],
    avoid:
      "Avoid signing off merely because the page renders without an error. Technical validation does not establish originality, permission or factual reliability. This journal's new guides are AI-assisted editorial material, not migrated posts or independently reviewed expert reporting.",
    question:
      "Does a technically valid page mean the article is editorially approved?",
    response:
      "No. Technical checks and owner/editorial approval are different gates, and both need an honest record.",
  },
];
