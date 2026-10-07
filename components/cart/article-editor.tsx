"use client";

import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
} from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";

// Briefs are stored as plain text, so the rich editor round-trips Markdown.
const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function inlineToHtml(text: string) {
  return escapeHtml(text)
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      (_m, label, href) => `<a href="${href}">${label}</a>`,
    )
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/~~(.+?)~~/g, "<s>$1</s>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function markdownToHtml(markdown: string) {
  const out: string[] = [];
  let list: "ul" | "ol" | null = null;
  const close = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };
  for (const line of markdown.split("\n")) {
    const bullet = /^- (.*)$/.exec(line);
    const numbered = /^\d+\. (.*)$/.exec(line);
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    const item = bullet || numbered;
    if (item) {
      const kind = bullet ? "ul" : "ol";
      if (list !== kind) {
        close();
        out.push(`<${kind}>`);
        list = kind;
      }
      out.push(`<li><p>${inlineToHtml(item[1])}</p></li>`);
      continue;
    }
    close();
    if (heading) out.push(`<h2>${inlineToHtml(heading[1])}</h2>`);
    else if (line.trim()) out.push(`<p>${inlineToHtml(line)}</p>`);
  }
  close();
  return out.join("");
}

type JsonNode = {
  type?: string;
  text?: string;
  content?: JsonNode[];
  marks?: { type: string; attrs?: { href?: string } }[];
};

function inlineToMarkdown(nodes: JsonNode[] = []) {
  return nodes
    .map((node) => {
      let text = node.text ?? "";
      if (node.type === "hardBreak") return " ";
      for (const mark of node.marks ?? []) {
        if (mark.type === "bold") text = `**${text}**`;
        else if (mark.type === "italic") text = `*${text}*`;
        else if (mark.type === "strike") text = `~~${text}~~`;
        else if (mark.type === "link" && mark.attrs?.href)
          text = `[${text}](${mark.attrs.href})`;
      }
      return text;
    })
    .join("");
}

function blockToMarkdown(node: JsonNode): string {
  if (node.type === "bulletList" || node.type === "orderedList") {
    const items = (node.content ?? []).map((item) =>
      inlineToMarkdown(item.content?.[0]?.content),
    );
    return items
      .map((text, i) => (node.type === "bulletList" ? `- ${text}` : `${i + 1}. ${text}`))
      .join("\n");
  }
  const text = inlineToMarkdown(node.content);
  return node.type === "heading" ? `## ${text}` : text;
}

function docToMarkdown(doc: JsonNode) {
  return (doc.content ?? [])
    .map(blockToMarkdown)
    .filter((block) => block.trim())
    .join("\n");
}

export function ArticleEditor({
  id,
  focusRef,
  value,
  disabled,
  placeholder,
  describedBy,
  onChange,
  onFocus,
}: {
  id: string;
  focusRef: RefObject<{ focus: () => void } | null>;
  value: string;
  disabled: boolean;
  placeholder: string;
  describedBy: string;
  onChange: (value: string) => void;
  onFocus: () => void;
}) {
  const lastMarkdown = useRef(value);
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        underline: false,
        link: { openOnClick: false, autolink: false },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: markdownToHtml(value),
    editorProps: {
      attributes: {
        id,
        role: "textbox",
        "aria-multiline": "true",
        "aria-describedby": describedBy,
        class: "placement-rich-text",
      },
    },
    onFocus,
    onUpdate: ({ editor: instance }) => {
      const markdown = docToMarkdown(instance.getJSON());
      if (markdown.length > 40000) {
        instance.commands.setContent(markdownToHtml(lastMarkdown.current));
        return;
      }
      lastMarkdown.current = markdown;
      onChange(markdown);
    },
  });

  useEffect(() => {
    focusRef.current = { focus: () => editor?.commands.focus() };
  }, [editor, focusRef]);
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);
  useEffect(() => {
    if (editor && value !== lastMarkdown.current) {
      lastMarkdown.current = value;
      editor.commands.setContent(markdownToHtml(value));
    }
  }, [editor, value]);

  if (!editor) return <div className="placement-rich-text" />;
  const chain = () => editor.chain().focus();
  const active = (name: string) => editor.isActive(name);
  function setLink() {
    const previous = editor?.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous || "https://");
    if (url === null) return;
    if (!url.trim()) chain().extendMarkRange("link").unsetLink().run();
    else if (/^https?:\/\//i.test(url.trim()))
      chain().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }
  return (
    <>
      <div
        className="placement-editor-toolbar"
        role="group"
        aria-label="Article formatting"
      >
        <select
          aria-label="Paragraph style"
          disabled={disabled}
          value={active("heading") ? "heading" : "paragraph"}
          onChange={(event) =>
            event.target.value === "heading"
              ? chain().setHeading({ level: 2 }).run()
              : chain().setParagraph().run()
          }
        >
          <option value="paragraph">Paragraph</option>
          <option value="heading">Heading</option>
        </select>
        <button
          type="button"
          aria-label="Bold"
          aria-pressed={active("bold")}
          disabled={disabled}
          onClick={() => chain().toggleBold().run()}
        >
          <Bold size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Italic"
          aria-pressed={active("italic")}
          disabled={disabled}
          onClick={() => chain().toggleItalic().run()}
        >
          <Italic size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Strikethrough"
          aria-pressed={active("strike")}
          disabled={disabled}
          onClick={() => chain().toggleStrike().run()}
        >
          <Strikethrough size={18} aria-hidden="true" />
        </button>
        <span className="placement-toolbar-divider" aria-hidden="true" />
        <button
          type="button"
          aria-label="Bulleted list"
          aria-pressed={active("bulletList")}
          disabled={disabled}
          onClick={() => chain().toggleBulletList().run()}
        >
          <List size={19} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Numbered list"
          aria-pressed={active("orderedList")}
          disabled={disabled}
          onClick={() => chain().toggleOrderedList().run()}
        >
          <ListOrdered size={19} aria-hidden="true" />
        </button>
        <span className="placement-toolbar-divider" aria-hidden="true" />
        <button
          type="button"
          aria-label="Insert link"
          aria-pressed={active("link")}
          disabled={disabled}
          onClick={setLink}
        >
          <Link2 size={18} aria-hidden="true" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </>
  );
}
