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

export interface Collection {
  name: string;
  /** Origin of this collection: user-authored or system-generated. */
  kind?: "user" | "system";
  items: unknown[];
  relationships: Record<string, unknown>;
  version: string;
  schema: "collection.schema.json";
}

export interface BlockTree {
  id: string;
  blocks: Block[];
  collections: Collection[];
}

/**
 * ThemeBlock is a legacy helper for theme tokens; new code should prefer a
 * TokenCollection + ApplyTokenCollectionBlock pipeline.
 */
export interface ThemeBlock extends Block {
  type: "data";
  properties: {
    element: "theme";
    tokens: Record<string, string>;
  } & Record<string, unknown>;
}

export interface TokenCollectionItem {
  key: string;
  value: string;
  [key: string]: unknown;
}

export interface TokenCollection extends Collection {
  items: TokenCollectionItem[];
}

export interface ApplyTokenCollectionBlock extends Block {
  type: "logic";
  properties: {
    element: "applyTokenCollection";
    collectionName: string;
    outputType: "cssVariables" | "jsStyleObject";
    mapperId?: string;
  } & Record<string, unknown>;
}

export interface DashboardPanelBlock extends Block {
  type: "visual";
  properties: {
    element: "dashboard.panel";
    dashboardId?: string;
    /** x position in grid columns (0-based index). */
    x: number;
    /** y position in grid rows (0-based index). */
    y: number;
    /** width in grid columns. */
    w: number;
    /** height in grid rows. */
    h: number;
    minW?: number;
    minH?: number;
    /** optional title/label for the panel chrome */
    title?: string;
  } & Record<string, unknown>;
}

export interface DashboardBlock extends Block {
  type: "visual";
  properties: {
    element: "dashboard";
    columns: number; // usually 12
    rowHeightPx: number;
    gapPx: number;
    editMode?: boolean;
    /** future: breakpoint config, zoom, etc. */
  } & Record<string, unknown>;
}

/**
 * CanvasBlock provides a pannable, zoomable 2D plane for free placement of
 * child blocks. It is intentionally generic and does not assume any specific
 * child type (nodes, shapes, etc.).
 */
export interface CanvasBlock extends Block {
  type: "visual";
  properties: {
    element: "canvas";
    /**
     * Logical zoom factor, where 1.0 is 100%. Implementations are free to
     * clamp this to a sensible range.
     */
    zoom: number;
    /** viewport translation in canvas coordinates */
    offsetX: number;
    offsetY: number;
    showGrid?: boolean;
    snapToGrid?: boolean;
  } & Record<string, unknown>;
}

/**
 * Generic port definition for visual programming nodes.
 */
export interface NodePortDefinition {
  id: string;
  label: string;
  /** optional semantic port type, e.g. "float", "color", "texture" */
  portType?: string;
  /** true if this port can accept/produce multiple connections */
  multiple?: boolean;
  [key: string]: unknown;
}

/**
 * NodeBlock is a generic visual node that can live inside a CanvasBlock or
 * any other container. It models position + optional dimensions and exposes
 * input/output port definitions.
 */
export interface NodeBlock extends Block {
  type: "visual";
  properties: {
    element: "node";
    /** optional parent canvas identifier */
    canvasId?: string;
    title?: string;
    x: number;
    y: number;
    w?: number;
    h?: number;
    collapsed?: boolean;
    inputs?: NodePortDefinition[];
    outputs?: NodePortDefinition[];
  } & Record<string, unknown>;
}

/**
 * EdgeBlock connects two nodes in a CanvasBlock. It is purely structural and
 * does not encode any domain semantics.
 */
export interface EdgeBlock extends Block {
  type: "visual";
  properties: {
    element: "edge";
    canvasId?: string;
    sourceNodeId: string;
    sourcePortId?: string;
    targetNodeId: string;
    targetPortId?: string;
  } & Record<string, unknown>;
}

export interface TypeScaleBlock extends Block {
  type: "logic";
  properties: {
    element: "typeScale";
    baseSizePx: number;
    /** ratio can be a named preset or a raw numeric multiplier */
    ratio: "minorThird" | "majorThird" | "perfectFourth" | "goldenRatio" | number;
    stepsAbove: number;
    stepsBelow: number;
    collectionName: string;
  } & Record<string, unknown>;
}

/**
 * DagToUiBlock is a logic block that, when "executed", reads a canvas + node
 * graph and produces a view-oriented BlockTree (e.g. headings, paragraphs)
 * suitable for feeding into a renderer. For now, execution is implemented in
 * example code, but the type lives in core so it can be reused.
 */
export interface DagToUiBlock extends Block {
  type: "logic";
  properties: {
    element: "dagToUi";
    /** canvas whose nodes define the DAG for this UI */
    canvasId: string;
  } & Record<string, unknown>;
}

/**
 * Modern HTML-native design system controls. These are semantic controls that
 * the renderer can map to stylable custom elements (e.g. <blocks-select>,
 * <blocks-range>, <blocks-switch>) while keeping the core model HTML-flavored.
 */
export interface SelectOptionDefinition {
  label: string;
  value: string;
  [key: string]: unknown;
}

export interface SelectBlock extends Block {
  type: "visual";
  properties: {
    /** semantic control kind */
    element: "select";
    /** form field name */
    name?: string;
    /** label text */
    text?: string;
    /** available options */
    options?: SelectOptionDefinition[];
  } & Record<string, unknown>;
}

export interface RangeBlock extends Block {
  type: "visual";
  properties: {
    element: "range";
    name?: string;
    /** label text */
    text?: string;
    /** inclusive minimum value */
    min?: number;
    /** inclusive maximum value */
    max?: number;
    /** current value */
    value?: number;
  } & Record<string, unknown>;
}

export interface SwitchBlock extends Block {
  type: "visual";
  properties: {
    element: "switch";
    name?: string;
    /** label text */
    text?: string;
    /** current state, when present */
    checked?: boolean;
  } & Record<string, unknown>;
}

/**
 * TableColumnDefinition describes a single column in a tabular visual block.
 */
export interface TableColumnDefinition {
  /** Stable identifier for the column (can be used for sorting, etc.). */
  id: string;
  /** Human-readable label shown in the header. */
  label?: string;
  /**
   * Field name to read from each collection item. For now this assumes items
   * are plain objects and field is a top-level key.
   */
  field: string;
  [key: string]: unknown;
}

/**
 * TableBlock is a visual block that renders a Collection as an HTML table.
 *
 * It expects a Collection in the surrounding BlockTree with a matching
 * collectionName. Items in that collection should be plain objects; columns
 * determine which fields are displayed.
 */
export interface TableBlock extends Block {
  type: "visual";
  properties: {
    element: "table";
    /** Name of the collection from BlockTree.collections to visualize. */
    collectionName: string;
    /** Optional explicit column configuration. If omitted, columns are
     * inferred from the first collection item.
     */
    columns?: TableColumnDefinition[];
    /** Optional maximum rows to display. */
    limit?: number;
  } & Record<string, unknown>;
}
