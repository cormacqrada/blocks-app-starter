import type { BlockTree } from "../../core/src";
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
export declare class BlocksCanvasElement extends HTMLElement {
    private tree;
    private canvasId;
    private selectedNodeIds;
    private marqueeEl;
    private marqueeStart;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, _old: string | null, value: string | null): void;
    setTree(tree: BlockTree): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private render;
    private findCanvas;
    private findNodes;
    private findEdges;
    private attachPanZoomBehavior;
    private handleNodeMoveRequested;
    private handleCanvasClick;
    private handleKeyDown;
    private refreshSelectionClasses;
}
export declare function registerBlocksCanvas(tagName?: string): void;
export {};
//# sourceMappingURL=blocks-canvas.d.ts.map