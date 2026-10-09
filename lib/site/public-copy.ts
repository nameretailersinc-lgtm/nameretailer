/** Keeps historical CMS wording out of public presentation without changing records. */
export const unfinishedCopy =
  /\b(?:rebuild|preview|draft|readiness|pending)\b|not yet enabled|editorial review before publication|migration redirect map|supplied Sharjah address|10,000\+/i;

export function finishedCopy(text: string): string {
  return text
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
