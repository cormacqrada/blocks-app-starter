import type { Block, BlockTree, Collection, TokenCollection } from "@blocks/core";
import { registerBlocksRenderer } from "@blocks/renderer/blocks-renderer";

registerBlocksRenderer();

function createThemeCollection(kind: "dark" | "light"): TokenCollection {
  const base: TokenCollection = {
    name: "theme.current",
    version: "1.0.0",
    schema: "collection.schema.json",
    items: [],
    relationships: {},
  };

  if (kind === "dark") {
    base.items = [
      { key: "color.accent", value: "#6366f1" },
      { key: "color.surface", value: "#111827" },
      { key: "color.surfaceSoft", value: "#020617" },
      { key: "color.text", value: "#e5e7eb" },
      { key: "color.muted", value: "#9ca3af" },
    ];
  } else {
    base.items = [
      { key: "color.accent", value: "#4f46e5" },
      { key: "color.surface", value: "#ffffff" },
      { key: "color.surfaceSoft", value: "#f3f4f6" },
      { key: "color.text", value: "#111827" },
      { key: "color.muted", value: "#6b7280" },
    ];
  }

  return base;
}

function createControlsBlocks(): Block[] {
  const blocks: Block[] = [
    {
      id: "heading:ds",
      type: "visual",
      version: "1.0.0",
      properties: {
        element: "heading",
        level: 2,
        text: "Account settings",
      },
      inputs: [],
      outputs: [],
      schema: "blocks.schema.json",
    },
    {
      id: "input:email",
      type: "visual",
      version: "1.0.0",
      properties: {
        element: "input",
        name: "email",
        text: "Email",
        inputType: "email",
        placeholder: "you@example.com",
      },
      inputs: [],
      outputs: [],
      schema: "blocks.schema.json",
    },
    {
      id: "textarea:bio",
      type: "visual",
      version: "1.0.0",
      properties: {
        element: "textarea",
        name: "bio",
        text: "Bio",
        placeholder: "Tell us a bit about yourself...",
        rows: 3,
      },
      inputs: [],
      outputs: [],
      schema: "blocks.schema.json",
    },
    {
      id: "select:language",
      type: "visual",
      version: "1.0.0",
      properties: {
        element: "select",
        name: "language",
        text: "Favorite language",
        options: [
          { label: "TypeScript", value: "ts" },
          { label: "JavaScript", value: "js" },
          { label: "Rust", value: "rs" },
        ],
      },
      inputs: [],
      outputs: [],
      schema: "blocks.schema.json",
    },
    {
      id: "range:volume",
      type: "visual",
      version: "1.0.0",
      properties: {
        element: "range",
        name: "volume",
        text: "Volume",
        min: 0,
        max: 100,
        value: 40,
      },
      inputs: [],
      outputs: [],
      schema: "blocks.schema.json",
    },
    {
      id: "switch:notifications",
      type: "visual",
      version: "1.0.0",
      properties: {
        element: "switch",
        name: "notifications",
        text: "Notifications",
      },
      inputs: [],
      outputs: [],
      schema: "blocks.schema.json",
    },
    {
      id: "popover:help",
      type: "visual",
      version: "1.0.0",
      properties: {
        element: "popover",
        triggerText: "Why we ask",
        text: "We use this information to personalize your experience.",
        size: "sm",
      },
      inputs: [],
      outputs: [],
      schema: "blocks.schema.json",
    },
    {
      id: "button:submit",
      type: "visual",
      version: "1.0.0",
      properties: {
        element: "button",
        text: "Save changes",
        variant: "primary",
      },
      inputs: [],
      outputs: [],
      schema: "blocks.schema.json",
    },
  ];

  return blocks;
}

function createTree(themeKind: "dark" | "light"): BlockTree {
  const collection = createThemeCollection(themeKind);

  const applyBlock: Block = {
    id: "logic:apply-theme",
    type: "logic",
    version: "1.0.0",
    properties: {
      element: "applyTokenCollection",
      collectionName: collection.name,
      outputType: "cssVariables",
    },
    inputs: [],
    outputs: [],
    schema: "blocks.schema.json",
  };

  const blocks = [applyBlock, ...createControlsBlocks()];

  const tree: BlockTree = {
    id: "ds-playground",
    blocks,
    collections: [collection as Collection],
  };

  return tree;
}

function main() {
  const preview = document.getElementById("ds-preview") as any;
  if (!preview) throw new Error("Missing ds-preview element");

  let currentTheme: "dark" | "light" = "dark";
  let tree = createTree(currentTheme);
  preview.setTree(tree);

  const toggleRoot = document.getElementById("theme-toggle");
  if (toggleRoot) {
    toggleRoot.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.tagName !== "BUTTON") return;
      const theme = target.getAttribute("data-theme") as "dark" | "light" | null;
      if (!theme || theme === currentTheme) return;
      currentTheme = theme;

      // Update button states
      Array.from(toggleRoot.querySelectorAll("button")).forEach((btn) => {
        const b = btn as HTMLButtonElement;
        const t = b.getAttribute("data-theme");
        b.setAttribute("data-active", String(t === currentTheme));
      });

      tree = createTree(currentTheme);
      preview.setTree(tree);
    });
  }
}

main();
