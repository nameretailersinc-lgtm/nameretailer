import {expect,it} from 'vitest';
import {organizationNode,websiteNode,breadcrumbSchema,itemListNode,serializeJsonLd} from '@/lib/seo/json-ld';
import {faqPageNode,jsonLdGraph} from '@/lib/seo/structured-data';
import {validateJsonLd} from '@/lib/seo/validate-jsonld';
it('parses and validates the public schema factories',()=>{for(const value of [organizationNode(),websiteNode(),breadcrumbSchema([['Home','/'],['Guides','/guides/']]),itemListNode([{domain:'https://artnews.com'}]),jsonLdGraph(faqPageNode([['How are prices sourced?','Placement prices are supplied with catalogue listings.']]))])expect(validateJsonLd(JSON.parse(serializeJsonLd(value)))).toEqual([]);});
it('rejects fabricated rating, incomplete articles and unavailable publication offers',()=>{expect(validateJsonLd({'@type':'AggregateRating'})).not.toEqual([]);expect(validateJsonLd({'@type':'BlogPosting',headline:'Missing verified data'})).not.toEqual([]);expect(validateJsonLd({'@type':'Offer',price:10},'/publication/artnews-com/')).not.toEqual([]);expect(validateJsonLd({'@type':'BreadcrumbList',itemListElement:[{position:2,name:'Home'}]})).not.toEqual([]);});
