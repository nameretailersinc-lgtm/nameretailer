import { describe, it, expect } from "vitest";
import { countText } from "@/lib/tools/word-counter";
describe("local word counter", () => {
  it("counts empty input", () => {
    expect(countText("")).toEqual({
      words: 0,
      characters: 0,
      paragraphs: 0,
      readingMinutes: 0,
    });
  });
  it("ignores whitespace-only lines without dropping characters", () => {
    expect(countText(" \n\n \t")).toEqual({
      words: 0,
      characters: 5,
      paragraphs: 0,
      readingMinutes: 0,
    });
  });
  it("counts words, nonempty lines and CRLF paragraphs", () => {
    expect(countText("Hello world\r\n\r\nA clear brief.")).toEqual({
      words: 5,
      characters: 29,
      paragraphs: 2,
      readingMinutes: 1,
    });
  });
  it("counts Unicode code points rather than UTF-16 units", () => {
    expect(countText("😀 hello").characters).toBe(7);
    expect(countText("😀 hello").words).toBe(1);
    expect(countText("مرحبا بالعالم").words).toBe(2);
  });
  it("rounds up reading time at 200 words per minute", () => {
    expect(countText(Array(200).fill("word").join(" ")).readingMinutes).toBe(1);
    expect(countText(Array(201).fill("word").join(" ")).readingMinutes).toBe(2);
  });
  it("does not treat punctuation alone as words", () => {
    expect(countText("! — …").words).toBe(0);
  });
});
