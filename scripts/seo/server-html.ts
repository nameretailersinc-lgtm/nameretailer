/** Resolve React's server HTML stream instructions without running page scripts. */
export function completedServerHtml(html: string): string {
  const operations = [
    ...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi),
  ].flatMap((script) => [
    ...script[1].matchAll(/\$(RS|RC)\("([SB]:[\da-f]+)","([PS]:[\da-f]+)"\)/g),
  ]);
  if (!operations.length) return html;
  let result = html.replace(
    /<script\b([^>]*)>[\s\S]*?<\/script>/gi,
    (script, attributes: string) =>
      /\btype="application\/ld\+json"/.test(attributes) ? script : "",
  );

  function fragment(id: string) {
    const opening = new RegExp(`<div\\b[^>]*\\bid="${id}"[^>]*>`).exec(result);
    if (!opening) return;
    const start = opening.index;
    const contentStart = start + opening[0].length;
    let depth = 1;
    for (const tag of result
      .slice(contentStart)
      .matchAll(/<div\b[^>]*>|<\/div\s*>/gi)) {
      depth += /^<\//.test(tag[0]) ? -1 : 1;
      if (depth === 0) {
        const contentEnd = contentStart + tag.index!;
        return {
          start,
          end: contentEnd + tag[0].length,
          content: result.slice(contentStart, contentEnd),
        };
      }
    }
  }

  for (const [, operation, first, second] of operations) {
    const segment = fragment(operation === "RS" ? first : second);
    if (!segment) continue;
    const target = operation === "RS" ? second : first;
    const template = new RegExp(
      `<template\\b[^>]*\\bid="${target}"[^>]*><\\/template>`,
    );
    if (!template.test(result)) continue;
    result = result.slice(0, segment.start) + result.slice(segment.end);
    if (operation === "RS") {
      result = result.replace(template, () => segment.content);
      continue;
    }
    const boundary = template.exec(result)!;
    const after = boundary.index + boundary[0].length;
    let depth = 0;
    for (const comment of result.slice(after).matchAll(/<!--([\s\S]*?)-->/g)) {
      if (["$", "$?", "$~", "$!", "&"].includes(comment[1])) depth++;
      else if (comment[1] === "/$" || comment[1] === "/&") {
        if (depth-- === 0) {
          const end = after + comment.index!;
          result =
            result.slice(0, boundary.index) +
            segment.content +
            result.slice(end);
          break;
        }
      }
    }
  }
  return result;
}
