import type { BuyerGuide } from "./buyer-guides";

// Commissioned October 18, 2026. No historical author, reviewer or publication
// date is inferred from the older buyer guides. Examples are editorial scenarios.
const paid: [string, string] = [
  "Google: qualifying paid links",
  "https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links",
];
const spam: [string, string] = [
  "Google: link-spam policies",
  "https://developers.google.com/search/docs/essentials/spam-policies#link-spam",
];
const helpful: [string, string] = [
  "Google: helpful, reliable content",
  "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
];
const analytics: [string, string] = [
  "Google Analytics: campaign URL parameters",
  "https://support.google.com/analytics/answer/10917952",
];
type Commission = Omit<
  BuyerGuide,
  "approved" | "updatedAt" | "sourcesCheckedAt"
>;
const guide = (content: Commission): BuyerGuide => ({
  ...content,
  approved: true,
  updatedAt: "2026-10-18",
  sourcesCheckedAt: "2026-10-18",
});

export const guestPostingGuides: BuyerGuide[] = [
  guide({
    slug: "guest-posting-for-beginners",
    title: "Guest posting for beginners",
    description:
      "Learn how guest posting works, choose a suitable publisher and prepare your first article with a simple workflow, example and publishing checklist.",
    answer:
      "Guest posting means contributing an article to another publication for its readers. Start with a useful subject, choose a relevant publisher, agree the editorial and commercial terms, then write and review the article. Paid placements need appropriate link qualification. Measure actual reader responses rather than assuming publication will improve your rankings.",
    sources: [paid, spam, helpful],
    questions: [
      {
        title: "What happens in a guest post placement?",
        body: "A contributor proposes a topic and the publisher decides whether it suits its audience. Some publications accept unpaid contributions; others sell sponsored placements. Writing may be supplied by you or separately arranged. Agreement on a topic is not approval of the finished article, and a catalogue listing does not establish acceptance, availability or a publication date.",
      },
      {
        title: "Choose one reader problem for your first article",
        body: "Write down who should read the piece and what they should be able to do afterward. For example, a fictional appointment-software company could explain how a small salon organizes cancellations. That gives an editor a concrete reader benefit. A broad article about why the company is excellent gives the editor little to work with.",
      },
      {
        title: "Separate an editorial contribution from a paid link",
        body: "A useful article can still be sponsored. If money, goods or another benefit are exchanged for placement, discuss disclosure and paid-link qualification. Google recommends sponsored for paid links and also accepts nofollow. A commercial offer promising ranking credit is a reason to reconsider. Payment does not purchase editorial credibility or predictable search performance.",
      },
      {
        title: "What should your first placement record contain?",
        body: "Keep the publisher, contact, proposed topic, sample articles, current quote, writing responsibility and approval terms together. After publication, add the actual URL, publication date and referral observations. This small record is more useful than a list of domain scores because it explains both the decision and what happened afterward.",
      },
    ],
    steps: [
      "Define the reader and one useful outcome.",
      "Find a relevant publication and read its current submission rules.",
      "Send a specific proposal, then agree scope, cost, disclosure and link attributes.",
      "Write the agreed article with evidence and image permissions, and complete editorial revisions.",
      "Check the published page and record observed visits or enquiries over a stated period.",
    ],
    checklist: [
      "Audience and proposed subject fit",
      "Writing and placement charges are separate and understood",
      "Approval and publication responsibilities are recorded",
      "Paid links and reader disclosure are agreed",
    ],
    faq: [
      [
        "Do I need a paid placement to start?",
        "No. Check the publisher's current contribution policy. An unpaid editorial submission can still require substantial research and editing.",
      ],
      [
        "Will a guest post guarantee higher rankings?",
        "No. Publication does not guarantee indexing, rankings, referrals or sales. Set a reader or business goal you can actually observe.",
      ],
    ],
    related: [
      [
        "Find potential publishers",
        "/guides/find-guest-posting-opportunities/",
      ],
      ["Prepare an outreach email", "/guides/guest-post-outreach-templates/"],
      ["Understand placement costs", "/guides/guest-post-cost/"],
    ],
  }),
  guide({
    slug: "find-guest-posting-opportunities",
    title: "How to find guest posting opportunities",
    description:
      "Build a guest posting prospect list using audience research, editorial searches and niche directories, then check that each publisher accepts proposals.",
    answer:
      "Find guest posting opportunities by identifying publications your intended readers already use, searching for relevant contributor guidance and exploring niche directories. Record why each prospect fits and verify that submissions are currently accepted. Discovery creates a candidate list; editorial review, audience checks and confirmed terms determine which opportunities deserve further work.",
    sources: [helpful, spam],
    questions: [
      {
        title: "Start with an audience map",
        body: "List the reader's role, subject interests, language and location. Turn those interests into publication types: trade journals, specialist tutorials, association blogs or consumer magazines. A fictional invoicing tool might search bookkeeping publications and small-business operations sites separately. This prevents a large generic business list from hiding the specific audience you need.",
      },
      {
        title: "Use searches to discover editorial policies",
        body: "Try a subject followed by contributor guidelines, submit an article, or write for us. Search for articles by practitioners you already read and inspect the publications hosting them. Treat a search result as a lead only: open the current guidance, check recent articles and verify the contact on the publisher's own site. An old policy may no longer apply.",
      },
      {
        title: "Use directories without mistaking listings for acceptance",
        body: "Name Retailer's niche directories can help you compare supplied categories, metrics and placement prices. Save the relevant publication and a reason for considering it. Neither a category nor an authority score proves current editorial availability. Ask the publisher whether your subject, contribution format and intended resource link are acceptable before writing the full article.",
      },
      {
        title: "Deduplicate before contacting editors",
        body: "Record one row per publication, with the relevant section and official contact. Several domains may share an editorial team; avoid sending the same request repeatedly. Mark an unanswered question explicitly, and stop pursuing sites without a plausible audience fit. Detailed publisher evaluation belongs after this initial discovery pass, using the separate vetting guide.",
      },
    ],
    table: {
      columns: ["Discovery route", "Useful evidence", "Next check"],
      rows: [
        [
          "Editorial search",
          "Current contribution instructions",
          "Subject and contact still valid",
        ],
        [
          "Relevant author bylines",
          "Articles written for your audience",
          "Independent editorial contact",
        ],
        [
          "Niche directory",
          "Category and supplied price",
          "Audience, scope and availability",
        ],
      ],
    },
    steps: [
      "Write three audience-specific subject searches.",
      "Collect a manageable list with official contact URLs and recent sample articles.",
      "Remove duplicates and unrelated publications.",
      "Evaluate the remaining prospects, then tailor each proposal.",
    ],
    faq: [
      [
        "Does a write-for-us page mean my article will be accepted?",
        "No. It describes an application route. The editor still decides whether the topic, evidence and manuscript meet the publication's requirements.",
      ],
      [
        "Should I contact every directory listing?",
        "No. Narrow the list by actual reader fit and current submission terms first. A small researched list makes personalization easier.",
      ],
    ],
    related: [
      ["Browse niche publisher directories", "/guest-posting-sites/"],
      ["Choose your shortlist", "/how-to-buy-links/"],
      ["Evaluate each shortlisted site", "/guides/vet-a-guest-post-site/"],
    ],
  }),
  guide({
    slug: "guest-post-outreach-templates",
    title: "Guest post outreach email templates",
    description:
      "Adapt three guest post outreach email templates for an editorial pitch, a sponsored-placement enquiry and a polite follow-up, with a personalization checklist.",
    answer:
      "A guest post outreach email should identify the relevant editor, explain a specific article idea and show why that publication's readers would benefit. Include credible experience or evidence you can supply and ask for the next editorial step. Use templates as a starting point, with different wording for editorial contributions and sponsored enquiries.",
    sources: [helpful, paid],
    questions: [
      {
        title: "Personalize the reason for contacting this editor",
        body: "Read a recent relevant article and explain what your proposed piece would add. Mention a missing practical detail or a different audience problem, rather than offering generic praise. Replace every bracketed field below. The examples are fictional messages for you to adapt; they do not represent a Name Retailer outreach service or an acceptance guarantee.",
      },
      {
        title: "Give the editor something concrete to evaluate",
        body: "Propose one title, two or three points and the evidence you can provide. Explain your experience honestly; an invented client result weakens the pitch. Follow submission rules about links and attachments. If your proposal is sponsored, identify the commercial relationship early and ask about the publisher's disclosure and link-qualification requirements.",
      },
      {
        title: "Follow up with restraint",
        body: "Keep any follow-up in the original thread, include the proposal context and leave the editor an easy way to decline. One short reminder after a reasonable interval is an editorial suggestion, not a universal timing rule. Follow the publisher's stated response window and stop if they decline or request no further contact.",
      },
    ],
    templates: [
      {
        title: "Template: an editorial contribution",
        text: "Subject: Article idea for [section]: [specific reader problem]\n\nHello [editor name],\n\nYour article on [specific subject] explains [useful point]. I would like to propose [working title] for [reader group], covering:\n1. [practical step]\n2. [original example or evidence]\n3. [reader takeaway]\n\nI work on [relevant, truthful experience] and can provide [evidence or sample]. Does this fit your current contribution guidelines?\n\nThank you,\n[name and relevant affiliation]",
      },
      {
        title: "Template: a sponsored-placement enquiry",
        text: "Subject: Sponsored article enquiry for [publication section]\n\nHello [editor name],\n\nI represent [brand] and am researching a paid article about [reader problem]. The proposed piece would help [audience] by [useful outcome].\n\nDo you currently consider this topic? Please share your editorial requirements, placement and writing charges, reader-facing disclosure, paid-link attributes and approval process.\n\nThank you,\n[name and affiliation]",
      },
      {
        title: "Template: a brief follow-up",
        text: "Hello [editor name],\n\nFollowing up on my proposal below about [topic]. I can adjust the angle to [specific alternative] if that better serves your readers. If you are not considering contributions, I will close the enquiry.\n\nThank you,\n[name]",
      },
    ],
    checklist: [
      "Correct editor and publication",
      "One relevant idea with an original contribution",
      "Truthful affiliation and evidence",
      "Commercial relationship disclosed where applicable",
      "Publisher's submission and contact preferences respected",
    ],
    faq: [
      [
        "Should I request a dofollow link in the opening email?",
        "Discuss editorial relevance and commercial terms honestly. Paid links should be appropriately qualified; do not make passing ranking credit a condition of payment.",
      ],
      [
        "Can I reuse the same email?",
        "Reuse the structure, then rewrite the reader benefit, topic and evidence for each publication. A publisher name swap alone is insufficient.",
      ],
    ],
    related: [
      [
        "Find suitable editors and publications",
        "/guides/find-guest-posting-opportunities/",
      ],
      ["Prepare the article", "/guides/write-a-guest-post/"],
      [
        "Understand submission guidelines",
        "/guides/guest-post-submission-guidelines/",
      ],
    ],
  }),
  guide({
    slug: "write-a-guest-post",
    title: "How to write a guest post that fits the publisher",
    description:
      "Turn an accepted guest post idea into a useful article with an outline, original examples, source checks and a practical editorial handoff.",
    answer:
      "Write a guest post by agreeing the audience and angle with the editor, building an outline around one reader problem and supporting each important claim with evidence. Use original examples, follow the publisher's format and review the manuscript before submission. Acceptance remains the editor's decision, even when you follow every instruction.",
    sources: [helpful, paid],
    questions: [
      {
        title: "Agree the brief before writing",
        body: "Confirm the reader, proposed title, expected depth, length guidance, source requirements and submission format. Ask whether the editor wants an outline first. A request for a beginner explanation and a request for an expert tutorial need different evidence and vocabulary. Also settle image permissions, author biography and commercial disclosure before preparing the final manuscript.",
      },
      {
        title: "Build an outline that produces a usable result",
        body: "For a fictional scheduling article, start with the cancellation problem, show a simple booking record, explain the reminder workflow and finish with exceptions such as rescheduling. Each section should move the reader toward a decision or action. Remove sections that only repeat the introduction or advertise your product without helping solve the problem.",
      },
      {
        title: "Add evidence the editor can inspect",
        body: "Use original screenshots you have permission to publish, a reproducible walkthrough or a clearly labeled hypothetical example. Link factual claims to appropriate primary sources and record when time-sensitive information was checked. Distinguish what you observed from your interpretation. Do not present invented numbers as customer results or turn a single example into a general market claim.",
      },
      {
        title: "Edit links and promotional language",
        body: "A resource link should help the reader complete the task described in the surrounding text. Avoid repeating commercial anchor phrases or adding links that the article does not need. Agree any paid-link attributes with the editor. Remove unsupported superlatives and claims about guaranteed traffic, rankings or acceptance; none follows from writing an article.",
      },
      {
        title: "Make the editorial handoff easy",
        body: "Send the agreed file type, an accessible image folder, source links and a short note identifying any unresolved question. Check names, calculations, headings and link destinations before sending. During revisions, answer the editor's specific concern rather than replacing the whole piece without explanation. Keep the approved version so you can compare it with the published page.",
      },
    ],
    steps: [
      "Confirm a one-sentence brief and outline.",
      "Write the useful answer first, followed by the steps needed to apply it.",
      "Add an original example and inspect every factual source.",
      "Check the publisher's formatting, attribution, links and image requirements.",
      "Submit through the official channel and respond to requested revisions.",
    ],
    faq: [
      [
        "Is there an ideal guest post word count?",
        "Use the publisher's requirements and the space needed to answer the reader's question. Length alone does not establish quality or acceptance.",
      ],
      [
        "Can I submit the same article elsewhere?",
        "Check exclusivity, reuse and rights with the publisher first. Do not assume that acceptance allows simultaneous submission or republication.",
      ],
    ],
    related: [
      [
        "Review publisher expectations",
        "/guides/guest-post-submission-guidelines/",
      ],
      ["Run the publishing checklist", "/guides/guest-posting-checklist/"],
      ["Avoid common mistakes", "/guides/guest-posting-mistakes/"],
    ],
  }),
  guide({
    slug: "guest-post-submission-guidelines",
    title: "Guest post submission guidelines explained",
    description:
      "Check guest post submission rules for audience fit, evidence, images, author details, revisions and paid-link disclosure before sending an article.",
    answer:
      "Guest post submission guidelines describe what a publisher will consider and how to send it. Check the accepted topics, audience, originality requirements, format, evidence, links and approval process before writing. If instructions are missing or conflict with a commercial quote, ask the editor for clarification and record the agreed requirements together.",
    sources: [helpful, paid],
    questions: [
      {
        title: "Which rules should you copy into the brief?",
        body: "Record the official guideline URL and date checked, topic restrictions, audience level, length guidance and required submission channel. Include whether the editor wants a pitch, outline or complete manuscript. These are publisher-specific requirements; a marketplace listing or another publication's rules cannot substitute for the instructions applying to your intended article.",
      },
      {
        title: "What counts as useful evidence?",
        body: "An editor may request primary references, original experience, named contributors or a specialist review. Ask what standard applies to the proposed subject rather than assuming a general business article and a health article need the same checks. Screenshots and customer examples also need permission. Remove personal or confidential information before supplying supporting material.",
      },
      {
        title: "Clarify links, rights and revision responsibilities",
        body: "Ask which contextual links are acceptable, how commercial relationships are disclosed and how paid links are qualified. Separately confirm image licenses, reuse rights, exclusivity and whether you can approve substantial factual changes. Agree how revisions are handled and what happens if the subject is declined. No universal guest-post guideline settles those questions for every publisher.",
      },
      {
        title: "Example: resolving conflicting instructions",
        body: "Imagine a publisher's contribution page prohibits product comparisons while a placement quote appears to allow them. Send a short outline and ask the editorial contact to resolve the conflict in writing. Do not treat a price quote as an exception to editorial policy. Proceed only with an angle the responsible editor confirms they will consider.",
      },
    ],
    checklist: [
      "Official instructions and contact verified",
      "Topic, length and format confirmed",
      "Source and specialist-review requirements understood",
      "Author biography and image permissions supplied",
      "Reuse, revisions, sponsorship and link attributes agreed",
    ],
    faq: [
      [
        "Does meeting the guidelines guarantee acceptance?",
        "No. Guidelines establish submission requirements; the editor still evaluates quality, originality, timing and fit.",
      ],
      [
        "What if a publisher has no published guidelines?",
        "Ask for the requirements in writing before writing or paying. Keep unanswered questions visible in the brief.",
      ],
    ],
    related: [
      ["Write a useful article", "/guides/write-a-guest-post/"],
      ["Qualify paid links", "/guides/paid-guest-posts-google-link-policies/"],
      ["Check before publication", "/guides/guest-posting-checklist/"],
    ],
  }),
  guide({
    slug: "guest-posting-strategy",
    title: "How to create a guest posting strategy",
    description:
      "Build a guest posting strategy around an audience, useful content, publisher selection, a complete budget and measurable reader or business outcomes.",
    answer:
      "A guest posting strategy connects an audience and business goal with useful articles, relevant publishers, a realistic budget and a measurement plan. Decide what success means before choosing placements. Start with a manageable test, document editorial and paid-link requirements, and use observed outcomes to decide whether to continue, change approach or stop.",
    sources: [paid, spam, analytics],
    questions: [
      {
        title: "Choose one primary outcome",
        body: "Pick an outcome the business can recognize: qualified enquiries, relevant product trials or useful readership for a specialist resource. Record secondary signals separately, such as referral sessions and editorial invitations. A ranking change after publication is not proof that a placement caused it, and counting links alone does not establish a commercial result.",
      },
      {
        title: "Match a topic and destination to the reader's stage",
        body: "A beginner may need a neutral process guide, while an experienced buyer may need a detailed implementation checklist. Send visitors to a page that continues the article's task and works on mobile. A fictional workflow tool could contribute an operations tutorial and link a relevant template, rather than directing every reader to a generic sales page.",
      },
      {
        title: "Plan capacity as well as spend",
        body: "Estimate research, writing, review and coordination time alongside confirmed placement charges. Use the existing budget worksheet to distinguish known quotes from unknown costs. Plan fewer articles if subject expertise or editorial review is scarce. A publishing calendar filled with unreviewed pieces is not evidence that the strategy is executable.",
      },
      {
        title: "Define a test and a stop decision",
        body: "Choose a reporting window appropriate to the business, record publication dates and avoid comparing a week-old article with a long-running placement. Track an agreed action and capture total cost. If readers arrive but never take that action, investigate audience fit and destination usefulness before purchasing more of the same format.",
      },
    ],
    table: {
      columns: ["Decision", "Example planning input", "Evidence to keep"],
      rows: [
        [
          "Audience",
          "Operations managers at small firms",
          "Customer questions and publication samples",
        ],
        [
          "Article",
          "A practical handoff checklist",
          "Outline and evidence permissions",
        ],
        [
          "Outcome",
          "Qualified template enquiries",
          "Defined event and reporting window",
        ],
        [
          "Budget",
          "Placement plus production",
          "Current quotes and internal time",
        ],
      ],
    },
    steps: [
      "Set the reader, goal and useful destination.",
      "Discover and evaluate relevant publishers.",
      "Confirm complete costs and editorial capacity.",
      "Agree content, disclosure and tracking before publication.",
      "Review like-for-like outcomes and record the next decision.",
    ],
    faq: [
      [
        "How many guest posts should a strategy include?",
        "Use the budget, content quality and review capacity you actually have. There is no universal placement count that guarantees success.",
      ],
      [
        "Should I optimize for authority scores?",
        "Treat supplied scores as context after audience and editorial fit. They cannot replace a business objective or measurement plan.",
      ],
    ],
    related: [
      [
        "Build the placement budget",
        "/blog/a-practical-guest-post-budget-worksheet/",
      ],
      ["Measure observed results", "/guides/measure-guest-posting-results/"],
      ["Compare publisher opportunities", "/guest-posting-sites/"],
    ],
  }),
  guide({
    slug: "guest-posting-vs-content-marketing",
    title: "Guest posting vs content marketing",
    description:
      "Compare guest posting with a wider content marketing program by editorial control, distribution, resource needs and measurement, with an example plan.",
    answer:
      "Guest posting is one way to distribute useful content through another publisher; content marketing is a broader program that can include your own guides, email, video and contributions elsewhere. Choose based on the reader's task, editorial control and distribution needs. A guest article works best when it connects to useful material you can maintain.",
    sources: [helpful, paid],
    questions: [
      {
        title: "Compare a tactic with the wider program",
        body: "A guest article is a specific editorial deliverable on someone else's publication. A content program decides which audience questions to answer and how to distribute and update those answers. The two can work together: an external article can introduce a problem, while an owned guide supplies the detailed tool or process readers need next.",
      },
      {
        title: "Who controls the article after publication?",
        body: "On your own site you can usually schedule revisions and measure engagement directly. An external publisher controls its review, placement, updates and page availability according to the agreement. Confirm rights and future corrections rather than assuming you can edit the article whenever your product changes. Keep an approved copy and the editorial contact.",
      },
      {
        title: "Example: a connected content plan",
        body: "A fictional stock-management company creates an owned reorder worksheet, then proposes a neutral inventory tutorial to a retailer publication. The external article teaches the method; a relevant worksheet link lets interested readers apply it. The company measures actual worksheet use and enquiries. This is a planning example, not a claim that either channel will produce demand.",
      },
      {
        title: "Decide where the next hour should go",
        body: "If your destination resource is incomplete or difficult to use, improve it before seeking distribution. If it already solves a clear task but reaches few relevant readers, evaluate suitable editorial partnerships. Include maintenance, outreach and production effort in the comparison; a sponsored placement fee alone is not the full cost of the content program.",
      },
    ],
    table: {
      columns: ["Dimension", "Guest article", "Owned content program"],
      rows: [
        [
          "Publication control",
          "Publisher decides acceptance and edits",
          "Your team controls its site and calendar",
        ],
        [
          "Distribution",
          "Access depends on publisher visibility",
          "Requires your own distribution plan",
        ],
        [
          "Measurement",
          "Referral data and agreed publisher reports",
          "Site analytics and business records",
        ],
        [
          "Maintenance",
          "Updates require publisher cooperation",
          "Your team schedules corrections",
        ],
      ],
    },
    faq: [
      [
        "Can guest posting replace an owned content strategy?",
        "It may contribute distribution, but it does not automatically supply a useful destination, follow-up process or maintained resource library.",
      ],
      [
        "Is guest posting always paid?",
        "No. Publications may accept unpaid contributions, offer sponsored placements or use both models. Confirm the applicable editorial and commercial terms.",
      ],
    ],
    related: [
      ["Create a guest posting strategy", "/guides/guest-posting-strategy/"],
      ["Compare digital PR", "/guides/guest-posting-vs-digital-pr/"],
      ["Measure reader actions", "/guides/measure-guest-posting-results/"],
    ],
  }),
  guide({
    slug: "guest-posting-vs-digital-pr",
    title: "Guest posting vs digital PR",
    description:
      "Compare a contributed guest article with digital PR outreach by story, editorial control, costs and measurement before choosing an approach.",
    answer:
      "Guest posting usually proposes a contributed article for a publication, while digital PR seeks coverage of a story, research or expert perspective that journalists choose how to report. Neither guarantees acceptance or links. Compare the strength of your evidence, editorial control, production effort and business objective before deciding which approach fits the opportunity.",
    sources: [helpful, spam, paid],
    questions: [
      {
        title: "What are you offering the editor?",
        body: "For a contributed article, you usually offer a complete explanation, practical process or specialist viewpoint. For a PR pitch, you offer something the journalist may turn into their own report: documented research, a timely development or an available expert. These are working distinctions; individual publications can combine formats, so confirm what the editor actually wants.",
      },
      {
        title: "Editorial control differs by agreement",
        body: "A guest contributor may prepare a manuscript and respond to revisions, while a journalist may use only part of an interview or decide not to link your site. Earned coverage is an editorial decision. If a fee buys a sponsored placement, treat it as commercial content and confirm disclosure and link qualification rather than labeling it independent earned coverage.",
      },
      {
        title: "Example: choose the strongest asset",
        body: "A fictional logistics business has an original delivery-delay dataset with a documented sample and limitations. That may support a journalist's story if it adds a useful finding. If the business instead has a well-tested warehouse checklist, a practical contributed article may be more appropriate. Neither example establishes likely acceptance, coverage volume or search results.",
      },
      {
        title: "Budget for the evidence and coordination",
        body: "Separate research, expert time, writing, fact checking and any sponsored fee. Ask a provider what deliverables are under its control and which depend on editorial decisions. Measure useful coverage, relevant visits and business actions with their limitations. Name Retailer's catalogue supports publisher research and enquiries; it does not establish that a managed digital PR service is offered.",
      },
    ],
    table: {
      columns: ["Question", "Guest posting", "Digital PR"],
      rows: [
        [
          "Primary proposal",
          "Contributed article",
          "Reportable story or expert source",
        ],
        [
          "Who writes?",
          "Contributor or agreed writer",
          "Often the publication's journalist",
        ],
        [
          "Control",
          "Subject to publisher review",
          "Independent reporting choices",
        ],
        [
          "Guarantees",
          "No assured acceptance or results",
          "No assured coverage or links",
        ],
      ],
    },
    faq: [
      [
        "Is a paid article earned media?",
        "Describe the actual arrangement. If payment buys publication, disclose that commercial relationship rather than describing it as independent editorial selection.",
      ],
      [
        "Which approach earns better links?",
        "There is no universal answer. Relevance and editorial decisions vary, and paid links require qualification. Choose for audience value rather than promised ranking credit.",
      ],
    ],
    related: [
      [
        "Compare content marketing",
        "/guides/guest-posting-vs-content-marketing/",
      ],
      ["Plan the strategy", "/guides/guest-posting-strategy/"],
      ["Understand sponsorship", "/guides/guest-post-vs-sponsored-post/"],
    ],
  }),
  guide({
    slug: "free-vs-paid-guest-posting",
    title: "Free vs paid guest posting",
    description:
      "Compare unpaid guest contributions with paid placements, including editorial effort, full costs, approval terms and sponsored-link requirements.",
    answer:
      "Free guest posting usually means there is no placement fee; research, writing and editing still cost time or money. Paid guest posting adds a commercial placement arrangement with its own scope and disclosure requirements. Compare audience fit, editorial standards and the complete cost of each option rather than treating either price model as a quality guarantee.",
    sources: [paid, spam, helpful],
    questions: [
      {
        title: "What does free actually cover?",
        body: "An unpaid contribution may require original reporting, a strong portfolio and several revisions. Record those production hours even if the publisher charges nothing. Check whether a free submission is eligible for the subject and format you propose. A page inviting contributors is not a promise to publish your article or include a commercial link.",
      },
      {
        title: "What changes when a placement is paid?",
        body: "Ask for the placement scope, writing charges, approval steps and current availability in writing. Payment may buy a publishing opportunity under agreed conditions, but it does not guarantee rankings, article readership or acceptance of an unsuitable manuscript. Discuss a visible sponsorship explanation and the paid-link attributes before making a commitment.",
      },
      {
        title: "Example: compare total effort",
        body: "Suppose an unpaid article takes six hours and a sponsored article takes three hours plus a hypothetical $90 fee. At an illustrative internal planning rate of $30 an hour, both total $180. These invented inputs show how to compare effort; they are not publisher prices, typical workloads or forecasts. Actual audience fit and terms can still make one unsuitable.",
      },
      {
        title: "Do not exchange hidden benefits for ranking credit",
        body: "Products, services or other benefits can also make a link part of a commercial arrangement. Avoid treating a placement as unpaid solely because no cash changes hands. Google's link-spam guidance addresses exchanges intended to influence rankings. Explain the real relationship to the publisher and agree appropriate qualification; do not negotiate for undisclosed ranking influence.",
      },
    ],
    table: {
      columns: ["Check", "Unpaid contribution", "Paid placement"],
      rows: [
        ["Placement fee", "None if confirmed", "Current agreed quote"],
        [
          "Production",
          "Research, writing and review",
          "Confirm separately included work",
        ],
        [
          "Approval",
          "Publisher's editorial decision",
          "Publisher's editorial and commercial terms",
        ],
        [
          "Links",
          "Relevant editorial use",
          "Appropriate paid-link qualification",
        ],
      ],
    },
    faq: [
      [
        "Are free guest posts always better?",
        "No. Evaluate the actual audience, standards, effort and terms. A zero placement fee does not establish quality.",
      ],
      [
        "Does paying remove the writing work?",
        "Only if writing is expressly included. Confirm who writes, the scope, revisions and any separate charge.",
      ],
    ],
    related: [
      ["Compare guest post costs", "/guides/guest-post-cost/"],
      [
        "Use the budget worksheet",
        "/blog/a-practical-guest-post-budget-worksheet/",
      ],
      [
        "Read paid-link guidance",
        "/guides/paid-guest-posts-google-link-policies/",
      ],
    ],
  }),
  guide({
    slug: "guest-posting-for-small-businesses",
    title: "Guest posting for small businesses",
    description:
      "Plan a manageable guest posting test for a small business: choose a useful topic, relevant readers, a complete budget and a clear enquiry goal.",
    answer:
      "Small businesses can approach guest posting as a focused audience experiment: solve a customer problem in a relevant publication, link a useful next step and measure actual enquiries. Keep production and placement costs within a confirmed budget. A narrow audience fit and manageable editorial workload matter more than buying the largest available authority score.",
    sources: [helpful, paid, analytics],
    questions: [
      {
        title: "Use a question customers already ask",
        body: "Review recent enquiries and choose a question your team can answer with experience. A fictional repair shop might explain when an appliance repair is practical and what information to collect before calling. Keep the article useful even for readers who never buy. Obtain permission before using a customer's story, photograph or identifiable details.",
      },
      {
        title: "Choose readers you can actually serve",
        body: "Check the publication's topics, language and relevant audience evidence. A local business needs to know whether readers are in its service area; a supplier country field alone cannot prove that. A specialist online business may need a narrow trade audience instead. Read the publication section where the article would appear before discussing price.",
      },
      {
        title: "Set a complete spending limit",
        body: "Include placement, writing, editing, images and staff coordination time. Keep unknown charges separate until confirmed. A low-cost placement with extensive revisions may exceed a small team's capacity. Name Retailer's shortlist organizes candidates; request a quote to confirm availability and the final price. Use the budget worksheet for the full comparison.",
      },
      {
        title: "Make the next action easy to recognize",
        body: "Send interested readers to a relevant checklist, service explanation or enquiry page that works on a phone. Record the published URL and use consistent campaign labels where permitted. Review qualified enquiries alongside referral activity over the same period. Do not attribute every new sale to the placement because it happened after publication.",
      },
    ],
    steps: [
      "Choose one customer question and a useful destination.",
      "Shortlist relevant publications your team can review properly.",
      "Confirm the full cost and editorial responsibilities.",
      "Publish one well-supported article and check its live form.",
      "Review observed enquiries and effort before expanding the test.",
    ],
    faq: [
      [
        "What budget should a small business use?",
        "Use an amount it can afford to test after accounting for production and staff time. This guide does not establish a market price or guaranteed return.",
      ],
      [
        "Should a local business choose only locally named publications?",
        "Check actual reader geography and subject fit. A local-sounding domain or supplied country does not establish a local audience.",
      ],
    ],
    related: [
      ["Plan local relevance", "/guides/guest-posting-for-local-seo/"],
      ["Review lower-price listings", "/guest-posting-sites-under-50/"],
      ["Measure the test", "/guides/measure-guest-posting-results/"],
    ],
  }),
  guide({
    slug: "check-guest-post-website-traffic",
    title: "How to check traffic before guest posting",
    description:
      "Verify guest post publisher traffic with a provider, period, channel and page scope, then record audience evidence and unresolved questions before deciding.",
    answer:
      "Check website traffic before guest posting by recording the metric's provider, measurement period, channel and domain or page scope, then examining whether the relevant readers and articles match your needs. Compare like-for-like evidence and ask about unexplained changes. A supplied traffic number or third-party estimate cannot guarantee views, referrals or sales for your article.",
    sources: [
      [
        "Ahrefs: how organic traffic estimates work",
        "https://help.ahrefs.com/en/articles/1863206-what-is-organic-traffic-in-ahrefs-and-how-do-we-calculate-it",
      ],
      analytics,
    ],
    questions: [
      {
        title: "Step 1: identify what the number measures",
        body: "Ask whether the value means users, sessions, page views or estimated search clicks. Record the reporting period, provider, observation date and target: whole domain, subdomain, section or page. Do not compare a whole-domain total with an article-level organic estimate. If the listing lacks this information, mark it unknown rather than choosing a convenient interpretation.",
      },
      {
        title: "Step 2: inspect the audience and relevant pages",
        body: "Request a report showing the channel and geography relevant to your campaign, with unnecessary personal information removed. Look at recent articles in the intended section and ask how readers discover them. A high publication-wide total may come from subjects unrelated to yours. Access to an analytics account requires the publisher's permission; screenshots alone also have verification limits.",
      },
      {
        title: "Step 3: compare a trend with the same method",
        body: "Ask for comparable periods using the same provider and scope. A sharp change deserves investigation, but the chart alone does not establish a penalty, fraud or an audience collapse. Check seasonality, publishing changes and measurement differences. Do not combine values from unrelated tools into a trend and describe it as observed growth or decline.",
      },
      {
        title: "Example: when two traffic figures cannot be compared",
        body: "Imagine one listing reports 20,000 monthly sessions for a whole domain and another shows 5,000 estimated organic clicks for a specialist section. These hypothetical values do not rank the sites fairly because both channel and scope differ. Ask each publisher for evidence about the relevant section and readers, or record the comparison as unresolved.",
      },
      {
        title: "Step 4: write a decision with its limits",
        body: "Keep the report date, source, target, audience match and open questions beside the listing. If traffic is central to the spend and the evidence is unavailable, pause the decision or reduce the amount at risk. Name Retailer's catalogue traffic values are supplied data; its tools do not independently refresh or certify publisher analytics.",
      },
    ],
    table: {
      columns: ["Record", "Question", "If unavailable"],
      rows: [
        ["Provider and period", "Which report and dates?", "Mark unknown"],
        [
          "Unit and channel",
          "Sessions, views or estimated search clicks?",
          "Do not compare totals",
        ],
        ["Scope", "Domain, section or article?", "No article-view projection"],
        [
          "Audience",
          "Relevant topics and geography?",
          "Seek evidence before committing",
        ],
      ],
    },
    faq: [
      [
        "Does Ahrefs show measured visits?",
        "Its organic traffic figure is an estimate of search clicks, not direct access to a publisher's measured analytics. Keep the provider and scope attached to the value.",
      ],
      [
        "Can I predict my article views from domain traffic?",
        "No. The domain total does not establish how much exposure your article will receive. Ask about the relevant section and measure actual results afterward.",
      ],
    ],
    related: [
      [
        "Understand DA, DR and traffic definitions",
        "/guides/da-vs-dr-and-traffic/",
      ],
      ["Complete the publisher review", "/guides/vet-a-guest-post-site/"],
      [
        "Measure results after publication",
        "/guides/measure-guest-posting-results/",
      ],
    ],
  }),
  guide({
    slug: "guest-posting-for-local-seo",
    title: "Guest posting for local SEO",
    description:
      "Evaluate local guest posting opportunities by service area, reader geography and useful local content, with practical checks and measurement limits.",
    answer:
      "Guest posting for local SEO should start with useful coverage for readers in a business's service area. Check local audience evidence, choose a relevant topic and offer a practical destination. Treat referrals and local enquiries as measurable outcomes. A local placement does not guarantee map visibility, and paid links still require appropriate qualification.",
    sources: [
      [
        "Google Business Profile: local ranking guidance",
        "https://support.google.com/business/answer/7091",
      ],
      paid,
      spam,
    ],
    questions: [
      {
        title: "Define a real service area",
        body: "Write down where customers can use your service and which local questions you can answer accurately. Then look for publications covering those people or organizations. A city in a domain name, a hosting location or a supplier country field does not prove the audience lives there. Ask for relevant geographic evidence when local reach is the reason for choosing a placement.",
      },
      {
        title: "Contribute detail that belongs to the location",
        body: "A fictional bicycle workshop could explain a maintenance checklist for local commuting conditions and identify which parts of the advice are seasonal. Use first-hand detail you can support and check any location-specific factual references. Repeating the city name through a generic article does not make it locally useful. Avoid publishing the same piece with only place names changed.",
      },
      {
        title: "Keep expectations about local rankings grounded",
        body: "Google's local guidance discusses relevance, distance and prominence. A contributed article does not control those factors or purchase a map position. Maintain accurate business information and useful service pages alongside any editorial distribution. If the placement is sponsored, agree the commercial explanation and paid-link attributes instead of asking the publisher to sell ranking credit.",
      },
      {
        title: "Measure useful local responses",
        body: "Point readers toward the relevant service or appointment information and record enquiries within the service area. Separate actual appointments from general page visits. Ask how new customers found the business if that fits your process, but treat self-reports as another imperfect signal. Compare similar periods and account for promotions or seasonal demand before crediting a placement.",
      },
    ],
    checklist: [
      "Readers plausibly live or work in the service area",
      "Topic contains useful supported local detail",
      "Service destination is accurate and usable",
      "Paid relationships are disclosed and links qualified",
      "Local enquiries are measured separately from all traffic",
    ],
    faq: [
      [
        "Will a local guest post improve my map ranking?",
        "There is no guarantee. A single placement cannot establish causation for a local ranking change.",
      ],
      [
        "Is a country directory enough for a city campaign?",
        "No. A supplied country field does not establish city-level readership. Ask for evidence relevant to the actual service area.",
      ],
    ],
    related: [
      [
        "Plan a small-business test",
        "/guides/guest-posting-for-small-businesses/",
      ],
      ["Check audience evidence", "/guides/check-guest-post-website-traffic/"],
      ["Browse business publications", "/business-guest-posting-sites/"],
    ],
  }),
  guide({
    slug: "guest-posting-for-ecommerce",
    title: "Guest posting for e-commerce websites",
    description:
      "Plan e-commerce guest articles around shopper questions, suitable publishers, useful landing pages and measured sales or enquiries without ranking promises.",
    answer:
      "E-commerce guest posting works as an audience and content test: answer a real shopper question on a relevant publication and offer a useful next step in your store. Check publisher fit, destination quality and complete costs before proceeding. Track observed referral actions and commercial outcomes, while keeping paid-link qualification and attribution limits explicit.",
    sources: [helpful, paid, analytics],
    questions: [
      {
        title: "Choose a shopper problem before a product link",
        body: "Start with a comparison, care question or usage problem customers actually raise. A fictional outdoor store might contribute a guide to choosing rainwear for different commuting conditions. The article should explain trade-offs, not merely list the store's products. Use truthful experience and evidence, and obtain permission for any photographs or customer examples.",
      },
      {
        title: "Match the publication to the buying context",
        body: "A practical hobby publication may suit a specialist item better than a broad shopping site. Read the relevant section and ask about audience location if shipping or product availability is restricted. Confirm seasonal lead times with the editor rather than assuming a catalogue listing can be published immediately. Supplied scores do not establish purchase intent.",
      },
      {
        title: "Use a destination that continues the task",
        body: "Link a helpful buying guide, sizing explanation or suitable category when the editor permits it. Check mobile usability, stock availability, regional shipping information and redirects. An expired product page or irrelevant homepage can waste a useful visit. Agree how product changes will be handled if the article remains online after the featured item is unavailable.",
      },
      {
        title: "Example: calculate a commercial result carefully",
        body: "For illustration, suppose a placement and production together cost $240, and reliably attributed orders contribute $180 after product costs and other order costs included in your chosen margin definition. The illustrative return is ($180 minus $240) divided by $240, or minus 25 percent. Revenue alone would overstate the result. These are invented figures, not a sales forecast or Name Retailer prices.",
      },
      {
        title: "Keep referrals, assisted activity and organic changes separate",
        body: "Use consistent campaign labels on permitted links and review actual landing-page sessions and orders. Missing consent or tracking can leave some activity unobserved; do not silently count it as either proven sales or guaranteed zero demand. A later organic change may have many causes. Record attribution rules before comparing placements, including how you handle returns and cancellations.",
      },
    ],
    steps: [
      "Choose one shopper problem and a maintained destination.",
      "Review publishers for subject, geography and seasonal fit.",
      "Confirm placement, production, disclosure and link terms.",
      "Check tracking and the mobile purchase path before publication.",
      "Review contribution-based results using a documented attribution window.",
    ],
    faq: [
      [
        "Should every guest article link a product page?",
        "No. Choose a destination that helps the reader complete the task and meets the publisher's rules. A guide or category may be more useful.",
      ],
      [
        "Are referral sales guaranteed?",
        "No. Measure actual activity, include complete costs and document the attribution limitations.",
      ],
    ],
    related: [
      [
        "Measure guest posting results",
        "/guides/measure-guest-posting-results/",
      ],
      [
        "Explore travel and lifestyle publications",
        "/travel-lifestyle-guest-posting-sites/",
      ],
      ["Compare business publishers", "/business-guest-posting-sites/"],
    ],
  }),
  guide({
    slug: "measure-guest-posting-results",
    title: "How to measure guest posting results and ROI",
    description:
      "Measure guest posting results with a defined goal, consistent campaign labels, complete costs and a worked ROI example that explains attribution limits.",
    answer:
      "Measure guest posting results by defining the desired reader action, recording the live article and campaign identifiers, and comparing observed outcomes with complete placement and production costs. Keep publication checks, referral activity and business results separate. Calculate ROI only with a documented value and attribution method; a link count or ranking change alone does not establish return.",
    sources: [analytics, paid],
    questions: [
      {
        title: "Record the goal and baseline before publication",
        body: "Choose the primary action, such as a qualified enquiry or a paid product trial, and define what counts. Record ordinary activity before publication, the reporting window and other campaigns running at the same time. A baseline gives context but does not create a controlled experiment. Keep the placement quote, production costs and actual publication date in the same record.",
      },
      {
        title: "Use consistent campaign labels where permitted",
        body: "When the publisher allows tagged URLs, use a stable utm_source for the publication, utm_medium for the agreed channel convention and utm_campaign for the campaign. Keep spelling and capitalization consistent, and do not put personal information in the parameters. Check that redirects preserve them and the destination loads. Tags help identify visits; they do not make every later conversion attributable to that visit.",
      },
      {
        title: "Distinguish delivery from performance",
        body: "First check that the article is live, accurate, disclosed appropriately and linked as agreed. Then report observed referrals and relevant actions. Finally connect eligible business outcomes using the attribution rule you chose. A live link is a delivery observation, while a qualified enquiry is a different outcome. Do not combine these into an unexplained success score.",
      },
      {
        title: "Worked ROI example",
        body: "Suppose an illustrative campaign costs $400 including placement, writing and coordination. Documented attributed sales contribute $300 after the order costs included in your chosen contribution definition. ROI is ($300 minus $400) divided by $400, or minus 25 percent. These hypothetical figures are not publisher quotes or expected results. If only enquiry counts are known, report cost per qualified enquiry instead of inventing sales value.",
      },
      {
        title: "Explain what the data cannot establish",
        body: "Consent choices, untagged links, cross-device journeys and offline sales can limit observation. A search ranking change may coincide with site changes or broader demand shifts. Report these gaps without assuming they prove extra sales. Compare placements over similar exposure periods, and keep an update log when articles change or disappear. Use the evidence to inform the next test rather than claim certainty.",
      },
    ],
    table: {
      columns: ["Layer", "Record", "Does not prove"],
      rows: [
        ["Delivery", "Live URL, date and agreed terms", "Reader engagement"],
        [
          "Audience response",
          "Observed referral visits and actions",
          "Incremental sales caused by the article",
        ],
        [
          "Business value",
          "Attributed contribution and full cost",
          "All future or assisted value",
        ],
        [
          "Search context",
          "Comparable query and page observations",
          "Causation from a single placement",
        ],
      ],
    },
    faq: [
      [
        "What if the campaign cost is zero?",
        "ROI as a percentage divides by cost, so it is undefined at zero cost. Report observed outcomes and any production effort instead.",
      ],
      [
        "Can I use revenue as profit in ROI?",
        "No. State the value definition and subtract the relevant product or delivery costs before comparing it with campaign spend.",
      ],
      [
        "How long should I measure?",
        "Choose a window that fits the buying cycle, then compare like-for-like periods. There is no universal period that proves a placement worked.",
      ],
    ],
    related: [
      ["Plan campaign goals", "/guides/guest-posting-strategy/"],
      [
        "Build a complete budget",
        "/blog/a-practical-guest-post-budget-worksheet/",
      ],
      ["Check the published article", "/guides/guest-posting-checklist/"],
    ],
  }),
  guide({
    slug: "guest-posting-mistakes",
    title: "Common guest posting mistakes and how to avoid them",
    description:
      "Avoid guest posting mistakes in audience selection, pitches, costs, editorial evidence, paid-link handling and reporting, with practical corrective actions.",
    answer:
      "Common guest posting mistakes include choosing publishers by scores alone, sending generic pitches, ignoring full costs and publishing weak or poorly sourced articles. Other problems arise when paid links are unqualified or results are reported without an attribution method. Prevent these errors with a clear brief, evidence checks, written terms and a measured review after publication.",
    sources: [helpful, paid, spam, analytics],
    questions: [
      {
        title: "Mistake: choosing a score instead of an audience",
        body: "A high supplied metric cannot tell you whether the right people read the intended section. Correct this by keeping two relevant sample articles and a sentence explaining the audience fit. If you cannot explain why readers would use the proposed piece, remove the prospect or ask for better audience evidence before discussing a fee.",
      },
      {
        title: "Mistake: writing before the editor agrees the angle",
        body: "A complete article can still be irrelevant to a publication's current priorities. Check its submission instructions and send the format it requests. A specific outline with evidence is easier to evaluate than a vague offer to write on any topic. Confirm rights and revision expectations before investing in original assets or extensive production.",
      },
      {
        title: "Mistake: treating a placement fee as the whole budget",
        body: "Writing, specialist review, images and coordination may add cost. Record unavailable amounts as unknown rather than zero. For a fictional team comparing two quotes, the cheaper placement can become the more expensive project if it requires substantial new production. Use a complete budget record and reconfirm the final scope instead of relying on a saved listing price.",
      },
      {
        title: "Mistake: promising search credit from a paid link",
        body: "Google's policies address links bought to manipulate rankings. Confirm paid-link qualification and reader disclosure before proceeding. Do not substitute a vague publisher assurance for the actual attributes on the live page. A resource can still be useful to readers when the link is sponsored or nofollow; ranking influence should not be sold as a guaranteed result.",
      },
      {
        title: "Mistake: declaring success before checking the article",
        body: "Open the final URL, compare it with the approved content and verify destination links on mobile. Then review actual reader actions over the agreed reporting window. If there are no observations, investigate tracking and placement exposure rather than inventing a return. A later ranking change and a live backlink count do not independently establish campaign value.",
      },
    ],
    table: {
      columns: ["Warning sign", "Corrective action", "Record"],
      rows: [
        [
          "Score-only shortlist",
          "Read relevant articles",
          "Audience-fit reason",
        ],
        ["Vague proposal", "Agree a specific outline", "Editor response"],
        [
          "Unknown costs entered as zero",
          "Request complete scope",
          "Dated quote",
        ],
        [
          "Ranking guarantee",
          "Review commercial and link terms",
          "Qualification agreement",
        ],
        [
          "Success based on publication alone",
          "Measure the chosen reader action",
          "Observed outcomes and limits",
        ],
      ],
    },
    faq: [
      [
        "Should I abandon a placement after one weak result?",
        "Review tracking, audience fit, time exposed and complete costs before deciding. A single observation may justify a change but cannot establish a universal rule.",
      ],
      [
        "Can a published mistake be fixed?",
        "Contact the editor with the specific factual correction or link issue and the supporting evidence. Future edits depend on the publisher and agreement.",
      ],
    ],
    related: [
      ["Use the pre-publication checklist", "/guides/guest-posting-checklist/"],
      ["Evaluate a publisher", "/guides/vet-a-guest-post-site/"],
      ["Measure outcomes honestly", "/guides/measure-guest-posting-results/"],
    ],
  }),
  guide({
    slug: "guest-posting-checklist",
    title: "Guest posting checklist before publishing",
    description:
      "Check guest post audience fit, article evidence, costs, image rights, disclosure, links and tracking before publication, then verify the live page.",
    answer:
      "Before publishing a guest post, confirm audience fit, an approved article, accurate sources, image permissions, complete costs and the publisher's agreed disclosure and link attributes. Check the destination and measurement setup as well. After publication, compare the live page with the agreement and record unresolved issues rather than treating publication alone as success.",
    sources: [helpful, paid, analytics],
    questions: [
      {
        title: "Gate 1: publisher and brief",
        body: "Verify the official contact, recent relevant articles and the section where your piece will appear. Confirm the title, target reader, article format, writing responsibility and permitted destination links. The publisher should have enough detail to assess the actual proposal. Pause if important scope questions remain unanswered or if the listing and editorial instructions conflict.",
      },
      {
        title: "Gate 2: accuracy and rights",
        body: "Check every material factual claim against its source and distinguish original observations from hypothetical examples. Verify names, arithmetic, screenshots and image permissions. Remove confidential information. Ask the appropriate specialist to review claims beyond your expertise. Retain the approved manuscript and source record so the editor can resolve later questions without reconstructing the research.",
      },
      {
        title: "Gate 3: commercial and link terms",
        body: "Record the current placement quote, separate production charges, agreed revisions and any applicable additional costs. Confirm what happens if the article is declined, removed or materially changed. Agree the visible commercial explanation and paid-link qualification. Preserve the written quote confirming availability, price and editorial acceptance.",
      },
      {
        title: "Gate 4: destination and measurement",
        body: "Open the destination on a phone and check the useful next step, redirects and any agreed campaign parameters. Define the primary outcome and reporting window before the article goes live. If the intended landing page is unavailable or unrelated to the article, fix it before publication instead of paying to send readers into a dead end.",
      },
      {
        title: "Gate 5: verify the live article",
        body: "Record the final URL and publication date. Compare the text, attribution, disclosure, destination links and paid-link attributes with the agreed version. Ask the editor to correct specific discrepancies and keep the response. Revisit the page during the reporting window and report actual audience actions separately from whether the article remains available.",
      },
    ],
    checklist: [
      "Reader, section and topic confirmed",
      "Approved manuscript and factual sources retained",
      "Image and example permissions documented",
      "Complete charges and revision terms agreed",
      "Commercial disclosure and paid-link attributes specified",
      "Useful destination works on mobile",
      "Measurement goal, identifiers and window recorded",
      "Final page and links checked after publication",
    ],
    faq: [
      [
        "Should I proceed if a checklist item is unknown?",
        "Identify whether it affects cost, rights, accuracy, audience fit or commercial disclosure. Resolve material questions before committing; do not turn unknowns into assumed approval.",
      ],
      [
        "Does a self-canonical mean the article will be indexed?",
        "No. Technical page signals and a successful response do not establish that a search engine has indexed or will show the page.",
      ],
    ],
    related: [
      ["Review submission rules", "/guides/guest-post-submission-guidelines/"],
      ["Avoid common mistakes", "/guides/guest-posting-mistakes/"],
      [
        "Measure results after publication",
        "/guides/measure-guest-posting-results/",
      ],
    ],
  }),
];
