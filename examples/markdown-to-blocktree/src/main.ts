import { registerBlocksRenderer, BlocksRendererElement } from "../../../packages/renderer/src";
import { BlocksRuntime, markdownToBlockTree, markdownToReplaceDelta } from "../../../packages/runtime/src";
import type { BlockTree, ThemeBlock } from "../../../packages/core/src";

registerBlocksRenderer();

const editor = document.getElementById("editor") as HTMLTextAreaElement | null;
const preview = document.getElementById("preview") as BlocksRendererElement | null;

if (editor && preview) {
  const baseTree: BlockTree = markdownToBlockTree("editor-doc", editor.value);

  // Inject a ThemeBlock into the tree as an example of parametric theming.
  const themeBlock: ThemeBlock = {
    id: "theme-default",
    type: "data",
    version: "1.0.0",
    properties: {
      element: "theme",
      tokens: {
        "color-text": "#e5e7eb",
        "color-accent": "#6366f1",
        "color-surface": "#111827"
      }
    },
    inputs: [],
    outputs: [],
    schema: "blocks.schema.json"
  };

  baseTree.blocks.unshift(themeBlock as any);

  const runtime = new BlocksRuntime(baseTree);

  runtime.registerAdapter({
    id: "renderer-adapter",
    onDeltas(_deltas, rt) {
      preview.setTree(rt.getTree());
    }
  });

  // Initial render
  preview.setTree(runtime.getTree());

  editor.addEventListener("input", () => {
    const deltas = markdownToReplaceDelta("editor-doc", editor.value);
    runtime.applyDeltas(deltas);
  });
}
