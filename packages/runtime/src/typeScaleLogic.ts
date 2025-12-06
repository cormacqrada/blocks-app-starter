import type { BlockTree } from "@blocks-ecosystem/core";
import type { TypeScaleBlock, TokenCollection, TokenCollectionItem } from "@blocks-ecosystem/core";

function resolveRatio(ratio: TypeScaleBlock["properties"]["ratio"]): number {
  if (typeof ratio === "number") return ratio;
  switch (ratio) {
    case "minorThird":
      return 1.2;
    case "majorThird":
      return 1.25;
    case "perfectFourth":
      return 1.333;
    case "goldenRatio":
      return 1.618;
    default:
      return 1.2;
  }
}

/**
 * Apply all TypeScaleBlock logic blocks to produce TokenCollections with
 * typography scale tokens.
 */
export function applyTypeScaleBlocks(tree: BlockTree): BlockTree {
  const blocks = tree.blocks;
  const existingCollections = [...tree.collections];

  const typeScaleBlocks = blocks.filter(
    (b) => b.type === "logic" && (b as any).properties?.element === "typeScale"
  ) as TypeScaleBlock[];

  if (typeScaleBlocks.length === 0) return tree;

  const collectionsByName = new Map<string, TokenCollection>();
  for (const c of existingCollections as TokenCollection[]) {
    collectionsByName.set(c.name, c);
  }

  for (const block of typeScaleBlocks) {
    const p = block.properties as any;
    const baseSizePx: number = p.baseSizePx ?? 16;
    const ratioValue: number = resolveRatio(p.ratio ?? "minorThird");
    const stepsAbove: number = p.stepsAbove ?? 3;
    const stepsBelow: number = p.stepsBelow ?? 2;
    const collectionName: string = p.collectionName ?? "typography.scale";

    const items: TokenCollectionItem[] = [];

    // Steps below (negative indices)
    for (let i = stepsBelow; i >= 1; i--) {
      const step = -i;
      const size = baseSizePx / Math.pow(ratioValue, i);
      items.push({
        key: `typography.scale.${step}`,
        value: `${Math.round(size * 100) / 100}px`
      });
    }

    // Base (0)
    items.push({
      key: "typography.scale.0",
      value: `${baseSizePx}px`
    });

    // Steps above (positive indices)
    for (let i = 1; i <= stepsAbove; i++) {
      const size = baseSizePx * Math.pow(ratioValue, i);
      items.push({
        key: `typography.scale.${i}`,
        value: `${Math.round(size * 100) / 100}px`
      });
    }

    const collection: TokenCollection = {
      name: collectionName,
      items,
      relationships: {},
      version: "1.0.0",
      schema: "collection.schema.json"
    };

    collectionsByName.set(collectionName, collection);
  }

  return {
    ...tree,
    collections: Array.from(collectionsByName.values())
  };
}
