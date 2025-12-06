import { registerBlocksNode } from "./blocks-node";
export class BlocksCanvasElement extends HTMLElement {
    tree = null;
    canvasId = null;
    selectedNodeIds = new Set();
    marqueeEl = null;
    marqueeStart = null;
    static get observedAttributes() {
        return ["canvas-id"];
    }
    attributeChangedCallback(name, _old, value) {
        if (name === "canvas-id") {
            this.canvasId = value;
            this.render();
        }
    }
    setTree(tree) {
        this.tree = tree;
        this.render();
    }
    connectedCallback() {
        this.addEventListener("node:moveRequested", this.handleNodeMoveRequested);
        this.addEventListener("click", this.handleCanvasClick);
        // Make the canvas focusable so we can listen for keyboard shortcuts.
        if (!this.hasAttribute("tabindex")) {
            this.setAttribute("tabindex", "0");
        }
        this.addEventListener("keydown", this.handleKeyDown);
        this.render();
    }
    disconnectedCallback() {
        this.removeEventListener("node:moveRequested", this.handleNodeMoveRequested);
        this.removeEventListener("click", this.handleCanvasClick);
        this.removeEventListener("keydown", this.handleKeyDown);
    }
    render() {
        const shadow = this.shadowRoot ?? this.attachShadow({ mode: "open" });
        shadow.innerHTML = "";
        ensureCanvasStyles(shadow);
        if (!this.tree)
            return;
        const canvas = this.findCanvas();
        if (!canvas) {
            const empty = document.createElement("div");
            empty.className = "blocks-canvas-empty";
            empty.textContent = "No canvas block found.";
            shadow.appendChild(empty);
            return;
        }
        const props = canvas.properties;
        const zoom = props.zoom ?? 1;
        const offsetX = props.offsetX ?? 0;
        const offsetY = props.offsetY ?? 0;
        const showGrid = props.showGrid ?? true;
        const viewport = document.createElement("div");
        viewport.className = "blocks-canvas-viewport";
        if (showGrid)
            viewport.classList.add("with-grid");
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
        const nodesById = new Map();
        for (const n of this.findNodes(canvas.id))
            nodesById.set(n.id, n);
        for (const edge of edges) {
            const props = edge.properties;
            const source = nodesById.get(props.sourceNodeId);
            const target = nodesById.get(props.targetNodeId);
            if (!source || !target)
                continue;
            const s = source.properties;
            const t = target.properties;
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
            const el = document.createElement("blocks-node");
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
    findCanvas() {
        if (!this.tree)
            return null;
        const blocks = this.tree.blocks;
        if (this.canvasId) {
            return (blocks.find((b) => b.type === "visual" &&
                b.properties.element === "canvas" &&
                b.id === this.canvasId) ?? null);
        }
        return (blocks.find((b) => b.type === "visual" && b.properties.element === "canvas") ??
            null);
    }
    findNodes(canvasId) {
        if (!this.tree)
            return [];
        const blocks = this.tree.blocks;
        return blocks.filter((b) => b.type === "visual" &&
            b.properties.element === "node" &&
            (b.properties.canvasId ?? canvasId) === canvasId);
    }
    findEdges(canvasId) {
        if (!this.tree)
            return [];
        const blocks = this.tree.blocks;
        return blocks.filter((b) => b.type === "visual" &&
            b.properties.element === "edge" &&
            (b.properties.canvasId ?? canvasId) === canvasId);
    }
    attachPanZoomBehavior(viewport, canvas, initialZoom, initialOffsetX, initialOffsetY) {
        let zoom = initialZoom;
        let offsetX = initialOffsetX;
        let offsetY = initialOffsetY;
        let panning = false;
        let startX = 0;
        let startY = 0;
        let startOffsetX = 0;
        let startOffsetY = 0;
        const plane = viewport.querySelector(".blocks-canvas-plane");
        if (!plane)
            return;
        const applyTransform = () => {
            plane.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`;
        };
        const onPointerDown = (ev) => {
            // Middle-click or space+drag style panning: here we treat any click on the
            // empty viewport (background) as pan.
            if (ev.button !== 0)
                return; // left-button only for now
            if (ev.target.closest("blocks-node"))
                return;
            panning = true;
            startX = ev.clientX;
            startY = ev.clientY;
            startOffsetX = offsetX;
            startOffsetY = offsetY;
            ev.currentTarget.setPointerCapture(ev.pointerId);
            ev.preventDefault();
        };
        const onPointerMove = (ev) => {
            if (!panning)
                return;
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            offsetX = startOffsetX + dx;
            offsetY = startOffsetY + dy;
            applyTransform();
        };
        const onPointerUp = (ev) => {
            if (!panning)
                return;
            panning = false;
            ev.currentTarget.releasePointerCapture(ev.pointerId);
            const canvasId = canvas.id;
            const deltas = [
                {
                    kind: "update",
                    blockId: canvasId,
                    path: "canvas.view",
                    block: { zoom, offsetX, offsetY }
                }
            ];
            const detail = {
                canvasId,
                zoom,
                offsetX,
                offsetY,
                deltas
            };
            this.dispatchEvent(new CustomEvent("canvas:viewChange", {
                detail,
                bubbles: true,
                composed: true
            }));
        };
        const onWheel = (ev) => {
            if (!ev.ctrlKey && !ev.metaKey)
                return; // pinch-to-zoom or modified wheel
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
            const deltas = [
                {
                    kind: "update",
                    blockId: canvasId,
                    path: "canvas.view",
                    block: { zoom, offsetX, offsetY }
                }
            ];
            const detail = {
                canvasId,
                zoom,
                offsetX,
                offsetY,
                deltas
            };
            this.dispatchEvent(new CustomEvent("canvas:viewChange", {
                detail,
                bubbles: true,
                composed: true
            }));
        };
        viewport.addEventListener("pointerdown", onPointerDown);
        viewport.addEventListener("pointermove", onPointerMove);
        viewport.addEventListener("pointerup", onPointerUp);
        viewport.addEventListener("pointercancel", onPointerUp);
        viewport.addEventListener("wheel", onWheel, { passive: false });
    }
    handleNodeMoveRequested = (event) => {
        const custom = event;
        const detail = custom.detail;
        if (!detail)
            return;
        const forwarded = {
            nodeId: detail.nodeId,
            x: detail.x,
            y: detail.y,
            deltas: detail.deltas
        };
        this.dispatchEvent(new CustomEvent("canvas:nodePositionChange", {
            detail: forwarded,
            bubbles: true,
            composed: true
        }));
    };
    handleCanvasClick = (event) => {
        const target = event.target;
        const nodeHost = target.closest("blocks-node");
        if (!nodeHost) {
            // Clicked on empty canvas, clear selection
            this.selectedNodeIds.clear();
            this.refreshSelectionClasses();
            return;
        }
        const nodeId = nodeHost.getAttribute("data-node-id");
        if (!nodeId)
            return;
        this.selectedNodeIds = new Set([nodeId]);
        this.refreshSelectionClasses();
    };
    handleKeyDown = (event) => {
        if (this.selectedNodeIds.size === 0)
            return;
        if (!this.tree)
            return;
        const deltas = [];
        if (event.key === "Delete" || event.key === "Backspace") {
            // Remove selected nodes and any edges that reference them.
            const toRemove = new Set(this.selectedNodeIds);
            for (const id of toRemove) {
                deltas.push({ kind: "remove", blockId: id });
            }
            // remove edges
            const edges = this.findEdges(this.findCanvas()?.id ?? "");
            for (const edge of edges) {
                const props = edge.properties;
                if (toRemove.has(props.sourceNodeId) || toRemove.has(props.targetNodeId)) {
                    deltas.push({ kind: "remove", blockId: edge.id });
                }
            }
            if (deltas.length > 0) {
                this.dispatchEvent(new CustomEvent("canvas:edit", {
                    detail: { deltas },
                    bubbles: true,
                    composed: true
                }));
            }
            event.preventDefault();
            return;
        }
        if ((event.key === "d" || event.key === "D") && (event.metaKey || event.ctrlKey)) {
            // Duplicate selected nodes with an offset
            const blocksById = new Map(this.tree.blocks.map((b) => [b.id, b]));
            for (const id of this.selectedNodeIds) {
                const original = blocksById.get(id);
                if (!original || original.properties.element !== "node")
                    continue;
                const props = original.properties;
                const clone = {
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
                this.dispatchEvent(new CustomEvent("canvas:edit", {
                    detail: { deltas },
                    bubbles: true,
                    composed: true
                }));
            }
            event.preventDefault();
        }
    };
    refreshSelectionClasses() {
        const shadow = this.shadowRoot;
        if (!shadow)
            return;
        const nodes = shadow.querySelectorAll("blocks-node");
        nodes.forEach((el) => {
            const id = el.getAttribute("data-node-id");
            if (id && this.selectedNodeIds.has(id)) {
                el.setAttribute("data-selected", "true");
            }
            else {
                el.removeAttribute("data-selected");
            }
        });
    }
}
export function registerBlocksCanvas(tagName = "blocks-canvas") {
    if (!customElements.get(tagName)) {
        customElements.define(tagName, BlocksCanvasElement);
    }
    registerBlocksNode();
}
function ensureCanvasStyles(shadow) {
    if (shadow.querySelector("style[data-blocks-canvas-style]"))
        return;
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
