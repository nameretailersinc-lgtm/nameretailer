export const architectureRedirects: Record<string,string> = Object.fromEntries([
  ...Array.from({length:9}, (_, i) => [`/da-${i === 0 ? 1 : i*10}-to-${(i+1)*10}/`, `/da-${i === 0 ? 1 : i*10}-to-${i*10+9}/`]),
  ['/0-to-50k-traffic/', '/traffic-0-to-49999/'], ['/50k-to-100k-traffic/', '/traffic-50000-to-99999/'],
  ['/100k-to-500k-traffic/', '/traffic-100000-to-499999/'], ['/500k-to-1m-traffic/', '/traffic-500000-to-999999/'],
  ['/1m-to-5m-traffic/', '/traffic-1000000-to-4999999/'], ['/5m-to-10m-traffic/', '/traffic-5000000-to-9999999/'], ['/10m-plus-traffic/', '/traffic-10000000-plus/'],
  ['/dr-0-to-20/', '/dr-0-to-19/'], ['/dr-20-to-50/', '/dr-20-to-49/'],
  ['/price-0-to-50/', '/guest-posting-sites-under-50/'], ['/price-50-to-100/', '/price-50-01-to-100/'], ['/price-100-to-150/', '/price-100-01-to-150/'], ['/price-150-to-200/', '/price-150-01-to-200/'],
]);
