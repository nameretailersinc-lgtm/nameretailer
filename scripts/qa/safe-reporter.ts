import type {
  Reporter,
  TestCase,
  TestResult,
  FullResult,
} from "@playwright/test/reporter";

// Failed network calls can include Cookie headers in Playwright's standard
// reporter. Keep diagnostics in ignored local artifacts, not shared tool logs.
export default class SafeReporter implements Reporter {
  private counts: Record<string, number> = {};
  onTestEnd(test: TestCase, result: TestResult) {
    this.counts[result.status] = (this.counts[result.status] || 0) + 1;
    console.log(
      `${result.status}: ${test.titlePath().filter(Boolean).join(" > ")}`,
    );
    if (result.errors.length)
      console.log(
        "Diagnostic details retained in ignored test artifacts; request headers are not printed.",
      );
  }
  onError() {
    console.log(
      "Runner error: diagnostic details are retained locally; sensitive request details are not printed.",
    );
  }
  onEnd(result: FullResult) {
    console.log(`Run ${result.status}: ${JSON.stringify(this.counts)}`);
  }
}
