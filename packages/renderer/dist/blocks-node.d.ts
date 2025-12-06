import type { NodeBlock } from "@blocks-ecosystem/core";
type BlockDelta = {
    kind: "insert" | "update" | "remove";
    blockId?: string;
    path?: string;
    block?: unknown;
};
export interface NodeMoveDetail {
    nodeId: string;
    x: number;
    y: number;
    deltas: BlockDelta[];
}
export declare class BlocksNodeElement extends HTMLElement {
    private node;
    /** logical position within the canvas plane */
    private x;
    private y;
    setNode(node: NodeBlock): void;
    connectedCallback(): void;
    private applyPosition;
    private render;
    private attachDragBehavior;
}
export declare function registerBlocksNode(tagName?: string): void;
export {};
//# sourceMappingURL=blocks-node.d.ts.map