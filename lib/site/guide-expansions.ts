import type { BuyerGuide } from "./buyer-guides";
import { directAnswer } from "./public-copy";

type Expansion = {
  seoTitle: string;
  description: string;
  sections: Array<{ title: string; body: string }>;
  faq?: Array<[string, string]>;
};
/** Specific buyer workflows added on October 19, 2026. Numbers in scenarios are illustrative. */
export const guideExpansions: Record<string, Expansion> = {
  "guest-posting-for-beginners": {
    seoTitle: "Guest Posting for Beginners: Your First Placement Guide",
    description:
      "Learn guest posting step by step, from choosing a relevant publication to agreeing a brief and checking the live article. Includes examples and a checklist.",
    sections: [
      {
        title: "Run a small first campaign you can actually review",
        body: "Start with one reader problem and a small shortlist rather than a target number of links. Choose an outcome you can observe, such as readers using a useful resource or making a relevant enquiry. Write down why the publication reaches those readers and what your article will help them do. Set a total spending limit that includes production and your own review time. A first campaign should teach you how the editorial process works and whether the audience responds; expanding before that review makes it harder to identify which choice helped or failed.",
      },
      {
        title: "Read the publication as a contributor before you pitch",
        body: "Open recent articles in the section you would use. Note their depth, examples, evidence and tone. Check the submission page and identify the editor or the official inquiry route. Look for an angle the publication has not already covered in the same way. If a useful article exists, propose a different task or new substantiated material instead of a lightly rewritten duplicate. Keep the URLs you reviewed in your research note. This helps you explain why you contacted that editor and gives the writer concrete examples of the expected standard.",
      },
      {
        title: "Agree the production sequence before writing",
        body: "A practical sequence is outline acceptance, manuscript preparation, factual review, publisher editing and publication checking. Confirm who owns each step and who can approve changes. Ask for the placement quote, separate writing costs, included revisions, image responsibilities, link qualification and visible disclosure. Record any requested date as a request until the publisher confirms it. If the editor rejects the proposed subject, change the outline before commissioning the full manuscript. Keeping this sequence explicit avoids paying to write an article that the intended publication has never agreed to consider.",
      },
      {
        title: "Prepare a complete first inquiry",
        body: "Include your name, business website, proposed publication, target reader, article idea, destination URL, anchor, budget and questions about scope. Explain what useful material you can supply, such as a documented process or an original example. Do not manufacture customer results or professional credentials to strengthen the pitch. Ask the editor which information is needed next. When a response arrives, save the accepted version of the brief and quote together; your original inquiry may differ from the final agreement after the editor narrows the angle or changes the production responsibilities.",
      },
      {
        title: "Make the article useful before adding the business reference",
        body: "Build the outline around the reader's task. Show the starting situation, the steps, a worked example and the circumstances in which the advice would not fit. Add sources beside factual claims and distinguish your own observations from external evidence. Introduce your business only where it helps explain the subject or provides an appropriate next step. The destination should continue the task promised by the anchor. A contribution that works only as an advertisement needs a different brief from an instructional article, and the editor should understand that distinction before approval.",
      },
      {
        title: "Check the live result and write one lesson",
        body: "Open the published URL and compare the article, images, links, attribution and disclosure with the accepted version. Ask for specific corrections if necessary and verify them afterward. Review the reader action over a stated period using measurement you have permission to collect. Separate publication delivery from campaign performance: an article can meet its brief and still produce few observed enquiries. Record one change for the next attempt, such as a narrower audience, a clearer destination or a better evidence packet. Avoid treating one result as a universal rule for every publication.",
      },
      {
        title: "Use a stop rule when important questions remain open",
        body: "Pause if the publication cannot identify the actual section, explain commercial terms or confirm how paid content is handled. Reject a quote whose central promise is guaranteed rankings. Ask for clarification when the writing scope is unclear or the requested article does not match the publisher's existing readers. These are practical decision gates, not a public verdict on the publication. Write down the unresolved question and who will answer it. You can resume after a useful response; a low headline price is not a reason to skip the missing agreement.",
      },
    ],
  },
  "find-guest-posting-opportunities": {
    seoTitle: "Find Guest Posting Opportunities That Fit Your Audience",
    description:
      "Find relevant guest posting opportunities with focused searches, publisher research and a reusable prospect log. Check editorial fit before sending outreach.",
    sections: [
      {
        title: "Build a prospect log around the proposed section",
        body: "Use columns for publication, section URL, reader, recent related articles, submission route, editor, research date and next action. Keep one row per actual opportunity, not one row for every search result. Several URLs can belong to the same publication or be handled by the same editor. Deduplicate those before contacting anyone. Record the exact section because a broad domain classification can hide very different readers. A finance publication's careers section may suit a hiring contribution while its investment commentary does not, even when both appear under the same domain.",
      },
      {
        title: "Use searches to find policies and coverage gaps",
        body: "Combine a specific subject with phrases such as contributor guidelines or guest article, then inspect the result. Also search the publication itself for the proposed angle. A submission page confirms a route for consideration, not guaranteed acceptance. If a site has already published a strong article on your exact task, identify a new angle, new evidence or a different reader stage before pitching. Save the current policy URL and date; old lists and copied directories can point to guidelines that no longer describe the editor's process.",
      },
      {
        title: "Prioritize a small researched queue",
        body: "Sort prospects by reader fit, the strength of your proposed contribution and whether you can meet the editorial requirements. Use authority metrics and traffic evidence as additional context. Give each row a decision: research, ready to contact, awaiting response or closed. A ready prospect should have an actual angle and a valid contact route, not merely a domain score. Limit active outreach to work you can follow up and fulfill. A large spreadsheet with no clear next action is less useful than a short queue of well-understood opportunities.",
      },
      {
        title: "Keep rejection and nonresponse useful",
        body: "Record the reason when an editor declines, if one is supplied. Distinguish no response from an explicit rejection or a mismatch with current guidelines. Do not invent motives or repeatedly contact another address at the same publication to bypass a refusal. If the editor suggests a different subject, assess it against your audience and evidence before agreeing. Keep a simple suppression field for publications that have asked not to receive more pitches. The research log should prevent duplicate and unwanted outreach as well as help discover new candidates.",
      },
    ],
  },
  "guest-post-outreach-templates": {
    seoTitle: "Guest Post Outreach Templates Editors Can Evaluate",
    description:
      "Use guest post outreach templates for editorial pitches, sponsored inquiries and polite follow-ups. Learn what to personalize and what to confirm in writing.",
    sections: [
      {
        title: "Choose the right kind of message before personalizing it",
        body: "An unpaid editorial pitch offers a contribution for the publication's readers. A sponsored inquiry asks about a commercial placement. Be clear which conversation you are starting. Do not disguise a paid offer as an independent recommendation, and do not assume a publication that accepts contributors sells placements. Read the current submission rules and use the stated contact route. Personalization should demonstrate a real reason the article belongs in that publication, not simply repeat the editor's first name or praise an article you have not read.",
      },
      {
        title: "Make the proposed article easy to assess",
        body: "Give the editor a specific working title, intended reader and useful outcome. Add two or three outline points that show the substance you can provide. Mention the relevant experience or source material you actually have, with a sample if requested. Avoid unsupported labels such as leading expert. If you propose a destination link, explain its purpose in the article rather than demanding a keyword anchor before the editor has considered the subject. The editor needs enough information to assess fit without opening an unsolicited attachment or following several promotional links.",
      },
      {
        title: "Replace template fields with observed details",
        body: "Before sending, replace every bracketed field and reread the message as a recipient. Check the publication name, editor, section, proposed subject and link destination. Remove a sentence if it could be sent unchanged to hundreds of unrelated sites and adds no necessary context. A short, accurate explanation is more credible than a lengthy claim of admiration. Do not paste a paragraph from the publication and call that research. Explain what you learned from a specific article and how your contribution would address a separate question the same reader might have.",
      },
      {
        title: "Follow up without creating a second unresolved pitch",
        body: "Keep the original subject line and summarize the same proposed article. Ask whether the editor wants to consider it and make it easy to decline. Follow the publication's stated response and exclusivity rules; do not invent a universal follow-up interval. If your availability changes, say so. Stop when the editor declines or asks you not to follow up. Record the contact date and status so a colleague does not send another version of the pitch to the same publication. A follow-up should reduce ambiguity, not pressure the editor.",
      },
      {
        title: "Evaluate a positive reply before saying yes",
        body: "A reply asking for a full draft is an invitation to the next step. Confirm the angle, expected length, evidence, images, originality rules, author attribution and approval process. If payment is involved, ask for an itemized quote, disclosure and link qualification terms. Record the revision boundary and any accepted timing. A friendly reply can still leave the commercial and editorial scope unresolved. Send a short confirmation listing the points you understand and asking the editor to correct them before production starts.",
      },
      {
        title: "Keep a reusable outreach record",
        body: "Save the publication and section, contact route, proposed angle, evidence offered, first contact, follow-up, reply and final decision. Record only the personal information needed for the work and respect opt-out requests. Separate the message template from the actual sent version so you know what the editor saw. Over time, use the record to identify where your pitches were poorly matched or lacked useful material. Do not turn a small set of replies into a fabricated response-rate claim or promise that a template will secure publication.",
      },
      {
        title: "Repair a weak pitch with a concrete editorial question",
        body: "If your draft says only that you want a guest post, add the missing reader task. For example, propose an article that helps a salon owner organize a cancellation list, explain the workflow you can demonstrate and ask whether that fits the publication's operations section. If the editor wants a different format, request an example or current guidelines. This gives both sides a decision to make. Do not compensate for an unclear proposal with more flattery, claims about your authority or a promise that the article will rank.",
      },
    ],
  },
  "write-a-guest-post": {
    seoTitle: "How to Write a Guest Post That Meets Publisher Guidelines",
    description:
      "Write a useful guest post from an approved brief, with a clear outline, evidence, natural links and a complete editorial handoff. Includes a review workflow.",
    sections: [
      {
        title: "Build the outline from a reader's starting situation",
        body: "Write one sentence describing what the reader already knows and one describing what they should be able to do afterward. Arrange the article around the gap between those states. A useful how-to explains prerequisites, the steps, a worked example and exceptions. A comparison needs decision criteria and tradeoffs. Avoid opening every article with a broad history of the industry. If a definition is necessary, make it brief and move quickly to the task. Check the outline against the editor's accepted angle before drafting the full manuscript.",
      },
      {
        title: "Keep evidence next to the claim it supports",
        body: "Use a source log with claim, source URL, date checked and the relevant limitation. When a figure describes a particular sample or period, preserve that scope in the prose. If you use invented values to demonstrate a calculation, introduce them as an illustrative example. Never create a customer quote, review, qualification or case study to make an article sound more experienced. Ask the subject owner for missing material and remove claims that cannot be supported. Strong writing can explain uncertainty precisely without filling the article with vague disclaimers.",
      },
      {
        title: "Edit for the publication's reader, then for mechanics",
        body: "First check whether the article answers the intended question, whether the steps can be followed and whether the examples match the audience's circumstances. Then check factual accuracy, source links, image rights and the destination URL. Finally edit grammar, formatting and length. A technically polished article can still miss the reader's task. Ask someone unfamiliar with the draft to follow one procedure or explain the comparison back to you. Their confusion identifies where the explanation needs work more reliably than adding another general introductory paragraph.",
      },
      {
        title: "Hand off an approved version with clear instructions",
        body: "Provide one manuscript, its source log, licensed images and captions, author details and the agreed commercial instructions. Resolve open comments before final approval. Identify who can answer editorial questions and who should check the live URL. Keep private notes separate from publishable copy. If the editor changes a factual statement, review the change before accepting it. Once published, compare the page with the approved manuscript and send a precise correction request for any material differences. Publication is the start of the delivery check, not proof that every agreed detail survived formatting.",
      },
    ],
  },
  "guest-post-submission-guidelines": {
    seoTitle: "Guest Post Submission Guidelines: A Practical Checklist",
    description:
      "Turn guest post submission guidelines into an actionable brief. Check topic, originality, evidence, image rights, link rules and revision responsibilities.",
    sections: [
      {
        title: "Translate each rule into a production decision",
        body: "Copy the current guideline URL and review date into your brief, then turn requirements into answerable fields. Topic rules determine the angle. Length and format determine the outline. Evidence rules determine the research packet. Image rules determine who supplies assets and permissions. Link rules determine whether your intended destination belongs in the contribution. Do not assume a generic guest post package satisfies the publication. Ask the editor about any rule that would materially change cost or effort before commissioning the manuscript, and preserve the response beside the public guidelines.",
      },
      {
        title: "Resolve conflicting instructions before drafting",
        body: "A public page, an editor's email and an intermediary's quote may describe different requirements. Identify the exact conflict and ask which applies to your proposed article. For example, a public page may require original illustrations while the quote assumes stock images. Ask the actual editor to confirm the accepted approach, including rights and captions. Do not select whichever instruction is easiest and hope the reviewer overlooks the difference. A short written clarification protects the production schedule and gives the writer a single standard to work toward.",
      },
      {
        title: "Check originality and reuse rights explicitly",
        body: "Ask whether the publication accepts adapted material, requires an exclusive manuscript or allows later republication. These questions concern the article and its rights, not just whether a plagiarism checker returns a low similarity score. If you plan to reuse a diagram, quotation or customer example, verify permission and attribution separately. Keep the relevant record with the handoff. If rights are unclear, replace the material with something you can lawfully supply or ask the editor for an acceptable alternative rather than making an unsupported ownership claim.",
      },
      {
        title: "Create a submission-ready packet",
        body: "Before sending the draft, check the accepted title and angle, required format, evidence links, image files, author details and proposed destination. Remove private comments and label the final version. Include a concise note identifying any agreed exception to the public rules, with the editor's confirmation. Ask who receives correction requests after publication. The packet should let the editor review the contribution without chasing files across several conversations. If the requested scope changes substantially at this stage, agree the production and price implications before rewriting.",
      },
      {
        title: "Treat rejection as a specific editorial decision",
        body: "If the editor declines, ask for clarification only when a response would help you resolve an actual requirement. Record the supplied reason without inventing one. A rejection does not automatically mean the article is unusable elsewhere; another publication may serve a different reader or format. Reassess the brief, rights and commercial terms before moving it. Do not submit the same exclusive manuscript to several editors at once when the agreed rules prohibit that approach.",
      },
    ],
  },
  "guest-posting-strategy": {
    seoTitle: "Guest Posting Strategy: Audience, Budget and Measurement",
    description:
      "Plan a guest posting strategy around audience fit, useful contributions and an affordable test. Set decision criteria, responsibilities and a review window.",
    sections: [
      {
        title: "Write a campaign hypothesis you can challenge",
        body: "State the audience, the problem they face, the contribution you will offer and the response you hope to observe. For example, a scheduling business might test whether an operational guide on a relevant small-business publication brings readers to a cancellation worksheet. That is a hypothesis, not a promised result. Add what would make the idea unsuitable: readers outside the service area, an irrelevant section or a destination that cannot support the next step. This makes the strategy useful when choosing between real publications instead of becoming a generic goal to acquire more links.",
      },
      {
        title: "Build the shortlist around editorial fit and evidence",
        body: "Review current articles, the proposed section and available readership evidence. Use catalogue fields to find candidates, then preserve the source of any important observation. Apply a consistent metric when comparing authority scores and keep traffic source, period and property scope visible. A high score cannot repair a mismatch with the intended reader. Assign each candidate a next action: request a quote, ask for evidence, research further or reject. The shortlist should explain a decision, not merely rank domains by a number whose connection to your business objective is unclear.",
      },
      {
        title: "Budget for the whole production process",
        body: "Include placement, writing, subject review, image permissions and coordination. Record who supplies the evidence and who can approve changes. Estimate capacity as well as cash: a team that can review one substantial article should not commit to several simultaneous deadlines. Ask for a quote with scope and revision terms before treating catalogue prices as a campaign total. Keep unknown charges separate until confirmed. If the accepted quote exceeds the cap, change the scope or seek approval; do not silently erase a known cost from the worksheet.",
      },
      {
        title: "Choose a comparison that can inform the next decision",
        body: "A small test can compare two reader angles or publication types, but changing every variable makes the result difficult to interpret. Record the article subject, destination, publication date, cost and reporting window. Note other marketing activity that may affect the same audience. You will rarely isolate every cause, so make a modest decision that the evidence can support: improve the landing resource, research a more relevant section or stop an unproductive approach. Do not present a before-and-after search movement as proof that a single paid placement caused it.",
      },
      {
        title: "Separate delivery gates from performance gates",
        body: "Delivery asks whether the agreed article, links, images and disclosure were published correctly. Performance asks what readers did afterward. Inspect the live page and resolve delivery problems before evaluating the campaign. Define the performance window and useful action in advance, then report observed counts and limitations. An article can meet the agreement while generating little tracked response. That result calls for a campaign decision, not an invented success story. Preserve both outcomes so the next review can distinguish supplier delivery from the strength of your audience and content choices.",
      },
      {
        title: "Set a stop, revise or repeat rule",
        body: "Choose a spending and effort boundary before the campaign begins. Describe what evidence would justify another test and what would make you pause. A repeat decision should have a reason, such as a relevant audience response and a production process your team can sustain. A revise decision should name the variable to change. A stop decision should acknowledge both cost and learning. Avoid setting a universal conversion threshold from an unrelated campaign; the useful standard depends on your economics, measurement quality and the purpose of the placement.",
      },
      {
        title: "Keep a strategy document short enough to use",
        body: "Put the reader, hypothesis, shortlist criteria, budget cap, production owner, measurement window and next decision on one working page. Link the evidence and quote records rather than copying every detail into a presentation. Review the document when a proposed article or publication changes. If the team cannot explain why a placement serves the reader and business, return to the hypothesis before buying another opportunity. More activity is not automatically a stronger strategy, and a clear reason to decline a placement is a useful output of the planning process.",
      },
    ],
  },
  "guest-posting-vs-content-marketing": {
    seoTitle: "Guest Posting vs Content Marketing: Choose the Next Step",
    description:
      "Compare guest posting with your wider content marketing program. Decide when to build an owned resource and when a relevant publisher contribution helps.",
    sections: [
      {
        title: "Map the reader journey across owned and publisher content",
        body: "Start with the question the reader has on the publication and the next question your own resource can answer. The guest article should stand on its own while a contextual link offers a useful continuation. If your destination is only a sales page unrelated to the article's task, improve the connection before outreach. An owned guide, worksheet or comparison may be the better first investment. A publication contribution can introduce a useful resource to a relevant audience, but it cannot compensate for a destination that does not fulfill the anchor's promise.",
      },
      {
        title: "Compare control and maintenance responsibilities",
        body: "On your own website you control revisions, layout and the publication schedule. On another publication, the editor controls acceptance and may control later changes. Record how corrections, link updates and removed content are handled in the actual agreement. Do not assume that paying for a contribution gives you permanent control over the page. Budget maintenance time for the owned resource too: a useful article can become misleading when a product changes or a process is retired. Choose the format whose responsibilities your team can support.",
      },
      {
        title: "Choose the next investment from the current gap",
        body: "If you lack a credible destination or supporting evidence, build those before buying distribution. If you have a useful resource but limited access to the right readers, research relevant publications. If the proposed topic is already covered well on your site, pitch a distinct application or example rather than duplicating the entire guide elsewhere. Keep the production and placement budgets separate. This makes the decision about the work needed now, rather than a false choice between two activities that can support the same program.",
      },
      {
        title: "Review the two formats with appropriate measures",
        body: "For the publisher article, inspect delivery and observe referral behavior within a defined period. For the owned resource, examine whether readers can complete the task and take a meaningful next step. Keep the reporting windows and limitations clear. Do not compare raw traffic totals without considering exposure and audience. If both pieces change during the campaign, record that fact before claiming a result. The useful review identifies the next improvement, such as a clearer worksheet or a better publication match, rather than announcing an unsupported winner.",
      },
    ],
  },
  "guest-posting-vs-digital-pr": {
    seoTitle: "Guest Posting vs Digital PR: Scope, Evidence and Budget",
    description:
      "Compare guest posting and digital PR by editorial control, evidence, production effort and budget. Choose the approach that fits the material you can supply.",
    sections: [
      {
        title: "Identify the asset you can credibly offer",
        body: "A contributor article offers an explanation, useful process or informed perspective. A PR pitch may offer a timely story, original data or a source a journalist can quote. List the material you actually possess before choosing the outreach format. Do not invent research, survey results or expertise to fit a tactic. If your strongest asset is a repeatable operational workflow, a practical contribution may suit it. If you have a timely finding with a defensible method, a journalist may need access to the evidence and a spokesperson instead of a finished guest article.",
      },
      {
        title: "Compare what the editor controls",
        body: "For both approaches, the recipient decides whether the material serves their audience. A commercial contribution can have agreed scope, while earned coverage may change angle, omit a link or not appear. Ask providers to distinguish deliverables they control from outcomes dependent on another editor. A list of pitches sent is different from published coverage. A promised link on a specific publication is different from an offer to research and contact journalists. Record the actual service scope so you can judge delivery without assuming a result the provider has not agreed to supply.",
      },
      {
        title: "Budget evidence and spokesperson time",
        body: "Research, fact checking, data preparation, interviews and approvals can dominate the effort in a PR campaign. A guest article also requires subject input and editorial review, even when writing is outsourced. Assign owners for those tasks and check availability before accepting deadlines. If the campaign uses original data, prepare a method note and explain its limitations. If the proposed story depends on a confidential customer, obtain the necessary permission or choose another angle. Do not treat the outreach fee as the entire cost of producing defensible material.",
      },
      {
        title: "Evaluate each route against the same business purpose",
        body: "Use the audience and intended response as common criteria, then review delivery according to the actual agreement. Keep published URLs, referral observations and qualified responses separate from pitch counts or claimed reach. Avoid adding the total audience of every publication as if every reader saw the piece. A small relevant mention can be useful without an inflated exposure figure. After the review, decide whether the next campaign needs stronger evidence, a different publication or a different format rather than assuming that one tactic is universally superior.",
      },
    ],
  },
  "free-vs-paid-guest-posting": {
    seoTitle: "Free vs Paid Guest Posting: Costs, Effort and Disclosure",
    description:
      "Compare free and paid guest posting by total effort, editorial scope and disclosure. Understand what the quote covers before choosing a publication.",
    sections: [
      {
        title: "Calculate effort even when there is no placement fee",
        body: "An unpaid contribution still requires research, writing, editing, images and communication with the publication. Estimate those tasks before comparing it with a paid package. Keep cash cost and internal effort separate so your team can see whether an apparently free opportunity fits its capacity. If the publisher requires a highly specialized article, the subject review may take longer than the writing. Do not assume that the absence of a fee means acceptance is easier, revisions are optional or the publication will accept a promotional destination link.",
      },
      {
        title: "Ask which part of the process payment covers",
        body: "A paid quote may cover placement only, writing only or a combination. Request an itemized scope and ask who controls editorial acceptance. Confirm the article format, image requirements, revisions, link qualification, reader disclosure and any agreed timing. A catalogue listing is a starting point for the inquiry, not a description of every production responsibility. Compare quotes for the same deliverable. If one includes a substantial research task and another assumes you supply a finished manuscript, their headline prices are not directly comparable.",
      },
      {
        title: "Avoid hidden exchanges that obscure the relationship",
        body: "A free product, reciprocal benefit or another incentive may create a commercial relationship even without a cash payment. Describe the arrangement honestly to the editor and agree appropriate disclosure and link handling. Do not call a contribution independent when a material benefit is tied to publication. Likewise, do not assume a payment guarantees a favorable editorial view. The article should still provide useful material for the publication's readers. If the offer depends on hiding the relationship or promising ranking credit, pause and reconsider the brief.",
      },
      {
        title: "Choose the opportunity that fits the reader and your capacity",
        body: "Compare audience relevance, editorial quality, the strength of your contribution and total production burden. Record why you chose a route and which terms remain open. A paid placement may be unsuitable despite a clear quote, while an unpaid opportunity may be too demanding for the current team. Use a small, reviewable commitment first. After publication, inspect the article and measure the intended reader action over a stated window. The result should inform your next choice without turning one campaign into a claim about every free or paid publication.",
      },
      {
        title: "Keep a simple comparable scope record",
        body: "For each option, note placement fee, writing responsibility, required evidence, image rights, included revisions, approval process and measurement plan. Put unresolved items in a question column rather than assigning them a zero cost. Ask the editor to confirm the items that would change your decision. This record helps you reject a misleading low-price comparison and gives whoever produces the article a practical handoff.",
      },
    ],
  },
  "guest-posting-for-small-businesses": {
    seoTitle: "Guest Posting for Small Businesses: A Practical Workflow",
    description:
      "Plan a manageable guest posting campaign for a small business. Choose relevant readers, control total costs and turn customer questions into useful articles.",
    sections: [
      {
        title: "Use a real customer question as the starting material",
        body: "Collect questions from sales conversations, support tickets or consultations that you are allowed to use. Remove identifying details and choose one problem you can explain accurately. A small business often has useful practical knowledge without having a research department. Turn that knowledge into a process, checklist or comparison rather than a claim that the business is the best. Ask whether the proposed reader could act on the advice without becoming a customer. That test helps distinguish a useful contribution from an advertisement disguised as an instructional article.",
      },
      {
        title: "Limit the campaign to work your team can approve",
        body: "Name one person who supplies the evidence and one who approves the final draft. Reserve time for editorial questions, image permissions and live-page checking. A publication deadline can interrupt other work, so agree a realistic schedule before accepting it. If you outsource writing, provide a short brief and factual source material instead of expecting the writer to infer how your business works. Keep the scope narrow enough that a delayed review does not cause a rushed or unsupported article.",
      },
      {
        title: "Set a complete spending boundary",
        body: "Include placement, production, review and any applicable additional charges. Ask for an itemized quote and keep unknown costs visible until confirmed. Decide what would make you stop: a publication outside your market, an article angle you cannot substantiate or a total above the approved cap. Do not buy several inexpensive placements simply because their combined headline price fits the budget. Each still creates production and review work. A single relevant contribution with a clear next step can be a more manageable test than a large batch of weakly matched articles.",
      },
      {
        title: "Use a destination that supports a simple next action",
        body: "Send readers to a useful page that continues the article's task, such as a worksheet, detailed service explanation or relevant consultation route. Check the page on a phone and make sure the promised resource is easy to find. Agree campaign parameters with the publisher if you need them and avoid personal details in URL labels. Record observed enquiries and whether they fit your service, not just raw visits. If the result is weak, review the audience and destination before assuming that spending more will solve it.",
      },
    ],
  },
  "check-guest-post-website-traffic": {
    seoTitle: "Check Guest Post Website Traffic Before Choosing a Site",
    description:
      "Check publisher traffic with source, date, channel and audience context. Learn which evidence to request and how to compare estimates before a placement.",
    sections: [
      {
        title: "Normalize the questions, not incompatible numbers",
        body: "For each candidate, ask the same questions: what is counted, over which period, for which property and by which method? Preserve the original unit. Users, sessions and estimated organic visits cannot be combined as if they were equivalent. If only one candidate has a useful report, ask the others for comparable evidence or acknowledge the limitation. Do not create a conversion factor from an unrelated site. Consistent questions help you assess the quality of evidence even when a neat numerical ranking would be misleading.",
      },
      {
        title: "Inspect the pages relevant to the proposed placement",
        body: "A domain-wide figure can be dominated by a tool, news event or section unrelated to your article. Ask which pages and audience segments support the proposed topic. Open recent comparable articles and check whether they serve the same reader task. For a section-specific listing, confirm whether the supplied metric covers the section or the whole domain. Keep the exact URLs and research date. A useful review explains how the evidence connects to your proposed reader instead of treating the largest headline number as the automatic winner.",
      },
      {
        title: "Investigate changes without inventing a cause",
        body: "When a report shows a sharp rise or decline, request comparable periods from the same source and method. Ask whether the publisher changed domain, measurement property or reporting setup. Record the publisher's explanation as a statement, not as independently proven causation. A decline can affect your decision even when its cause is uncertain. A rise does not guarantee demand for your subject. Use the evidence to decide whether to proceed, ask for another report or choose a candidate whose audience fit is better supported.",
      },
      {
        title: "Keep the evidence request proportionate",
        body: "Ask only for the information needed to resolve your decision and respect the publisher's data boundaries. A scoped report may be sufficient without access to an entire analytics account. Redact personal information and avoid storing credentials in your research log. If evidence cannot be supplied, decide whether the remaining case is strong enough for your budget and objective. Do not fill the gap with a fabricated monthly audience or a claim that the traffic has been verified. Record the uncertainty and its effect on the choice.",
      },
    ],
  },
  "guest-posting-for-local-seo": {
    seoTitle: "Guest Posting for Local SEO: Audience and Place Matter",
    description:
      "Evaluate local guest posting opportunities by service area, reader relevance and useful local detail. Plan outreach and measure real enquiries responsibly.",
    sections: [
      {
        title: "Define the service area before researching publications",
        body: "List the locations you can actually serve and the customer problem your article addresses. Then inspect whether a publication covers those communities and subjects. A country field in a catalogue is too broad for many local services. Look for relevant sections, recent local coverage and a contact who can explain the readership. If the publication mainly serves visitors while your offer is for residents, note that mismatch. Your research should connect the reader to the service area, not simply find a geographic word in the domain or page title.",
      },
      {
        title: "Use local detail you can substantiate",
        body: "A helpful contribution might explain a practical process that differs by location or answer a recurring customer question. Verify any rules, prices, opening times or eligibility details with appropriate current sources before including them. Avoid creating a generic article for several cities by replacing place names. If you do not have distinct local knowledge, choose a broader task you can support. Obtain permission before naming a customer or using a project photograph. Label illustrative scenarios so readers do not mistake them for documented local case studies.",
      },
      {
        title: "Connect the article to a relevant destination",
        body: "Use a page that describes the applicable service and area clearly. A reader should not have to infer whether you cover their location. Check the enquiry route and explain what information is needed next. If you use a campaign link, agree it with the publisher and keep URL labels free of personal information. Measure useful local responses where possible, distinguishing out-of-area enquiries from potential customers. Do not treat every referral as a qualified lead or promise that the placement will change map rankings.",
      },
      {
        title: "Review the decision with the right evidence",
        body: "Record the publication section, article angle, service-area fit, accepted quote and live URL. Inspect delivery before assessing performance. Use a stated observation period and note concurrent local advertising or seasonal demand that may affect enquiries. If there is little response, review whether the topic, audience or next step needs improvement. A locally named publication can still be a weak fit for your actual customer. Preserve the reasoning so the next campaign starts from what you learned rather than repeating the same geographic assumption.",
      },
    ],
  },
  "guest-posting-for-ecommerce": {
    seoTitle: "Guest Posting for Ecommerce: Readers, Content and ROI",
    description:
      "Plan ecommerce guest posts around shopper problems, relevant publications and useful destinations. Separate referral observations from unsupported sales claims.",
    sections: [
      {
        title: "Choose the shopper's decision before the product link",
        body: "Identify whether the reader is learning a task, comparing options, selecting a product or maintaining something they own. Match the contribution to that stage. A care guide needs useful instructions and limitations; a comparison needs fair criteria and suitable alternatives. Do not begin with a product URL and force an unrelated article around it. Ask whether the publication serves the relevant shopper and whether the proposed section supports that kind of explanation. A broad lifestyle audience may be less useful than a narrower publication with a clear connection to the purchase context.",
      },
      {
        title: "Check the destination as part of the brief",
        body: "Open the landing page on a phone and verify that it continues the task promised by the anchor. Confirm product availability, market coverage and any claims repeated from the article. If the contribution teaches a process, a supporting guide or comparison page may be more appropriate than a product category. Record who maintains the destination if products change after publication. Avoid linking to a temporary offer without discussing what happens when it expires. The article should remain understandable when a campaign promotion ends.",
      },
      {
        title: "Use product evidence without inventing customer outcomes",
        body: "Provide specifications, permitted images, documented demonstrations and clear limitations. Do not create a review, testimonial or sales increase to make the contribution persuasive. If you compare products, explain the criteria and disclose relevant commercial relationships. Ask a product specialist to review technical statements before handoff. For an illustrative calculation, state the assumed values and show the arithmetic so readers can substitute their own numbers. Keep hypothetical revenue separate from actual observed sales in campaign reporting.",
      },
      {
        title: "Review commercial response with a clear attribution limit",
        body: "Record the reporting window, tracked visits, meaningful actions and known costs. Separate completed orders from enquiries and assisted activity. Returns, repeat purchases and margin can affect the business interpretation, so avoid equating gross sales with profit. Note other campaigns that reach the same shoppers. If tracking loses source information, explain that limitation rather than crediting every later order to the article. Use the review to improve the publication match, contribution or destination, not to announce a universal guest posting ROI.",
      },
    ],
  },
  "measure-guest-posting-results": {
    seoTitle: "Measure Guest Posting Results and ROI Without Guesswork",
    description:
      "Measure guest posting delivery, referrals and business outcomes with a clear reporting window. Calculate ROI from known inputs and explain attribution limits.",
    sections: [
      {
        title: "Define the measurement record before publication",
        body: "Save the publication, proposed article, destination, intended reader action, campaign labels and observation window. Check that the action can actually be measured with your setup and permissions. Record known cost separately from expected cost. Assign someone to inspect the live URL and someone to review the reader response. A written plan prevents you from choosing whichever metric looks strongest afterward. It also makes a weak result useful: you can compare what happened with the original objective instead of inventing a new success criterion after the campaign ends.",
      },
      {
        title: "Keep delivery, engagement and commercial value separate",
        body: "Delivery concerns the agreed article and its elements. Engagement concerns observed visits or use of the resource. Commercial value concerns qualified enquiries, sales or another defined outcome. Do not add these into one score that hides what happened. An article may meet the delivery agreement and produce limited response. Another may generate enquiries that are outside your service area. These are different lessons. Preserve the counts and definitions so a colleague can understand the result without relying on a label such as successful placement.",
      },
      {
        title: "Calculate only from inputs you can support",
        body: "For a financial return calculation, identify the value attributed to the campaign, the costs included and the attribution method. If you have only revenue, do not label it profit. If staff time is excluded from a cash-cost calculation, say so. A hypothetical worksheet can demonstrate the formula, but it must remain separate from actual results. With very small counts, avoid presenting an unstable conversion percentage as a dependable forecast. Report the underlying observations and describe what additional evidence would make a larger investment more defensible.",
      },
      {
        title: "Make the report end in a decision",
        body: "Choose repeat, revise, investigate or stop and give a reason tied to the evidence. A revise decision should name the next variable: a more relevant section, a clearer article promise or a better destination. An investigate decision should identify the missing report or tracking issue. Note concurrent marketing, site changes and seasonal events that could affect the result. Do not claim a single placement caused a broad ranking change from a simple before-and-after comparison. A useful report helps allocate the next budget without overstating causation.",
      },
    ],
  },
  "guest-posting-mistakes": {
    seoTitle: "Guest Posting Mistakes: Fix Your Brief Before Publishing",
    description:
      "Avoid common guest posting mistakes in publisher selection, pricing, briefs and delivery checks. Use specific corrections instead of chasing scores or promises.",
    sections: [
      {
        title: "Mistake: treating a directory field as complete evidence",
        body: "A category, country or traffic figure can help you find candidates, but it does not answer every audience question. Open the proposed section and current articles. Ask what an important metric counts and when it was observed. Keep your conclusion proportional to the source. Correct the process by adding an evidence column to the shortlist, with the exact URL or report supporting each important decision. If the source is missing, create a question for the publisher rather than filling the field with a confident inference.",
      },
      {
        title: "Mistake: letting production begin before the scope is settled",
        body: "A writer needs an accepted reader, angle, format and evidence packet. If the publication later wants a different topic, the work may become a new assignment rather than a minor revision. Correct this by getting outline acceptance and a written quote before commissioning the full draft. Name the approvers and revision boundary. Keep the latest agreed version visible to everyone involved. When the brief changes, explain the effect on cost and timing instead of assuming the writer or editor will absorb it silently.",
      },
      {
        title: "Mistake: confusing a low fee with a low total cost",
        body: "Placement only can leave research, writing, images and editorial coordination with your team. A package can still exclude specialist review or additional revisions. Correct the comparison with an itemized scope table and separate internal-effort column. Keep unknown charges visible until confirmed. If the accepted total exceeds the budget, change the plan before proceeding. Do not erase known costs to make a preferred publication appear affordable. The useful comparison is the complete deliverable your campaign needs.",
      },
      {
        title: "Mistake: calling delivery a business result",
        body: "A live URL confirms a publication event, subject to checking its actual content and agreed elements. It does not establish qualified traffic, sales or a ranking effect. Correct the reporting process by using separate delivery and performance records. Inspect the page, resolve discrepancies and review the intended action over a stated period. Record tracking limits and other marketing activity. If the campaign underperforms, identify what to change or stop. An honest weak result is more useful than a fabricated success metric.",
      },
    ],
  },
  "guest-posting-checklist": {
    seoTitle: "Guest Posting Checklist: From Shortlist to Live Article",
    description:
      "Use a guest posting checklist covering publisher fit, accepted scope, evidence, rights and live-page checks. Assign owners and stop conditions at each gate.",
    sections: [
      {
        title: "Make each checklist item produce evidence",
        body: "Replace checked boxes such as quality confirmed with a specific record: section URL reviewed, article examples saved, guideline date recorded or editor response attached. A colleague should be able to inspect the result without repeating the whole task. Keep the checklist proportional to the placement and subject. A simple article may need a compact evidence packet, while a technical contribution may need a specialist review. The purpose is to expose unresolved decisions before handoff, not to create a decorative score that implies a publication has been certified.",
      },
      {
        title: "Assign an owner and a stop condition to each gate",
        body: "For publisher fit, name the person who reviews the audience and proposed section. For scope, name the person who accepts the quote and revision terms. For accuracy and rights, identify who checks claims and image permissions. For publication, identify who inspects the live page. Add a stop condition, such as an unresolved evidence claim or a changed total above the cap. A checklist without responsibility can leave everyone assuming someone else has approved the important detail.",
      },
      {
        title: "Use a final handoff record rather than scattered approvals",
        body: "Collect the approved manuscript, source log, images and permissions, author details, destination link and commercial instructions in one packet. Label the final version and resolve open comments. Link the accepted outline and quote. Include the contact for editorial questions and the recipient for the live URL. If any material condition changes, reopen the relevant gate instead of treating an old approval as covering a new article or publication. This keeps the check useful when work crosses between buyer, writer, intermediary and editor.",
      },
      {
        title: "Close the checklist after inspecting the published result",
        body: "Compare the live page with the accepted brief, including content, images, attribution, destination, anchor, visible disclosure and link relationship. Record the date and any correction request. Recheck corrections before closing delivery. Start a separate performance review using the agreed observation window and reader action. Do not mark a campaign effective solely because the article was published correctly. The checklist confirms that work and decisions were completed; the performance record explains what the audience did afterward.",
      },
    ],
  },
  "guest-post-cost": {
    seoTitle: "Guest Post Costs: Compare Placement, Writing and Scope",
    description:
      "Compare guest post costs with itemized placement, writing and revision budgets. Use real catalogue prices carefully and request a quote for your actual brief.",
    sections: [
      {
        title: "Compare the same scope before comparing the price",
        body: "Send each provider the same publication, article angle, expected depth and production requirements. Ask whether the quote includes placement, writing, images, research, review and revisions. A low placement-only figure and a full production package describe different deliverables. Record currency, quote date and any applicable charges. Keep unknown amounts blank with an action to confirm them; do not convert uncertainty into a zero. The resulting table should let you see both the supplier payment and the work that remains with your own team.",
      },
      {
        title: "Use a complete illustrative budget",
        body: "Suppose an example quote includes USD 200 for placement, USD 80 for writing and USD 20 for licensed images. The stated external cost is USD 300 before any other applicable charges. If your approved cap is USD 280, you need a scope change or a different publication before acceptance. You could supply suitable images with documented rights, but you cannot simply delete a confirmed charge from the worksheet. Record internal review time separately if it is not a supplier payment. These assumed values demonstrate the method; they are not market averages or a Name Retailer offer.",
      },
      {
        title: "Check what changes the quote",
        body: "Ask whether a longer article, new topic, extra image work or additional revision would require a revised price. Define the difference between correcting an error and changing the accepted brief. Confirm who approves a scope change and keep the revised quote with the original. This helps prevent a production team from agreeing work informally while the buyer still expects the earlier total. If the publication changes, reassess the whole scope because its audience, guidelines and commercial terms may differ even when the listed placement price is similar.",
      },
      {
        title: "Interpret a catalogue distribution as context",
        body: "A distribution describes the active records included in that snapshot. It does not establish completed transaction prices or explain why a particular publisher charges more. Compare candidates within relevant topic and language groups, then inspect audience and editorial fit. A median is a descriptive midpoint, not a fair-price certification. Keep the snapshot date visible and distinguish a catalogue record update from a supplier's metric observation date. Ask for a current quote before using a shortlist total as the amount your campaign will spend.",
      },
      {
        title: "Budget for a decline or delayed acceptance",
        body: "Confirm the applicable cancellation, rejection and refund terms before paying for a service. Ask what happens to writing already completed if the publisher declines the finished article, and whether an alternative publication requires a new quote. Do not assume a universal refund rule from another provider. Name Retailer's existing policy contains claims flagged for owner confirmation; obtain the terms that apply to your quote. A desired publication date should also be confirmed for the actual brief rather than inferred from a generic turnaround field.",
      },
      {
        title: "Review value with the reader and objective in view",
        body: "A higher price does not prove stronger editorial quality or a predictable search benefit. Ask what useful reader access and agreed deliverables the placement offers. Consider whether you can produce a contribution that belongs in that section and whether the destination continues its task. If the case depends only on a domain score, return to publisher research before increasing the budget. Keep a decision note explaining why a candidate was selected and what evidence would make you reconsider. That note is more useful than a price ranking without context.",
      },
      {
        title: "Reconcile the accepted quote after publication",
        body: "Record the final charge, any approved changes and the delivered URL. Compare the amount with the accepted version of the scope, then explain variances with specific causes. Keep delivery checking separate from performance reporting. You can confirm the agreed article was published without claiming a financial return. For a later campaign, use your own recorded production effort and actual charges to improve planning, while acknowledging that one placement does not establish a general market rate or guarantee the next campaign's cost.",
      },
    ],
  },
  "guest-post-vs-link-insertion": {
    seoTitle: "Guest Post vs Link Insertion: Compare Scope and Reader Fit",
    description:
      "Compare a new guest post with a link insertion by reader value, context, editorial control and total scope. Confirm paid-link terms before requesting a quote.",
    sections: [
      {
        title: "Start with the page the reader will actually use",
        body: "For a new guest post, assess whether the proposed article adds a useful explanation to the publication. For an insertion, read the existing page and identify the exact sentence where the destination would help. A contextual addition should improve the reader's task rather than create an awkward detour. Ask whether the editor will update surrounding text and check the destination. An old page's headline metrics do not establish that the specific article is relevant or currently read. Save the exact URL and proposed context before comparing the commercial options.",
      },
      {
        title: "Compare production and approval responsibilities",
        body: "A new article usually needs an accepted outline, manuscript, evidence, images and editorial review. An insertion may involve less writing but still requires an appropriate existing page, a justified destination and approval of the change. Request an itemized scope for each. Confirm who controls the wording, whether the article can be edited later and how corrections are handled. Do not assume an insertion is automatically cheaper or faster. The actual quote and agreement determine the work, and a publication may not offer both formats.",
      },
      {
        title: "Inspect the surrounding content and commercial relationship",
        body: "Read the whole relevant passage, not just the proposed anchor. Check whether the destination supports the claim or gives the reader a useful next step. If payment or another benefit is involved, discuss visible disclosure where applicable and paid-link qualification. Do not ask an editor to hide the relationship or to guarantee ranking credit. A new article and an insertion can both be sponsored arrangements. Changing the format does not remove the need to understand the commercial terms or evaluate the reader value.",
      },
      {
        title: "Use a decision record for the format choice",
        body: "Write down the reader task, proposed context, production burden, agreed price and unresolved questions for each option. Choose the format that supplies a useful contribution with a scope your team can support. If no existing article provides a natural context, do not force an insertion solely to obtain a link. If a strong existing explanation only needs a relevant resource, a full new article may duplicate work. The decision should follow the content gap and editor's agreement rather than a universal claim that one format is superior.",
      },
      {
        title: "Check the published change against the accepted version",
        body: "For an insertion, inspect the exact article, surrounding wording, anchor, destination and link attributes. For a new guest post, inspect the entire delivered article and agreed elements. Record the URL and inspection date, then request specific corrections for discrepancies. Keep performance observations separate from delivery. An accessible page does not prove indexing or future referral traffic. If the existing article later changes substantially, record the change and use the actual agreement when discussing any remedy with the publication.",
      },
    ],
  },
  "da-vs-dr-and-traffic": {
    seoTitle: "DA vs DR vs Traffic: A Guide for Guest Post Site Buyers",
    description:
      "Understand DA, DR and traffic estimates when comparing guest post sites. Keep provider, date, audience and property scope visible in your shortlist decisions.",
    sections: [
      {
        title: "Keep each provider's observation intact",
        body: "Use separate columns for DA, DR and traffic, with the source and observation date. Do not average scores or convert one into another using an improvised formula. If you rank candidates by one metric, use that metric consistently and keep missing observations out of the ranking rather than assigning zero. A reproducible sorting rule is useful, but it does not turn the score into proof of editorial quality or audience fit. Preserve the original supplied value when your later research produces a different observation, and explain the scope or date difference.",
      },
      {
        title: "Match the metric to the property being offered",
        body: "A root domain, subdomain and section can represent different opportunities. Record the exact listed URL and ask which property the report covers. A section-specific placement should not inherit every assumption attached to the whole website. Open current articles in the proposed section and assess their reader task and quality. If the supplier cannot explain the metric's scope, use it cautiously or exclude it from the numerical comparison. The purpose is to understand the proposed placement, not to borrow a large domain's reputation without inspecting where your article would appear.",
      },
      {
        title: "Ask what traffic means before interpreting its scale",
        body: "Determine whether the figure counts users, sessions, page views or an estimated search channel. Record the reporting period and relevant locations. A whole-site annual count cannot be compared directly with a monthly organic estimate. Ask for a scoped report when the distinction changes your spending decision. Inspect whether popular pages relate to your proposed subject; a free tool can dominate activity on a site whose sponsored section serves few relevant readers. Avoid calculating expected article visits from a domain-wide number without an appropriate basis.",
      },
      {
        title: "Use disagreements to guide research",
        body: "Two tools can show different patterns because their datasets, methods and observation dates differ. Instead of declaring one score true and the other wrong, identify which unresolved question matters to your campaign. You may need current section examples, a dated traffic report or an explanation of the domain history. Keep the publisher's explanation separate from independently observed evidence. If the placement is a poor reader fit, more metric research may not be worth the effort. Reject that candidate and spend the research time on a stronger one.",
      },
    ],
  },
  "vet-a-guest-post-site": {
    seoTitle: "How to Vet a Guest Post Site Before Requesting Placement",
    description:
      "Evaluate guest post publishers with a repeatable review of reader fit, current articles, traffic evidence and commercial scope. Includes a decision record.",
    sections: [
      {
        title: "Start with a specific contribution and intended reader",
        body: "Write the reader's role, problem and desired outcome before opening the catalogue. Then review whether the publication's proposed section serves that task. A broad category match is only a starting point. Read several recent articles and record their intended reader and level of detail. Your proposed contribution should add something useful within that context. If you cannot explain the connection without referring to a domain score, the fit needs more work. Keep the article URLs and review date so a colleague can inspect the reasoning.",
      },
      {
        title: "Review editorial substance with a consistent sample",
        body: "Inspect comparable pages for clear explanations, supported claims, appropriate attribution and useful examples. Describe concrete problems instead of assigning vague quality labels. An unsupported factual claim is different from a style you dislike. Ask how submissions are reviewed and how factual corrections are handled. The answer should explain a process relevant to your contribution. Use the same sampling method across candidates so one publication does not benefit from a more favorable selection of pages. A small sample has limits, and your notes should preserve those limits.",
      },
      {
        title: "Check the audience evidence that affects your decision",
        body: "Ask what a traffic figure measures, its source, period and exact property. Separate listing country from readership geography. If your business serves only one market, request evidence relevant to that market. For a section listing, confirm whether the report covers the section or the whole domain. Avoid calling an undated estimate current or treating a large domain-wide figure as guaranteed exposure for your article. If the evidence is unavailable, decide whether the remaining case is strong enough for your budget instead of filling the gap with assumptions.",
      },
      {
        title: "Confirm the actual commercial scope",
        body: "Request placement and production prices separately. Ask about writing, images, revisions, acceptance, timing and applicable cancellation or refund terms. Confirm visible disclosure and link qualification for a paid arrangement. Preserve the actual editor's response when an intermediary handles the conversation. A generic package description may not explain the requirements of the selected publication. If the quoted section or article angle changes, revisit the review because the original fit and scope may no longer apply. Keep the accepted quote with the brief used by the writer.",
      },
      {
        title: "Use a clear proceed, pause or reject decision",
        body: "Proceed when the audience, contribution and commercial agreement are sufficiently clear for your objective and budget. Pause when a specific question can be resolved, such as the section URL or revision boundary. Reject when the opportunity fails a requirement, relies on hidden sponsorship or is sold mainly through guaranteed rankings. Record the reason and the evidence supporting it. These categories describe your campaign decision at a particular time; they are not a public certification of the publication or a claim that every future contribution would be suitable.",
      },
      {
        title: "Give a second reviewer an inspectable record",
        body: "Use a compact review note containing the publication and section, proposed angle, sample URLs, metrics with source and date, commercial questions and final decision. Link supporting material instead of copying large reports into the note. Ask the reviewer to challenge the weakest assumption: readership location, article fit, unclear cost or production capacity. Resolve that issue before commissioning the manuscript. A second review is useful when it improves a concrete decision; adding a badge saying reviewed without explaining the work would not help the buyer.",
      },
      {
        title: "Reopen the review when the proposed placement changes",
        body: "A new section, different destination, changed price or revised article subject can invalidate the original assessment. Record the change and revisit the relevant evidence. After publication, inspect the live article and compare it with the accepted brief. Keep any later removal or correction discussion tied to the actual agreement. Evaluate reader response separately using a stated reporting window. This closes the research loop and gives your team evidence for the next shortlist without pretending that vetting can guarantee rankings, traffic or permanent availability.",
      },
    ],
  },
  "paid-guest-posts-google-link-policies": {
    seoTitle: "Paid Guest Posts and Google Link Policies: Buyer Guide",
    description:
      "Understand Google's paid-link guidance when considering guest posts. Ask publishers about disclosure, link qualification and scope without promising rankings.",
    sections: [
      {
        title:
          "Separate the article's usefulness from the commercial relationship",
        body: "An article can be useful and still be sponsored. Evaluate the explanation, evidence and audience fit on their merits while describing the payment relationship honestly. Do not label a paid contribution independent merely because the prose is educational. Ask the publication how readers will recognize the arrangement and how the destination link will be qualified. Keep those answers in the accepted brief. Paying for writing alone and paying a publisher for placement are different arrangements, so explain which benefits are exchanged rather than relying on a vague label such as collaboration.",
      },
      {
        title: "Ask the publisher two separate implementation questions",
        body: "First ask where the visible sponsorship explanation will appear. Then ask what relationship attribute will be applied to the paid link. A reader-facing label and the HTML relationship serve different purposes. If an intermediary handles the quote, obtain confirmation that applies to the actual publication and section. Do not infer implementation from a package name or from the appearance of an unrelated article. Preserve the answer so the live-page check can compare a specific agreement with what was published.",
      },
      {
        title: "Respond to offers built around guaranteed search results",
        body: "Pause a quote that promises a fixed ranking gain or presents an unqualified paid link as its central value. Ask for a clearly described advertising placement and assess whether its audience and article context justify the cost. Do not seek a way to hide the relationship or negotiate away the publisher's qualification policy. If the commercial case disappears without a promise of ranking credit, revisit the campaign objective. A placement can have reader and referral value, but that value needs its own reasoning and measurement rather than an unsupported search guarantee.",
      },
      {
        title: "Inspect the published link and surrounding context",
        body: "Open the live article and confirm the destination, anchor and visible disclosure. Inspect the HTML relationship on the relevant link, using browser tools or a method you understand. Record the URL and inspection date. If the published result differs from the agreement, send a precise correction request and recheck the page afterward. Do not mark a correction complete solely because someone says it was made. A technically accessible article still does not establish indexing, search display or future referral volume; those are separate observations.",
      },
      {
        title: "Keep a policy source with the buying decision",
        body: "Link the current primary guidance you used and record the date checked. Summarize only the point relevant to the placement, then distinguish your own campaign judgment from the source's statement. Avoid turning an external policy link into a badge that certifies a provider or every article on its site. Revisit the guidance when the arrangement changes or a material policy question arises. If you cannot explain how the proposed relationship is being represented, resolve that before accepting the quote instead of assuming an intermediary's general reassurance is sufficient.",
      },
      {
        title: "Use the article's reader value to set an honest objective",
        body: "Choose an action the contribution can reasonably support, such as helping readers use a resource, understand a process or make a relevant enquiry. Select a destination that continues that task and confirm any campaign parameters with the editor. Record observed responses over a defined period and include tracking limits. Keep delivery checking separate from performance. An article can meet its editorial and commercial agreement while producing little response, and that is a useful campaign result to review without inventing a ranking explanation.",
      },
      {
        title: "Document a decision to decline an unsuitable offer",
        body: "Write the publication, proposed section, offered terms and the requirement that was not met. A short record helps colleagues avoid reopening the same unresolved purchase. You do not need to accuse the publication of misconduct to decide it is unsuitable for your campaign. If the editor later offers a different, clearly described arrangement, review that proposal on its actual terms. The goal is a defensible buying decision with transparent commercial expectations, useful content and evidence proportional to the claims you publish.",
      },
    ],
  },
  "guest-post-vs-sponsored-post": {
    seoTitle: "Guest Post vs Sponsored Post: Scope and Disclosure Guide",
    description:
      "Understand how guest posts and sponsored posts overlap. Compare authorship, commercial relationships, writing scope and disclosure before a placement inquiry.",
    sections: [
      {
        title: "Describe authorship and payment as separate facts",
        body: "Guest post describes who contributes the article. Sponsored post describes a commercial relationship. A contribution can be both, and the label alone does not explain who writes it or what the publisher will approve. In your inquiry, state whether you are offering an unpaid editorial article or asking about a paid placement. Explain any other benefit exchanged. This helps the editor apply the relevant process and prevents your team from assuming that a familiar format name settles disclosure, rights or link handling.",
      },
      {
        title: "Compare the actual deliverable instead of the package name",
        body: "Request the publication and section, article scope, writing responsibility, evidence requirements, images, review, revisions and price. Ask who approves the finished manuscript and what happens if the proposed angle changes. Two providers can use the same package label for different work. Keep the quote itemized so a placement-only offer is not compared with a full production package. A clear deliverable gives the writer an actionable brief and gives the buyer something specific to inspect after publication.",
      },
      {
        title: "Agree how the relationship appears to readers",
        body: "Ask where the commercial explanation will appear and how paid links will be qualified. Preserve the publication's answer for the actual section. Do not assume that an educational article is exempt from commercial transparency or that an author biography explains the sponsorship by itself. If the editor proposes a label you do not understand, ask for an example of how it will appear. Avoid paying for an arrangement whose selling point depends on readers or search systems being unable to recognize the commercial relationship.",
      },
      {
        title: "Review content value and commercial delivery separately",
        body: "Before acceptance, assess whether the article serves the publication's readers and offers a useful next step. After publication, check the agreed text, images, attribution, links and disclosure. Then review reader response over a stated window with the measurement limitations visible. A sponsored label does not guarantee reach, and an unpaid contributor label does not guarantee acceptance or referrals. Keep the decision tied to the actual audience, contribution and scope rather than assuming one format is inherently more credible or effective.",
      },
    ],
  },
};

export const mainGuideSlugs = new Set([
  "guest-posting-for-beginners",
  "guest-post-outreach-templates",
  "guest-posting-strategy",
  "guest-post-cost",
  "vet-a-guest-post-site",
  "paid-guest-posts-google-link-policies",
]);

export function expandBuyerGuide(guide: BuyerGuide): BuyerGuide {
  const extra = guideExpansions[guide.slug];
  if (!extra) return { ...guide, approved: false };
  const faq = [...(guide.faq || [])];
  for (const item of extra.faq || [])
    if (!faq.some(([question]) => question === item[0])) faq.push(item);
  if (faq.length < 3)
    faq.push([
      "What should I include in a placement inquiry?",
      "Send the publication, reader, article idea, website URL, proposed anchor, total budget and questions about the scope. Keep the accepted quote and editorial brief together.",
    ]);
  if (faq.length < 3)
    faq.push([
      "What should I check after publication?",
      "Inspect the live article, agreed links, images, attribution and disclosure. Record the date and verify any requested correction before closing delivery.",
    ]);
  if (faq.length < 3)
    faq.push([
      "Does publication guarantee a business result?",
      "No. Check delivery against the accepted brief, then review observed reader actions over a stated period. Keep tracking limitations and other marketing activity visible.",
    ]);
  const additions: Record<string, { title: string; body: string }> = {
    "guest-posting-for-beginners": {
      title: "Keep the first handoff simple",
      body: "Give the writer and editor one approved brief, one manuscript and one source packet. Label the version and identify the person who answers questions. When feedback arrives, consolidate it before requesting changes. This prevents a first campaign from becoming a confusing collection of documents whose approval status nobody can explain. Keep the live-page check assigned to a named person too.",
    },
    "guest-post-outreach-templates": {
      title: "Check the recipient and attachment policy",
      body: "Use the contact route the publication currently specifies. If it asks for a form or prohibits attachments, follow that process. Confirm that your proposed sample is accessible without sharing private credentials or confidential customer material.",
    },
    "guest-posting-strategy": {
      title: "Use the review to allocate the next block of effort",
      body: "List the work required by each possible next step. Improving a destination may need product input, while another article may need research and an available editor. Compare those requirements with the team's actual capacity. Choose one next action and name its owner. Keep the campaign record available so the decision can be revisited when new evidence arrives. This links the strategy to work the team can complete instead of ending with an abstract recommendation to publish more content or obtain more links.",
    },
    "paid-guest-posts-google-link-policies": {
      title: "Keep commercial instructions out of reader-facing prose",
      body: "Give the editor the disclosure and link instructions in a separate handoff note. Check that private negotiation comments are removed from the manuscript. The final article should explain its subject clearly while presenting the actual commercial relationship accurately to readers.",
    },
    "guest-posting-for-small-businesses": {
      title: "Name the person who closes delivery",
      body: "Assign the live-page inspection before publication so checking the agreed article is not lost among daily business tasks.",
    },
    "guest-posting-for-local-seo": {
      title: "Record out-of-area responses separately",
      body: "A referral outside your service area is an observation, but it should not be reported as a qualified local enquiry.",
    },
  };
  const added = additions[guide.slug];
  const related = [
    ...(guide.related || []),
    ["Compare guest posting sites by niche", "/guest-posting-sites/"],
    ["Review current placement prices", "/guest-post-prices/"],
    ["Count words in your manuscript", "/word-counter/"],
  ] as Array<[string, string]>;
  return {
    ...guide,
    answer: directAnswer(guide.answer),
    seoTitle: extra.seoTitle,
    description: extra.description,
    sources: guide.sources.filter(([, url]) =>
      [
        "https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links",
        "https://developers.google.com/search/docs/essentials/spam-policies#link-spam",
        "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
        "https://support.google.com/analytics/answer/10917952",
        "https://ahrefs.com/seo/glossary/domain-rating",
        "https://moz-static.s3.amazonaws.com/products/landing-pages/announcements/Authority_Scoring_Guide.pdf",
        "https://help.ahrefs.com/en/articles/1863206-what-is-organic-traffic-in-ahrefs-and-how-do-we-calculate-it",
      ].includes(url),
    ),
    author: "Fahad Shaikh",
    reviewer: undefined,
    approved: true,
    updatedAt: Date.parse(guide.updatedAt) > Date.parse("2026-10-19") ? guide.updatedAt : "2026-10-19",
    sourcesCheckedAt: "2026-10-19",
    questions: [
      ...guide.questions,
      ...extra.sections,
      ...(added ? [added] : []),
    ],
    faq: faq.slice(0, 5),
    related: [
      ...new Map(
        related
          .filter(([, path]) => path !== `/guides/${guide.slug}/`)
          .map((item) => [item[1], item]),
      ).values(),
    ].slice(0, 6),
  };
}
