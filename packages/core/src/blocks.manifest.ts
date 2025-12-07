import type { BlockManifest } from "@blocks-ecosystem/registry";

export const CORE_BLOCK_MANIFEST: BlockManifest = {
  packageName: "@blocks-ecosystem/core",
  namespace: "Core",
  blocks: [
    {
      id: "@blocks-ecosystem/core/paragraph",
      label: "Paragraph",
      description: "Basic rich text paragraph",
      element: "paragraph",
      kind: "visual",
      version: "1.0.0",
      defaultProps: { text: "Write something..." },
      propSchema: [{ name: "text", label: "Text", type: "string" }],
      schemaRef: {
        module: "../../schema/blocks.schema.json",
        id: "https://blocks.dev/schema/blocks.schema.json",
      },
    },
    {
      id: "@blocks-ecosystem/core/heading",
      label: "Heading",
      description: "Section heading (H1–H4)",
      element: "heading",
      kind: "visual",
      version: "1.0.0",
      defaultProps: { text: "Heading", level: 2 },
      propSchema: [
        { name: "text", label: "Text", type: "string" },
        { name: "level", label: "Level", type: "enum", options: ["1", "2", "3", "4"] },
      ],
    },
    {
      id: "@blocks-ecosystem/core/input",
      label: "Input",
      description: "Semantic text input",
      element: "input",
      kind: "visual",
      version: "1.0.0",
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
      id: "@blocks-ecosystem/core/textarea",
      label: "Textarea",
      description: "Multi-line text input",
      element: "textarea",
      kind: "visual",
      version: "1.0.0",
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
      id: "@blocks-ecosystem/core/button",
      label: "Button",
      description: "Semantic button",
      element: "button",
      kind: "visual",
      version: "1.0.0",
      defaultProps: {
        text: "Save changes",
        variant: "primary",
      },
      propSchema: [{ name: "text", label: "Label", type: "string" }],
    },
  ],
};
