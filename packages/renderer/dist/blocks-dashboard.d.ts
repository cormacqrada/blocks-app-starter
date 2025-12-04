import type { BlockTree } from "../../core/src";
type BlockDelta = {
    kind: "insert" | "update" | "remove";
    blockId?: string;
    path?: string;
    block?: unknown;
};
export interface PanelPositionChangeDetail {
    panelId: string;
    x: number;
    y: number;
    w: number;
    h: number;
    deltas: BlockDelta[];
}
export declare class BlocksDashboardElement extends HTMLElement {
    private tree;
    private dashboardId;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, _old: string | null, value: string | null): void;
    setTree(tree: BlockTree): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private render;
    private findDashboard;
    private findPanels;
    private renderPanel;
    private handlePanelMoveRequested;
    private handlePanelResizeRequested;
}
export declare function registerBlocksDashboard(tagName?: string): void;
export {};
//# sourceMappingURL=blocks-dashboard.d.ts.map