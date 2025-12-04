import type { EditorAdapter } from "./EditorAdapter";
import { BLOCK_REGISTRY } from "./blockRegistry";

export interface BlockPickerOptions {
  adapter: EditorAdapter;
  container: HTMLElement;
}

export class BlockPicker {
  private adapter: EditorAdapter;
  private container: HTMLElement;

  constructor(options: BlockPickerOptions) {
    this.adapter = options.adapter;
    this.container = options.container;
    this.render();
  }

  render() {
    this.container.innerHTML = "";
    const list = document.createElement("div");
    list.className = "block-picker-list";

    BLOCK_REGISTRY.forEach((def) => {
      const item = document.createElement("button");
      item.className = "block-picker-item";
      item.type = "button";
      item.onclick = () => this.adapter.insertBlock(def.id);

      const title = document.createElement("div");
      title.textContent = def.label;
      const desc = document.createElement("div");
      desc.textContent = def.description ?? "";
      desc.style.fontSize = "0.7rem";
      desc.style.opacity = "0.8";

      item.appendChild(title);
      if (def.description) item.appendChild(desc);

      list.appendChild(item);
    });

    this.container.appendChild(list);
  }
}
