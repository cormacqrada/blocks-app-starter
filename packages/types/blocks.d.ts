export type BlockKind = "data" | "logic" | "visual";

export interface BlockRef {
  id: string;
}

export interface Block {
  id: string;
  type: BlockKind;
  version: string;
  properties: Record<string, unknown>;
  inputs: BlockRef[];
  outputs: BlockRef[];
  schema: "blocks.schema.json";
}
