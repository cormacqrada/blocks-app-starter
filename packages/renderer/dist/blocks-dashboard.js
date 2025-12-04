import { registerBlocksDashboardPanel } from "./blocks-dashboard-panel";
export class BlocksDashboardElement extends HTMLElement {
    tree = null;
    dashboardId = null;
    static get observedAttributes() {
        return ["dashboard-id"];
    }
    attributeChangedCallback(name, _old, value) {
        if (name === "dashboard-id") {
            this.dashboardId = value;
            this.render();
        }
    }
    setTree(tree) {
        this.tree = tree;
        this.render();
    }
    connectedCallback() {
        this.addEventListener("panel:moveRequested", this.handlePanelMoveRequested);
        this.addEventListener("panel:resizeRequested", this.handlePanelResizeRequested);
        this.render();
    }
    disconnectedCallback() {
        this.removeEventListener("panel:moveRequested", this.handlePanelMoveRequested);
        this.removeEventListener("panel:resizeRequested", this.handlePanelResizeRequested);
    }
    render() {
        const shadow = this.shadowRoot ?? this.attachShadow({ mode: "open" });
        shadow.innerHTML = "";
        ensureStyles(shadow);
        if (!this.tree) {
            return;
        }
        const dashboard = this.findDashboard();
        if (!dashboard) {
            const msg = document.createElement("div");
            msg.textContent = "No dashboard block found.";
            msg.className = "blocks-dashboard-empty";
            shadow.appendChild(msg);
            return;
        }
        const props = dashboard.properties;
        const columns = props.columns ?? 12;
        const rowHeightPx = props.rowHeightPx ?? 80;
        const gapPx = props.gapPx ?? 8;
        const grid = document.createElement("div");
        grid.className = "blocks-dashboard-grid";
        grid.style.setProperty("--blocks-dashboard-columns", String(columns));
        grid.style.setProperty("--blocks-dashboard-row-height", `${rowHeightPx}px`);
        grid.style.setProperty("--blocks-dashboard-gap", `${gapPx}px`);
        const panels = this.findPanels(dashboard.id);
        for (const panel of panels) {
            grid.appendChild(this.renderPanel(panel, columns, rowHeightPx));
        }
        shadow.appendChild(grid);
    }
    findDashboard() {
        if (!this.tree)
            return null;
        const blocks = this.tree.blocks;
        if (this.dashboardId) {
            return (blocks.find((b) => b.type === "visual" &&
                b.properties.element === "dashboard" &&
                b.id === this.dashboardId) ?? null);
        }
        return (blocks.find((b) => b.type === "visual" && b.properties.element === "dashboard") ??
            null);
    }
    findPanels(dashboardId) {
        if (!this.tree)
            return [];
        const blocks = this.tree.blocks;
        return blocks.filter((b) => b.type === "visual" &&
            b.properties.element === "dashboard.panel" &&
            (b.properties.dashboardId ?? dashboardId) === dashboardId);
    }
    renderPanel(panel, columns, rowHeightPx) {
        const el = document.createElement("blocks-dashboard-panel");
        el.setConfig(panel, columns, rowHeightPx);
        return el;
    }
    handlePanelMoveRequested = (event) => {
        const custom = event;
        const detail = custom.detail;
        if (!detail)
            return;
        const forwarded = {
            panelId: detail.panelId,
            x: detail.x,
            y: detail.y,
            w: detail.w,
            h: detail.h,
            deltas: detail.deltas
        };
        this.dispatchEvent(new CustomEvent("dashboard:panelPositionChange", {
            detail: forwarded,
            bubbles: true,
            composed: true
        }));
    };
    handlePanelResizeRequested = (event) => {
        const custom = event;
        const detail = custom.detail;
        if (!detail)
            return;
        const forwarded = {
            panelId: detail.panelId,
            x: detail.x,
            y: detail.y,
            w: detail.w,
            h: detail.h,
            deltas: detail.deltas
        };
        this.dispatchEvent(new CustomEvent("dashboard:panelPositionChange", {
            detail: forwarded,
            bubbles: true,
            composed: true
        }));
    };
}
export function registerBlocksDashboard(tagName = "blocks-dashboard") {
    if (!customElements.get(tagName)) {
        customElements.define(tagName, BlocksDashboardElement);
    }
    registerBlocksDashboardPanel();
}
function ensureStyles(shadow) {
    if (shadow.querySelector("style[data-blocks-dashboard-style]"))
        return;
    const style = document.createElement("style");
    style.setAttribute("data-blocks-dashboard-style", "true");
    style.textContent = `
:host {
  display: block;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
}

.blocks-dashboard-grid {
  display: grid;
  grid-template-columns: repeat(var(--blocks-dashboard-columns, 12), minmax(0, 1fr));
  grid-auto-rows: var(--blocks-dashboard-row-height, 80px);
  gap: var(--blocks-dashboard-gap, 8px);
}

.blocks-dashboard-panel {
  position: relative;
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

.blocks-dashboard-empty {
  padding: 0.75rem;
  font-size: 0.85rem;
  color: #9ca3af;
}
  `;
    shadow.prepend(style);
}
