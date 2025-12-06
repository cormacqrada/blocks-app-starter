import type { BlockTree, Block } from "@blocks-ecosystem/core";
/**
 * <blocks-renderer>
 *
 * A Web Component that turns Markdown-with-BLOCKS-header into rendered HTML
 * plus (optionally) a debug view of the underlying BlockTree.
 *
 * Usage:
 *   <blocks-renderer debug="true">
 *   <!-- BLOCKS:{"id":"doc","blocks":[],"collections":[]} -->
 *   # Hello Blocks
 *   </blocks-renderer>
 */
export declare class BlocksRendererElement extends HTMLElement {
    private markdownSource;
    private treeOverride;
    static get observedAttributes(): string[];
    connectedCallback(): void;
    attributeChangedCallback(name: string): void;
    set markdown(value: string | null);
    get markdown(): string;
    setTree(tree: BlockTree): void;
    private render;
}
export declare function renderVisualLayout(tree: BlockTree): HTMLElement | null;
export declare function renderVisualBlock(block: Block): HTMLElement;
export declare function registerBlocksRenderer(tagName?: string): void;
//# sourceMappingURL=blocks-renderer.d.ts.map