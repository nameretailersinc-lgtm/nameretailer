import { expect, it } from "vitest";
import { pageMetadata } from "@/lib/seo/page-metadata";
it("bounds public metadata and shares the resolved title, description and canonical", () => {
  const meta = pageMetadata({title: "A useful buyer guide ".repeat(8), description: "Catalogue guidance ".repeat(20)}, "/example/");
  const title = (meta.title as {absolute:string}).absolute;
  expect(title.length).toBeLessThanOrEqual(60);
  expect(meta.description!.length).toBeLessThanOrEqual(155);
  expect(meta.openGraph).toMatchObject({title, description:meta.description, url:"https://nameretailer.com/example/"});
  expect(meta.twitter).toMatchObject({title, description:meta.description});
});
it("preserves index restrictions and route-specific article imagery", () => {
  const meta = pageMetadata({title:"Buyer checklist", robots:{index:false,follow:true}, openGraph:{type:"article", images:[{url:"/actual.png",alt:"Actual buyer checklist"}]}},"/checklist/");
  expect(meta.robots).toEqual({index:false,follow:true});
  expect(meta.openGraph).toMatchObject({type:"article",images:[{url:"/actual.png",alt:"Actual buyer checklist"}]});
});
