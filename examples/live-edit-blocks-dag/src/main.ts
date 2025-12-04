import type { Block, BlockTree, CanvasBlock, NodeBlock, EdgeBlock, NodePortDefinition, DagToUiBlock } from "@blocks/core/src";
import { BlocksRuntime, type BlockDelta } from "@blocks/runtime/src";
import { registerBlocksCanvas } from "@blocks/renderer/src/blocks-canvas";
import { BlocksRendererElement } from "@blocks/renderer/src/blocks-renderer";

registerBlocksCanvas();
customElements.define("blocks-renderer", BlocksRendererElement);

function createPorts(labels: string[]): NodePortDefinition[] {
  return labels.map((label, index) => ({ id: `${label}:${index}`, label }));
}

function createDagTree(): BlockTree {
  const canvas: CanvasBlock = {
    id: "canvas:dag",
    type: "visual",
    version: "1.0.0",
    properties: {
      element: "canvas",
      zoom: 0.9,
      offsetX: 80,
      offsetY: 40,
      showGrid: true,
      snapToGrid: false
    },
    inputs: [],
    outputs: [],
    schema: "blocks.schema.json"
  };


  const edge = (
    id: string,
    from: string,
    to: string,
    fromPort?: string,
    toPort?: string
  ): EdgeBlock => ({
    id,
    type: "visual",
    version: "1.0.0",
    properties: {
      element: "edge",
      canvasId: canvas.id,
      sourceNodeId: from,
      sourcePortId: fromPort,
      targetNodeId: to,
      targetPortId: toPort
    },
    inputs: [],
    outputs: [],
    schema: "blocks.schema.json"
  });

  const heroHeading: NodeBlock = {
    id: "node:hero-heading",
    type: "visual",
    version: "1.0.0",
    properties: {
      element: "node",
      canvasId: canvas.id,
      title: "Hero heading",
      x: 40,
      y: 40,
      inputs: createPorts(["in"]),
      outputs: createPorts(["out"]),
      blockElement: "heading",
      blockProps: {
        text: "Build interfaces as DAGs",
        level: 1
      }
    },
    inputs: [],
    outputs: [],
    schema: "blocks.schema.json"
  };

  const subHeading: NodeBlock = {
    id: "node:subheading",
    type: "visual",
    version: "1.0.0",
    properties: {
      element: "node",
      canvasId: canvas.id,
      title: "Subheading",
      x: 320,
      y: 80,
      inputs: createPorts(["in"]),
      outputs: createPorts(["out"]),
      blockElement: "heading",
      blockProps: {
        text: "Nodes describe blocks; the runtime renders them.",
        level: 2
      }
    },
    inputs: [],
    outputs: [],
    schema: "blocks.schema.json"
  };

  const body: NodeBlock = {
    id: "node:body",
    type: "visual",
    version: "1.0.0",
    properties: {
      element: "node",
      canvasId: canvas.id,
      title: "Body",
      x: 40,
      y: 140,
      inputs: createPorts(["in"]),
      outputs: createPorts(["out"]),
      blockElement: "paragraph",
      blockProps: {
        text: "Each node in this canvas describes a real UI block in the preview above. Move, duplicate, or delete nodes to recompose the UI."
      }
    },
    inputs: [],
    outputs: [],
    schema: "blocks.schema.json"
  };

  const quote: NodeBlock = {
    id: "node:quote",
    type: "visual",
    version: "1.0.0",
    properties: {
      element: "node",
      canvasId: canvas.id,
      title: "Quote",
      x: 320,
      y: 190,
      inputs: createPorts(["in"]),
      outputs: createPorts(["out"]),
      blockElement: "blockquote",
      blockProps: {
        text: "The DAG is the program; the blocks are the UI."
      }
    },
    inputs: [],
    outputs: [],
    schema: "blocks.schema.json"
  };

  const codeSample: NodeBlock = {
    id: "node:code",
    type: "visual",
    version: "1.0.0",
    properties: {
      element: "node",
      canvasId: canvas.id,
      title: "Code sample",
      x: 40,
      y: 240,
      inputs: createPorts(["in"]),
      outputs: createPorts(["out"]),
      blockElement: "code",
      blockProps: {
        text: "const tree = deriveUiTreeFromDag(graphTree);",
        language: "ts"
      }
    },
    inputs: [],
    outputs: [],
    schema: "blocks.schema.json"
  };

  const edges: EdgeBlock[] = [
    edge("edge:hero->slot1", heroHeading.id, "logic:dag-to-ui", undefined, "slot:1"),
    edge("edge:sub->slot2", subHeading.id, "logic:dag-to-ui", undefined, "slot:2"),
    edge("edge:body->slot3", body.id, "logic:dag-to-ui", undefined, "slot:3"),
    edge("edge:quote->slot4", quote.id, "logic:dag-to-ui", undefined, "slot:4"),
    edge("edge:code->slot5", codeSample.id, "logic:dag-to-ui", undefined, "slot:5")
  ];

  const dagToUi: DagToUiBlock = {
    id: "logic:dag-to-ui",
    type: "logic",
    version: "1.0.0",
    properties: {
      element: "dagToUi",
      canvasId: canvas.id
    },
    inputs: [],
    outputs: [],
    schema: "blocks.schema.json"
  };

  const blocks: Block[] = [canvas, heroHeading, subHeading, body, quote, codeSample, ...edges, dagToUi];

  return {
    id: "canvas-node-live-root",
    blocks,
    collections: []
  };
}

const runtime = new BlocksRuntime(createDagTree());

const canvasEl = document.getElementById("graph-canvas") as any;
const previewEl = document.getElementById("graph-preview") as any;

function executeDagToUiBlock(tree: BlockTree): BlockTree {
  const uiBlocks: Block[] = [];

  const dagBlocks = tree.blocks.filter(
    (b) => b.type === "logic" && (b.properties as any).element === "dagToUi"
  ) as DagToUiBlock[];
  if (dagBlocks.length === 0) {
    return {
      id: "ui-from-dag",
      blocks: [],
      collections: []
    };
  }

  const dagBlock = dagBlocks[0];
  const canvasId = (dagBlock.properties as any).canvasId as string;

  const nodes = tree.blocks.filter((b) => {
    const p = b.properties as any;
    return p.element === "node" && (p.canvasId ?? canvasId) === canvasId;
  }) as NodeBlock[];

  const nodesById = new Map(nodes.map((n) => [n.id, n] as const));

  // Primary ordering: edges into DagToUiBlock with targetPortId like "slot:1",
  // "slot:2", etc.
  const edgeBlocks = tree.blocks.filter(
    (b) => (b.properties as any).element === "edge"
  ) as EdgeBlock[];

  const edgesToDag = edgeBlocks
    .map((e) => {
      const p = e.properties as any;
      if (p.targetNodeId !== dagBlock.id) return null;
      const match = typeof p.targetPortId === "string" && p.targetPortId.match(/^slot:(\d+)$/);
      if (!match) return null;
      const index = Number(match[1]);
      return { edge: e, index };
    })
    .filter((x): x is { edge: EdgeBlock; index: number } => !!x)
    .sort((a, b) => a.index - b.index);

  const orderedNodes: NodeBlock[] = [];
  const seen = new Set<string>();

  for (const { edge } of edgesToDag) {
    const p = edge.properties as any;
    const node = nodesById.get(p.sourceNodeId as string);
    if (node && !seen.has(node.id)) {
      orderedNodes.push(node);
      seen.add(node.id);
    }
  }

  // Fallback: any remaining nodes ordered by position
  const remaining = nodes.filter((n) => !seen.has(n.id));
  remaining.sort((a, b) => {
    const pa = a.properties as any;
    const pb = b.properties as any;
    const ax = pa.x ?? 0;
    const bx = pb.x ?? 0;
    if (ax !== bx) return ax - bx;
    const ay = pa.y ?? 0;
    const by = pb.y ?? 0;
    return ay - by;
  });

  const finalOrder = [...orderedNodes, ...remaining];

  for (const n of finalOrder) {
    const p = n.properties as any;
    const blockElement = p.blockElement ?? "heading";
    const blockProps = p.blockProps ?? {};

    if (blockElement === "heading") {
      uiBlocks.push({
        id: `ui:${n.id}`,
        type: "visual",
        version: "1.0.0",
        properties: {
          element: "heading",
          text: blockProps.text ?? p.title ?? n.id,
          level: blockProps.level ?? 1
        },
        inputs: [],
        outputs: [],
        schema: "blocks.schema.json"
      });
    } else if (blockElement === "paragraph") {
      uiBlocks.push({
        id: `ui:${n.id}`,
        type: "visual",
        version: "1.0.0",
        properties: {
          element: "paragraph",
          text: blockProps.text ?? p.title ?? ""
        },
        inputs: [],
        outputs: [],
        schema: "blocks.schema.json"
      });
    } else if (blockElement === "blockquote") {
      uiBlocks.push({
        id: `ui:${n.id}`,
        type: "visual",
        version: "1.0.0",
        properties: {
          element: "blockquote",
          text: blockProps.text ?? p.title ?? ""
        },
        inputs: [],
        outputs: [],
        schema: "blocks.schema.json"
      });
    } else if (blockElement === "code") {
      uiBlocks.push({
        id: `ui:${n.id}`,
        type: "visual",
        version: "1.0.0",
        properties: {
          element: "code",
          text: blockProps.text ?? "",
          language: blockProps.language ?? ""
        },
        inputs: [],
        outputs: [],
        schema: "blocks.schema.json"
      });
    }

    // Additional blockElement cases (e.g. "card") can be added here.
  }

  return {
    id: "ui-from-dag",
    blocks: uiBlocks,
    collections: []
  };
}

function updatePreview(): void {
  if (!previewEl || typeof previewEl.setTree !== "function") return;
  const dagTree = runtime.getTree();
  const uiTree = executeDagToUiBlock(dagTree);
  previewEl.setTree(uiTree);
}

if (canvasEl && typeof canvasEl.setTree === "function") {
  canvasEl.setTree(runtime.getTree());
  updatePreview();

  canvasEl.addEventListener("canvas:nodePositionChange", (event: Event) => {
    const custom = event as CustomEvent<{ deltas: BlockDelta[] }>;
    const deltas = custom.detail?.deltas ?? [];
    if (!Array.isArray(deltas) || deltas.length === 0) return;

    runtime.applyDeltas(deltas);
    canvasEl.setTree(runtime.getTree());
    updatePreview();
  });

  canvasEl.addEventListener("canvas:viewChange", (event: Event) => {
    const custom = event as CustomEvent<{ deltas: BlockDelta[] }>;
    const deltas = custom.detail?.deltas ?? [];
    if (!Array.isArray(deltas) || deltas.length === 0) return;

    runtime.applyDeltas(deltas);
    // View changes do not affect the UI tree, but we keep the runtime in sync.
  });

  canvasEl.addEventListener("canvas:edit", (event: Event) => {
    const custom = event as CustomEvent<{ deltas: BlockDelta[] }>;
    const deltas = custom.detail?.deltas ?? [];
    if (!Array.isArray(deltas) || deltas.length === 0) return;

    runtime.applyDeltas(deltas);
    canvasEl.setTree(runtime.getTree());
    updatePreview();
  });
}
