import { describe, expect, it } from "vitest";
import { completedServerHtml } from "../../scripts/seo/server-html";

describe("completed server HTML", () => {
  it("keeps a normal server response unchanged", () => {
    const html =
      "<main><h1>Publications</h1><p>Loading publications</p></main>";
    expect(completedServerHtml(html)).toBe(html);
  });

  it("resolves nested streamed segments and removes the temporary shell", () => {
    const html =
      '<body><!--$?--><template id="B:0"></template><main><h1>Loading</h1><script type="application/ld+json">{"temporary":true}</script></main><!--/$--><div hidden id="S:0"><main><h1>Publications</h1><div><template id="P:1"></template></div><script type="application/ld+json">{"@type":"ItemList"}</script></main></div><div hidden id="S:1"><table><tr><td>artnews.com</td><td>$50</td></tr></table></div><script>$RS("S:1","P:1");$RC("B:0","S:0")</script></body>';
    const completed = completedServerHtml(html);
    expect(completed).not.toMatch(/Loading|temporary|<template|hidden|\$RS/);
    expect(completed.match(/<h1>/g)).toHaveLength(1);
    expect(completed).toContain("<main><h1>Publications</h1><div><table>");
    expect(completed).toContain(
      'type="application/ld+json">{"@type":"ItemList"}',
    );
    expect(completed).toContain("artnews.com</td><td>$50");
  });

  it("preserves a still-unresolved fallback instead of inventing completed content", () => {
    const html =
      '<main><!--$?--><template id="B:0"></template><p>Loading publications</p><!--/$--></main><script>$RC("B:0","S:0")</script>';
    expect(completedServerHtml(html)).toContain("Loading publications");
  });
});
