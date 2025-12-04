import type { Block } from "@blocks/core";
import type { EditorAdapter } from "./EditorAdapter";
import { findRegistryDefByElement } from "./blockRegistry";

export interface PropertiesPanelOptions {
  adapter: EditorAdapter;
  container: HTMLElement;
}

export class PropertiesPanel {
  private adapter: EditorAdapter;
  private container: HTMLElement;

  constructor(options: PropertiesPanelOptions) {
    this.adapter = options.adapter;
    this.container = options.container;
    this.render();
  }

  render() {
    this.container.innerHTML = "";
    const selectedId = this.adapter.selectedBlockId;
    if (!selectedId) {
      const empty = document.createElement("div");
      empty.textContent = "No block selected";
      empty.style.fontSize = "0.8rem";
      empty.style.color = "#9ca3af";
      this.container.appendChild(empty);
      return;
    }

    const block = this.adapter.blocks.find((b) => b.id === selectedId);
    if (!block) {
      const empty = document.createElement("div");
      empty.textContent = "Selected block not found";
      this.container.appendChild(empty);
      return;
    }

    this.renderBlock(block);
  }

  private renderBlock(block: Block) {
    const element = block.properties?.element as string | undefined;
    const def = findRegistryDefByElement(element);
    if (!def) {
      const text = document.createElement("div");
      text.textContent = `Unknown block type: ${element ?? "(none)"}`;
      this.container.appendChild(text);
      return;
    }

    const title = document.createElement("div");
    title.textContent = def.label;
    title.style.fontSize = "0.85rem";
    title.style.fontWeight = "600";
    title.style.marginBottom = "0.4rem";
    this.container.appendChild(title);

    def.propSchema.forEach((prop) => {
      const field = document.createElement("div");
      field.className = "prop-field";

      const label = document.createElement("label");
      label.textContent = prop.label;
      field.appendChild(label);

      const currentValue = (block.properties as any)?.[prop.name];

      if (prop.type === "string" || prop.type === "number") {
        const input = document.createElement("input");
        input.type = prop.type === "number" ? "number" : "text";
        input.value = currentValue != null ? String(currentValue) : "";
        input.onchange = () => {
          const raw = input.value;
          const value = prop.type === "number" ? Number(raw) : raw;
          this.adapter.updateBlockProps(block.id, { [prop.name]: value });
        };
        field.appendChild(input);
      } else if (prop.type === "enum") {
        const select = document.createElement("select");
        (prop.options ?? []).forEach((opt) => {
          const option = document.createElement("option");
          option.value = opt;
          option.textContent = opt;
          if (String(currentValue) === opt) option.selected = true;
          select.appendChild(option);
        });
        select.onchange = () => {
          this.adapter.updateBlockProps(block.id, { [prop.name]: select.value });
        };
        field.appendChild(select);
      }

      this.container.appendChild(field);
    });
  }
}
