export type ContentSection = { title: string; paragraphs: string[]; bullets?: string[]; code?: string; links?: Array<readonly [string, string]> };
export const askingPriceLabel = "asking prices from supplied listings, not transaction prices";
export const googlePaidLinks = "https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links";
export const ftcDisclosures = "https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses";
export const businessTodos = {
  reply: "TODO: Owner to confirm the placement inquiry reply time.",
  revisions: "TODO: Owner to confirm included revision rounds, extra revision charges and the approval process.",
  reporting: "TODO: Owner to confirm delivery of the published URL, link checks and any post-publication report.",
  rejection: "TODO: Owner to confirm the procedure and any charges or refunds when a publisher rejects an article.",
  payment: "TODO: Owner to confirm available payment methods, payment timing and invoicing terms.",
} as const;
export const hubSections: ContentSection[] = [
  { title: "What a guest post marketplace is and when it beats DIY outreach", paragraphs: [
    "A marketplace puts supplied publication details into a common format so you can compare options before contacting anyone. Instead of collecting unrelated rate cards, you can review topic, listing country, language, authority metrics and placement price together. This helps when you already know the audience you need and want a manageable set of candidates for a quote.",
    "DIY outreach starts from finding an editor and earning a response to an individual idea. It can suit a highly specialised story, an existing relationship or an unpaid editorial contribution. Marketplace browsing can reduce the work of building an initial comparison, but it does not replace reading the publication, checking a current offer or agreeing editorial terms. Treat every listing as a research lead. A listed domain is not proof of publisher authorization, and a supplied price is not an accepted order.",
  ] },
  { title: "How to pick a band for your goal", paragraphs: [
    "For referral traffic, begin with relevance and the destination page. Find publications whose recent articles answer the same questions as your intended readers. Ask for dated audience information for the proposed section, including reader geography and acquisition sources. A large whole-domain estimate can conceal a small or unrelated section. Choose a price band that leaves room to produce a useful article and evaluate the visits it actually sends.",
    "For brand mentions, examine the context in which your name will appear. A practical contribution beside credible coverage may be more useful than a high-scoring domain with no relevant readers. Agree the byline, sponsorship label, product-reference policy and publication section. The article should make sense to a reader who never follows the link.",
    "For link research, DR and DA bands let you compare sites with broadly similar supplied scores. Check recent articles and outbound links rather than interpreting a band as approval. Record the metric provider and observation date, and investigate sudden changes. Paid placements need appropriate link qualification; a higher band does not purchase ranking credit. Start with the audience requirement, then narrow the price and metric ranges until you have candidates worth reviewing.",
  ] },
  { title: "How to read DA, DR and traffic without being misled", paragraphs: [
    "DA and DR are different providers' estimates of a domain's link profile. They are not interchangeable scores and neither establishes the quality of a specific article. Compare the same metric across similar publications, then read recent content to understand editorial focus. A high score beside unrelated coverage is a reason to investigate, not a reason to skip review.",
    "Traffic estimates have their own scope and measurement limits. Ask whether a value represents organic search visits, all visits or another measure, and whether it describes the whole domain. A missing figure remains unknown; it is not zero. Invalid import values are hidden. The listing update date records a catalogue change, not an independent audience audit. Request the measurement source and date when readership is central to your decision.",
  ], links: [["Understand DA, DR and traffic estimates", "/guides/da-vs-dr-and-traffic/"]] },
  { title: "Build a shortlist an agency can review", paragraphs: [
    "Write the campaign's intended reader, useful article angle, target country and total budget before opening filters. Keep a brief note beside each candidate explaining why that audience would care. An agency can use the same fields across clients while keeping each client's topic, disclosures and destination separate. Do not reuse an article pitch solely because the sites share a category.",
    "Compare up to four publications at a time in the marketplace. Inspect recent posts, sample sponsored content, author information and editorial requirements. Ask whether the quoted placement is a new article, an addition to an existing page or another format. Keep unknown writing and revision costs visible until they are confirmed. Remove a candidate if the seller cannot explain the exact section or provide sample articles. A shorter, well-supported shortlist is easier to approve than a large export ordered only by DR.",
  ], links: [["Browse and compare the active catalogue", "/"], ["Use the publisher evaluation checklist", "/guides/vet-a-guest-post-site/"]] },
  { title: "Cheap guest posting sites and the full budget", paragraphs: [
    "A low placement price can help you explore a relevant niche, but it cannot answer whether the audience fits or an article will be accepted. Review the publication with the same care at every price. Budget for research, writing, fact-checking, images, revisions and coordination as well as placement. A missing charge is an unanswered question, not a free inclusion.",
    "The band counts and medians above are calculated from the catalogue when this page is requested. Counts describe listings rather than unique verified publishers. Boundary labels tell you which prices are included, so you can compare adjacent bands without counting a placement twice. Request a current quote before committing work; a median is a comparison point, not the price of your proposed article.",
  ], links: [["Compare guest post price distributions", "/guest-post-prices/"]] },
  { title: "Paid placements and link attributes", paragraphs: [
    "Google's guidance asks publishers to qualify paid links with rel=\"sponsored\"; rel=\"nofollow\" is also acceptable. Agree that qualification and a clear sponsorship label before commissioning the article. The reader-facing label and the HTML link attribute serve different purposes, so check both rather than assuming one provides the other.",
    "Plan paid guest posting around relevant audience and brand reach. Do not treat a supplied dofollow field as a promise of search benefit, indexing or rankings. Your brief should record the intended resource, natural anchor text and disclosure requirements. If the offer depends on concealing payment or selling ranking credit, reconsider the placement.",
  ], links: [["Read Google's paid-link guidance", googlePaidLinks], ["Follow the placement inquiry process", "/how-it-works/"]] },
];
export const hubFaq = [
  ["What is a guest post marketplace?", "A guest post marketplace lets you compare supplied publication listings and request a placement quote. Review audience fit, current availability and editorial terms before treating a listing as an offer."],
  ["Is DR or DA more important?", "Neither score is a substitute for relevance. Compare each metric within its own system, ask for its source and date, and inspect recent articles and audience evidence."],
  ["How many sites should I shortlist?", "Choose only candidates you can review properly. The marketplace comparison supports up to four publications at a time; that interface limit is not a recommended campaign size."],
  ["Are the metrics verified?", "No. Metrics are supplied estimates. A listing update date does not verify the metric provider, measurement date or readership; request that evidence separately."],
  ["Can I supply my own article?", "Include your draft in the placement inquiry and ask whether the publisher accepts supplied articles. Acceptance, editing requirements and any separate writing costs need confirmation."],
] as const;
export const workflowSections: ContentSection[] = [
  { title: "Find and shortlist", paragraphs: [
    "Start with the reader you want to reach. Use topic, country, language, budget and metric filters to narrow the catalogue, then compare up to four publications at a time. Read recent relevant articles and check the proposed publication section. A supplied authority score does not establish reader interest, and a country field does not prove the audience lives there.",
    "Record why each candidate fits the article rather than saving only a domain and price. Check available requirements and the supplied turnaround field on the listing. Missing information should become a question for the inquiry. You can browse before creating an account; saving a plan and sending an inquiry are separate actions.",
  ], links: [["Find publications in the marketplace", "/"]] },
  { title: "Request a quote", paragraphs: [
    "Use Request a placement for a publication or Request quote for shortlist to discuss your candidates together. The inquiry form collects your contact details, website, anchor preference, budget and message. Explain whether you have a completed article or need writing. Sending the form asks the team to assess the request; it does not reserve a publisher slot or guarantee acceptance.",
    "Ask for a written scope identifying the publication, section, format, placement charge and any separate services. Keep the catalogue amount as a reference until current availability and the final quote are confirmed. Provide a deadline as a requirement to discuss, rather than assuming it has been accepted.",
    businessTodos.reply,
  ] },
  { title: "Send the article brief", paragraphs: [
    "Provide the target URL, reader problem, proposed topic or keyword, preferred anchor text, intended audience and deadline. Attach a manuscript or an outline, depending on what is ready. Include sources for factual claims, image permissions and any brand or product references that need review. Remove passwords, private customer details and confidential screenshots before submitting material.",
    "Make the destination useful for someone reading the article. A relevant guide, demonstration or documentation page may fit better than an unrelated sales page. Ask whether the publisher permits the destination and anchor you propose; editorial decisions can change the final wording. Explain any disclosure requirements in the brief so they can be agreed before writing begins.",
  ], links: [["Prepare a practical guest article", "/guides/write-a-guest-post/"]] },
  { title: "Agree writing and approval", paragraphs: [
    "Article writing is priced separately where available. Review the offered writing option and ask what research, images, specialist review and editing it covers. If you supply a draft, ask whether publisher edits or a rewrite will still be needed. Do not assume an unavailable writing price means that writing is included.",
    "Agree who approves factual claims and the final draft, how changes are submitted and which version can be published. A scope change after approval may affect both cost and scheduling; get that confirmed before requesting substantial additional work. Publisher acceptance remains subject to its editorial requirements.",
    businessTodos.revisions,
  ] },
  { title: "Confirm publication and link qualification", paragraphs: [
    "Confirm the sponsorship label, publication section and destination before the article is scheduled. Google's guidance recommends rel=\"sponsored\" for paid links and accepts rel=\"nofollow\". A listing's link-type field is supplied information; do not assume a paid placement promises an unqualified link or a search ranking benefit.",
    "Ask how the published URL will be delivered and when you should check it. Review the live article against the approved brief: title, destination, anchor, images, visible label and HTML qualification. Keep any correction request specific to the agreed scope rather than asking for an undisclosed commercial link.",
  ], links: [["Understand paid guest post disclosure", "/guides/paid-guest-posts-google-link-policies/"]] },
  { title: "Record delivery and measure response", paragraphs: [
    "Keep your quote, approved draft and publication details together. Use a campaign identifier on the agreed destination if tracking is permitted. Measure observed referral visits and meaningful actions such as enquiries or sign-ups. Compare those observations with the original audience goal instead of reporting supplied domain traffic as visits to your business.",
    "Before agreeing an order, ask what delivery evidence is included and whether subsequent checks or correction handling are offered. Do not assume ongoing monitoring, a ranking report or a particular retention period is included in a placement price.",
    businessTodos.reporting,
  ], links: [["Plan how to measure guest posting results", "/guides/measure-guest-posting-results/"]] },
  { title: "Typical timelines vary by publisher", paragraphs: [
    "Use the supplied turnaround field on each listing as a question to confirm with the team. It may depend on editorial review, draft readiness, corrections and the publisher's schedule. A blank field provides no timing commitment. Confirm whether the quoted window begins at inquiry, approved brief, final draft or another agreed milestone, and ask how a missed deadline would be handled.",
  ] },
  { title: "What we do not guarantee", paragraphs: [
    "There is no guaranteed publisher acceptance, indexing, ranking improvement, referral volume or commercial result. A comparison, saved plan or placement inquiry is not evidence that a publisher has approved your article. Confirm availability, commercial scope and editorial requirements before making a commitment. Paid content should remain useful to its readers even if it brings no search benefit.",
    businessTodos.rejection, businessTodos.payment,
  ], links: [["Check placement price data before budgeting", "/guest-post-prices/"]] },
];
export const workflowFaq = [
  ["How long does a guest post take?", "Timing varies by publisher. Review the supplied turnaround field and confirm the starting milestone, editorial review and final schedule in your quote; a blank field is not a promise."],
  ["Can I supply my own article?", "Send your draft or outline with the inquiry. Confirm that the publisher accepts supplied articles and ask about editorial changes and separate charges before proceeding."],
  ["Do you guarantee the link is dofollow?", "No. Paid links should be qualified with sponsored or nofollow in line with Google's guidance. Confirm the actual attribute and sponsorship label before approval."],
  ["What if the publisher rejects my article?", businessTodos.rejection],
  ["How do I pay?", businessTodos.payment],
] as const;
