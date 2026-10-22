import { createElement } from "react";
import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Loading from "@/app/guest-posting-sites/loading";

it("renders only a placeholder, without a second H1, footer or page shell", () => {
  const html = renderToStaticMarkup(createElement(Loading));
  expect(html).not.toMatch(/<h1|<footer|<header|<nav/);
  expect(html).toContain("Loading publications");
});
