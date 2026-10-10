/** Validate the schemas this application emits; rich-result eligibility remains a separate Google check. */
export function validateJsonLd(value:unknown,path='/'):string[] {
  const errors:string[]=[];
  const fail=(s:string)=>errors.push(s);
  const nonempty=(v:unknown)=>typeof v==='string' && !!v.trim();
  const visit=(v:unknown)=> {
    if(Array.isArray(v)){v.forEach(visit);return;}
    if(!v || typeof v!=='object')return;
    const n=v as Record<string,unknown>,type=n['@type'];
    if(n['@context']!==undefined && n['@context']!=='https://schema.org')fail('Unexpected schema context');
    const required:Record<string,string[]>={Organization:['name'],WebSite:['name','url'],BreadcrumbList:['itemListElement'],ItemList:['itemListElement','numberOfItems'],Article:['headline','author','publisher','datePublished','dateModified','image','mainEntityOfPage'],BlogPosting:['headline','author','publisher','datePublished','dateModified','image','mainEntityOfPage'],FAQPage:['mainEntity'],Question:['name','acceptedAnswer'],Answer:['text']};
    for(const key of required[String(type)] || [])if(n[key]===undefined || n[key]===null || n[key]==='')fail(`${type}: missing ${key}`);
    if(['Review','AggregateRating'].includes(String(type)) || (path.startsWith('/publication/') && ['Product','Offer'].includes(String(type))))fail(`Unsupported ${type}`);
    if(type==='BreadcrumbList' || type==='ItemList') {
      if(!Array.isArray(n.itemListElement) || !n.itemListElement.length)fail(`${type}: empty list`);
      else { n.itemListElement.forEach((item,i)=>{if(item.position!==i+1)fail(`${type}: invalid position`);});if(type==='ItemList' && n.numberOfItems!==n.itemListElement.length)fail('ItemList: incorrect count'); }
    }
    for(const key of ['datePublished','dateModified'])if(n[key]!==undefined && (!nonempty(n[key]) || !Number.isFinite(Date.parse(String(n[key])))))fail(`Invalid ${key}`);
    if(type==='Question' && (typeof n.acceptedAnswer!=='object' || !n.acceptedAnswer || !nonempty((n.acceptedAnswer as Record<string,unknown>).text)))fail('Question: empty answer');
    Object.values(n).forEach(visit);
  };
  if(!value || typeof value!=='object')fail('JSON-LD must be an object or array');else visit(value);
  return errors;
}
