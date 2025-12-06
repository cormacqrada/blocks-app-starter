declare module "@blocks-ecosystem/core" {
  export interface Block {
    id: string;
    type: string;
    version: string;
    properties: Record<string, unknown>;
    inputs?: unknown[];
    outputs?: unknown[];
    schema?: string;
  }

  export interface BlockTree {
    id: string;
    blocks: Block[];
    collections: any[];
  }

  export interface ApplyTokenCollectionBlock extends Block {
    properties: {
      element: "applyTokenCollection";
      collectionName: string;
      outputType: string;
    } & Record<string, unknown>;
  }

  export interface TokenCollection {
    name: string;
    items: any[];
    relationships: Record<string, unknown>;
    version: string;
    schema: string;
  }

  export interface ThemeBlock extends Block {
    properties: {
      element: "theme";
      tokens: Record<string, string>;
    } & Record<string, unknown>;
  }

  export interface CanvasBlock extends Block {
    properties: {
      element: "canvas";
      zoom: number;
      offsetX: number;
      offsetY: number;
      showGrid?: boolean;
      snapToGrid?: boolean;
    } & Record<string, unknown>;
  }

  export interface NodePortDefinition {
    id: string;
    label: string;
    portType?: string;
    multiple?: boolean;
    [key: string]: unknown;
  }

  export interface NodeBlock extends Block {
    properties: {
      element: "node";
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

  export interface EdgeBlock extends Block {
    properties: {
      element: "edge";
      canvasId?: string;
      sourceNodeId: string;
      sourcePortId?: string;
      targetNodeId: string;
      targetPortId?: string;
    } & Record<string, unknown>;
  }

  export interface DashboardBlock extends Block {
    properties: {
      element: "dashboard";
      columns: number;
      rowHeightPx: number;
      gapPx: number;
      editMode?: boolean;
    } & Record<string, unknown>;
  }

  export interface DashboardPanelBlock extends Block {
    properties: {
      element: "dashboard.panel";
      dashboardId?: string;
      x: number;
      y: number;
      w: number;
      h: number;
      minW?: number;
      minH?: number;
      title?: string;
    } & Record<string, unknown>;
  }
}

declare module "@blocks-ecosystem/runtime" {
  import type { BlockTree } from "@blocks-ecosystem/core";

  export interface ExecutableDocument {
    id: string;
    markdown: string;
    tree: BlockTree;
  }

  export function deserializeFromMarkdown(id: string, markdown: string): ExecutableDocument;
  export function executeBlockTree(tree: BlockTree): BlockTree;
  export function markdownToBlockTree(id: string, markdown: string): BlockTree;
}
