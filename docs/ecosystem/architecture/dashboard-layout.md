# Dashboard Layout Blocks

This document describes the `dashboard` and `dashboard.panel` blocks, which
compose a grid-based dashboard layout as one of the core page layouts in a
Blocks app.

## `dashboard` Block (container + grid system)

The `dashboard` block defines a 12-column grid, establishes layout rules, and
manages the overall canvas.

**Purpose**

- Provide the coordinate system for panels.
- Own grid sizing, snap rules, and responsive breakpoints.
- Maintain global dashboard state (editing mode, selection, etc.).
- Host nested `dashboard.panel` children.
- Handle global behaviors like drag-selection, zoom, and canvas scaling.

**TypeScript shape** (from `@blocks/core`):

```ts
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
```

## `dashboard.panel` Block (tile + XY container)

The `dashboard.panel` block represents a single tile within the dashboard and
wraps a child block (chart, table, feed, image, KPI card, etc.).

**Purpose**

- Represent a single tile within the dashboard.
- Wrap any content block via `inputs` (e.g. `inputs[0].id` is the content id).
- Store and expose positional + size metadata (`x, y, w, h`).
- Be independently draggable, resizable, and expandable/collapsible.
- Communicate position changes back to the parent dashboard.

**TypeScript shape**:

```ts
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
```

In a `BlockTree`, a dashboard page layout typically contains:

- One `DashboardBlock` that defines the grid and global state.
- Multiple `DashboardPanelBlock` instances whose `dashboardId` points at the
  parent `DashboardBlock.id` and whose `inputs` contain the wrapped content
  block ids.

## Runtime & Renderer Responsibilities

At the **runtime** level:

- The `BlockTree` carries `dashboard` and `dashboard.panel` blocks plus their
  content blocks.
- The runtime is responsible for applying `BlockDelta[]` that update panel
  positions and sizes (e.g. in response to drag/resize operations).

At the **renderer** level (e.g. a future `blocks-dashboard` Web Component):

- Render the 12-column grid using CSS Grid or absolute positioning.
- Render each `dashboard.panel` as a tile with chrome (handles, header).
- Allow drag/move/resize interactions and dispatch position deltas back to the
  runtime (e.g. `{ kind: "update", blockId, path: "panel.position", block: {...} }`).
- Handle collision detection, snapping, and layout constraints using pure
  layout logic, producing new `BlockDelta[]`.

These blocks are intentionally defined as **generic layout primitives** so they
can host any child blocks and remain compatible with the broader parametric
Design System and Blocks Runtime OS.