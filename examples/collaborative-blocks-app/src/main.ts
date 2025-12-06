import { registerBlocksRenderer, BlocksRendererElement } from "@blocks-ecosystem/renderer/blocks-renderer";
import { BlocksRuntime, type BlockDelta } from "@blocks-ecosystem/runtime";
import type { BlockTree } from "@blocks-ecosystem/core";

registerBlocksRenderer();

const renderer = document.getElementById("realtime-view") as BlocksRendererElement | null;

if (renderer) {
  // Client-side runtime mirrors the server runtime via BlockDelta[] over WS.
  let runtime: BlocksRuntime | null = null;

  const ws = new WebSocket("ws://localhost:4001");

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(String(event.data));
      if (msg.type === "snapshot") {
        const tree = msg.tree as BlockTree;
        runtime = new BlocksRuntime(tree);
        runtime.registerAdapter({
          id: "renderer",
          onDeltas(_deltas, rt) {
            renderer.setTree(rt.getTree());
          }
        });
        renderer.setTree(runtime.getTree());
      } else if (msg.type === "deltas" && runtime) {
        const deltas = msg.deltas as BlockDelta[];
        runtime.applyDeltas(deltas);
      }
    } catch (err) {
      console.error("Error handling WS message", err);
    }
  };
}
