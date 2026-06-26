"use client";

import React, { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";

export interface TabData {
  left: { type: "text" | "list"; content: string }[];
  right: { type: "text" | "list"; content: string }[];
}

interface BeforeYouBookEditorProps {
  value: TabData | string | undefined | null;
  onChange: (data: string) => void;
}

// Helper to extract HTML strings from value
function getInitialHtml(value: TabData | string | undefined | null) {
  let leftHtml = "";
  let rightHtml = "";

  if (!value) return { leftHtml, rightHtml };

  const decodeHTML = (html: string) => {
    if (typeof window === "undefined") return html;
    const textarea = document.createElement("textarea");
    textarea.innerHTML = html;
    return textarea.value;
  };

  if (typeof value === "string") {
    if (typeof window === "undefined") {
      return { leftHtml: value, rightHtml: "" };
    }

    const decodedValue = decodeHTML(value);
    const parser = new DOMParser();
    const doc = parser.parseFromString(decodedValue, "text/html");
    const leftCol = doc.querySelector(".col-left");
    const rightCol = doc.querySelector(".col-right");

    if (leftCol || rightCol) {
      leftHtml = leftCol?.innerHTML || "";
      rightHtml = rightCol?.innerHTML || "";
    } else {
      leftHtml = decodedValue;
    }
  } else if (typeof value === "object") {
    if (Array.isArray(value.left)) {
      leftHtml = value.left.map(b => b.type === "list" ? `<ul><li>${b.content}</li></ul>` : `<p>${b.content}</p>`).join("");
    }
    if (Array.isArray(value.right)) {
      rightHtml = value.right.map(b => b.type === "list" ? `<ul><li>${b.content}</li></ul>` : `<p>${b.content}</p>`).join("");
    }
  }

  return { leftHtml, rightHtml };
}

export default function BeforeYouBookEditor({ value, onChange }: BeforeYouBookEditorProps) {
  const [activeColumn, setActiveColumn] = useState<"left" | "right">("left");
  const { leftHtml, rightHtml } = getInitialHtml(value);

  const triggerChange = (left: string, right: string) => {
    onChange(`<div class="col-left">${left}</div><div class="col-right">${right}</div>`);
  };

  const leftEditor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      LinkExtension.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-600 underline" } }),
      Placeholder.configure({ placeholder: "Type paragraphs here..." }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Highlight.configure({ multicolor: true }),
    ],
    content: leftHtml,
    onUpdate: ({ editor }) => {
      triggerChange(editor.getHTML(), rightEditor?.getHTML() || "");
    },
    onFocus: () => setActiveColumn("left")
  });

  const rightEditor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      LinkExtension.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-600 underline" } }),
      Placeholder.configure({ placeholder: "Type checklist items here as bullet lists..." }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Highlight.configure({ multicolor: true }),
    ],
    content: rightHtml,
    onUpdate: ({ editor }) => {
      triggerChange(leftEditor?.getHTML() || "", editor.getHTML());
    },
    onFocus: () => setActiveColumn("right")
  });

  const handleAddLink = useCallback(() => {
    const editor = activeColumn === "left" ? leftEditor : rightEditor;
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [activeColumn, leftEditor, rightEditor]);

  if (!leftEditor || !rightEditor) {
    return null;
  }

  const currentEditor = activeColumn === "left" ? leftEditor : rightEditor;

  return (
    <div className="flex flex-col border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-200 bg-gray-50/80">
        <button type="button" onClick={() => currentEditor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-gray-200 transition-colors ${currentEditor.isActive("bold") ? "bg-gray-200 text-blue-600" : "text-gray-700"}`} title="Bold">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" /></svg>
        </button>
        <button type="button" onClick={() => currentEditor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-gray-200 transition-colors ${currentEditor.isActive("italic") ? "bg-gray-200 text-blue-600" : "text-gray-700"}`} title="Italic">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" /></svg>
        </button>
        <button type="button" onClick={() => currentEditor.chain().focus().toggleUnderline().run()} className={`p-2 rounded hover:bg-gray-200 transition-colors ${currentEditor.isActive("underline") ? "bg-gray-200 text-blue-600" : "text-gray-700"}`} title="Underline">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" /></svg>
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button type="button" onClick={() => currentEditor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-gray-200 transition-colors ${currentEditor.isActive("heading", { level: 2 }) ? "bg-gray-200 text-blue-600" : "text-gray-700"}`} title="Heading 2">
          <span className="font-bold text-xs">H2</span>
        </button>
        <button type="button" onClick={() => currentEditor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded hover:bg-gray-200 transition-colors ${currentEditor.isActive("heading", { level: 3 }) ? "bg-gray-200 text-blue-600" : "text-gray-700"}`} title="Heading 3">
          <span className="font-bold text-xs">H3</span>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button type="button" onClick={() => currentEditor.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-gray-200 transition-colors ${currentEditor.isActive("bulletList") ? "bg-gray-200 text-blue-600" : "text-gray-700"}`} title="Bullet List">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" /></svg>
        </button>
        <button type="button" onClick={() => currentEditor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-gray-200 transition-colors ${currentEditor.isActive("orderedList") ? "bg-gray-200 text-blue-600" : "text-gray-700"}`} title="Numbered List">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" /></svg>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button type="button" onClick={handleAddLink} className={`p-2 rounded hover:bg-gray-200 transition-colors ${currentEditor.isActive("link") ? "bg-gray-200 text-blue-600" : "text-gray-700"}`} title="Add Link">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>
        </button>
      </div>

      {/* EDITORS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-gray-200 min-h-[300px]">
        {/* LEFT COLUMN */}
        <div className={`bg-white transition-colors duration-200 flex flex-col ${activeColumn === "left" ? "bg-blue-50/10" : ""}`}>
          <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between shadow-sm z-10">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Left Column (Paragraphs)</span>
            {activeColumn === "left" && <span className="flex w-2 h-2 bg-blue-500 rounded-full"></span>}
          </div>
          <EditorContent 
            editor={leftEditor} 
            className="prose prose-sm max-w-none p-4 flex-1 outline-none cursor-text focus:outline-none focus:ring-0 prose-p:my-1 prose-headings:mb-2 prose-headings:mt-4 prose-a:text-blue-600 min-h-[250px]" 
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className={`bg-white transition-colors duration-200 flex flex-col ${activeColumn === "right" ? "bg-blue-50/10" : ""}`}>
          <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between shadow-sm z-10">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Right Column (Checklist)</span>
            {activeColumn === "right" && <span className="flex w-2 h-2 bg-blue-500 rounded-full"></span>}
          </div>
          <EditorContent 
            editor={rightEditor} 
            className="prose prose-sm max-w-none p-4 flex-1 outline-none cursor-text focus:outline-none focus:ring-0 prose-p:my-1 prose-headings:mb-2 prose-headings:mt-4 prose-a:text-blue-600 prose-ul:my-1 prose-li:my-0.5 min-h-[250px]" 
          />
        </div>
      </div>
    </div>
  );
}
