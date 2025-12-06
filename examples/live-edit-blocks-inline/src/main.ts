import type { BlockTree } from "@blocks-ecosystem/core";
import { EditorAdapter } from "./EditorAdapter";
import { DocEditor } from "./DocEditor";
import { BlockPicker } from "./BlockPicker";
import { PropertiesPanel } from "./PropertiesPanel";

const initialTree: BlockTree = {
  rootId: "root",
  blocks: [],
};

function main() {
  const docEl = document.getElementById("doc-editor");
  const pickerEl = document.getElementById("block-picker-panel");
  const propsEl = document.getElementById("properties-panel");
  const cmdRoot = document.getElementById("cmd-menu-root");

  if (!docEl || !pickerEl || !propsEl || !cmdRoot) {
    throw new Error("Missing editor DOM roots");
  }

  const adapter = new EditorAdapter(initialTree, {
    onChange: () => {
      docEditor.render();
      propsPanel.render();
    },
    onSelect: () => {
      docEditor.render();
      propsPanel.render();
    },
    onInsert: (block, index) => {
      console.log("block.inserted", { id: block.id, element: (block.properties as any).element, index });
    },
    onTransform: (block, from, to) => {
      console.log("block.transformed", { id: block.id, from, to });
    },
    onCursorMove: (cursor) => {
      console.debug("cursor.moved", cursor);
    },
    onRemove: (blockId) => {
      console.log("block.removed", { blockId });
    },
    onInserterOpen: (ctx) => {
      console.debug("inserter.opened", ctx);
    },
    onInserterClose: () => {
      console.debug("inserter.closed");
    },
  });

  const docEditor = new DocEditor({ adapter, container: docEl, cmdMenuRoot: cmdRoot });
  const picker = new BlockPicker({ adapter, container: pickerEl });
  const propsPanel = new PropertiesPanel({ adapter, container: propsEl });

  // keep references to avoid tree-shaking
  (window as any).__blocksEditor = { adapter, docEditor, picker, propsPanel };
}

main();
