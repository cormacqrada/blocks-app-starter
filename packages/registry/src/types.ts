export type BlockTrustTier = "core" | "commons" | "thirdParty";

export interface BlockRuntimeRef {
  module: string;
  export: string;
}

export interface BlockPropSchemaItem {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "enum";
  options?: string[];
}

export type BlockKind = "data" | "logic" | "visual";

export interface BlockManifestEntry {
  id: string;
  label: string;
  description?: string;
  element: string;
  /**
   * High-level, non-overlapping classification of the block's execution role.
   * - "data": fetch/transform/aggregate data
   * - "logic": derive decisions, compute derived state, orchestrate flows
   * - "visual": present information in the UI
   */
  kind: BlockKind;
  version: string;
  requiresCore?: string;
  requiresRuntime?: string;
  /** Optional reference to a deeper Block Schema definition (e.g. JSON Schema). */
  schemaRef?: {
    /** Module that exports the schema definition (TS or JSON). */
    module: string;
    /** Named export or JSON Schema identifier. */
    export?: string;
    /** Optional JSON Schema $id or file name for validators. */
    id?: string;
  };
  defaultProps: Record<string, unknown>;
  propSchema: BlockPropSchemaItem[];
  runtime?: BlockRuntimeRef;
  capabilities?: {
    network?: boolean;
    localStorage?: boolean;
    executesCode?: boolean;
  };
}

export interface BlockManifest {
  packageName: string;
  namespace?: string;
  blocks: BlockManifestEntry[];
}

export interface RegistrySource {
  id: string;
  trustTier: BlockTrustTier;
  manifest: BlockManifest;
}

export interface BlockRegistryEntry extends BlockManifestEntry {
  sourceId: string;
  trustTier: BlockTrustTier;
}

export interface BlockRegistry {
  entries: BlockRegistryEntry[];
}
