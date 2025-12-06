import type { Block, BlockTree } from "@blocks-ecosystem/core";
import { BlocksRuntime, type BlockDelta } from "@blocks-ecosystem/runtime";
import { BLOCK_REGISTRY, createBlockFromRegistry, type RegistryBlockDefinition } from "./blockRegistry";

export interface CursorState {
  blockId: string | null;
  offset: number;
}

export interface EditorEvents {
  onChange?: (tree: BlockTree) => void;
  onSelect?: (blockId: string | null) => void;
  onInsert?: (block: Block, index: number) => void;
  onPropChange?: (block: Block) => void;
  onTransform?: (block: Block, fromElement: string, toElement: string) => void;
  onCursorMove?: (cursor: CursorState) => void;
  onRemove?: (blockId: string) => void;
  onInserterOpen?: (context: {
    blockId: string | null;
    blockIndex: number | null;
    mode: "transform" | "insert";
  }) => void;
  onInserterClose?: () => void;
}

export class EditorAdapter {
  private runtime: BlocksRuntime;
  private events: EditorEvents;
  private _selectedBlockId: string | null = null;
  private tree: BlockTree;

  constructor(initialTree?: BlockTree, events?: EditorEvents) {
    this.tree = initialTree ?? ({ rootId: "root", blocks: [] } as any as BlockTree);
    this.runtime = new BlocksRuntime(this.tree);
    this.events = events ?? {};
  }

  getTree(): BlockTree {
    return this.tree;
  }

  get blocks(): Block[] {
    return this.tree.blocks as Block[];
  }

  get selectedBlockId(): string | null {
    return this._selectedBlockId;
  }

  set selectedBlockId(id: string | null) {
    this._selectedBlockId = id;
    this.events.onSelect?.(id);
  }

  getRegistry(): RegistryBlockDefinition[] {
    return BLOCK_REGISTRY;
  }

  getRegistryById(registryId: string): RegistryBlockDefinition | undefined {
    return BLOCK_REGISTRY.find((b) => b.id === registryId);
  }

  getRegistryByElement(element: string | undefined): RegistryBlockDefinition | undefined {
    if (!element) return undefined;
    return BLOCK_REGISTRY.find((b) => b.element === element);
  }

  notifyInserterOpen(context: { blockId: string | null; blockIndex: number | null; mode: "transform" | "insert" }): void {
    this.events.onInserterOpen?.(context);
  }

  notifyInserterClose(): void {
    this.events.onInserterClose?.();
  }

  private nextLocalId(element: string): string {
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${element}:${suffix}`;
  }

  deleteBlock(blockId: string): void {
    const blocks = this.tree.blocks as Block[];
    const index = blocks.findIndex((b) => b.id === blockId);
    if (index === -1) return;
    const nextBlocks = blocks.filter((b) => b.id !== blockId);
    this.tree = { ...(this.tree as any), blocks: nextBlocks };
    this.runtime = new BlocksRuntime(this.tree);

    if (this._selectedBlockId === blockId) {
      this._selectedBlockId = null;
      this.events.onSelect?.(null);
    }
    this.events.onRemove?.(blockId);
    this.events.onChange?.(this.tree);
  }

  applyDeltas(deltas: BlockDelta[]): void {
    // Optional hook to keep compatibility with future runtime-based flows.
    this.runtime.applyDeltas(deltas);
    this.tree = this.runtime.getTree();
    this.events.onChange?.(this.tree);
  }

  insertBlock(registryId: string, index?: number): Block {
    const def = this.getRegistryById(registryId);
    if (!def) {
      throw new Error(`Unknown registry block id: ${registryId}`);
    }
    const id = this.nextLocalId(def.element);
    const block = createBlockFromRegistry(def, id);

    const before = (this.tree.blocks as Block[]).length;
    const blocks = this.tree.blocks as Block[];
    const insertIndex = index != null ? Math.max(0, Math.min(index, blocks.length)) : blocks.length;

    const nextBlocks = [...blocks];
    nextBlocks.splice(insertIndex, 0, block);
    this.tree = { ...(this.tree as any), blocks: nextBlocks };
    this.runtime = new BlocksRuntime(this.tree);

    const after = nextBlocks.length;
    console.log("EditorAdapter.insertBlock", {
      registryId,
      before,
      after,
      insertIndex,
      newBlockId: block.id,
    });

    this._selectedBlockId = block.id;
    this.events.onInsert?.(block, insertIndex);
    this.events.onChange?.(this.tree);
    this.events.onSelect?.(block.id);
    return block;
  }

  updateBlockProps(blockId: string, partialProps: Record<string, any>): void {
    const blocks = this.tree.blocks as Block[];
    const nextBlocks = blocks.map((b) =>
      b.id === blockId
        ? ({
            ...b,
            properties: {
              ...b.properties,
              ...partialProps,
            },
          } as Block)
        : b,
    );
    this.tree = { ...(this.tree as any), blocks: nextBlocks };
    this.runtime = new BlocksRuntime(this.tree);

    const updated = nextBlocks.find((b) => b.id === blockId);
    if (updated) {
      this.events.onPropChange?.(updated);
    }
    this.events.onChange?.(this.tree);
  }

  transformBlock(blockId: string, targetRegistryId: string): void {
    const target = this.getRegistryById(targetRegistryId);
    if (!target) return;

    const blocks = this.tree.blocks as Block[];
    const nextBlocks = blocks.map((b) => {
      if (b.id !== blockId) return b;
      const fromElement = String((b.properties as any).element ?? "paragraph");
      const existingText = (b.properties as any).text;
      const merged: Block = {
        ...b,
        properties: {
          ...b.properties,
          element: target.element,
          ...target.defaultProps,
          text: existingText ?? target.defaultProps.text,
        },
      } as Block;
      this.events.onTransform?.(merged, fromElement, target.element);
      return merged;
    });

    this.tree = { ...(this.tree as any), blocks: nextBlocks };
    this.runtime = new BlocksRuntime(this.tree);
    this.events.onChange?.(this.tree);
  }

  selectBlock(blockId: string | null): void {
    this.selectedBlockId = blockId;
  }

  setCursor(blockId: string | null, offset: number): void {
    this.events.onCursorMove?.({ blockId, offset });
  }
}
