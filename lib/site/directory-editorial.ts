type Editorial = {
  sections: Array<{ title: string; body: string }>;
  resources: Array<[label: string, path: string]>;
};

// These additions describe selection work, not newly verified inventory.
export const directoryEditorial: Record<string, Editorial> = {
  "saas-guest-posting-sites": {
    sections: [
      {
        title: "Example: match a SaaS article to the adoption decision",
        body: "A fictional monitoring tool could offer a reproducible incident-response tutorial to a developer publication, or an operations checklist to a founder audience. Choose the version that serves the reader instead of repeating a product pitch across both. Verify technical steps against the version discussed, remove credentials from screenshots and agree a useful destination. Track observed trials or qualified enquiries separately from a supplied domain score; the example is a planning scenario, not evidence of customer results.",
      },
    ],
    resources: [
      ["Build an audience-led strategy", "/guides/guest-posting-strategy/"],
      [
        "Measure qualified trials and enquiries",
        "/guides/measure-guest-posting-results/",
      ],
    ],
  },
  "technology-guest-posting-sites": {
    sections: [
      {
        title: "Prepare a technical evidence pack",
        body: "For a tutorial, record the tested environment, relevant software version, reproducible steps and any limitations. For a product comparison, explain what was actually evaluated and distinguish observations from supplier claims. Confirm rights for screenshots and remove personal information or access tokens. Ask the editor whether the proposed depth fits the intended section before writing. A Technology category or supplied traffic figure cannot establish that technical reviewers or the right readers are available.",
      },
    ],
    resources: [
      ["Write an evidence-based guest article", "/guides/write-a-guest-post/"],
      [
        "Check publisher traffic evidence",
        "/guides/check-guest-post-website-traffic/",
      ],
    ],
  },
  "business-guest-posting-sites": {
    sections: [
      {
        title: "Turn a business topic into a practical contribution",
        body: "A fictional small-business adviser could propose a process for comparing supplier quotes, with a clearly labeled hypothetical worksheet. Separate factual sources, assumptions and interpretation; do not present illustrative savings as measured client results. Confirm whether the publication serves owners, finance professionals or job seekers before selecting the angle. If the subject requires specialist judgment, agree the appropriate review with the editor rather than assuming a Business category establishes expertise.",
      },
    ],
    resources: [
      [
        "Guest posting for small businesses",
        "/guides/guest-posting-for-small-businesses/",
      ],
      [
        "Agree submission requirements",
        "/guides/guest-post-submission-guidelines/",
      ],
    ],
  },
  "health-guest-posting-sites": {
    sections: [
      {
        title: "Request the editorial review process before committing",
        body: "Ask who will check any health claims, which evidence standards apply and whether the contributor's relevant qualifications will be visible. Confirm a correction contact and how sources will be presented. Distinguish a person's experience from evidence that an intervention produces a general outcome. A Health, Beauty or Sports category does not establish medical expertise or approval of a supplement claim. If competent review or adequate evidence is unavailable, change the subject or pause the placement.",
      },
    ],
    resources: [
      [
        "Confirm evidence and review requirements",
        "/guides/guest-post-submission-guidelines/",
      ],
      [
        "Evaluate the publisher's editorial standards",
        "/guides/vet-a-guest-post-site/",
      ],
    ],
  },
  "travel-lifestyle-guest-posting-sites": {
    sections: [
      {
        title: "Plan the article around season, place and permissions",
        body: "For a fictional packing guide, distinguish first-hand observations from general advice and identify when any location-specific details were checked. Confirm that photos are yours to license and that identifiable people have appropriate permissions. Ask about seasonal publication timing and the intended reader geography rather than assuming a travel category provides either. If the article links a store, ensure the destination is available to that audience and remains useful when individual products change.",
      },
    ],
    resources: [
      [
        "Plan an e-commerce guest article",
        "/guides/guest-posting-for-ecommerce/",
      ],
      ["Review the publishing checklist", "/guides/guest-posting-checklist/"],
    ],
  },
  "guest-posting-sites-usa": {
    sections: [
      {
        title: "Verify the part of the US audience you need",
        body: "A national audience and a city service area are different requirements. Ask for the relevant geographic breakdown and reporting period when location drives the budget. For a fictional regional service business, inspect local coverage and relevant articles rather than choosing solely from the supplied United States field. Record what the evidence actually shows, what remains unknown and whether your destination serves those readers. The directory does not independently certify US readership or state-level reach.",
      },
    ],
    resources: [
      ["Plan local audience relevance", "/guides/guest-posting-for-local-seo/"],
      [
        "Check traffic scope and geography",
        "/guides/check-guest-post-website-traffic/",
      ],
    ],
  },
};
