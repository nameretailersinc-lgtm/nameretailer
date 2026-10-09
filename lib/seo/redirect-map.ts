export const legacyRedirects: Array<{source: string; destination: string; reason: string}> = [
  {source: "/products/", destination: "/", reason: "Same catalogue and supporting content as the canonical marketplace"},
  {source: "/home/", destination: "/", reason: "One canonical home URL"},
  {source: "/contact-us/", destination: "/contact/", reason: "One canonical contact URL"},
];
