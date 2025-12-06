import type { Block, BlockTree, DashboardBlock, DashboardPanelBlock } from "@blocks-ecosystem/core";
import { BlocksRuntime, type BlockDelta } from "@blocks-ecosystem/runtime";
import { registerBlocksDashboard } from "@blocks-ecosystem/renderer/blocks-dashboard";

registerBlocksDashboard();

function createDashboardTree(): BlockTree {
  const dashboard: DashboardBlock = {
    id: "dashboard:main",
    type: "visual",
    properties: {
      element: "dashboard",
      columns: 12,
      rowHeightPx: 80,
      gapPx: 12,
      editMode: true
    },
    state: {},
    inputs: [],
    children: [],
    metadata: {}
  };

  const makePanel = (
    id: string,
    title: string,
    x: number,
    y: number,
    w: number,
    h: number
  ): DashboardPanelBlock => ({
    id,
    type: "visual",
    properties: {
      element: "dashboard.panel",
      dashboardId: dashboard.id,
      title,
      x,
      y,
      w,
      h
    },
    state: {},
    inputs: [],
    children: [],
    metadata: {}
  });

  const blocks: Block[] = [
    dashboard,
    makePanel("panel:traffic", "Traffic", 0, 0, 4, 3),
    makePanel("panel:revenue", "Revenue", 4, 0, 4, 3),
    makePanel("panel:activity", "Activity", 8, 0, 4, 3),
    makePanel("panel:map", "Geo Map", 0, 3, 6, 3),
    makePanel("panel:feed", "Feed", 6, 3, 6, 3)
  ];

  return {
    id: "dashboard-demo-root",
    version: 1,
    root: dashboard.id,
    blocks
  };
}

const initialTree: BlockTree = createDashboardTree();
const runtime = new BlocksRuntime(initialTree);

const dashboardEl = document.getElementById("demo-dashboard") as any;
if (dashboardEl && typeof dashboardEl.setTree === "function") {
  // initial render from the runtime's canonical tree
  dashboardEl.setTree(runtime.getTree());

  dashboardEl.addEventListener("dashboard:panelPositionChange", (event: Event) => {
    const custom = event as CustomEvent<{ deltas: BlockDelta[] }>;
    const deltas = custom.detail?.deltas ?? [];
    if (!Array.isArray(deltas) || deltas.length === 0) return;

    runtime.applyDeltas(deltas);
    // The panels already update their own grid positions; we don't need to
    // immediately re-render the dashboard tree on every delta, which was
    // causing a visual snap back.
    // dashboardEl.setTree(runtime.getTree());
  });
}
