import type { Block } from "@blocks-ecosystem/core";
import {
  loadBlockRegistry,
  getBlockById,
  type BlockRegistryEntry,
} from "@blocks-ecosystem/registry";
import { CORE_REGISTRY_SOURCE } from "@blocks-ecosystem/core/registrySource";

export type RegistryBlockDefinition = BlockRegistryEntry;

// Load a registry for the inline editor. For now this uses only the core
// source, but can be extended later (e.g. to include a Commons source).
const EDITOR_REGISTRY = loadBlockRegistry({
  sources: [CORE_REGISTRY_SOURCE],
  minTrust: "core",
});

// Backwards-compatible export: many example components import BLOCK_REGISTRY
// directly, so we keep it as a live view of the registry entries.
export const BLOCK_REGISTRY: RegistryBlockDefinition[] = EDITOR_REGISTRY.entries;

export function createBlockFromRegistry(def: RegistryBlockDefinition, id: string): Block {
  return {
    id,
    type: "visual",
    version: def.version,
    properties: {
      element: def.element,
      ...def.defaultProps,
    },
    children: [],
  };
}

export function findRegistryDefByElement(
  element: string | undefined | null,
): RegistryBlockDefinition | undefined {
  if (!element) return undefined;
  return EDITOR_REGISTRY.entries.find((d) => d.element === element);
}
