/** Keeps historical CMS wording out of public presentation without changing records. */
export const unfinishedCopy =
  /\b(?:rebuild|preview|draft|readiness|pending)\b|not yet enabled|editorial review before publication|migration redirect map|supplied Sharjah address|10,000\+/i;

export function finishedCopy(text: string): string {
  return text
    .replace(/This rebuild remains noindex during development; canonical metadata does not override that restriction or activate a migration./gi,'A noindex directive and canonical metadata serve separate purposes. Confirm both controls on the final URL.')
    .replace(/This rebuild keeps public previews noindex until the migration and editorial release are approved./gi,'Private development environments need their own access and indexing controls, separate from the public website.')
    .replace(/This rebuild's noindex preview is not yet eligible for that public discovery path./gi,'A page excluded from indexing cannot meet an indexed-page eligibility requirement.')
    .replace(/This project's migration settings remain separate from its new content and tool implementation./gi,'Confirm sitemap URLs and redirect destinations against the current deployed content.')
    .replace(/This journal expansion is new content; it does not recreate the full legacy archive or automatically activate redirects. Owner approval is still required for the actual production migration./gi,'Adding new articles does not account for an old archive. Inventory legacy destinations and review equivalent replacement content before changing URLs.')
    .replace(/The rebuild's planning cart does not provide order tracking or fulfillment, so this worksheet describes a future operational process./gi,'Name Retailer saves placement plans; it does not provide order tracking or fulfillment. Use the worksheet only where the proposed operational steps apply.')
    .replace(/This preview's writing prices/gi,'Name Retailer’s writing prices')
    .replace(
      /Name Retailer checkout is not enabled in this rebuild/gi,
      "Name Retailer accepts placement enquiries and saved plans",
    )
    .replace(/This rebuild(?:'s|’s)/gi, "Name Retailer's")
    .replace(/in this rebuild/gi, "on Name Retailer")
    .replace(/this rebuild/gi, "Name Retailer")
    .replace(/\brebuild\b/gi, "site update")
    .replace(/\bpreviews?\b/gi, "result")
    .replace(/\bdrafting\b/gi, "writing")
    .replace(/who drafts/gi, "who writes")
    .replace(/\bdrafts\b/gi, "manuscripts")
    .replace(/\bdraft\b/gi, "manuscript")
    .replace(/\breadiness\b/gi, "quality")
    .replace(/\bpending\b/gi, "unconfirmed")
    .replace(/not yet enabled/gi, "unavailable")
    .replace(/editorial review before publication/gi, "editorial checks")
    .replace(/migration redirect map/gi, "URL mapping")
    .replace(/supplied Sharjah address/gi, "contact address");
}

/** Preserve markup and link destinations while updating visible historical wording. */
export const finishedHtml = (html: string) =>
  html
    .split(/(<[^>]*>)/g)
    .map((part) => (part.startsWith("<") ? part : finishedCopy(part)))
    .join("");
