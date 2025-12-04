import type { BlockTree } from "@blocks/core";
import type { BlockDelta } from "./index";
export declare function markdownToBlockTree(id: string, markdown: string): BlockTree;
/**
 * Convenience adapter that treats the entire markdown document as a single
 * "replace root" delta.
 */
export declare function markdownToReplaceDelta(id: string, markdown: string): BlockDelta[];
//# sourceMappingURL=markdownAdapter.d.ts.map