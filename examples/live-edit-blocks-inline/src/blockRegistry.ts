import type { Block } from "@blocks/core";

export type BlockPropType = "string" | "number" | "enum";

export interface BlockPropSchemaItem {
  name: string;
  label: string;
  type: BlockPropType;
  options?: string[]; // for enum
}

export interface RegistryBlockDefinition {
  id: string;
  label: string;
  description?: string;
  /** core element name, e.g. "paragraph", "heading", "input" */
  element: string;
  /** high-level category for palette filtering */
  kind: "text" | "list" | "layout" | "control" | "media" | "embed";
  /** true if a line can be transformed into this type (e.g. paragraph → heading) */
  transformable?: boolean;
  defaultProps: Record<string, any>;
  propSchema: BlockPropSchemaItem[];
}

export const BLOCK_REGISTRY: RegistryBlockDefinition[] = [
  {
    id: "paragraph",
    label: "Paragraph",
    description: "Basic rich text paragraph",
    element: "paragraph",
    kind: "text",
    transformable: true,
    defaultProps: {
      text: "Write something...",
    },
    propSchema: [{ name: "text", label: "Text", type: "string" }],
  },
  {
    id: "heading",
    label: "Heading",
    description: "Section heading (H1–H4)",
    element: "heading",
    kind: "text",
    transformable: true,
    defaultProps: {
      level: 2,
      text: "Heading",
    },
    propSchema: [
      { name: "text", label: "Text", type: "string" },
      {
        name: "level",
        label: "Level",
        type: "enum",
        options: ["1", "2", "3", "4"],
      },
    ],
  },
  {
    id: "blockquote",
    label: "Blockquote",
    description: "Quoted text callout",
    element: "blockquote",
    kind: "text",
    transformable: true,
    defaultProps: {
      text: "A short, punchy quote.",
    },
    propSchema: [{ name: "text", label: "Text", type: "string" }],
  },
  {
    id: "code",
    label: "Code",
    description: "Code block with optional language",
    element: "code",
    kind: "text",
    transformable: true,
    defaultProps: {
      text: "console.log('Hello, Blocks!')",
      language: "ts",
    },
    propSchema: [
      { name: "text", label: "Code", type: "string" },
      {
        name: "language",
        label: "Language",
        type: "string",
      },
    ],
  },
  {
    id: "input",
    label: "Input",
    description: "Semantic text input",
    element: "input",
    kind: "control",
    defaultProps: {
      name: "email",
      text: "Email",
      inputType: "email",
      placeholder: "you@example.com",
    },
    propSchema: [
      { name: "text", label: "Label", type: "string" },
      { name: "name", label: "Name", type: "string" },
    ],
  },
  {
    id: "textarea",
    label: "Textarea",
    description: "Multi-line text input",
    element: "textarea",
    kind: "control",
    defaultProps: {
      name: "bio",
      text: "Bio",
      placeholder: "Tell us about yourself...",
      rows: 3,
    },
    propSchema: [
      { name: "text", label: "Label", type: "string" },
      { name: "name", label: "Name", type: "string" },
    ],
  },
  {
    id: "button",
    label: "Button",
    description: "Semantic button",
    element: "button",
    kind: "control",
    defaultProps: {
      text: "Save changes",
      variant: "primary",
    },
    propSchema: [{ name: "text", label: "Label", type: "string" }],
  },
];

export function createBlockFromRegistry(def: RegistryBlockDefinition, id: string): Block {
  return {
    id,
    type: "visual",
    version: "1.0.0",
    properties: {
      element: def.element,
      ...def.defaultProps,
    },
    children: [],
  };
}

export function findRegistryDefByElement(element: string | undefined | null): RegistryBlockDefinition | undefined {
  if (!element) return undefined;
  return BLOCK_REGISTRY.find((d) => d.element === element);
}
