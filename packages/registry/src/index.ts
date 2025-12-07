import type {
  BlockRegistry,
  BlockRegistryEntry,
  RegistrySource,
  BlockTrustTier,
} from "./types";

export * from "./types";

const TRUST_RANK: Record<BlockTrustTier, number> = {
  core: 3,
  commons: 2,
  thirdParty: 1,
};

export interface LoadRegistryOptions {
  sources: RegistrySource[];
  minTrust?: BlockTrustTier;
  conflictResolver?: (a: BlockRegistryEntry, b: BlockRegistryEntry) => BlockRegistryEntry;
}

export function loadBlockRegistry(options: LoadRegistryOptions): BlockRegistry {
  const { sources, minTrust = "thirdParty", conflictResolver } = options;
  const minRank = TRUST_RANK[minTrust];
  const byId = new Map<string, BlockRegistryEntry>();

  for (const source of sources) {
    const rank = TRUST_RANK[source.trustTier];
    if (rank < minRank) continue;

    for (const entry of source.manifest.blocks) {
      const merged: BlockRegistryEntry = {
        ...entry,
        sourceId: source.id,
        trustTier: source.trustTier,
      };
      const existing = byId.get(entry.id);
      if (!existing) {
        byId.set(entry.id, merged);
        continue;
      }
      if (conflictResolver) {
        byId.set(entry.id, conflictResolver(existing, merged));
      } else {
        const existingRank = TRUST_RANK[existing.trustTier];
        byId.set(entry.id, rank >= existingRank ? merged : existing);
      }
    }
  }

  return { entries: [...byId.values()] };
}

import type { BlockKind } from "./types";

export function listBlocks(
  registry: BlockRegistry,
  filter?: { kind?: BlockKind; trustAtLeast?: BlockTrustTier },
): BlockRegistryEntry[] {
  const minRank = filter?.trustAtLeast ? TRUST_RANK[filter.trustAtLeast] : 1;
  return registry.entries.filter((b) => {
    if (filter?.kind && b.kind !== filter.kind) return false;
    if (TRUST_RANK[b.trustTier] < minRank) return false;
    return true;
  });
}

export function getBlockById(
  registry: BlockRegistry,
  id: string,
): BlockRegistryEntry | undefined {
  return registry.entries.find((b) => b.id === id);
}
