export class BlocksNodeElement extends HTMLElement {
    node = null;
    /** logical position within the canvas plane */
    x = 0;
    y = 0;
    setNode(node) {
        this.node = node;
        const props = node.properties;
        this.x = props.x ?? 0;
        this.y = props.y ?? 0;
        this.applyPosition();
        this.render();
    }
    connectedCallback() {
        if (this.node)
            this.render();
    }
    applyPosition() {
        this.style.position = "absolute";
        this.style.left = `${this.x}px`;
        this.style.top = `${this.y}px`;
    }
    render() {
        const shadow = this.shadowRoot ?? this.attachShadow({ mode: "open" });
        shadow.innerHTML = "";
        ensureNodeStyles(shadow);
        const wrapper = document.createElement("div");
        wrapper.className = "blocks-node";
        const header = document.createElement("header");
        header.className = "blocks-node-header";
        const title = document.createElement("span");
        title.className = "blocks-node-title";
        title.textContent = String(this.node?.properties?.title ?? this.node?.id ?? "Node");
        header.appendChild(title);
        const body = document.createElement("div");
        body.className = "blocks-node-body";
        const ports = this.node?.properties ?? {};
        const inputPorts = ports.inputs ?? [];
        const outputPorts = ports.outputs ?? [];
        const grid = document.createElement("div");
        grid.className = "blocks-node-ports";
        const inputsCol = document.createElement("div");
        inputsCol.className = "blocks-node-ports-col inputs";
        for (const port of inputPorts) {
            const row = document.createElement("div");
            row.className = "blocks-node-port-row";
            const dot = document.createElement("span");
            dot.className = "port-dot input";
            const label = document.createElement("span");
            label.className = "port-label";
            label.textContent = port.label;
            row.appendChild(dot);
            row.appendChild(label);
            inputsCol.appendChild(row);
        }
        const outputsCol = document.createElement("div");
        outputsCol.className = "blocks-node-ports-col outputs";
        for (const port of outputPorts) {
            const row = document.createElement("div");
            row.className = "blocks-node-port-row";
            const label = document.createElement("span");
            label.className = "port-label";
            label.textContent = port.label;
            const dot = document.createElement("span");
            dot.className = "port-dot output";
            row.appendChild(label);
            row.appendChild(dot);
            outputsCol.appendChild(row);
        }
        grid.appendChild(inputsCol);
        grid.appendChild(outputsCol);
        const content = document.createElement("div");
        content.className = "blocks-node-content";
        content.textContent = "Node content";
        body.appendChild(grid);
        body.appendChild(content);
        wrapper.appendChild(header);
        wrapper.appendChild(body);
        shadow.appendChild(wrapper);
        this.attachDragBehavior(header);
    }
    attachDragBehavior(handle) {
        let dragging = false;
        let startX = 0;
        let startY = 0;
        let startNodeX = 0;
        let startNodeY = 0;
        const onPointerDown = (ev) => {
            dragging = true;
            startX = ev.clientX;
            startY = ev.clientY;
            startNodeX = this.x;
            startNodeY = this.y;
            handle.setPointerCapture(ev.pointerId);
            ev.preventDefault();
        };
        const onPointerMove = (ev) => {
            if (!dragging)
                return;
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            this.x = startNodeX + dx;
            this.y = startNodeY + dy;
            this.applyPosition();
        };
        const onPointerUp = (ev) => {
            if (!dragging)
                return;
            dragging = false;
            handle.releasePointerCapture(ev.pointerId);
            const nodeId = this.node?.id ?? "";
            if (!nodeId)
                return;
            const deltas = [
                {
                    kind: "update",
                    blockId: nodeId,
                    path: "node.position",
                    block: { x: this.x, y: this.y }
                }
            ];
            const detail = {
                nodeId,
                x: this.x,
                y: this.y,
                deltas
            };
            this.dispatchEvent(new CustomEvent("node:moveRequested", {
                detail,
                bubbles: true,
                composed: true
            }));
        };
        handle.addEventListener("pointerdown", onPointerDown);
        handle.addEventListener("pointermove", onPointerMove);
        handle.addEventListener("pointerup", onPointerUp);
        handle.addEventListener("pointercancel", onPointerUp);
    }
}
export function registerBlocksNode(tagName = "blocks-node") {
    if (!customElements.get(tagName)) {
        customElements.define(tagName, BlocksNodeElement);
    }
}
function ensureNodeStyles(shadow) {
    if (shadow.querySelector("style[data-blocks-node-style]"))
        return;
    const style = document.createElement("style");
    style.setAttribute("data-blocks-node-style", "true");
    style.textContent = `
.blocks-node {
  position: relative;
  min-width: 180px;
  max-width: 260px;
  border-radius: 0.75rem;
  background: radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 55%),
              #020617;
  border: 1px solid rgba(148,163,184,0.6);
  box-shadow: 0 16px 40px rgba(15,23,42,0.9);
  overflow: hidden;
  color: #e5e7eb;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
}

.blocks-node-header {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.6rem;
  font-size: 0.8rem;
  background: linear-gradient(to right, rgba(15,23,42,0.98), rgba(30,64,175,0.9));
  border-bottom: 1px solid rgba(15,23,42,0.95);
  cursor: grab;
}

.blocks-node-title {
  font-weight: 500;
}

.blocks-node-body {
  padding: 0.5rem 0.6rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.blocks-node-ports {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.2rem 0.8rem;
}

.blocks-node-ports-col {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
}

.blocks-node-port-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #cbd5f5;
}

.blocks-node-ports-col.outputs .blocks-node-port-row {
  justify-content: flex-end;
}

.port-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  border: 1px solid rgba(148,163,184,0.9);
}

.port-dot.input {
  background: rgba(52,211,153,0.5);
}

.port-dot.output {
  background: rgba(59,130,246,0.65);
}

.port-label {
  white-space: nowrap;
}

.blocks-node-content {
  margin-top: 0.4rem;
  padding: 0.35rem 0.4rem;
  border-radius: 0.45rem;
  border: 1px dashed rgba(55,65,81,0.95);
  background: rgba(15,23,42,0.95);
  font-size: 0.75rem;
  color: #9ca3af;
}
`;
    shadow.prepend(style);
}
