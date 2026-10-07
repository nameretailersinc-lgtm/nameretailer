import sharp from "sharp";
import { readdir } from "node:fs/promises";
for (const directory of ["public", "docs/design-preview/evidence"]) {
  for (const name of (await readdir(directory)).filter((name) =>
    name.endsWith(".png"),
  )) {
    const file = `${directory}/${name}`;
    const metadata = await sharp(file).metadata();
    console.log(
      JSON.stringify({ file, width: metadata.width, height: metadata.height }),
    );
  }
}
