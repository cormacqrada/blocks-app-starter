import type { Block } from "@blocks-ecosystem/core";
import type { EditorAdapter } from "./EditorAdapter";
import { findRegistryDefByElement } from "./blockRegistry";

export interface DocEditorOptions {
  adapter: EditorAdapter;
  container: HTMLElement;
  cmdMenuRoot: HTMLElement;
}

export class DocEditor {
  private adapter: EditorAdapter;
  private container: HTMLElement;
  private cmdMenuRoot: HTMLElement;
  private cmdMenuEl: HTMLDivElement | null = null;
  private cmdSearchEl: HTMLInputElement | null = null;
  private cmdContext: {
    blockId: string;
    blockIndex: number;
    editable: HTMLElement;
    mode: "transform" | "insert";
    caretOffset: number;
  } | null = null;

  constructor(options: DocEditorOptions) {
    this.adapter = options.adapter;
    this.container = options.container;
    this.cmdMenuRoot = options.cmdMenuRoot;

    this.container.tabIndex = 0;
    this.container.addEventListener("keydown", this.handleKeyDown);
    this.container.addEventListener("click", (e) => {
      if (e.target === this.container) {
        this.adapter.selectBlock(null);
        this.closeCmdMenu();
      }
    });

    this.render();
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    // For now, only allow `/` when focused directly on the container (no active editor).
    if (event.target === this.container && event.key === "/") {
      event.preventDefault();
      this.openCmdMenu();
    }
  };

  private openCmdMenu(ctx?: {
    blockId: string;
    blockIndex: number;
    editable: HTMLElement;
    mode: "transform" | "insert";
    caretOffset: number;
  }) {
    if (this.cmdMenuEl) return;
    if (ctx) {
      this.cmdContext = ctx;
      this.adapter.notifyInserterOpen({
        blockId: ctx.blockId,
        blockIndex: ctx.blockIndex,
        mode: ctx.mode,
      });
    } else {
      this.cmdContext = null;
      this.adapter.notifyInserterOpen({
        blockId: null,
        blockIndex: null,
        mode: "insert",
      });
    }

    const menu = document.createElement("div");
    menu.className = "cmd-menu";

    const input = document.createElement("input");
    input.className = "cmd-menu-search";
    input.placeholder = "Search blocks...";

    const list = document.createElement("div");
    list.className = "cmd-menu-list";

    const renderList = () => {
      const query = input.value.toLowerCase();
      list.innerHTML = "";
      const registry = this.adapter.getRegistry();
      const ctx = this.cmdContext;
      const mode = ctx?.mode ?? "insert";

      registry
        .filter((b) =>
          b.label.toLowerCase().includes(query) || (b.description ?? "").toLowerCase().includes(query),
        )
        .filter((b) => (mode === "transform" ? b.transformable : true))
        .forEach((def) => {
          const item = document.createElement("button");
          item.className = "cmd-menu-item";
          item.textContent = def.label;
          item.onclick = () => {
            const ctxNow = this.cmdContext;
            if (ctxNow) {
              if (ctxNow.mode === "transform") {
                // Transform current block in-place.
                this.adapter.transformBlock(ctxNow.blockId, def.id);
              } else {
                // Insert new block after current, splitting text if caret is mid-line.
                const text = ctxNow.editable.textContent ?? "";
                const offset = ctxNow.caretOffset;
                const before = text.slice(0, offset);
                const after = text.slice(offset);

                this.adapter.updateBlockProps(ctxNow.blockId, { text: before });

                const insertIndex = ctxNow.blockIndex + 1;
                let cursorTargetId: string | null = null;

                if (after.length > 0) {
                  const split = this.adapter.insertBlock("paragraph", insertIndex);
                  this.adapter.updateBlockProps(split.id, { text: after });
                  const inserted = this.adapter.insertBlock(def.id, insertIndex + 1);
                  cursorTargetId = inserted.id;
                } else {
                  const inserted = this.adapter.insertBlock(def.id, insertIndex);
                  cursorTargetId = inserted.id;
                }

                if (cursorTargetId) {
                  this.adapter.setCursor(cursorTargetId, 0);
                }
              }
            } else {
              // Global insert (no context) – append at end.
              const inserted = this.adapter.insertBlock(def.id);
              this.adapter.setCursor(inserted.id, 0);
            }
            this.closeCmdMenu();
          };
          list.appendChild(item);
        });
    };

    input.addEventListener("input", renderList);

    menu.appendChild(input);
    menu.appendChild(list);
    this.cmdMenuRoot.appendChild(menu);
    this.cmdMenuEl = menu;
    this.cmdSearchEl = input;

    renderList();
    setTimeout(() => input.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        this.closeCmdMenu();
      }
    };

    menu.addEventListener("keydown", onKeyDown);
  }

  private closeCmdMenu() {
    if (!this.cmdMenuEl) return;
    this.cmdMenuRoot.removeChild(this.cmdMenuEl);
    this.cmdMenuEl = null;
    this.cmdSearchEl = null;
    this.cmdContext = null;
    this.adapter.notifyInserterClose();
  }

  render(): void {
    const blocks = this.adapter.blocks;
    console.debug("DocEditor.render", { count: blocks.length, blocks });
    this.container.innerHTML = "";

    blocks.forEach((block, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "doc-block-wrapper";
      wrapper.dataset.blockId = block.id;
      if (this.adapter.selectedBlockId === block.id) {
        wrapper.classList.add("selected");
      }
      wrapper.onclick = (e) => {
        e.stopPropagation();
        this.adapter.selectBlock(block.id);
      };

      const content = document.createElement("div");
      content.className = "doc-block-content";

      // Single editable surface that is also the preview for this block.
      const editor = document.createElement("div");
      editor.className = "doc-block-editable";
      editor.contentEditable = "true";
      editor.spellcheck = true;

      this.renderBlockPreview(block, editor);

      editor.addEventListener("keydown", (event: KeyboardEvent) => {
        const selection = window.getSelection();
        const caretOffset = selection && selection.anchorNode ? selection.anchorOffset : (editor.textContent ?? "").length;

        // Update cursor position event
        this.adapter.setCursor(block.id, caretOffset);

        // If inserter palette is open, treat printable keys as search input (ephemeral command text).
        if (this.cmdMenuEl && this.cmdSearchEl) {
          if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault();
            this.cmdSearchEl.value += event.key;
            this.cmdSearchEl.dispatchEvent(new Event("input"));
            return;
          }
          if (event.key === "Backspace") {
            event.preventDefault();
            this.cmdSearchEl.value = this.cmdSearchEl.value.slice(0, -1);
            this.cmdSearchEl.dispatchEvent(new Event("input"));
            return;
          }
        }

        // Notion-style: `/` opens the command menu for this line.
        if (event.key === "/") {
          event.preventDefault();
          const text = editor.textContent ?? "";
          const before = text.slice(0, caretOffset).trimStart();
          const mode: "transform" | "insert" = before.length === 0 ? "transform" : "insert";
          this.openCmdMenu({ blockId: block.id, blockIndex: index, editable: editor, mode, caretOffset });
          return;
        }

        if (event.key === "Enter" && !event.shiftKey) {
          // Create a new paragraph block below on Enter.
          event.preventDefault();
          const newBlock = this.adapter.insertBlock("paragraph", index + 1);
          this.render();
          const next = this.container.querySelector<HTMLElement>(
            `.doc-block-wrapper[data-block-id="${newBlock.id}"] .doc-block-editable`,
          );
          next?.focus();
          this.adapter.setCursor(newBlock.id, 0);
          return;
        }

        // Auto-pattern transforms (e.g. #, ##, > at line start)
        if (event.key === " " && !event.shiftKey) {
          const fullText = editor.textContent ?? "";
          const before = fullText.slice(0, caretOffset);
          const after = fullText.slice(caretOffset);
          const trimmedLeading = before.trimStart();

          const patterns: { match: string; action: () => void }[] = [
            {
              match: "#",
              action: () => {
                // Heading level 1
                const without = fullText.replace(/^\s*#\s+/, "");
                this.adapter.transformBlock(block.id, "heading");
                this.adapter.updateBlockProps(block.id, { level: 1, text: without });
              },
            },
            {
              match: "##",
              action: () => {
                const without = fullText.replace(/^\s*##\s+/, "");
                this.adapter.transformBlock(block.id, "heading");
                this.adapter.updateBlockProps(block.id, { level: 2, text: without });
              },
            },
            {
              match: "###",
              action: () => {
                const without = fullText.replace(/^\s*###\s+/, "");
                this.adapter.transformBlock(block.id, "heading");
                this.adapter.updateBlockProps(block.id, { level: 3, text: without });
              },
            },
            {
              match: ">",
              action: () => {
                const without = fullText.replace(/^\s*>\s+/, "");
                this.adapter.transformBlock(block.id, "blockquote");
                this.adapter.updateBlockProps(block.id, { text: without });
              },
            },
          ];

          const found = patterns.find((p) => trimmedLeading === p.match);
          if (found) {
            event.preventDefault();
            found.action();
            this.render();
            const updated = this.container.querySelector<HTMLElement>(
              `.doc-block-wrapper[data-block-id="${block.id}"] .doc-block-editable`,
            );
            updated?.focus();
            this.adapter.setCursor(block.id, 0);
            return;
          }
        }

        if (event.key === "Backspace" && !event.shiftKey) {
          const text = (editor.textContent ?? "").trim();
          if (text.length === 0) {
            // Delete this block when backspacing on empty line (if not the only block).
            const blocksNow = this.adapter.blocks;
            if (blocksNow.length > 1) {
              event.preventDefault();
              const prev = blocksNow[index - 1];
              this.adapter.deleteBlock(block.id);
              this.render();
              if (prev) {
                const prevEditable = this.container.querySelector<HTMLElement>(
                  `.doc-block-wrapper[data-block-id="${prev.id}"] .doc-block-editable`,
                );
                prevEditable?.focus();
              }
              return;
            }
          }
        }
      });

      editor.addEventListener("blur", () => {
        const text = editor.textContent ?? "";
        this.adapter.updateBlockProps(block.id, { text });
      });

      content.appendChild(editor);
      wrapper.appendChild(content);
      this.container.appendChild(wrapper);
    });
  }

  private renderBlockPreview(block: Block, target: HTMLElement): void {
    const element = (block.properties as any)?.element as string | undefined;
    const def = findRegistryDefByElement(element);
    const props = (block.properties as any) ?? {};

    target.innerHTML = "";

    if (!def) {
      target.textContent = `Unknown block: ${element ?? "(no element)"}`;
      return;
    }

    switch (def.element) {
      case "heading": {
        const level = Number(props.level ?? 2);
        const text = String(props.text ?? "Heading");
        const tag = ("h" + Math.min(Math.max(level, 1), 4)) as keyof HTMLElementTagNameMap;
        const h = document.createElement(tag);
        h.textContent = text;
        target.appendChild(h);
        break;
      }
      case "blockquote": {
        const text = String(props.text ?? "");
        const bq = document.createElement("blockquote");
        bq.textContent = text;
        target.appendChild(bq);
        break;
      }
      case "code": {
        const text = String(props.text ?? "");
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.textContent = text;
        pre.appendChild(code);
        target.appendChild(pre);
        break;
      }
      case "paragraph":
      default: {
        const text = String(props.text ?? "");
        const p = document.createElement("p");
        p.textContent = text;
        target.appendChild(p);
        break;
      }
    }
  }
}
