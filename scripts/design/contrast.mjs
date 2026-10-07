// Run: node scripts/design/contrast.mjs [--json]. No dependencies.
// WCAG relative luminance and contrast; ratios remain unrounded for pass/fail.
export const palette = {
  paper: '#f6f4ed', surface: '#ffffff', ink: '#172c28', muted: '#4c605a',
  brand: '#195844', brandHover: '#103e30', tint: '#e9f1ea', boundary: '#71817a',
  warning: '#785108', warningTint: '#fff3d6', danger: '#a3292d',
  info: '#205a83', infoTint: '#eaf2f8', disabled: '#e9ede7', tableHeader: '#edf0e9',
};
export function luminance(hex) {
  const channels = hex.replace('#', '').match(/.{2}/g).map(c => parseInt(c, 16) / 255);
  const linear = channels.map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
}
export function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + .05) / (values[1] + .05);
}
const pairs = [
  ['Body on paper', 'ink', 'paper', 4.5], ['Body on surface', 'ink', 'surface', 4.5],
  ['Muted on paper', 'muted', 'paper', 4.5], ['Muted on surface', 'muted', 'surface', 4.5],
  ['Primary button', 'surface', 'brand', 4.5], ['Button hover', 'surface', 'brandHover', 4.5],
  ['Links on paper', 'brand', 'paper', 4.5], ['Metric badge', 'brand', 'tint', 4.5],
  ['Warning badge', 'warning', 'warningTint', 4.5], ['Error on surface', 'danger', 'surface', 4.5],
  ['Info badge', 'info', 'infoTint', 4.5], ['Disabled label', 'muted', 'disabled', 4.5],
  ['Control boundary on surface', 'boundary', 'surface', 3],
  ['Control boundary on paper', 'boundary', 'paper', 3],
  ['Control boundary on tint', 'boundary', 'tint', 3],
  ['Focus on surface', 'info', 'surface', 3], ['Focus on paper', 'info', 'paper', 3],
  ['Focus on tint', 'info', 'tint', 3], ['Dark preview strip', 'surface', 'ink', 4.5],
  ['Sample label on paper', 'warning', 'paper', 4.5],
  ['Sample label on surface', 'warning', 'surface', 4.5],
  ['Table header label', 'ink', 'tableHeader', 4.5],
  ['Boundary on info tint', 'boundary', 'infoTint', 3],
  ['Secondary hover', 'brand', 'tint', 4.5],
];
const results = pairs.map(([use, fg, bg, minimum]) => {
  const ratio = contrast(palette[fg], palette[bg]);
  return { use, foreground: palette[fg], background: palette[bg], ratio: Number(ratio.toFixed(2)), minimum, pass: ratio >= minimum };
});
if (process.argv.includes('--json')) console.log(JSON.stringify(results, null, 2));
else {
  console.log('| Use | Foreground | Background | Ratio | Minimum | Result |');
  console.log('| --- | --- | --- | ---: | ---: | --- |');
  for (const r of results) console.log(`| ${r.use} | ${r.foreground} | ${r.background} | ${r.ratio.toFixed(2)}:1 | ${r.minimum}:1 | ${r.pass ? 'PASS' : 'FAIL'} |`);
}
if (results.some(r => !r.pass)) process.exitCode = 1;
