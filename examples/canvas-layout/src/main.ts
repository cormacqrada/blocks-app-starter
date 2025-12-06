import type { Block, BlockTree, CanvasBlock, NodeBlock, NodePortDefinition } from "@blocks-ecosystem/core";
import { BlocksRuntime, type BlockDelta } from "@blocks-ecosystem/runtime";
import { registerBlocksCanvas } from "@blocks-ecosystem/renderer/blocks-canvas";

registerBlocksCanvas();

function createPorts(labels: string[]): NodePortDefinition[] {
  return labels.map((label, index) => ({ id: `${label}:${index}`, label }));
}

function createCanvasTree(): BlockTree {
  const canvas: CanvasBlock = {
    id: "canvas:main",
    type: "visual",
    version: "1.0.0",
    properties: {
      element: "canvas",
      zoom: 1,
      offsetX: 80,
      offsetY: 40,
      showGrid: true,
      snapToGrid: false
    },
    inputs: [],
    outputs: [],
    schema: "blocks.schema.json"
  };

  const node = (
    id: string,
    title: string,
    x: number,
    y: number,
    inputs: string[],
    outputs: string[]
  ): NodeBlock => ({
    id,
    type: "visual",
    version: "1.0.0",
    properties: {
      element: "node",
      canvasId: canvas.id,
      title,
      x,
      y,
      inputs: createPorts(inputs),
      outputs: createPorts(outputs)
    },
    inputs: [],
    outputs: [],
    schema: "blocks.schema.json"
  });

  const blocks: Block[] = [
    canvas,
    node("node:noise", "Noise", 40, 60, ["seed", "frequency"], ["noise"]),
    node("node:color-map", "Color Map", 320, 80, ["noise"], ["colorTexture"]),
    node("node:displace", "Displace", 640, 60, ["geometry", "displacement"], ["geometry"]),
    node("node:output", "Output", 960, 120, ["geometry", "colorTexture"], [])
  ];

  return {
    id: "canvas-node-demo-root",
    blocks,
    collections: []
  };
}

const initialTree: BlockTree = createCanvasTree();
const runtime = new BlocksRuntime(initialTree);

const canvasEl = document.getElementById("demo-canvas") as any;
if (canvasEl && typeof canvasEl.setTree === "function") {
  // Initial render from runtime tree
  canvasEl.setTree(runtime.getTree());

  canvasEl.addEventListener("canvas:nodePositionChange", (event: Event) => {
    const custom = event as CustomEvent<{ deltas: BlockDelta[] }>;
    const deltas = custom.detail?.deltas ?? [];
    if (!Array.isArray(deltas) || deltas.length === 0) return;

    runtime.applyDeltas(deltas);
    // Node components maintain their own absolute positions visually; no
    // immediate setTree() here to avoid snapping.
  });

  canvasEl.addEventListener("canvas:viewChange", (event: Event) => {
    const custom = event as CustomEvent<{ deltas: BlockDelta[] }>;
    const deltas = custom.detail?.deltas ?? [];
    if (!Array.isArray(deltas) || deltas.length === 0) return;

    runtime.applyDeltas(deltas);
    // The canvas component already updates its own transform; we only need to
    // keep the runtime in sync.
  });
}
