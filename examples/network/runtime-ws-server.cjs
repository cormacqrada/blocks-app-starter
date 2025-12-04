#!/usr/bin/env node
// Simple BlocksRuntime WebSocket server that broadcasts BlockDelta[] to clients.

const http = require("http");
const WebSocket = require("ws");
const { BlocksRuntime, markdownToBlockTree } = require("../../packages/runtime/dist/index.js");

const port = process.env.PORT || 4001;

// Initial tree: a trivial markdown-derived tree
const initialMarkdown = "# Realtime Blocks\n\nCollaborative editing demo.";
const initialTree = markdownToBlockTree("realtime-doc", initialMarkdown);
const runtime = new BlocksRuntime(initialTree);

const server = http.createServer();
const wss = new WebSocket.Server({ server });

function broadcast(message) {
  const payload = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

runtime.registerAdapter({
  id: "ws-broadcast",
  onDeltas(deltas, rt) {
    broadcast({ type: "deltas", deltas });
  }
});

wss.on("connection", (ws) => {
  // Send initial snapshot
  ws.send(JSON.stringify({ type: "snapshot", tree: runtime.getTree() }));

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(String(data));
      if (msg.type === "deltas" && Array.isArray(msg.deltas)) {
        runtime.applyDeltas(msg.deltas);
      }
    } catch (err) {
      console.error("Error handling message", err);
    }
  });
});

server.listen(port, () => {
  console.log(`BlocksRuntime WS server listening on ws://localhost:${port}`);
});
