import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
await mkdir('public/og',{recursive:true});
const templates={home:['Guest-post marketplace','Compare publications. Prepare your placement plan.'],hub:['Publication directories','Research audience, topic, supplied metrics and price.'],guide:['Guest-post buying guides','Understand costs, disclosure and publication fit.'],article:['Name Retailer journal','Practical guides to content and publication research.']};
for(const [name,[title,description]] of Object.entries(templates)) {
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#073f46"/><circle cx="1140" cy="65" r="260" fill="#0e646a"/><rect x="72" y="72" width="68" height="8" fill="#7cddc5"/><text x="72" y="145" fill="#b0efe1" font-family="sans-serif" font-size="32">NAME RETAILER</text><text x="72" y="315" fill="white" font-family="sans-serif" font-weight="bold" font-size="56">${title}</text><text x="72" y="398" fill="#d9eeeb" font-family="sans-serif" font-size="29">${description}</text><text x="72" y="551" fill="#b0efe1" font-family="sans-serif" font-size="26">nameretailer.com</text></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(`public/og/${name}.png`);
}
