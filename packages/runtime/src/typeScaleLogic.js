function resolveRatio(ratio) {
    if (typeof ratio === "number")
        return ratio;
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
export function applyTypeScaleBlocks(tree) {
    const blocks = tree.blocks;
    const existingCollections = [...tree.collections];
    const typeScaleBlocks = blocks.filter((b) => b.type === "logic" && b.properties?.element === "typeScale");
    if (typeScaleBlocks.length === 0)
        return tree;
    const collectionsByName = new Map();
    for (const c of existingCollections) {
        collectionsByName.set(c.name, c);
    }
    for (const block of typeScaleBlocks) {
        const p = block.properties;
        const baseSizePx = p.baseSizePx ?? 16;
        const ratioValue = resolveRatio(p.ratio ?? "minorThird");
        const stepsAbove = p.stepsAbove ?? 3;
        const stepsBelow = p.stepsBelow ?? 2;
        const collectionName = p.collectionName ?? "typography.scale";
        const items = [];
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
        const collection = {
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
