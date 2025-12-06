/**
 * BlocksRuntime is the "operating system" for blocks.
 * It owns the canonical BlockTree, applies deltas, and notifies adapters.
 */
export class BlocksRuntime {
    tree;
    adapters = [];
    constructor(initialTree) {
        this.tree = initialTree;
    }
    getTree() {
        return this.tree;
    }
    /**
     * Apply a batch of deltas to the block tree.
     *
     * NOTE: This starter only stores the deltas and does not yet mutate the
     * BlockTree structure; a real implementation would walk and update blocks
     * according to the delta semantics.
     */
    applyDeltas(deltas) {
        for (const delta of deltas) {
            // Whole-tree replacement
            if (delta.kind === "update" && delta.path === "root" && delta.block) {
                this.tree = delta.block;
                continue;
            }
            if (delta.kind === "update" && delta.blockId && delta.block) {
                // Generic per-block property merge: for any update with a blockId+block,
                // merge the provided partial block payload into the block's properties.
                this.tree = {
                    ...this.tree,
                    blocks: this.tree.blocks.map((b) => b.id === delta.blockId
                        ? {
                            ...b,
                            properties: {
                                ...b.properties,
                                ...delta.block
                            }
                        }
                        : b)
                };
                continue;
            }
            if (delta.kind === "remove" && delta.blockId) {
                this.tree = {
                    ...this.tree,
                    blocks: this.tree.blocks.filter((b) => b.id !== delta.blockId)
                };
                continue;
            }
            if (delta.kind === "insert" && delta.block) {
                this.tree = {
                    ...this.tree,
                    blocks: [...this.tree.blocks, delta.block]
                };
                continue;
            }
        }
        for (const adapter of this.adapters) {
            adapter.onDeltas?.(deltas, this);
        }
    }
    registerAdapter(adapter) {
        this.adapters.push(adapter);
    }
}
export * from "./markdownAdapter";
/**
 * Serialize a document by embedding the BlockTree into a leading HTML comment.
 * This is the "Markdown as Data" and "Two-Way Serialization" mechanism.
 */
export function serializeToMarkdown(doc) {
    const header = `<!-- BLOCKS:${JSON.stringify(doc.tree)} -->`;
    return `${header}\n\n${doc.markdown.trimStart()}\n`;
}
/**
 * Deserialize Markdown back into an ExecutableDocument.
 * If no BLOCKS header is present, an empty BlockTree is returned.
 */
export function deserializeFromMarkdown(id, markdown) {
    const blocksHeader = /^<!--\s*BLOCKS:(.*?)\s*-->\s*\n?/s;
    const match = markdown.match(blocksHeader);
    let tree = {
        id,
        blocks: [],
        collections: []
    };
    let content = markdown;
    if (match) {
        try {
            const raw = match[1];
            tree = JSON.parse(raw);
        }
        catch {
            // leave default empty tree
        }
        content = markdown.slice(match[0].length);
    }
    return {
        id,
        markdown: content,
        tree
    };
}
/**
 * Minimal execution model: in a real system this would dispatch on block types
 * and walk the graph. Here we just echo the tree, acting as a placeholder for
 * an execution engine.
 */
import { applyTypeScaleBlocks } from "./typeScaleLogic";
export function executeBlockTree(tree) {
    // In a full system, this would walk the DAG of logic blocks. For now, we
    // support typeScale blocks as a concrete example of logic → collection.
    return applyTypeScaleBlocks(tree);
}
