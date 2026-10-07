export function countText(text: string) {
  const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
  let words = 0;
  for (const segment of segmenter.segment(text))
    if (segment.isWordLike) words++;
  const characters = Array.from(text).length;
  const paragraphs = text.split(/\r?\n+/u).filter((line) => line.trim()).length;
  return {
    words,
    characters,
    paragraphs,
    readingMinutes: Math.ceil(words / 200),
  };
}
