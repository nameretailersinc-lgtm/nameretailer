"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Search, ShieldCheck, X } from "lucide-react";
import { tools } from "@/lib/tools/catalog";
import { toolGroups, toolIcon } from "@/lib/tools/presentation";

const popular = [
  ["Word Counter", "word-counter"],
  ["Image to PNG", "jpg-to-png-converter"],
  ["Schema Generator", "schema-generator"],
  ["Keyword Suggestion", "keyword-suggestion-tool"],
  ["Domain Rating", "bulk-domain-rating-checker"],
  ["Text Case Converter", "text-case-converter"],
];

export function ToolDirectory() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const filter = query.trim().toLowerCase();
  const matches = tools.filter((tool) =>
    `${tool.title} ${tool.description} ${tool.group}`
      .toLowerCase()
      .includes(filter),
  );
  return (
    <>
      <section className="tools-search-panel" aria-label="Find a tool">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            setSearched(true);
            document.getElementById("tools-results")?.focus();
          }}
        >
          <div className="tools-search-input">
            <Search size={22} aria-hidden="true" />
            <label className="sr-only" htmlFor="tools-search">
              Search tools
            </label>
            <input
              id="tools-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearched(true);
              }}
              placeholder="Search tools… (e.g. word counter, image converter, schema validator)"
            />
          </div>
          <button className="button button-primary">
            Search Tools <ArrowRight size={17} aria-hidden="true" />
          </button>
        </form>
        <div className="tools-popular">
          <strong>Popular:</strong>
          {popular.map(([title, slug]) => (
            <Link href={`/${slug}/`} key={slug}>
              {title}
            </Link>
          ))}
        </div>
      </section>
      {!filter && (
        <section className="tools-featured">
          <Image
            className="tools-featured-icon"
            src="/tools/08_word_counter_category_icon.png"
            width={120}
            height={110}
            alt=""
            sizes="56px"
          />
          <div className="tools-featured-copy">
            <div className="tools-featured-heading">
              <h2>Word counter</h2>
              <span className="tools-count-badge">Available now</span>
            </div>
            <p>
              Count words, characters, paragraphs and estimated reading time
              locally. Your text is not uploaded.
            </p>
            <Link className="button button-primary" href="/word-counter/">
              Open word counter <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <Image
            className="tools-featured-preview"
            src="/tools/07_word_counter_preview.png"
            width={450}
            height={250}
            alt=""
            sizes="(max-width: 760px) 260px, 420px"
          />
        </section>
      )}
      <div id="tools-results" className="tools-results" tabIndex={-1}>
        <div className="tools-search-status" role="status">
          {searched &&
            (filter ? (
              <>
                <span>
                  {matches.length} {matches.length === 1 ? "tool" : "tools"}{" "}
                  found for “{query.trim()}”
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    document.getElementById("tools-search")?.focus();
                  }}
                >
                  Clear search <X size={14} aria-hidden="true" />
                </button>
              </>
            ) : (
              `${tools.length} tools to explore`
            ))}
        </div>
        {matches.length === 0 && (
          <div className="tools-empty">
            <Search size={30} aria-hidden="true" />
            <h2>No tools found</h2>
            <p>Try a different keyword, like image, text or schema.</p>
          </div>
        )}
        <div className="tools-category-grid">
          {toolGroups.map((group) => {
            const rows = matches.filter((tool) => tool.group === group.name);
            if (!rows.length) return null;
            return (
              <section
                className={`tools-category tools-category-${group.tone}`}
                id={group.name.toLowerCase().replaceAll(" ", "-")}
                key={group.name}
              >
                <div className="tools-category-heading">
                  <Image
                    src={`/tools/${group.icon}`}
                    width={120}
                    height={110}
                    alt=""
                    sizes="52px"
                  />
                  <div>
                    <h2>{group.name}</h2>
                    <p>{group.description}</p>
                  </div>
                  <span className="tools-count-badge">
                    {rows.length} {rows.length === 1 ? "tool" : "tools"}
                  </span>
                </div>
                <div className="tools-category-list">
                  {rows.map((tool) => (
                    <Link
                      className="tools-directory-link"
                      href={`/${tool.slug}/`}
                      key={tool.slug}
                    >
                      <Image
                        src={toolIcon(tool)}
                        width={85}
                        height={85}
                        alt=""
                        sizes="38px"
                      />
                      <span>
                        <strong>{tool.title}</strong>
                        <small>{tool.description}</small>
                      </span>
                      <ChevronRight size={17} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
      <aside className="tools-research-note">
        <span>
          <ShieldCheck size={25} aria-hidden="true" />
        </span>
        <div>
          <strong>About our research tools</strong>
          <small>Research with context.</small>
        </div>
        <p>
          Research tools use local brainstorming, uploaded reports or
          owner-supplied catalog data. They do not measure live provider scores
          or search volumes. The outreach planner does not create external
          backlinks.
        </p>
      </aside>
    </>
  );
}
