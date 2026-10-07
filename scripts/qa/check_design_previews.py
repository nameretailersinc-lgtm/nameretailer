"""Capture and check local Phase 2 HTML previews using existing Playwright.

Run: python scripts/qa/check_design_previews.py
This checks prototypes only, not WCAG certification or production readiness.
"""
from __future__ import annotations

import json
import argparse
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[2]
PREVIEWS = ROOT / "docs/design-preview"
EVIDENCE = PREVIEWS / "evidence"
TEMPLATES = ("home", "marketplace", "article", "tool")


def check_demo(page, template: str) -> dict:
    """Exercise visible demo behaviors with known nonpersonal sample inputs."""
    checks: dict = {}
    if template == "marketplace":
        if not page.locator("#filters").is_visible():
            page.locator("details.filters > summary").click()
        initial = page.locator("#listings tr:not([hidden])").count()
        page.locator("#query").fill("no-such-demo-publication")
        page.locator("#filters button[type=submit]").click()
        checks["noResultsShowsRecovery"] = (
            page.locator("#listings tr:not([hidden])").count() == 0
            and page.locator("#empty").is_visible()
        )
        page.locator("#empty-reset").click()
        page.wait_for_function("document.querySelector('#query').value === '' && document.querySelector('#empty').hidden")
        checks["resetRestoresResults"] = page.locator("#listings tr:not([hidden])").count() == initial
        page.locator("#max-price").fill("100")
        page.locator("#filters button[type=submit]").click()
        checks["budgetFilter"] = page.locator("#listings tr:not([hidden])").count() == 3
        remove_buttons = page.locator("#chips button")
        if remove_buttons.count():
            remove_buttons.first.click()
            checks["removeChipRestoresResults"] = page.locator("#listings tr:not([hidden])").count() == initial
        else:
            checks["removeChipRestoresResults"] = False
        page.locator("#sort").select_option("price")
        prices = page.locator("#listings tr").evaluate_all("rows => rows.map(row => Number(row.dataset.price))")
        checks["sortPriceAscending"] = prices == sorted(prices)
    elif template == "tool":
        page.locator("#text").fill("Hello world.\n\nA useful test.")
        checks["wordCount"] = page.locator("#words").inner_text() == "5"
        checks["paragraphCount"] = page.locator("#paragraphs").inner_text() == "2"
        page.locator("#text").fill("🙂 café")
        checks["unicodeCodePointCount"] = page.locator("#characters").inner_text() == "6"
        page.locator("#clear").click()
        checks["clearResetsInputAndCounts"] = (
            page.locator("#text").input_value() == ""
            and page.locator("#words").inner_text() == "0"
            and page.locator("#characters").inner_text() == "0"
        )
        page.locator("#sample").click()
        checks["sampleProducesOutput"] = int(page.locator("#words").inner_text()) > 0
    return checks


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("templates", nargs="*", metavar="TEMPLATE", help="home, marketplace, article or tool; default: all four")
    args = parser.parse_args()
    templates = args.templates or TEMPLATES
    invalid = [name for name in templates if name not in TEMPLATES]
    if invalid:
        parser.error("Unknown template: " + ", ".join(invalid))
    missing = [name for name in templates if not (PREVIEWS / f"{name}.html").is_file()]
    if missing:
        print("Missing preview files: " + ", ".join(missing))
        return 1
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    results: list[dict] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for template in templates:
            for width in (320, 375, 1280):
                page = browser.new_page(viewport={"width": width, "height": 900}, device_scale_factor=1)
                page.set_default_timeout(5000)
                runtime_errors: list[str] = []
                page.on("pageerror", lambda error: runtime_errors.append(str(error)))
                page.goto((PREVIEWS / f"{template}.html").as_uri(), wait_until="load")
                page.emulate_media(reduced_motion="reduce")
                measurements = page.evaluate("""() => {
                  const root = document.documentElement;
                  const unnamedControls = [...document.querySelectorAll('input,select,textarea')]
                    .filter(el => !['hidden','submit','button','reset'].includes(el.type))
                    .filter(el => !el.labels?.length && !el.getAttribute('aria-label') &&
                      !el.getAttribute('aria-labelledby'))
                    .map(el => el.id || el.name || el.tagName);
                  const brokenFragments = [...document.querySelectorAll('a[href^="#"]')]
                    .map(el => el.getAttribute('href'))
                    .filter(href => href !== '#' && !document.getElementById(href.slice(1)));
                  return {
                    title: document.title,
                    pageWidth: root.scrollWidth,
                    viewportWidth: root.clientWidth,
                    h1Count: document.querySelectorAll('h1').length,
                    mainCount: document.querySelectorAll('main').length,
                    unnamedControls,
                    missingImageAlt: document.querySelectorAll('img:not([alt])').length,
                    brokenFragments,
                    visiblePrimaryNavigationItems: [...document.querySelectorAll('header.site-header nav > a, header.site-header nav > details > summary')]
                      .filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden').length
                  };
                }""")
                if width in (375, 1280):
                    screenshot = EVIDENCE / f"{template}-{width}.png"
                    page.screenshot(path=str(screenshot), full_page=True)
                    measurements["screenshot"] = str(screenshot.relative_to(ROOT)).replace("\\", "/")
                page.keyboard.press("Tab")
                measurements["firstKeyboardFocus"] = page.evaluate(
                    "document.activeElement?.textContent?.trim() || document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName"
                )
                failures = []
                if measurements["pageWidth"] > measurements["viewportWidth"] + 1:
                    failures.append("Horizontal page overflow")
                if measurements["h1Count"] != 1:
                    failures.append("Expected exactly one H1")
                if measurements["mainCount"] != 1:
                    failures.append("Expected exactly one main landmark")
                if measurements["unnamedControls"]:
                    failures.append("Inputs missing label/name")
                if measurements["missingImageAlt"]:
                    failures.append("Images missing alt attribute")
                if measurements["brokenFragments"]:
                    failures.append("Broken in-page anchors")
                if measurements["visiblePrimaryNavigationItems"] > 7:
                    failures.append("More than seven visible primary navigation items")
                if width in (375, 1280):
                    try:
                        measurements["demoChecks"] = check_demo(page, template)
                        failures.extend(name for name, passed in measurements["demoChecks"].items() if not passed)
                    except Exception as error:
                        failures.append(f"Demo interaction failed: {error}")
                if runtime_errors:
                    failures.append("JavaScript runtime error")
                results.append({"template": template, "width": width, **measurements,
                                "runtimeErrors": runtime_errors, "failures": failures})
                page.close()
        browser.close()
    report = {"scope": "Phase 2 local prototype smoke checks; not a complete accessibility audit",
              "results": results}
    (EVIDENCE / "preview-checks.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    for result in results:
        state = "; ".join(result["failures"]) or "PASS"
        print(f"{result['template']} @ {result['width']}px: {state}")
    return int(any(result["failures"] for result in results))


if __name__ == "__main__":
    raise SystemExit(main())
