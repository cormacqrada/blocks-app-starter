export class BlocksDashboardPanelElement extends HTMLElement {
    panel = null;
    columns = 12;
    rowHeightPx = 80;
    x = 0;
    y = 0;
    w = 3;
    h = 2;
    setConfig(panel, columns, rowHeightPx) {
        this.panel = panel;
        this.columns = columns;
        this.rowHeightPx = rowHeightPx;
        const props = panel.properties;
        this.x = props.x ?? 0;
        this.y = props.y ?? 0;
        this.w = props.w ?? 3;
        this.h = props.h ?? 2;
        this.applyGridPosition();
        this.render();
    }
    connectedCallback() {
        if (this.panel) {
            this.render();
        }
    }
    applyGridPosition() {
        this.style.gridColumn = `${this.x + 1} / span ${this.w}`;
        this.style.gridRow = `${this.y + 1} / span ${this.h}`;
    }
    render() {
        const shadow = this.shadowRoot ?? this.attachShadow({ mode: "open" });
        shadow.innerHTML = "";
        ensurePanelStyles(shadow);
        const wrapper = document.createElement("div");
        wrapper.className = "blocks-dashboard-panel";
        const header = document.createElement("header");
        header.className = "blocks-dashboard-panel-header";
        const titleEl = document.createElement("span");
        titleEl.className = "blocks-dashboard-panel-title";
        const title = this.panel?.properties?.title ?? this.panel?.id ?? "Panel";
        titleEl.textContent = title;
        const handle = document.createElement("span");
        handle.className = "blocks-dashboard-panel-handle";
        handle.textContent = "⋮⋮";
        header.appendChild(titleEl);
        header.appendChild(handle);
        const body = document.createElement("div");
        body.className = "blocks-dashboard-panel-body";
        const firstInput = this.panel?.inputs?.[0];
        const contentId = firstInput?.id ?? "(none)";
        body.textContent = `Content block: ${contentId}`;
        const resize = document.createElement("div");
        resize.className = "blocks-dashboard-panel-resize";
        wrapper.appendChild(header);
        wrapper.appendChild(body);
        wrapper.appendChild(resize);
        shadow.appendChild(wrapper);
        this.attachDragBehavior(handle);
        this.attachResizeBehavior(resize);
    }
    attachDragBehavior(handleEl) {
        let dragging = false;
        let startX = 0;
        let startY = 0;
        let startCol = 0;
        let startRow = 0;
        const onPointerDown = (ev) => {
            dragging = true;
            startX = ev.clientX;
            startY = ev.clientY;
            startCol = this.x;
            startRow = this.y;
            handleEl.setPointerCapture(ev.pointerId);
            ev.preventDefault();
        };
        const onPointerMove = (ev) => {
            if (!dragging)
                return;
            const grid = this.parentElement;
            if (!grid)
                return;
            const gridRect = grid.getBoundingClientRect();
            const colWidth = gridRect.width / this.columns;
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            const dCols = Math.round(dx / colWidth);
            const dRows = Math.round(dy / this.rowHeightPx);
            const newX = Math.max(0, startCol + dCols);
            const newY = Math.max(0, startRow + dRows);
            this.style.gridColumn = `${newX + 1} / span ${this.w}`;
            this.style.gridRow = `${newY + 1} / span ${this.h}`;
        };
        const onPointerUp = (ev) => {
            if (!dragging)
                return;
            dragging = false;
            handleEl.releasePointerCapture(ev.pointerId);
            const grid = this.parentElement;
            if (!grid)
                return;
            const gridRect = grid.getBoundingClientRect();
            const colWidth = gridRect.width / this.columns;
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            const dCols = Math.round(dx / colWidth);
            const dRows = Math.round(dy / this.rowHeightPx);
            const newX = Math.max(0, this.x + dCols);
            const newY = Math.max(0, this.y + dRows);
            this.x = newX;
            this.y = newY;
            this.applyGridPosition();
            const panelId = this.panel?.id ?? "";
            if (!panelId)
                return;
            const deltas = [
                {
                    kind: "update",
                    blockId: panelId,
                    path: "panel.position",
                    block: {
                        x: newX,
                        y: newY
                    }
                }
            ];
            const detail = {
                panelId,
                x: newX,
                y: newY,
                w: this.w,
                h: this.h,
                deltas
            };
            this.dispatchEvent(new CustomEvent("panel:moveRequested", {
                detail,
                bubbles: true,
                composed: true
            }));
        };
        handleEl.addEventListener("pointerdown", onPointerDown);
        handleEl.addEventListener("pointermove", onPointerMove);
        handleEl.addEventListener("pointerup", onPointerUp);
        handleEl.addEventListener("pointercancel", onPointerUp);
    }
    attachResizeBehavior(resizeEl) {
        let resizing = false;
        let startX = 0;
        let startY = 0;
        let startW = 0;
        let startH = 0;
        const onPointerDown = (ev) => {
            resizing = true;
            startX = ev.clientX;
            startY = ev.clientY;
            startW = this.w;
            startH = this.h;
            resizeEl.setPointerCapture(ev.pointerId);
            ev.preventDefault();
        };
        const onPointerMove = (ev) => {
            if (!resizing)
                return;
            const grid = this.parentElement;
            if (!grid)
                return;
            const gridRect = grid.getBoundingClientRect();
            const colWidth = gridRect.width / this.columns;
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            const dCols = Math.round(dx / colWidth);
            const dRows = Math.round(dy / this.rowHeightPx);
            const newW = Math.max(1, startW + dCols);
            const newH = Math.max(1, startH + dRows);
            this.style.gridColumn = `${this.x + 1} / span ${newW}`;
            this.style.gridRow = `${this.y + 1} / span ${newH}`;
        };
        const onPointerUp = (ev) => {
            if (!resizing)
                return;
            resizing = false;
            resizeEl.releasePointerCapture(ev.pointerId);
            const grid = this.parentElement;
            if (!grid)
                return;
            const gridRect = grid.getBoundingClientRect();
            const colWidth = gridRect.width / this.columns;
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            const dCols = Math.round(dx / colWidth);
            const dRows = Math.round(dy / this.rowHeightPx);
            const newW = Math.max(1, this.w + dCols);
            const newH = Math.max(1, this.h + dRows);
            this.w = newW;
            this.h = newH;
            this.applyGridPosition();
            const panelId = this.panel?.id ?? "";
            if (!panelId)
                return;
            const deltas = [
                {
                    kind: "update",
                    blockId: panelId,
                    path: "panel.size",
                    block: {
                        w: newW,
                        h: newH
                    }
                }
            ];
            const detail = {
                panelId,
                x: this.x,
                y: this.y,
                w: newW,
                h: newH,
                deltas
            };
            this.dispatchEvent(new CustomEvent("panel:resizeRequested", {
                detail,
                bubbles: true,
                composed: true
            }));
        };
        resizeEl.addEventListener("pointerdown", onPointerDown);
        resizeEl.addEventListener("pointermove", onPointerMove);
        resizeEl.addEventListener("pointerup", onPointerUp);
        resizeEl.addEventListener("pointercancel", onPointerUp);
    }
}
export function registerBlocksDashboardPanel(tagName = "blocks-dashboard-panel") {
    if (!customElements.get(tagName)) {
        customElements.define(tagName, BlocksDashboardPanelElement);
    }
}
function ensurePanelStyles(shadow) {
    if (shadow.querySelector("style[data-blocks-dashboard-panel-style]"))
        return;
    const style = document.createElement("style");
    style.setAttribute("data-blocks-dashboard-panel-style", "true");
    style.textContent = `
.blocks-dashboard-panel {
  position: relative;
  height: 100%;
  box-sizing: border-box;
  border-radius: 0.75rem;
  background: radial-gradient(circle at top left, rgba(99,102,241,0.14), transparent 55%),
              radial-gradient(circle at bottom right, rgba(56,189,248,0.12), transparent 55%),
              #111827;
  border: 1px solid rgba(148,163,184,0.4);
  box-shadow: 0 16px 40px rgba(15,23,42,0.7);
  overflow: hidden;
}

.blocks-dashboard-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  color: #e5e7eb;
  border-bottom: 1px solid rgba(15,23,42,0.9);
  cursor: grab;
}

.blocks-dashboard-panel-title {
  font-weight: 500;
}

.blocks-dashboard-panel-handle {
  opacity: 0.7;
  font-size: 0.85rem;
}

.blocks-dashboard-panel-body {
  padding: 0.75rem 0.9rem;
  font-size: 0.85rem;
  color: #9ca3af;
}

.blocks-dashboard-panel-resize {
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid rgba(148,163,184,0.75);
  background: rgba(15,23,42,0.95);
  cursor: se-resize;
}
`;
    shadow.prepend(style);
}
