import type { BlockTree } from "@blocks-ecosystem/core";
export interface ExecutableDocument {
    id: string;
    markdown: string;
    tree: BlockTree;
}
export type BlockDeltaKind = "insert" | "update" | "remove";
export interface BlockDelta {
    kind: BlockDeltaKind;
    /** Optional block identifier; semantics depend on adapter/runtime usage. */
    blockId?: string;
    /** Path or location hint within the tree (e.g. parent id, index). */
    path?: string;
    /** New or updated block payload for insert/update operations. */
    block?: unknown;
}
export interface RuntimeAdapter {
    id: string;
    /** Called when the runtime applies deltas so adapters can sync external systems. */
    onDeltas?(deltas: BlockDelta[], runtime: BlocksRuntime): void;
}
/**
 * BlocksRuntime is the "operating system" for blocks.
 * It owns the canonical BlockTree, applies deltas, and notifies adapters.
 */
export declare class BlocksRuntime {
    private tree;
    private adapters;
    constructor(initialTree: BlockTree);
    getTree(): BlockTree;
    /**
     * Apply a batch of deltas to the block tree.
     *
     * NOTE: This starter only stores the deltas and does not yet mutate the
     * BlockTree structure; a real implementation would walk and update blocks
     * according to the delta semantics.
     */
    applyDeltas(deltas: BlockDelta[]): void;
    registerAdapter(adapter: RuntimeAdapter): void;
}
export * from "./markdownAdapter";
/**
 * Serialize a document by embedding the BlockTree into a leading HTML comment.
 * This is the "Markdown as Data" and "Two-Way Serialization" mechanism.
 */
export declare function serializeToMarkdown(doc: ExecutableDocument): string;
/**
 * Deserialize Markdown back into an ExecutableDocument.
 * If no BLOCKS header is present, an empty BlockTree is returned.
 */
export declare function deserializeFromMarkdown(id: string, markdown: string): ExecutableDocument;
export declare function executeBlockTree(tree: BlockTree): BlockTree;
//# sourceMappingURL=index.d.ts.map