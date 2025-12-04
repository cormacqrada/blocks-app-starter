import { registerBlocksRenderer, BlocksRendererElement } from "../../../packages/renderer/src";
import { BlocksRuntime } from "../../../packages/runtime/src";
import type { BlockTree, BlockDelta } from "../../../packages/runtime/src";

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
