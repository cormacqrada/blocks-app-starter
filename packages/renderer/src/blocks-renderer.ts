import { deserializeFromMarkdown, executeBlockTree, markdownToBlockTree, type ExecutableDocument } from "@blocks-ecosystem/runtime";
import type { BlockTree, Block, ApplyTokenCollectionBlock, TokenCollection, ThemeBlock } from "@blocks-ecosystem/core";
import { marked } from "marked";

/**
 * <blocks-renderer>
 *
 * A Web Component that turns Markdown-with-BLOCKS-header into rendered HTML
 * plus (optionally) a debug view of the underlying BlockTree.
 *
 * Usage:
 *   <blocks-renderer debug="true">
 *   <!-- BLOCKS:{"id":"doc","blocks":[],"collections":[]} -->
 *   # Hello Blocks
 *   </blocks-renderer>
 */
export class BlocksRendererElement extends HTMLElement {
  private markdownSource: string | null = null;
  private treeOverride: BlockTree | null = null;

  static get observedAttributes(): string[] {
    return ["markdown"];
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(name: string): void {
    if (name === "markdown") {
      this.markdownSource = this.getAttribute("markdown");
      this.render();
    }
  }

  set markdown(value: string | null) {
    this.markdownSource = value;
    if (value !== null) {
      this.setAttribute("markdown", value);
    } else {
      this.removeAttribute("markdown");
    }
    this.render();
  }

  get markdown(): string {
    return this.markdownSource ?? this.textContent ?? "";
  }

  setTree(tree: BlockTree): void {
    this.treeOverride = tree;
    this.render();
  }

  private render(): void {
    const markdown = this.markdown;
    const attrId = this.getAttribute("doc-id");
    const id = attrId ?? (this.id || "blocks-renderer-doc");

    const doc: ExecutableDocument = deserializeFromMarkdown(id, markdown);

    const baseTree: BlockTree =
      doc.tree.blocks.length || doc.tree.collections.length
        ? doc.tree
        : markdownToBlockTree(id, doc.markdown);

    const tree = this.treeOverride ?? baseTree;
    const executedTree = executeBlockTree(tree);

    const shadow = this.shadowRoot ?? this.attachShadow({ mode: "open" });
    shadow.innerHTML = "";

    ensureStyles(shadow);
    applyThemeFromTree(tree, shadow);

    // Blocks graph rendering as visual elements (heading, paragraph, code, blockquote, ...)
    const layout = renderVisualLayout(executedTree);
    if (layout) {
      shadow.appendChild(layout);
    }

    if (this.getAttribute("debug") === "true") {
      const pre = document.createElement("pre");
      pre.className = "blocks-renderer-tree-debug";
      pre.textContent = JSON.stringify(executedTree, null, 2);
      shadow.appendChild(pre);
    }
  }
}

function findApplyTokenCollectionBlock(tree: BlockTree): ApplyTokenCollectionBlock | null {
  return (
    tree.blocks.find((b: Block) => (b as any).properties?.element === "applyTokenCollection") as ApplyTokenCollectionBlock
  ) ?? null;
}

function applyThemeFromTree(tree: BlockTree, shadow: ShadowRoot): void {
  const applyBlock = findApplyTokenCollectionBlock(tree);
  if (!applyBlock) return;

  const props = applyBlock.properties as any;
  const collectionName: string | undefined = props.collectionName;
  const outputType: string | undefined = props.outputType;
  if (!collectionName || outputType !== "cssVariables") return;

  const collection = tree.collections.find((c: TokenCollection) => c.name === collectionName) as TokenCollection | undefined;
  if (!collection) return;

  const items = (collection.items as any[]) ?? [];
  const tokens: Record<string, string> = {};
  for (const item of items) {
    if (!item) continue;
    const key = item.key ?? item.name;
    const value = item.value ?? item.token ?? item.hex;
    if (key && value) {
      tokens[String(key)] = String(value);
    }
  }

  const host = shadow.host as HTMLElement;
  for (const [key, value] of Object.entries(tokens)) {
    const cssVar = "--blocks-" + key.replace(/\./g, "-");
    host.style.setProperty(cssVar, value);
  }
}

export function renderVisualLayout(tree: BlockTree): HTMLElement | null {
  const visualBlocks = tree.blocks.filter((b: Block) => b.type === "visual");
  if (visualBlocks.length === 0) return null;

  const section = document.createElement("section");
  section.className = "blocks-renderer-markdown-layout";

  for (const block of visualBlocks) {
    section.appendChild(renderVisualBlock(block));
  }

  return section;
}

export function renderVisualBlock(block: Block): HTMLElement {
  const kind = String(block.properties["element"] ?? "paragraph");
  const text = String(block.properties["text"] ?? "");
  const level = Number(block.properties["level"] ?? 1);
  const language = String(block.properties["language"] ?? "");

  const name = String((block.properties as any).name ?? "");
  const options = ((block.properties as any).options as { label: string; value: string }[] | undefined) ?? [];
  const min =
    typeof (block.properties as any).min === "number" ? (block.properties as any).min : Number((block.properties as any).min ?? 0);
  const max =
    typeof (block.properties as any).max === "number" ? (block.properties as any).max : Number((block.properties as any).max ?? 100);
  const value =
    typeof (block.properties as any).value === "number"
      ? (block.properties as any).value
      : Number((block.properties as any).value ?? min);
  const inputType = String((block.properties as any).inputType ?? "text");
  const placeholder = String((block.properties as any).placeholder ?? "");
  const rows = Number((block.properties as any).rows ?? 3);
  const variant = String((block.properties as any).variant ?? "primary");

  switch (kind) {
    case "heading": {
      const clamped = Math.min(Math.max(level, 1), 6);
      const tag = `blocks-h${clamped}`;
      const h = document.createElement(tag);
      h.textContent = text;
      return h;
    }
    case "code": {
      const el = document.createElement("blocks-code");
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      if (language) {
        code.className = `language-${language}`;
      }
      code.textContent = text;
      pre.appendChild(code);
      el.appendChild(pre);
      return el;
    }
    case "blockquote": {
      const el = document.createElement("blocks-blockquote");
      const q = document.createElement("blockquote");
      q.textContent = text;
      el.appendChild(q);
      return el;
    }
    case "input": {
      const el = document.createElement("blocks-input");
      const labelEl = document.createElement("label");
      labelEl.className = "blocks-field-label";
      labelEl.textContent = text || name || "Input";
      const wrapper = document.createElement("div");
      wrapper.className = "blocks-input-wrapper";
      const input = document.createElement("input");
      input.type = inputType || "text";
      if (placeholder) input.placeholder = placeholder;
      wrapper.appendChild(input);
      el.appendChild(labelEl);
      el.appendChild(wrapper);
      return el;
    }
    case "textarea": {
      const el = document.createElement("blocks-textarea");
      const labelEl = document.createElement("label");
      labelEl.className = "blocks-field-label";
      labelEl.textContent = text || name || "Textarea";
      const ta = document.createElement("textarea");
      if (placeholder) ta.placeholder = placeholder;
      if (!Number.isNaN(rows) && rows > 0) ta.rows = rows;
      el.appendChild(labelEl);
      el.appendChild(ta);
      return el;
    }
    case "button": {
      const el = document.createElement("blocks-button");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `blocks-button blocks-button-${variant}`;
      btn.textContent = text || "Button";
      el.appendChild(btn);
      return el;
    }
    case "paragraph":
    default: {
      const el = document.createElement("blocks-p");
      const p = document.createElement("p");
      // Use marked to support inline markdown (e.g. `code`, **bold**)
      p.innerHTML = marked.parseInline(text) as string;
      el.appendChild(p);
      return el;
    }
  }
}

function ensureStyles(shadow: ShadowRoot): void {
  if (shadow.querySelector("style[data-blocks-style]")) return;

  const style = document.createElement("style");
  style.setAttribute("data-blocks-style", "true");
  style.textContent = `
:host {
  --blocks-font-sans: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  --blocks-radius-md: 0.5rem;
  --blocks-radius-lg: 0.75rem;
  --blocks-color-bg: #050816;
  --blocks-color-surface: #111827;
  --blocks-color-surface-soft: #020617;
  --blocks-color-border-subtle: rgba(148, 163, 184, 0.35);
  --blocks-color-text: #e5e7eb;
  --blocks-color-muted: #9ca3af;
  --blocks-color-accent: #6366f1;
  --blocks-color-accent-soft: rgba(99, 102, 241, 0.12);
  --blocks-color-code-bg: #020617;
  --blocks-color-bq-border: rgba(148, 163, 184, 0.6);
  --blocks-shadow-soft: 0 10px 30px rgba(15, 23, 42, 0.7);

  font-family: var(--blocks-font-sans);
  color: var(--blocks-color-text);
  background: transparent;
  display: block;
}

.blocks-renderer-markdown-layout {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1.25rem 1.5rem;
  border-radius: var(--blocks-radius-lg);
  background: radial-gradient(circle at top left, rgba(99,102,241,0.14), transparent 55%),
              radial-gradient(circle at bottom right, rgba(56,189,248,0.12), transparent 55%),
              var(--blocks-color-surface);
  box-shadow: var(--blocks-shadow-soft);
  border: 1px solid var(--blocks-color-border-subtle);
}

.blocks-renderer-tree-debug {
  margin-top: 1.25rem;
  padding: 0.75rem 1rem;
  border-radius: var(--blocks-radius-md);
  background: var(--blocks-color-surface-soft);
  color: var(--blocks-color-muted);
  font-size: 0.75rem;
  max-height: 260px;
  overflow: auto;
}

blocks-h1, blocks-h2, blocks-h3, blocks-h4, blocks-h5, blocks-h6,
blocks-p, blocks-code, blocks-blockquote,
blocks-input, blocks-textarea, blocks-button {
  display: block;
}

blocks-h1 {
  font-size: 1.75rem;
  line-height: 1.2;
  letter-spacing: -0.03em;
  font-weight: 600;
}

blocks-p {
  font-size: 0.95rem;
  color: var(--blocks-color-text);
}

blocks-code pre {
  margin: 0;
  padding: 0.75rem 0.9rem;
  border-radius: var(--blocks-radius-md);
  background: var(--blocks-color-code-bg);
  border: 1px solid rgba(15,23,42,0.9);
  font-size: 0.85rem;
  overflow-x: auto;
}

blocks-code code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

blocks-blockquote {
  border-left: 2px solid var(--blocks-color-bq-border);
  padding-left: 0.9rem;
  color: var(--blocks-color-muted);
}

.blocks-field-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--blocks-color-muted);
  margin-bottom: 0.25rem;
}

.blocks-input-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  border-radius: var(--blocks-radius-md);
  border: 1px solid rgba(31,41,55,0.9);
  background: rgba(15,23,42,0.95);
  padding: 0.1rem 0.45rem;
}

.blocks-input-wrapper input {
  border: none;
  background: transparent;
  padding: 0.25rem 0.1rem;
  color: var(--blocks-color-text);
  font-size: 0.85rem;
}

blocks-p p strong {
  color: #e5e7eb;
}

blocks-p p code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.85em;
  padding: 0.15rem 0.35rem;
  border-radius: 999px;
  background: rgba(15,23,42,0.95);
  border: 1px solid rgba(148,163,184,0.4);
}
  `;

  shadow.prepend(style);
}

export function registerBlocksRenderer(tagName = "blocks-renderer"): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, BlocksRendererElement);
  }
}
