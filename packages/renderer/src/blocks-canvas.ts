import type { BlockTree, CanvasBlock, NodeBlock, EdgeBlock } from "../../core/src";
import type { NodeMoveDetail } from "./blocks-node";
import { registerBlocksNode, BlocksNodeElement } from "./blocks-node";

type BlockDelta = {
  kind: "insert" | "update" | "remove";
  blockId?: string;
  path?: string;
  block?: unknown;
};

export interface CanvasNodeMoveDetail {
  nodeId: string;
  x: number;
  y: number;
  deltas: BlockDelta[];
}

export interface CanvasViewChangeDetail {
  canvasId: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  deltas: BlockDelta[];
}

export class BlocksCanvasElement extends HTMLElement {
  private tree: BlockTree | null = null;
  private canvasId: string | null = null;
  private selectedNodeIds: Set<string> = new Set();
  private marqueeEl: HTMLDivElement | null = null;
  private marqueeStart: { x: number; y: number } | null = null;

  static get observedAttributes(): string[] {
    return ["canvas-id"];
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (name === "canvas-id") {
      this.canvasId = value;
      this.render();
    }
  }

  setTree(tree: BlockTree): void {
    this.tree = tree;
    this.render();
  }

  connectedCallback(): void {
    this.addEventListener("node:moveRequested", this.handleNodeMoveRequested as EventListener);
    this.addEventListener("click", this.handleCanvasClick as EventListener);

    // Make the canvas focusable so we can listen for keyboard shortcuts.
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0");
    }
    this.addEventListener("keydown", this.handleKeyDown as EventListener);

    this.render();
  }

  disconnectedCallback(): void {
    this.removeEventListener("node:moveRequested", this.handleNodeMoveRequested as EventListener);
    this.removeEventListener("click", this.handleCanvasClick as EventListener);
    this.removeEventListener("keydown", this.handleKeyDown as EventListener);
  }

  private render(): void {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: "open" });
    shadow.innerHTML = "";
    ensureCanvasStyles(shadow);

    if (!this.tree) return;

    const canvas = this.findCanvas();
    if (!canvas) {
      const empty = document.createElement("div");
      empty.className = "blocks-canvas-empty";
      empty.textContent = "No canvas block found.";
      shadow.appendChild(empty);
      return;
    }

    const props = canvas.properties as any;
    const zoom: number = props.zoom ?? 1;
    const offsetX: number = props.offsetX ?? 0;
    const offsetY: number = props.offsetY ?? 0;
    const showGrid: boolean = props.showGrid ?? true;

    const viewport = document.createElement("div");
    viewport.className = "blocks-canvas-viewport";
    if (showGrid) viewport.classList.add("with-grid");

    const plane = document.createElement("div");
    plane.className = "blocks-canvas-plane";
    plane.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`;

    // Edges SVG overlay
    const edgesSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    edgesSvg.setAttribute("class", "blocks-canvas-edges");
    edgesSvg.setAttribute("width", "100%");
    edgesSvg.setAttribute("height", "100%");
    edgesSvg.setAttribute("viewBox", "0 0 2000 1000");

    const edges = this.findEdges(canvas.id);
    const nodesById = new Map<string, NodeBlock>();
    for (const n of this.findNodes(canvas.id)) nodesById.set(n.id, n);

    for (const edge of edges) {
      const props = edge.properties as any;
      const source = nodesById.get(props.sourceNodeId);
      const target = nodesById.get(props.targetNodeId);
      if (!source || !target) continue;
      const s = source.properties as any;
      const t = target.properties as any;
      const sx = (s.x ?? 0) + 150; // approximate right side of node
      const sy = (s.y ?? 0) + 40;
      const tx = (t.x ?? 0);
      const ty = (t.y ?? 0) + 40;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const dx = (tx - sx) * 0.5;
      const d = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
      path.setAttribute("d", d);
      path.setAttribute("class", "blocks-canvas-edge");
      edgesSvg.appendChild(path);
    }

    plane.appendChild(edgesSvg);

    const nodes = this.findNodes(canvas.id);
    for (const node of nodes) {
      const el = document.createElement("blocks-node") as BlocksNodeElement;
      el.setAttribute("data-node-id", node.id);
      if (this.selectedNodeIds.has(node.id)) {
        el.setAttribute("data-selected", "true");
      }
      el.setNode(node);
      plane.appendChild(el);
    }

    viewport.appendChild(plane);
    shadow.appendChild(viewport);

    this.attachPanZoomBehavior(viewport, canvas, zoom, offsetX, offsetY);
  }

  private findCanvas(): CanvasBlock | null {
    if (!this.tree) return null;
    const blocks = this.tree.blocks as CanvasBlock[];
    if (this.canvasId) {
      return (
        blocks.find(
          (b) =>
            b.type === "visual" &&
            (b.properties as any).element === "canvas" &&
            b.id === this.canvasId
        ) ?? null
      );
    }
    return (
      blocks.find((b) => b.type === "visual" && (b.properties as any).element === "canvas") ??
      null
    );
  }

  private findNodes(canvasId: string): NodeBlock[] {
    if (!this.tree) return [];
    const blocks = this.tree.blocks as NodeBlock[];
    return blocks.filter(
      (b) =>
        b.type === "visual" &&
        (b.properties as any).element === "node" &&
        ((b.properties as any).canvasId ?? canvasId) === canvasId
    );
  }

  private findEdges(canvasId: string): EdgeBlock[] {
    if (!this.tree) return [];
    const blocks = this.tree.blocks as EdgeBlock[];
    return blocks.filter(
      (b) =>
        b.type === "visual" &&
        (b.properties as any).element === "edge" &&
        ((b.properties as any).canvasId ?? canvasId) === canvasId
    );
  }

  private attachPanZoomBehavior(
    viewport: HTMLElement,
    canvas: CanvasBlock,
    initialZoom: number,
    initialOffsetX: number,
    initialOffsetY: number
  ): void {
    let zoom = initialZoom;
    let offsetX = initialOffsetX;
    let offsetY = initialOffsetY;

    let panning = false;
    let startX = 0;
    let startY = 0;
    let startOffsetX = 0;
    let startOffsetY = 0;

    const plane = viewport.querySelector(".blocks-canvas-plane") as HTMLElement | null;
    if (!plane) return;

    const applyTransform = () => {
      plane.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`;
    };

    const onPointerDown = (ev: PointerEvent) => {
      // Middle-click or space+drag style panning: here we treat any click on the
      // empty viewport (background) as pan.
      if (ev.button !== 0) return; // left-button only for now
      if ((ev.target as HTMLElement).closest("blocks-node")) return;
      panning = true;
      startX = ev.clientX;
      startY = ev.clientY;
      startOffsetX = offsetX;
      startOffsetY = offsetY;
      (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
      ev.preventDefault();
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (!panning) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      offsetX = startOffsetX + dx;
      offsetY = startOffsetY + dy;
      applyTransform();
    };

    const onPointerUp = (ev: PointerEvent) => {
      if (!panning) return;
      panning = false;
      (ev.currentTarget as HTMLElement).releasePointerCapture(ev.pointerId);

      const canvasId = canvas.id;
      const deltas: BlockDelta[] = [
        {
          kind: "update",
          blockId: canvasId,
          path: "canvas.view",
          block: { zoom, offsetX, offsetY }
        }
      ];

      const detail: CanvasViewChangeDetail = {
        canvasId,
        zoom,
        offsetX,
        offsetY,
        deltas
      };

      this.dispatchEvent(
        new CustomEvent<CanvasViewChangeDetail>("canvas:viewChange", {
          detail,
          bubbles: true,
          composed: true
        })
      );
    };

    const onWheel = (ev: WheelEvent) => {
      if (!ev.ctrlKey && !ev.metaKey) return; // pinch-to-zoom or modified wheel
      ev.preventDefault();

      const rect = viewport.getBoundingClientRect();
      const cx = ev.clientX - rect.left;
      const cy = ev.clientY - rect.top;

      const zoomFactor = ev.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.min(4, Math.max(0.25, zoom * zoomFactor));
      const scale = newZoom / zoom;

      // Zoom around cursor position
      offsetX = cx - scale * (cx - offsetX);
      offsetY = cy - scale * (cy - offsetY);
      zoom = newZoom;

      applyTransform();

      const canvasId = canvas.id;
      const deltas: BlockDelta[] = [
        {
          kind: "update",
          blockId: canvasId,
          path: "canvas.view",
          block: { zoom, offsetX, offsetY }
        }
      ];

      const detail: CanvasViewChangeDetail = {
        canvasId,
        zoom,
        offsetX,
        offsetY,
        deltas
      };

      this.dispatchEvent(
        new CustomEvent<CanvasViewChangeDetail>("canvas:viewChange", {
          detail,
          bubbles: true,
          composed: true
        })
      );
    };

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);
    viewport.addEventListener("wheel", onWheel, { passive: false });
  }

  private handleNodeMoveRequested = (event: Event): void => {
    const custom = event as CustomEvent<NodeMoveDetail>;
    const detail = custom.detail;
    if (!detail) return;

    const forwarded: CanvasNodeMoveDetail = {
      nodeId: detail.nodeId,
      x: detail.x,
      y: detail.y,
      deltas: detail.deltas
    };

    this.dispatchEvent(
      new CustomEvent<CanvasNodeMoveDetail>("canvas:nodePositionChange", {
        detail: forwarded,
        bubbles: true,
        composed: true
      })
    );
  };

  private handleCanvasClick = (event: Event): void => {
    const target = event.target as HTMLElement;
    const nodeHost = target.closest("blocks-node") as HTMLElement | null;
    if (!nodeHost) {
      // Clicked on empty canvas, clear selection
      this.selectedNodeIds.clear();
      this.refreshSelectionClasses();
      return;
    }
    const nodeId = nodeHost.getAttribute("data-node-id");
    if (!nodeId) return;
    this.selectedNodeIds = new Set([nodeId]);
    this.refreshSelectionClasses();
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this.selectedNodeIds.size === 0) return;
    if (!this.tree) return;

    const deltas: BlockDelta[] = [];

    if (event.key === "Delete" || event.key === "Backspace") {
      // Remove selected nodes and any edges that reference them.
      const toRemove = new Set(this.selectedNodeIds);
      for (const id of toRemove) {
        deltas.push({ kind: "remove", blockId: id });
      }
      // remove edges
      const edges = this.findEdges(this.findCanvas()?.id ?? "");
      for (const edge of edges) {
        const props = edge.properties as any;
        if (toRemove.has(props.sourceNodeId) || toRemove.has(props.targetNodeId)) {
          deltas.push({ kind: "remove", blockId: edge.id });
        }
      }

      if (deltas.length > 0) {
        this.dispatchEvent(
          new CustomEvent<{ deltas: BlockDelta[] }>("canvas:edit", {
            detail: { deltas },
            bubbles: true,
            composed: true
          })
        );
      }
      event.preventDefault();
      return;
    }

    if ((event.key === "d" || event.key === "D") && (event.metaKey || event.ctrlKey)) {
      // Duplicate selected nodes with an offset
      const blocksById = new Map(this.tree.blocks.map((b) => [b.id, b] as const));
      for (const id of this.selectedNodeIds) {
        const original = blocksById.get(id) as NodeBlock | undefined;
        if (!original || (original.properties as any).element !== "node") continue;
        const props = original.properties as any;
        const clone: NodeBlock = {
          ...original,
          id: `${original.id}:copy:${Math.floor(Math.random() * 1e6)}`,
          properties: {
            ...props,
            x: (props.x ?? 0) + 40,
            y: (props.y ?? 0) + 40
          }
        };
        deltas.push({ kind: "insert", path: "blocks", blockId: clone.id, block: clone });
      }

      if (deltas.length > 0) {
        this.dispatchEvent(
          new CustomEvent<{ deltas: BlockDelta[] }>("canvas:edit", {
            detail: { deltas },
            bubbles: true,
            composed: true
          })
        );
      }
      event.preventDefault();
    }
  };

  private refreshSelectionClasses(): void {
    const shadow = this.shadowRoot;
    if (!shadow) return;
    const nodes = shadow.querySelectorAll("blocks-node");
    nodes.forEach((el) => {
      const id = el.getAttribute("data-node-id");
      if (id && this.selectedNodeIds.has(id)) {
        el.setAttribute("data-selected", "true");
      } else {
        el.removeAttribute("data-selected");
      }
    });
  }
}

export function registerBlocksCanvas(tagName = "blocks-canvas"): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, BlocksCanvasElement);
  }
  registerBlocksNode();
}

function ensureCanvasStyles(shadow: ShadowRoot): void {
  if (shadow.querySelector("style[data-blocks-canvas-style]")) return;

  const style = document.createElement("style");
  style.setAttribute("data-blocks-canvas-style", "true");
  style.textContent = `
:host {
  display: block;
  position: relative;
  overflow: hidden;
  /* Default height so the viewport is visible even if the host has no explicit size.
     Embedders can override this via CSS (e.g. blocks-canvas { height: 100%; }). */
  min-height: 320px;
  background: radial-gradient(circle at top left, #020617, #020617 45%, #000 100%);
}

.blocks-canvas-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  /* Ensure the viewport is visible even if the host has not been given an
     explicit height. This works together with the host min-height. */
  min-height: 320px;
  cursor: grab;
  user-select: none;
}

.blocks-canvas-plane {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
}

.blocks-canvas-edges {
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
}

.blocks-canvas-edge {
  fill: none;
  stroke: rgba(129, 140, 248, 0.9);
  stroke-width: 1.5;
}

.blocks-canvas-viewport.with-grid::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(31,41,55,0.8) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(31,41,55,0.8) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.blocks-canvas-empty {
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  color: #9ca3af;
}
`;

  shadow.prepend(style);
}
