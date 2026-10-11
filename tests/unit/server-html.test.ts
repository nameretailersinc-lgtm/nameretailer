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

  it("resolves streamed table rows and cells inside their correct table context", () => {
    const html =
      '<main><table><tbody><template id="P:1"></template><tr><template id="P:2"></template></tr></tbody></table></main><table hidden><tbody id="S:1"><tr><th>artnews.com</th><td>$50</td></tr></tbody></table><table hidden><tr id="S:2"><th>bbc.co.uk</th><td>$75</td></tr></table><script>$RS("S:1","P:1");$RS("S:2","P:2")</script>';
    const completed = completedServerHtml(html);
    expect(completed).toContain(
      "<main><table><tbody><tr><th>artnews.com</th><td>$50</td></tr><tr><th>bbc.co.uk</th><td>$75</td></tr></tbody></table></main>",
    );
    expect(completed).not.toContain("<template");
    expect(completed).not.toMatch(/id="S:/);
  });
});
