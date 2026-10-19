/** Buyer-specific additions; examples describe decisions, never reported customer results. */
export type BuyerExpansion = {
  title: string;
  description: string;
  sections: Array<{ heading: string; body: string; code?: string }>;
  faq: Array<[string, string]>;
};
export const buyerExpansions: Record<string, BuyerExpansion> = {
  "how-to-choose-a-guest-post-publication-for-your-audience": {
    title: "Choose Guest Post Publications Your Audience Will Read",
    description:
      "Choose a guest post publication by reader fit, editorial standards and placement scope. Use a practical review record before requesting a publisher quote.",
    sections: [
      {
        heading: "Test one proposed article against three recent pages",
        body: "Open three recent articles in the section you would actually use. For each, record the intended reader, the task it helps them complete and the level of knowledge it assumes. Then write your proposed article title beside those observations. If you cannot explain why the same reader would use your contribution, a shared category label is too weak a reason to proceed. A business publication aimed at finance directors may be a poor home for beginner advice to sole traders, even though both fit Business. Keep the URLs you inspected so a colleague can challenge your assessment without repeating the entire search.",
      },
      {
        heading:
          "Resolve a borderline choice before requesting the full article",
        body: "When a candidate is close, send the editor a short outline rather than commissioning the finished piece. Ask whether the section accepts that angle and whether the contribution can include the supporting material you intend to provide. A response about price alone does not settle topic fit. Compare the answer with your original audience statement: does the publication reach the right kind of reader, or is the offer simply easy to buy? If the editor proposes a different subject, check whether that subject still serves your campaign before agreeing. Your shortlist should become smaller as evidence improves.",
      },
      {
        heading: "Use a decision record you can reuse",
        body: "Save a short conclusion with each candidate. Separate observed evidence from an editor's statement and from your own inference. Record why the strongest alternative was rejected, since that makes future reviews quicker when prices or editors change. Reopen the decision if the proposed section, article angle or commercial scope changes; the original reasoning may no longer apply.",
        code: "Reader: [role and problem]\nProposed article: [specific task]\nPages inspected: [URLs and dates]\nFit evidence: [what the articles show]\nOpen question: [what the editor must answer]\nDecision: [proceed / pause / reject, with reason]",
      },
    ],
    faq: [
      [
        "Should I choose the highest-DR publication?",
        "Use DR as one comparison input after relevance. A score does not tell you whether readers need your article or whether the proposed section is appropriate.",
      ],
      [
        "What should I send with the inquiry?",
        "Include the publication, audience, article idea, destination URL, proposed anchor and total budget. Ask which scope and editorial terms the quote includes.",
      ],
    ],
  },
  "a-practical-guest-post-budget-worksheet": {
    title: "Guest Post Budget Worksheet: Price, Writing and Scope",
    description:
      "Build a guest post budget that separates placement, writing, revisions and internal time. Compare complete quotes with a worksheet and clear spending limits.",
    sections: [
      {
        heading: "Price the same deliverable before comparing two quotes",
        body: "Create one row per proposed publication and columns for placement, writing, editing, images and internal coordination. Add a status column so a confirmed charge is distinguishable from an estimate. If the placement quote excludes writing, do not compare its headline figure with a package that includes a finished article. Ask the provider to itemize the scope or calculate your own equivalent production budget. Keep the currency visible in every row; a bare number can become misleading when an agency combines quotes from several suppliers. Do not treat a blank tax or fee field as a confirmed zero.",
      },
      {
        heading: "Use a spending cap before selecting a publication",
        body: "For an illustrative budget, suppose a placement quote is USD 180, writing is USD 70 and image licensing is USD 20. The external cost is USD 270 before any other applicable charges. If your approved cap is USD 250, the brief needs a change before acceptance: choose a different publication, supply suitable licensed images yourself, or seek approval for the higher total. Reducing a contingency line does not make a known charge disappear. Keep staff time in a separate planning column if it does not represent a supplier payment. This lets you report both cash spending and the actual effort required.",
      },
      {
        heading: "Reconcile the accepted quote with the final record",
        body: "Preserve the written quote and record any approved scope changes beside it. When the article is published, compare actual charges with the accepted version, not with the first catalogue snapshot. Explain variances with a specific cause such as a longer article or an agreed extra revision. This produces a useful next-campaign estimate without pretending that one placement establishes a market average.",
        code: "Publication | Currency | Placement | Writing | Other agreed charges | Quote date | Accepted total | Actual total | Variance reason",
      },
    ],
    faq: [
      [
        "Should I include my own editing time?",
        "Yes, in an effort column. Keep internal time separate from external cash payments so totals remain understandable.",
      ],
      [
        "Is the catalogue figure a complete quote?",
        "It is the listed placement price. Request a quote to confirm writing, revisions and any additional charges for your actual brief.",
      ],
    ],
  },
  "domain-rating-and-domain-authority-a-comparison-worksheet": {
    title: "DA and DR Comparison Worksheet for Guest Post Buyers",
    description:
      "Compare Domain Rating and Domain Authority without mixing their scales. Record sources, dates, topical fit and traffic context before choosing a publisher.",
    sections: [
      {
        heading: "Build two metric columns rather than one blended score",
        body: "Record DA and DR in separate columns with provider and observation date. Do not average them or convert one into the other with an improvised formula. A publication can differ across the tools because the tools assess different data with different methods. If you rank a shortlist by DR, apply DR consistently to every candidate with that information. Keep candidates with missing scores in a separate research queue instead of assigning them zero. A consistent sorting rule makes comparison reproducible; it does not make the score a measurement of editorial standards or reader interest.",
      },
      {
        heading: "Investigate the disagreement that would change your choice",
        body: "Suppose two relevant publications have similar prices and different score patterns. Identify what the disagreement might mean for your decision before paying for more reports. Inspect current articles, the proposed section and available traffic evidence. Ask whether a supplier's report covers the root domain or a subdomain. A score for a large root domain may not describe the section offered in the placement. Keep the original supplied value and annotate the scope instead of silently replacing it with a result from another tool. This preserves the difference between catalogue information and your later research.",
      },
      {
        heading: "Write an explanation without a false quality verdict",
        body: "A useful conclusion states the evidence and its limit: a candidate fits the intended reader and has supplied authority observations, but the editor still needs to confirm the article angle and commercial scope. Avoid labels such as certified, safe or premium unless you have a defined basis you can substantiate. A number can support a research decision without becoming a guarantee of search performance.",
        code: "Publisher | DA / date | DR / date | Domain or section | Relevant article URLs | Traffic source / period | Decision and unresolved questions",
      },
    ],
    faq: [
      [
        "Can I convert DA into DR?",
        "There is no dependable universal conversion. Compare like with like and preserve each provider's original observation.",
      ],
      [
        "Does a high score guarantee a valuable placement?",
        "No. Evaluate reader fit, article quality, commercial scope and evidence alongside the metric.",
      ],
    ],
  },
  "how-to-read-a-publication-traffic-estimate": {
    title: "Read Publisher Traffic Estimates Before Guest Posting",
    description:
      "Interpret publisher traffic estimates by source, channel, period and geography. Learn what to request when a headline visitor count cannot support a decision.",
    sections: [
      {
        heading: "Ask what the traffic number counts",
        body: "Write down whether a figure describes users, sessions, page views or an estimated search channel. Then record the period and the exact property: root domain, subdomain, section or article. These distinctions determine which comparisons are useful. A whole-site monthly estimate and a single article's yearly page views answer different questions. Request the original report or a clearly scoped extract when the figure affects a substantial spending decision. If the supplier cannot explain it, keep the figure out of your comparison calculation rather than guessing its meaning from the size of the number.",
      },
      {
        heading:
          "Follow the route from headline traffic to your proposed reader",
        body: "Inspect the pages and locations responsible for the audience, when evidence is available. A publication may attract most visits to a free calculator while selling an unrelated sponsored section. Ask which current articles resemble your proposed subject and whether the audience information covers those pages. You do not need every page to match your business, but you need a plausible route from the publication's readers to the contribution you will provide. Treat a listing country as a catalogue classification until actual readership geography is evidenced. A country name in a supplier spreadsheet is not an analytics breakdown.",
      },
      {
        heading: "Keep a trend and its limitations together",
        body: "Compare several periods from the same source and method if the decision requires a trend. Note tool changes or property changes beside the series. A single jump warrants investigation, not an automatic verdict of growth or manipulation. Record the explanation supplied by the publisher separately from what you observed. Use the result to decide whether to request a quote, ask for another report, or reject the candidate.",
        code: "Metric counted: [...]\nProvider and channel: [...]\nProperty / section: [...]\nPeriod and observation date: [...]\nRelevant pages and locations: [...]\nDecision this evidence supports: [...]",
      },
    ],
    faq: [
      [
        "Does traffic mean guaranteed visits to my article?",
        "No. Whole-site activity does not predict how many readers will see a new contribution.",
      ],
      [
        "What if the report has no date?",
        "Ask for a dated report. Preserve the undated observation as such and avoid calling it current traffic.",
      ],
    ],
  },
  "what-to-confirm-in-a-guest-post-placement-brief": {
    title: "Guest Post Placement Brief: Terms to Confirm Up Front",
    description:
      "Prepare a placement brief covering article scope, approval, link attributes, revisions and timing. Use a confirmation template before accepting a quote.",
    sections: [
      {
        heading: "Turn an inquiry into a brief an editor can approve",
        body: "Start with the exact publication and section, proposed article title, reader and intended outcome. Add the destination URL and proposed anchor in context. Specify who supplies the manuscript, images, supporting evidence and author details. If you need writing, state the expected scope rather than assuming it is part of placement. Ask the editor to acknowledge these points in writing with the quote. A response that only says the domain and price leaves enough ambiguity to cause a costly rewrite later. Keep the inquiry and accepted scope together so the handoff does not rely on someone remembering a phone call.",
      },
      {
        heading: "Define what happens when the article needs changes",
        body: "Agree who reviews the first draft, who can approve changes and which revisions are covered. Distinguish correcting a factual error from replacing the entire topic after writing has begun. Ask whether substantial changes require a revised quote. Discuss what happens if the editor declines the final article or cannot meet the requested schedule, and check the applicable refund terms before committing. Avoid inventing a standard turnaround for all publications. A supplied estimate is useful, but the timing for your brief depends on acceptance, production and review. Record the agreed sequence rather than only a desired live date.",
      },
      {
        heading: "Send a confirmation request with answerable fields",
        body: "Use questions that let the editor confirm or amend specific points. Leave room for an explicit response where your assumption may be wrong. After agreement, save a dated copy and give the writer the accepted version. If the publication changes, revisit the whole brief because audience, format and link policy can change with it.",
        code: "Please confirm: [publication / section], [article angle], [writing responsibility], [placement and production charges], [included revisions], [paid disclosure and link attributes], [approval steps], [target timing], [decline / cancellation terms].",
      },
    ],
    faq: [
      [
        "Is an inquiry the accepted scope?",
        "The inquiry starts the discussion. Preserve the editor's written confirmation of the final scope and quote.",
      ],
      [
        "What should change if I switch publishers?",
        "Review audience, format, guidelines, price, approval and link terms again; do not carry assumptions from the first publication.",
      ],
    ],
  },
  "paid-link-disclosure-questions-to-ask-before-placement": {
    title: "Paid Guest Post Disclosure: Questions for Publishers",
    description:
      "Ask publishers clear questions about sponsored disclosure and paid link attributes. Review the quote and the live article without assuming ranking credit.",
    sections: [
      {
        heading: "Ask about the reader label and the link separately",
        body: "A sponsorship label explains the commercial relationship to readers. A link attribute communicates a relationship in the HTML. Ask where the visible disclosure will appear and how the publisher will qualify the destination link. One does not substitute for the other. Keep the response with your brief and confirm whether the publisher controls both decisions. When an intermediary answers, ask them to obtain confirmation from the actual publication rather than accepting a generic policy that may not apply to the section you are buying. The purpose is to know what the publication will deliver before your article is written.",
      },
      {
        heading: "Respond to a ranking-credit sales pitch",
        body: "If a quote emphasizes guaranteed rankings or an unqualified paid link, pause the purchase. Ask for an advertising placement whose disclosure and link terms are explicit. A useful article can still introduce a business to readers without a promise about search performance. Do not negotiate to hide payment or to remove the publisher's disclosure. Review whether the placement remains worth the cost for its subject, audience and referral opportunity. If the commercial case depends entirely on passing ranking credit, reconsider the campaign brief and budget rather than treating a different label as a solution.",
      },
      {
        heading: "Check the published article against the agreement",
        body: "Open the live page and inspect the destination, anchor, visible label and link attributes. Save the URL and date of inspection with the accepted brief. If something differs, send a specific correction request identifying the element and the agreed wording. Do not report a discrepancy as fixed until you inspect the revised page. Publisher acceptance and a technically accessible article do not establish that Google will index it or display it for a particular query.",
        code: "Agreed disclosure: [...]\nAgreed link relationship: [...]\nLive URL and inspection date: [...]\nObserved disclosure / link attributes: [...]\nCorrection requested and checked: [...]",
      },
    ],
    faq: [
      [
        "Can a sponsored article still be useful?",
        "Yes. Judge its content and audience fit as well as its commercial transparency. Use referral and reader outcomes you can observe.",
      ],
      [
        "Should I ask for guaranteed rankings?",
        "No. A placement agreement cannot establish how search systems will rank either website.",
      ],
    ],
  },
  "how-to-compare-publication-language-and-geography": {
    title: "Compare Publisher Language and Geography for Outreach",
    description:
      "Check publisher language, reader geography and local context before outreach. Separate a listing country from evidence about the audience you want to reach.",
    sections: [
      {
        heading: "Read beyond the site's country field",
        body: "Record the language used by the proposed section, the markets discussed in its recent articles and the location of the readers when evidence supports it. Keep these observations in separate fields. A publisher based in one country may serve readers across several markets, while a global domain may offer a narrowly local section. Check the contact and editorial pages to understand the operation, but do not treat the postal address as an audience report. If your offer only serves one region, ask for readership information relevant to that region before accepting a quote.",
      },
      {
        heading: "Check whether the article works in the reader's context",
        body: "Review examples, units, terminology, product availability and practical steps with someone who understands the intended market. Translation alone will not fix an article that recommends an unavailable service or assumes a different buying process. For an illustrative software contribution, an explanation of appointment scheduling might travel well, but payment examples and customer communication practices may need local adaptation. Give the editor a short outline showing those choices. Ask whether the publication expects a local contributor or particular references, and budget for that editorial work if it is part of the required scope.",
      },
      {
        heading: "Make geography a decision criterion rather than a decoration",
        body: "Decide how much location matters to your actual objective. A local service needs a different audience match from a downloadable tool serving many countries. Record which candidates meet the requirement and which need more evidence. Do not apply a precise location percentage unless you have a source and period for it. Where location is a strict requirement, unresolved geography should pause the decision instead of being offset by a high authority score.",
        code: "Reader language: [...]\nService area / target market: [...]\nSection language and examples: [...]\nReadership evidence and period: [...]\nLocalization required: [...]\nProceed / ask / reject: [...]",
      },
    ],
    faq: [
      [
        "Does listing country prove audience location?",
        "No. It is a catalogue field. Ask for readership evidence if location affects the campaign.",
      ],
      [
        "Can I reuse an article in another language?",
        "Check originality, translation rights and the publisher's policy first. Adapt the substance and examples for the intended readers.",
      ],
    ],
  },
  "an-editorial-review-checklist-for-a-publication-shortlist": {
    title: "Publication Shortlist Review: An Editorial Checklist",
    description:
      "Review a publisher shortlist using recent articles, sources, editorial policies and topic fit. Keep a concise evidence record before requesting a placement.",
    sections: [
      {
        heading: "Sample a section using a consistent review method",
        body: "Choose recent pages from the section offered in the placement, including at least one contribution similar to your proposed subject. Record whether each page solves a recognizable reader problem, identifies its author where appropriate and supports claims with inspectable evidence. Note the URLs and dates. Do not use a visually polished home page as a substitute for inspecting the pages where your article would sit. Apply the same method across candidates so one publication is not rewarded simply because you happened to open its strongest article while reviewing a competitor's weakest one.",
      },
      {
        heading: "Distinguish editorial concerns from personal preferences",
        body: "A writing style you dislike is different from an unsupported factual claim, deceptive sponsorship or an incoherent article. Describe the problem precisely and explain how it affects your brief. Ask the editor how submissions are checked, how corrections are handled and whether they can decline content that fails their standards. A meaningful answer describes a process; a broad claim that every post is premium tells you little. Keep your review proportionate to the subject. A technical or high-stakes contribution needs evidence and review appropriate to its claims, not merely a grammar pass.",
      },
      {
        heading: "Give each candidate a clear next step",
        body: "Use proceed, pause or reject and write one reason. A pause should name the evidence needed to resolve it, such as the actual section URL or submission rules. A rejection should identify the requirement that failed. Do not turn these categories into a public certification or a claim that the publication is fraudulent. They are your campaign decisions based on the material reviewed at a particular time.",
        code: "Publication / section: [...]\nSample pages and review date: [...]\nReader fit: [...]\nEvidence and editorial observations: [...]\nCommercial questions: [...]\nDecision and required next action: [...]",
      },
    ],
    faq: [
      [
        "How many articles should I inspect?",
        "Use enough to understand the proposed section and repeat the same sampling approach across your shortlist. A small sample has limits; record them.",
      ],
      [
        "Is this a publisher certification?",
        "No. It is an internal decision record for your campaign based on observed material and outstanding questions.",
      ],
    ],
  },
  "placement-only-versus-article-writing-packages": {
    title: "Placement Only vs Guest Post Writing Packages: Compare",
    description:
      "Compare placement-only quotes with guest post writing packages. Check research, revision, image and approval responsibilities before choosing the right scope.",
    sections: [
      {
        heading: "Describe the same finished article in both quote requests",
        body: "Send both providers the proposed publication, reader, angle, expected article scope, sources and image needs. Ask what each quote includes and which work remains yours. A package may cover a manuscript but exclude subject research, licensed images or a specialist review. Placement only may suit a team with a finished, suitable article, but the publication can still require revisions. Compare responsibilities line by line before comparing totals. The provider with the smallest headline price may leave more production work with your team, while a writing package may duplicate expertise you already have.",
      },
      {
        heading: "Choose who is best placed to supply the evidence",
        body: "If the article relies on your product behavior, original observations or a technical process, your team needs to provide accurate source material even when a writer produces the prose. Prepare screenshots you have rights to use, documented examples and a contact who can answer factual questions. Ask the writer to flag gaps instead of inventing customer stories or performance figures. For sensitive topics, identify the person responsible for substantive review before work starts. Outsourcing writing changes who prepares the manuscript; it does not make factual responsibility or publisher acceptance disappear.",
      },
      {
        heading: "Agree a handoff and revision boundary",
        body: "Confirm the first-delivery format, who comments on the draft and how revisions are approved. Consolidate feedback into one agreed version so a writer does not receive contradictory instructions. If the editor requests a new topic after accepting the original outline, discuss the new scope before treating it as an ordinary revision. Keep the accepted manuscript and commercial agreement together for the publication check.",
        code: "Work item | Included in placement? | Included in writing? | Our responsibility | Evidence or approval needed\nResearch | [...] | [...] | [...] | [...]\nImages / rights | [...] | [...] | [...] | [...]\nRevisions | [...] | [...] | [...] | [...]",
      },
    ],
    faq: [
      [
        "Does placement only mean I can submit any article?",
        "No. The manuscript still needs to fit the publication's guidelines and accepted angle.",
      ],
      [
        "What should a writing quote specify?",
        "Research responsibilities, article scope, images, review, included revisions, delivery format and the relationship to publisher approval.",
      ],
    ],
  },
  "what-to-record-after-a-placement-is-published": {
    title: "Guest Post Publication Record: Checks After It Goes Live",
    description:
      "Record the live guest post URL, agreed links, disclosure, corrections and referral observations. Separate publication delivery from campaign performance.",
    sections: [
      {
        heading: "Check delivery against the accepted brief",
        body: "Open the live article on a normal browser and compare it with the accepted manuscript. Check the title, article text, images, attribution, destination URLs and anchors. Review the visible commercial disclosure and link relationships against the agreement. Save the inspection date and identify any differences with a specific correction request. A supplier saying the article is live is a useful notification, but your own inspection establishes what was actually published. Do not mark a requested correction complete until you reopen the page and verify the change.",
      },
      {
        heading: "Give performance observations a defined window",
        body: "Decide when you will review referrals and the action readers should take on your own site. Record the window beside the result and preserve the campaign labels used with the publisher's permission. Separate tracked sessions from enquiries, qualified enquiries and sales. Small counts can be informative, but they do not establish a stable conversion rate or prove that a placement caused a wider search change. If tracking is incomplete, explain the limitation rather than replacing missing observations with zero. A good publication record remains useful even when the campaign did not produce the hoped-for response.",
      },
      {
        heading: "Use later checks to resolve concrete questions",
        body: "Revisit the article when the agreement calls for a check or when a reported issue makes it necessary. Record whether the page is accessible and whether the agreed elements remain present. Do not claim lifetime permanence unless that is an actual supported commitment. If the URL changes, save the new destination and discuss the effect with the publisher. Keep delivery corrections, commercial disputes and performance lessons in separate fields so a future campaign review can distinguish them.",
        code: "Live URL / date checked: [...]\nAccepted brief version: [...]\nObserved differences and correction status: [...]\nReporting window: [...]\nReferrals / meaningful actions / limitations: [...]\nNext campaign decision: [...]",
      },
    ],
    faq: [
      [
        "Does a live article prove it is indexed?",
        "No. Publication accessibility and search indexing are separate observations.",
      ],
      [
        "What if I cannot measure referrals reliably?",
        "Record the tracking limitation and the delivery evidence you can verify. Avoid reporting an unsupported traffic or ROI figure.",
      ],
    ],
  },
  "how-to-write-a-guest-post-brief-an-editor-can-use": {
    title: "Write a Guest Post Brief an Editor Can Approve Quickly",
    description:
      "Write a guest post brief with a clear reader, angle, evidence and editorial boundaries. Use a compact template to reduce avoidable rewrites and confusion.",
    sections: [
      {
        heading: "Replace a broad topic with a useful promise",
        body: "A topic such as business software leaves the writer and editor guessing. Narrow it to a reader, a problem and an outcome: for example, helping a small appointment-based business organize a cancellation list. Explain what the reader should be able to do afterward and what the article will deliberately leave for another resource. Check that the publication already serves that kind of reader. This makes the outline review concrete and prevents a writer from filling the article with general definitions that the audience already knows.",
      },
      {
        heading: "Supply evidence in a form the writer can inspect",
        body: "Attach the actual source for each proposed factual claim. Explain what a screenshot demonstrates, who collected an observation and what limits apply to it. If an example uses invented figures to demonstrate arithmetic, label it as an illustration. Do not ask the writer to invent a client story to make the piece sound experienced. Identify a contact for unresolved questions and decide which claims must be removed if evidence cannot be supplied. A useful brief makes these boundaries visible before drafting, when changing the outline is much cheaper than replacing a finished manuscript.",
      },
      {
        heading: "Give the editor specific approval questions",
        body: "Send the outline with questions about the angle, expected depth, publication section and any commercial or image requirements. Ask the editor to identify conflicts with current guidelines. Preserve the approved outline and use it when reviewing the draft. If your business goal changes during production, acknowledge the scope change and seek agreement before asking the writer to reshape the piece.",
        code: "Reader and problem: [...]\nUseful outcome: [...]\nProposed title / section: [...]\nOutline: [...]\nSources and original material: [...]\nDestination link in context: [...]\nDisclosure, rights and review: [...]\nEditor decisions needed: [...]",
      },
    ],
    faq: [
      [
        "Should the brief prescribe every sentence?",
        "No. Specify the outcome, evidence and boundaries while allowing the writer to choose a clear explanation.",
      ],
      [
        "What if the editor changes the angle?",
        "Confirm that the new angle still serves the reader and campaign, then update the outline and commercial scope before rewriting.",
      ],
    ],
  },
  "an-editorial-handoff-checklist-before-publication": {
    title: "Guest Post Editorial Handoff Checklist Before Publishing",
    description:
      "Hand a guest post to an editor with sources, image permissions, links and one approved manuscript. Use a practical version and approval checklist.",
    sections: [
      {
        heading: "Deliver one manuscript and a separate evidence packet",
        body: "Name the approved manuscript clearly and remove ambiguous copies from the handoff folder. Put source links, image permissions, captions, author details and commercial instructions in an accompanying note. The editor should be able to distinguish publishable text from private production comments without guessing. If a source is unavailable to the editor, explain how the relevant claim can be checked or remove it. Confirm whether the publication wants a document, HTML or another format before spending time on layout that its workflow cannot use.",
      },
      {
        heading: "Resolve comments before the final approval",
        body: "Read every open comment and assign a decision to the person responsible. A factual correction, a commercial request and a stylistic preference may need different approvers. Consolidate feedback so the editor does not have to choose between contradictory instructions from several stakeholders. Check the final destination URL on a real browser and confirm that the page continues the task described in the article. Review the intended anchor in its sentence rather than treating it as an isolated keyword. Make sure the final version still matches the scope the editor accepted.",
      },
      {
        heading: "Make post-publication checking part of the handoff",
        body: "Tell the editor who should receive the live URL and who can approve any urgent correction. Keep the accepted version and date so you can compare the published page with the handoff. A completion notice should lead to an inspection of the article, links, images and disclosure. Record any differences precisely and keep a correction request open until it has been checked on the live page.",
        code: "Approved manuscript and version: [...]\nSource log: [...]\nImage files / permissions / captions: [...]\nLink destination and proposed anchor: [...]\nCommercial disclosure and attributes: [...]\nFinal approver: [...]\nLive URL recipient and checker: [...]",
      },
    ],
    faq: [
      [
        "Should production notes appear in the article?",
        "Only if they are intended for readers. Keep private comments and commercial instructions in the handoff note.",
      ],
      [
        "Who approves a correction after publication?",
        "Assign that responsibility before handoff and preserve the approved manuscript for comparison.",
      ],
    ],
  },
  "a-referral-traffic-worksheet-for-publication-campaigns": {
    title: "Guest Post Referral Traffic Worksheet for Campaigns",
    description:
      "Measure guest post referrals with a defined window, campaign labels and useful actions. Keep delivery evidence separate from attribution assumptions.",
    sections: [
      {
        heading: "Choose the action before choosing the reporting column",
        body: "Decide what the reader should do after arriving: use a worksheet, read a detailed comparison, request a consultation or buy a relevant product. Ensure the destination makes that action possible and record how it will be measured. A page view is not equivalent to a qualified enquiry, and an enquiry is not a completed sale. Use separate columns so a larger count at the top of the funnel does not hide a lack of useful responses. Record any consent or measurement limitations that affect the observations.",
      },
      {
        heading: "Keep campaign labels consistent and permitted",
        body: "Where the publisher permits campaign parameters, use a stable naming convention and test the destination before publication. Save the exact link sent to the editor. Avoid personal details in parameter values because URLs can appear in logs and be shared. If the publisher removes parameters, preserve that fact in the record instead of assuming labelled attribution still works. Review the referral source and landing page as additional context, understanding that some visits may lose source information. Use the same reporting window across candidates when making a comparison.",
      },
      {
        heading: "Report a result without claiming more than the data shows",
        body: "An illustrative worksheet might record twelve tracked visits and one enquiry during a stated window. That describes an observation; it does not prove the placement's long-term conversion rate or establish that a later sale was caused solely by the article. Add the external cost and staff effort only when those amounts are known. Note other campaigns that reached the same audience during the window. The useful output is a decision about what to repeat, change or investigate next.",
        code: "Publication / live URL | Window | Campaign labels | Tracked referrals | Useful actions | Known cost | Tracking limits | Next action",
      },
    ],
    faq: [
      [
        "Should I report missing tracking as zero visits?",
        "No. Distinguish no observed visits from incomplete measurement.",
      ],
      [
        "Can I attribute every later sale to the article?",
        "Only report what your measurement supports and describe the attribution method and its limits.",
      ],
    ],
  },
  "a-backlink-report-quality-check-before-analysis": {
    title: "Backlink Report Quality Checks for Guest Post Campaigns",
    description:
      "Check backlink exports for duplicate rows, property scope, dates and live destinations. Build a usable placement record before drawing campaign conclusions.",
    sections: [
      {
        heading: "Identify the unit of each row before counting links",
        body: "An export can contain one row per linking page, per destination, per anchor or per observation. Record the tool, export date, property and filters before adding totals. Deduplicate only after deciding which unit answers your question. If you want to confirm placement delivery, count the agreed live articles rather than every row containing a link. If you want to inspect link destinations, preserve distinct destination URLs even when several appear on one article. Keep the original export so a later reviewer can reproduce your transformation.",
      },
      {
        heading: "Verify the rows that affect a commercial decision",
        body: "Open the relevant article pages and check the destination, anchor and relationship attributes directly. A tool may discover a page late or retain an older observation after a change. Keep the provider observation separate from your live inspection, with a date for each. If the URL redirects, record the final destination and whether it still serves the intended reader task. Do not infer publisher approval, sponsorship disclosure or article quality from a backlink row alone. Those require the accepted brief and the page itself.",
      },
      {
        heading: "Turn discrepancies into specific follow-up work",
        body: "Separate a missing live article, a changed link and a reporting delay. Contact the publisher about a delivery discrepancy using the agreed scope and the URL you inspected. Recheck a suspected tool delay with a defined next date rather than repeatedly treating the same stale row as a new issue. When presenting results, state the source, unit counted and verification method. Avoid translating a larger backlink count into an unsupported prediction of rankings or revenue.",
        code: "Source export / date: [...]\nProperty and filters: [...]\nRow unit and deduplication rule: [...]\nLive URLs inspected / date: [...]\nDiscrepancy type: [...]\nOwner and follow-up action: [...]",
      },
    ],
    faq: [
      [
        "Does a missing export row prove the placement is gone?",
        "No. Inspect the live URL and distinguish a delivery issue from a tool's discovery or reporting delay.",
      ],
      [
        "Should I combine totals from different tools?",
        "Keep them separate unless you have a defined deduplication method and explain the resulting unit.",
      ],
    ],
  },
};

const practicalNotes: Record<
  string,
  Array<{ heading: string; body: string }>
> = {
  "how-to-choose-a-guest-post-publication-for-your-audience": [
    {
      heading: "Compare the strongest two candidates on the same question",
      body: "Take the same article idea to the final two candidates and ask how each editor would place and review it. Preserve the proposed section, expected reader, production scope and quote in comparable columns. If one editor proposes a different angle, assess that angle as a distinct option rather than treating the two prices as equivalent. Ask which evidence would make your contribution useful to their readers and whether you can actually supply it. This turns a domain comparison into a concrete editorial choice. Do not let an impressive home page distract from a weak proposed section, or let a low fee compensate for an article your team cannot substantiate.",
    },
    {
      heading:
        "Keep a rejected candidate from reappearing without new evidence",
      body: "Record the requirement that failed and the date of the decision. A future colleague may otherwise rediscover the same domain and repeat the research because its score or price looks attractive. Avoid broad claims about the entire publication; explain that the specific opportunity did not meet your campaign's needs. If the editor later proposes a more relevant section or supplies useful audience evidence, reopen the record and assess the new proposal. A shortlist is a working decision tool, so its value comes from preserved reasoning rather than from how many publications it contains. Review the destination resource at the same time to ensure it continues the task promised by your article.",
    },
  ],
  "a-practical-guest-post-budget-worksheet": [
    {
      heading: "Track quote status as carefully as the amount",
      body: "Use a status such as requested, received, clarified or accepted beside each total. Record the date and the document or email containing the scope. This prevents an early estimate from silently becoming the approved budget when the editor later adds a production requirement. Keep the current accepted version easy to find and archive superseded versions with a reason for the change. If several people can approve spending, identify the responsible approver before work starts. A number without scope and status is not enough to guide the writer, purchaser or publication checker. Ask for clarification whenever a line item would materially change the decision.",
    },
    {
      heading:
        "Record noncash constraints without pretending they are supplier charges",
      body: "A subject specialist may have only a limited review window, or your team may need time to obtain image permission. Put those constraints beside the cash budget so the apparent affordability of a placement does not hide a delivery problem. If you assign an internal hourly cost for planning, label it as your own assumption and keep it separate from invoices. After the campaign, compare planned and actual effort using your own records. That produces a useful basis for future scheduling without inventing a standard production rate for every business. When the next quote arrives, check whether the same tasks and review responsibilities still apply before reusing the earlier estimate.",
    },
  ],
  "domain-rating-and-domain-authority-a-comparison-worksheet": [
    {
      heading: "Avoid a score threshold that replaces the buying question",
      body: "A minimum metric can make a catalogue easier to browse, but explain why you are applying it. If it excludes a highly relevant publication, inspect whether the filter is helping the actual campaign or merely making the spreadsheet look tidy. Keep score-based filtering separate from your reader-fit assessment and editorial review. Do not describe a provider score as Google's approval, a traffic measurement or a promise that a particular page will be indexed. When sharing the shortlist, include the definitions and sources so another person understands what the columns represent. Clear labels prevent a convenient research field from becoming an unsupported commercial claim.",
    },
    {
      heading: "Keep observations comparable when refreshing a shortlist",
      body: "When you revisit candidates, record the new observation date and source rather than overwriting every old value without context. A change in tool, property scope or reporting method can explain a difference that otherwise looks like growth or decline. Ask whether the new observation changes your decision about the article and audience. If it does not, avoid spending disproportionate effort explaining a small score movement. If it does, investigate the specific question and preserve the supporting report. A refresh should improve the current buying decision, not manufacture a story about the publication from a sequence of third-party estimates collected under different conditions.",
    },
  ],
  "how-to-read-a-publication-traffic-estimate": [
    {
      heading: "Write an evidence request the publisher can answer",
      body: "Name the exact property and period you need, then explain the decision it will support. For example, ask for readership geography for the proposed section if your business only serves one market. A scoped extract may answer the question without access to an entire account. Do not request credentials or personal visitor information. If the publisher supplies a screenshot, preserve its visible definitions and ask about any cropped context that affects interpretation. Keep the publisher's statement separate from your own inference. The goal is enough evidence to assess this opportunity, not a claim that you have independently verified every visitor on the website.",
    },
    {
      heading: "Avoid converting whole-site activity into a placement forecast",
      body: "A domain-wide estimate does not tell you how prominently a new article will be displayed, which readers will see it or how many will click your link. Ask about the actual article format and distribution scope if those are part of the commercial offer. Do not invent a click rate and multiply it by the site's audience to report expected visits as if they were evidence. If you use an internal scenario for planning, label every assumed input and keep it separate from observed results. After publication, use your own scoped referral measurements to learn what happened, with the tracking limits visible.",
    },
  ],
  "what-to-confirm-in-a-guest-post-placement-brief": [
    {
      heading: "Identify who has authority to approve the final version",
      body: "A buyer, writer, subject specialist, intermediary and editor can all be involved, but their responsibilities differ. Name who approves factual claims, who accepts commercial changes and who gives final editorial approval. Decide how conflicting comments will be resolved before the writer receives them. Give the production team one current brief and mark older versions as superseded. If approval arrives through a phone call, summarize the accepted points in writing and ask the relevant person to confirm them. This creates a usable record without pretending that an informal exchange answered questions nobody actually discussed. A clear approver also makes later correction requests easier to route.",
    },
    {
      heading: "Keep requested timing separate from agreed timing",
      body: "Explain when you would like the article published and ask the editor which production steps must happen first. Record any confirmed schedule with its dependencies, such as receipt of source material or completion of a review. Do not infer a guaranteed publication date from a generic catalogue turnaround. If your campaign has a fixed event date, discuss that constraint before accepting the quote. Decide what happens if the article cannot be approved in time and preserve the applicable commercial terms. When a scope change delays the process, update the schedule and inform the person responsible for the campaign rather than leaving the original date in the brief.",
    },
  ],
  "paid-link-disclosure-questions-to-ask-before-placement": [
    {
      heading: "Preserve the implementation answer with the actual offer",
      body: "Record the publication, section, quoted format and the editor's response about commercial disclosure and link handling. A general answer about a provider's network may not establish the implementation on the publication you selected. If the provider changes the destination publication, ask the questions again. Keep the response with the version of the brief the writer uses so the article's wording does not imply independence that the commercial arrangement does not support. When the final manuscript is approved, check that its references and destination still match the agreed purpose. An accurate production record helps you inspect delivery without relying on a marketing label such as premium placement.",
    },
    {
      heading: "Discuss discrepancies without inventing a search consequence",
      body: "If the link or disclosure differs from the agreement, identify the exact page element and ask for the agreed correction. Explain what you observed and when. Avoid claiming a particular ranking loss, penalty or traffic effect unless you have appropriate evidence for that separate conclusion. Save the response and recheck the live page after a reported change. If the editor cannot supply the agreed format, use the actual commercial terms to discuss the next step. Do not solve a delivery disagreement by asking the publication to hide sponsorship or guarantee search influence. Keep the issue focused on the transparent arrangement you agreed to buy.",
    },
  ],
  "how-to-compare-publication-language-and-geography": [
    {
      heading: "Give a translator or local reviewer a substantive brief",
      body: "Explain the reader's market, familiarity with the subject and the practical task the article supports. Ask the reviewer to check terminology, examples, units and service availability as well as grammar. A technically correct translation can still recommend a process that readers cannot use. Keep any local factual claim attached to a current source and avoid adding regional statistics without evidence. If the publication suggests an adaptation, confirm whether it changes the article's scope or production cost. This gives the editor a useful local contribution rather than a generic article whose place names have been replaced to match a target market.",
    },
    {
      heading: "Review the destination for the same language and market",
      body: "Open the page readers will reach and check whether its language, currency, availability and next step fit the audience. If the article is in one language and the destination is in another, make that transition clear and decide whether it is still useful. A relevant publication cannot repair a landing page that excludes its readers. Record any geographic or language restriction in your campaign brief and share it with the writer. After publication, distinguish useful responses from enquiries you cannot serve. That makes the next decision more informative than treating every visit from the publication as an equally relevant opportunity.",
    },
  ],
  "an-editorial-review-checklist-for-a-publication-shortlist": [
    {
      heading: "Ask a second reviewer to challenge one important assumption",
      body: "Give the reviewer the proposed article, section URL, sample pages and your decision note. Ask them to inspect the assumption most likely to change the purchase, such as whether the section serves the intended reader or whether the quoted scope includes necessary production work. A second review should produce a decision or an answerable question. Do not turn the existence of another reader into a peer-reviewed badge or a public claim of certification. Preserve any disagreement and the evidence that resolved it. If the uncertainty remains material, pause the quote rather than hiding it behind an averaged quality score.",
    },
    {
      heading: "Keep the review current when the opportunity changes",
      body: "Revisit the relevant checks if the provider proposes another publication, section or article format. An earlier approval applies to the opportunity you inspected, not automatically to every alternative in the same price band. Record the changed field and the new evidence. After publication, compare the delivered article with the accepted brief and use the result to improve future reviews. A discrepancy may reveal a question your checklist failed to ask, such as who controls image rights or final edits. Add that specific lesson to the process instead of padding the checklist with generic statements that do not change a decision.",
    },
  ],
  "placement-only-versus-article-writing-packages": [
    {
      heading: "Review a writing sample for the task you need",
      body: "Ask for a relevant sample where appropriate and assess whether it explains a comparable subject clearly. Do not assume that a polished general article demonstrates the ability to handle a technical or regulated topic. Decide who supplies specialist knowledge and who checks factual accuracy. If the writer needs access to your product or process, arrange a safe, scoped way to provide the necessary material without sharing credentials in the brief. A sample helps assess style and explanation; it does not establish that the writer has qualifications or first-hand experience that have not been supplied and verified.",
    },
    {
      heading: "Calculate the cost of a production change before approving it",
      body: "A longer manuscript, different audience or new evidence requirement can change the work substantially. Ask whether the request falls within the accepted revision scope and record any new charge before the work starts. Keep a clear distinction between correcting an error and changing the original assignment. If you supply your own draft, ask whether the publisher will edit it and whether those edits need your approval. Compare the final accepted production scope with the placement quote so neither task is assumed to be included twice or omitted entirely. This makes the package choice concrete and gives the team a clear handoff.",
    },
  ],
  "what-to-record-after-a-placement-is-published": [
    {
      heading: "Make a correction request easy to act on",
      body: "Provide the live URL, the location of the issue, what appears now and what the accepted brief specified. Attach the relevant approved wording or destination rather than asking for a vague improvement. Name the person who can confirm the correction and keep the request status open until the live page has been inspected again. If the publication proposes a different solution, assess it against the reader task and commercial agreement. Do not treat a delivery problem as proof of a wider search consequence. The record should explain what was wrong, what was agreed and what was actually changed.",
    },
    {
      heading: "Use the record to improve the next brief",
      body: "After delivery closes, identify which production questions caused avoidable delays or revisions. Perhaps the image format was unclear, the destination changed late or the subject reviewer was unavailable. Add the specific lesson to your next brief and assign an owner. Keep that operational lesson separate from performance observations such as tracked referrals or qualified enquiries. A campaign can reveal a better handoff process even when its audience response is limited. Preserve the actual costs and effort if known, but do not turn one experience into a claim about the typical results or standards of every publication in the same category.",
    },
  ],
  "how-to-write-a-guest-post-brief-an-editor-can-use": [
    {
      heading: "Choose an outline that produces a usable result",
      body: "For a process article, include prerequisites, ordered actions, a worked example and situations where the process does not fit. For a comparison, define the reader's decision and use criteria that reveal meaningful tradeoffs. Avoid prescribing headings merely to repeat the target phrase. Ask the editor whether the planned depth suits the section and which existing articles the contribution should complement. The outline should show how the reader will finish the task, not simply list broad concepts. If you cannot provide a useful example or supporting material, narrow the topic until you can substantiate the explanation.",
    },
    {
      heading: "Specify the destination and commercial boundaries in context",
      body: "Include the proposed destination URL and a sentence showing why a reader would use it. State whether the article is part of a paid arrangement and ask how disclosure and link qualification will be handled. Do not demand an isolated keyword anchor that makes the sentence misleading or unnatural. Check the destination before sending the brief and identify who maintains it if the resource changes. Keep author details factual and provide the approved biography rather than inventing credentials for the byline. These choices give the editor a contribution they can evaluate without needing to infer the business relationship or the purpose of the link.",
    },
  ],
  "an-editorial-handoff-checklist-before-publication": [
    {
      heading: "Check files and permissions as separate handoff tasks",
      body: "A file being present does not establish permission to publish it. Keep the source, license or written permission for each image and explain required attribution. Check that screenshots do not reveal personal information or private account details. Provide captions and descriptive alt text where the image carries meaning. If an asset is decorative, tell the editor its purpose rather than forcing a keyword description. Confirm that the editor can open the supplied format. These practical checks reduce the chance that a useful article is delayed or published with an image whose origin and intended use are unclear.",
    },
    {
      heading: "Set a clear boundary for later changes",
      body: "Tell the editor which changes can be handled as routine copy editing and which factual or commercial changes need approval. Name a contact who can respond during the publication window. If the destination or product details change after handoff, send an explicit update and identify the affected version. Preserve the accepted manuscript so the live-page checker has a reliable comparison. After delivery, record the lesson from any discrepancy and update the next handoff checklist with that specific issue. A checklist should make work easier to complete and verify; it should not imply flawless publication or independently reviewed credentials that the process does not establish.",
    },
  ],
  "a-referral-traffic-worksheet-for-publication-campaigns": [
    {
      heading: "Test the measurement path before the article goes live",
      body: "Open the intended destination with the agreed campaign link and confirm that the page works and the relevant event can be observed in your measurement setup. Follow your organization's privacy and consent requirements. Keep the campaign labels consistent and avoid placing personal information in a URL. If the publisher changes or removes the parameters, record that change and reassess what can be measured. Do not assume that a link being clickable means every visit will retain attribution. A short prepublication check can identify a broken destination or an event that was never configured, both of which would weaken the later report.",
    },
    {
      heading: "Keep raw observations available beside the interpretation",
      body: "Save the source report, period, filters and definitions used for the worksheet. Explain whether a count refers to sessions, users or a particular action. If you compare campaigns, use comparable windows and avoid mixing a newly published article with one that has been live much longer. Record other marketing activity and destination changes that could affect the response. A conclusion such as revise the landing resource should point to an observed issue, not an assumed failure of the publisher's audience. Keep small or incomplete samples visible so the report supports a proportionate next decision instead of presenting a precise forecast the data cannot justify.",
    },
  ],
  "a-backlink-report-quality-check-before-analysis": [
    {
      heading: "Keep the import and cleaning method reproducible",
      body: "Save an untouched source export and describe how you removed duplicates or excluded rows. Use explicit fields for source page, final destination, anchor, relationship and observation date. If one page contains several relevant links, decide whether your report counts pages or links before calculating a total. Do not silently merge different units across tools. Give a colleague enough detail to repeat the transformation and reach the same count. A reproducible report helps resolve disagreements about delivery because it shows which observations came from a tool and which came from a direct inspection of the published page.",
    },
    {
      heading: "Prioritize discrepancies by their practical effect",
      body: "A missing article, a changed destination and a stale provider observation need different actions. Inspect the live page before asking the publisher to fix a reporting delay that may be outside its control. For a delivery issue, reference the accepted brief and identify the requested correction precisely. For a measurement issue, preserve the export date and plan the next check. Avoid treating every newly discovered row as a newly acquired placement or every missing row as a lost commercial deliverable. The report should help your team resolve real questions while keeping tool coverage, observation timing and the actual agreement distinct.",
    },
  ],
};

for (const [slug, sections] of Object.entries(practicalNotes))
  buyerExpansions[slug].sections.push(...sections);
