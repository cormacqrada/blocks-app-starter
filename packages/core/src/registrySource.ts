import type { RegistrySource } from "@blocks-ecosystem/registry";
import { CORE_BLOCK_MANIFEST } from "./blocks.manifest";

export const CORE_REGISTRY_SOURCE: RegistrySource = {
  id: "core",
  trustTier: "core",
  manifest: CORE_BLOCK_MANIFEST,
};
