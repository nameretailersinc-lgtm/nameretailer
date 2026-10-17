import {legacyRedirects} from './redirect-map';
import {loadCsvRedirects,type CsvRedirect} from './redirect-csv';
import { canonicalOrigin } from './origin';

function localDestination(destination: string): string {
  const url = new URL(destination, canonicalOrigin);
  if (url.origin !== canonicalOrigin)
    throw new Error('Redirect destination must be on-site');
  return url.pathname + url.search + url.hash;
}
/** Code owns canonical destinations. Old CSV aliases resolve directly to those destinations. */
export function mergePublicRedirects(primary:CsvRedirect[],extra:CsvRedirect[]):CsvRedirect[]{
  // Normalize every hop before building the graph. A CSV absolute URL can point
  // to another alias; normalizing only the first hop leaves chains and cycles.
  primary = primary.map(row => ({ ...row, destination: localDestination(row.destination) }));
  extra = extra.map(row => ({ ...row, destination: localDestination(row.destination) }));
  const known=new Set(primary.map(row=>row.source));
  const canonical=new Set(primary.map(row=>row.destination));
  const merged=[...primary,...extra.filter(row=>!known.has(row.source)&&!canonical.has(row.source))];
  const targets=new Map(merged.map(row=>[row.source,row.destination]));
  return merged.map(row=>{let destination=row.destination.replace(/^https:\/\/nameretailer\.com(?=\/)/,'');const visited=new Set([row.source]);while(targets.has(destination)){if(visited.has(destination))throw new Error('Redirect cycle at '+row.source);visited.add(destination);destination=targets.get(destination)!;}return {...row,destination};});
}
export const publicRedirects=()=>mergePublicRedirects(legacyRedirects.map(row=>({source:row.source,destination:row.destination,statusCode:301})),loadCsvRedirects());
