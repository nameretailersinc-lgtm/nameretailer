/** DNS presentation-form length, after the browser's IDNA conversion. No lookup. */
export function domainLength(input: string) {
  const value = input.trim().replace(/\.$/, "");
  if (!value || value.length > 2048 || /[\s/:?#@%\\]/u.test(value))
    throw new Error(
      "Enter a domain only, such as example.com, without a URL or path.",
    );
  let ascii: string;
  try {
    ascii = new URL(`https://${value}`).hostname.toLowerCase();
  } catch {
    throw new Error("This domain cannot be converted to a valid DNS hostname.");
  }
  const labels = ascii.split(".");
  if (
    labels.length < 2 ||
    /^[\d.]+$/.test(ascii) ||
    labels.some((label) => !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))
  )
    throw new Error(
      "Use a domain with at least two labels, letters or digits, and internal hyphens only. IP addresses are not supported.",
    );
  return {
    ascii,
    displayCharacters: Array.from(value).length,
    asciiCharacters: ascii.length,
    labels: labels.map((label) => ({
      label,
      length: label.length,
      withinLimit: label.length <= 63,
    })),
    withinLimits:
      ascii.length <= 253 && labels.every((label) => label.length <= 63),
  };
}
