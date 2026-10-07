import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Download,
  Settings2,
  Upload,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/chrome";
import type { Tool } from "@/lib/tools/catalog";
import { imageAction, toolIcon } from "@/lib/tools/presentation";

export function ToolsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="reference-site tools-site">
      <SiteHeader active="tools" />
      <main id="main" className="reference-container tools-main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function ToolsBenefits({ tool }: { tool?: Tool }) {
  const server = tool?.kind === "amp" || tool?.kind === "rating";
  const image = tool?.kind === "image";
  const benefits = [
    [
      "03_free_to_use_icon.png",
      image ? "Fast conversion" : "Free to use",
      image ? "Results in your browser" : "No registration required",
    ],
    [
      "04_private_secure_icon.png",
      !tool || server ? "Clear processing" : "Private & secure",
      !tool
        ? "Privacy explained for each tool"
        : server
          ? "One request to our server"
          : "All processing in your browser",
    ],
    [
      "05_accurate_results_icon.png",
      image ? "No upload required" : "Clear results",
      image ? "Your files stay on your device" : "Understand every output",
    ],
    [
      "06_no_data_stored_icon.png",
      !tool || server ? "Defined scope" : "No input stored",
      !tool
        ? "Know what each tool measures"
        : server
          ? tool!.mode
          : "Your data stays on your device",
    ],
  ];
  return (
    <div className="tools-benefits">
      {benefits.map(([icon, title, description]) => (
        <div key={title}>
          <Image
            src={`/tools/${icon}`}
            width={150}
            height={130}
            alt=""
            sizes="46px"
          />
          <p>
            <strong>{title}</strong>
            <small>{description}</small>
          </p>
        </div>
      ))}
    </div>
  );
}

export function DirectoryHero() {
  return (
    <section className="tools-hero tools-directory-hero">
      <div className="tools-hero-copy">
        <p className="tools-eyebrow">Free tools</p>
        <h1>
          Useful tools.
          <br />
          <span>Less busywork.</span>
        </h1>
        <p className="tools-lead">
          Prepare content, convert images and inspect markup in one place. Each
          tool explains what it measures and where your input is processed.
        </p>
        <ToolsBenefits />
      </div>
      <div className="tools-hero-art" aria-hidden="true">
        <Image
          src="/tools/01_hero_tools_illustration.png"
          width={650}
          height={445}
          alt=""
          sizes="(max-width: 760px) 90vw, 48vw"
          preload
        />
        <span className="tools-art-caption">
          <span className="tools-art-dot" />A little help. A lot less work.
        </span>
      </div>
    </section>
  );
}

export function ToolHero({ tool }: { tool: Tool }) {
  const words = tool.title.split(" ");
  const last = words.pop();
  const jpg = tool.slug === "jpg-to-png-converter";
  const counter = tool.slug === "word-counter";
  const asset = jpg
    ? "01_jpg_to_png_hero.png"
    : counter
      ? "07_word_counter_preview.png"
      : "01_hero_tools_illustration.png";
  return (
    <>
      <nav className="tools-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/home/">Home</Link>
        <ChevronRight size={13} aria-hidden="true" />
        <Link href="/seo-tools/">Tools</Link>
        <ChevronRight size={13} aria-hidden="true" />
        <Link
          href={`/seo-tools/#${tool.group.toLowerCase().replaceAll(" ", "-")}`}
        >
          {tool.group}
        </Link>
        <ChevronRight size={13} aria-hidden="true" />
        <span aria-current="page">{tool.title}</span>
      </nav>
      <section className="tools-hero tools-detail-hero">
        <div className="tools-hero-copy">
          <p className="tools-eyebrow">{tool.group}</p>
          <h1>
            {words.join(" ")} <span>{last}</span>
          </h1>
          <p className="tools-lead">{tool.description}</p>
        </div>
        <div
          className={`tools-hero-art${jpg ? " tools-converter-art" : ""}`}
          aria-hidden="true"
        >
          <Image
            src={`/tools/${asset}`}
            width={jpg ? 590 : counter ? 450 : 650}
            height={jpg ? 370 : counter ? 250 : 445}
            alt=""
            sizes="(max-width: 760px) 90vw, 46vw"
            preload
          />
          {!jpg && !counter && (
            <span className="tools-current-tool">
              <Image
                src={toolIcon(tool)}
                width={85}
                height={85}
                alt=""
                sizes="42px"
              />
              <span>
                {tool.title}
                <small>{tool.mode}</small>
              </span>
            </span>
          )}
        </div>
      </section>
      <ToolsBenefits tool={tool} />
    </>
  );
}

export function ToolSteps({ tool }: { tool: Tool }) {
  const image = tool.kind === "image";
  const counter = tool.slug === "word-counter";
  const steps = [
    [
      "Add your input",
      image
        ? "Choose a file or drop it into the workspace. Keep your original: all edits produce a separate copy."
        : counter
          ? "Paste your text or start writing. Word and character counts update as you type."
          : "Use the labeled fields to add your text, values or report. Choose the settings that fit your task.",
      Upload,
    ],
    [
      image ? "Convert and preview" : "Review your result",
      image
        ? `Click “${imageAction(tool.slug)}” and compare the preview with your original image.`
        : counter
          ? "Check words, characters, paragraphs and estimated reading time. Counts help you meet a brief."
          : "Run the tool and inspect the result. A structural check or research idea still needs your judgment.",
      Settings2,
    ],
    [
      image ? "Download and use" : "Copy and keep working",
      image
        ? "Download your processed image and use it anywhere. The file stays on your device."
        : counter
          ? "Copy the count summary without including your text. Clear the input when you are done."
          : "Copy the output into your workflow. Review generated markup and research plans before using them.",
      Download,
    ],
  ] as const;
  return (
    <section className="tools-steps" aria-label="How to use this tool">
      {steps.map(([title, description, Icon], index) => (
        <article className={`tools-step tools-step-${index}`} key={title}>
          <div className="tools-step-symbols">
            <span>0{index + 1}</span>
            <Icon size={27} aria-hidden="true" />
          </div>
          <h2>{title}</h2>
          <p>{description}</p>
        </article>
      ))}
    </section>
  );
}

export function ToolsNext() {
  return (
    <section className="tools-next">
      <span className="tools-next-icon">
        <BookOpen size={29} aria-hidden="true" />
      </span>
      <div>
        <h2>Keep working with context</h2>
        <p>Find related tools or practical SEO, AEO and GEO reading.</p>
        <div className="reference-actions">
          <Link className="button button-primary" href="/seo-tools/">
            All tools <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link className="button button-secondary" href="/blog/">
            Read the journal <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <Image
        src="/tools/02_tools_document_illustration.png"
        width={395}
        height={335}
        alt=""
        sizes="(max-width: 760px) 160px, 260px"
      />
    </section>
  );
}
