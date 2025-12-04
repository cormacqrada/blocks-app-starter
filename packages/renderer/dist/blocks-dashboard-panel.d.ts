import type { DashboardPanelBlock } from "../../core/src";
type BlockDelta = {
    kind: "insert" | "update" | "remove";
    blockId?: string;
    path?: string;
    block?: unknown;
};
export interface DashboardPanelMoveDetail {
    panelId: string;
    x: number;
    y: number;
    w: number;
    h: number;
    deltas: BlockDelta[];
}
export interface DashboardPanelResizeDetail {
    panelId: string;
    x: number;
    y: number;
    w: number;
    h: number;
    deltas: BlockDelta[];
}
export declare class BlocksDashboardPanelElement extends HTMLElement {
    private panel;
    private columns;
    private rowHeightPx;
    private x;
    private y;
    private w;
    private h;
    setConfig(panel: DashboardPanelBlock, columns: number, rowHeightPx: number): void;
    connectedCallback(): void;
    private applyGridPosition;
    private render;
    private attachDragBehavior;
    private attachResizeBehavior;
}
export declare function registerBlocksDashboardPanel(tagName?: string): void;
export {};
//# sourceMappingURL=blocks-dashboard-panel.d.ts.map