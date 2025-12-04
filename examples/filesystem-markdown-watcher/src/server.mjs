#!/usr/bin/env node
// Server that watches a markdown file and serves a web UI that renders BlockTree updates

import http from "http";
import { WebSocketServer } from "ws";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { markdownToBlockTree } from "../../../packages/runtime/src/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5174;
const MARKDOWN_FILE = process.env.MARKDOWN_FILE || path.join(__dirname, "../example.md");

// Create example markdown file if it doesn't exist
if (!fs.existsSync(MARKDOWN_FILE)) {
  const exampleContent = `# Example Document

This markdown file is being watched by the filesystem watcher.

Edit this file in your external editor and see the changes appear in real-time!

## Features

- **Real-time updates** - Changes appear instantly
- **BlockTree generation** - Markdown is converted to BlockTree
- **Live rendering** - BlockTree is rendered in the browser

\`\`\`ts
// Code blocks work too!
const example = "Hello, Blocks!";
\`\`\`

> Blockquotes are also supported

### Try it!

Edit this file and save it. The changes will appear in the browser automatically.
`;
  fs.writeFileSync(MARKDOWN_FILE, exampleContent, "utf8");
  console.log(`Created example markdown file: ${MARKDOWN_FILE}`);
}

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Filesystem Markdown Watcher</title>
    <style>
      body {
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        background: #1a1a1a;
        color: #e5e7eb;
      }
      h1 {
        color: #6366f1;
        margin-bottom: 1rem;
      }
      .status {
        padding: 0.5rem 1rem;
        background: #374151;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        font-size: 0.875rem;
      }
      .status.connected {
        background: #065f46;
        color: #d1fae5;
      }
      .status.disconnected {
        background: #7f1d1d;
        color: #fecaca;
      }
      .file-info {
        padding: 0.5rem 1rem;
        background: #374151;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        font-size: 0.875rem;
        font-family: monospace;
      }
      blocks-renderer {
        display: block;
        padding: 1rem;
        background: #111827;
        border-radius: 0.5rem;
        min-height: 200px;
      }
    </style>
  </head>
  <body>
    <h1>Filesystem Markdown Watcher</h1>
    <div id="status" class="status disconnected">Disconnected</div>
    <div class="file-info">Watching: <strong>${MARKDOWN_FILE}</strong></div>
    <div>
      <h2>Live Preview</h2>
      <p>Edit the markdown file in your external editor and see changes appear here in real-time.</p>
      <blocks-renderer id="preview" debug="false"></blocks-renderer>
    </div>
    <script type="module">
      import { registerBlocksRenderer, BlocksRendererElement } from "../../../packages/renderer/src";
      import { BlocksRuntime } from "../../../packages/runtime/src";

      registerBlocksRenderer();

      const statusEl = document.getElementById("status");
      const preview = document.getElementById("preview");
      let runtime = null;
      let ws = null;

      function connect() {
        ws = new WebSocket("ws://localhost:${PORT}");

        ws.onopen = () => {
          statusEl.textContent = "Connected - Watching for changes";
          statusEl.className = "status connected";
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === "tree") {
              const tree = msg.tree;
              if (!runtime) {
                runtime = new BlocksRuntime(tree);
                runtime.registerAdapter({
                  id: "renderer",
                  onDeltas(_deltas, rt) {
                    preview.setTree(rt.getTree());
                  }
                });
              } else {
                runtime = new BlocksRuntime(tree);
                runtime.registerAdapter({
                  id: "renderer",
                  onDeltas(_deltas, rt) {
                    preview.setTree(rt.getTree());
                  }
                });
              }
              preview.setTree(runtime.getTree());
            }
          } catch (err) {
            console.error("Error handling message", err);
          }
        };

        ws.onerror = (err) => {
          console.error("WebSocket error", err);
          statusEl.textContent = "Connection error";
          statusEl.className = "status disconnected";
        };

        ws.onclose = () => {
          statusEl.textContent = "Disconnected - Reconnecting...";
          statusEl.className = "status disconnected";
          setTimeout(connect, 1000);
        };
      }

      connect();
    </script>
  </body>
</html>
    `);
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

const wss = new WebSocketServer({ server });

function broadcastTree(tree) {
  const message = JSON.stringify({ type: "tree", tree });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}

function updateTree() {
  try {
    const markdown = fs.readFileSync(MARKDOWN_FILE, "utf8");
    const tree = markdownToBlockTree(path.basename(MARKDOWN_FILE), markdown);
    console.log(`[${new Date().toISOString()}] File changed, broadcasting BlockTree update`);
    broadcastTree(tree);
  } catch (err) {
    console.error("Error reading/processing markdown file:", err);
  }
}

// Initial tree
updateTree();

// Watch for file changes
fs.watchFile(MARKDOWN_FILE, { interval: 500 }, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    updateTree();
  }
});

wss.on("connection", (ws) => {
  console.log("Client connected");
  // Send initial tree
  try {
    const markdown = fs.readFileSync(MARKDOWN_FILE, "utf8");
    const tree = markdownToBlockTree(path.basename(MARKDOWN_FILE), markdown);
    ws.send(JSON.stringify({ type: "tree", tree }));
  } catch (err) {
    console.error("Error sending initial tree:", err);
  }

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Filesystem Markdown Watcher`);
  console.log(`   Watching: ${MARKDOWN_FILE}`);
  console.log(`   Server: http://localhost:${PORT}`);
  console.log(`   WebSocket: ws://localhost:${PORT}\n`);
  console.log(`   Edit the markdown file in your external editor and see changes in real-time!\n`);
});

