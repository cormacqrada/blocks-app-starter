# Realtime Blocks Examples

This folder contains a minimal example of using the **BlocksRuntime** with a
WebSocket-based network adapter.

## Server

`runtime-ws-server.cjs` starts a Node.js HTTP+WebSocket server and a
BlocksRuntime instance. It:

- Creates an initial BlockTree from a markdown string using
  `markdownToBlockTree`.
- Broadcasts `BlockDelta[]` to all connected clients whenever
  `BlocksRuntime.applyDeltas` is called.
- Accepts incoming `BlockDelta[]` from clients and applies them to the runtime.

Run:

```bash
pnpm build
pnpm add -D ws
node examples/network/runtime-ws-server.cjs
```

## Client

`examples/collaborative-blocks-app` is a Vite-based client that:

- Connects to the WebSocket server.
- Receives an initial `snapshot` BlockTree and creates a client-side
  `BlocksRuntime`.
- Applies incoming `deltas` via `runtime.applyDeltas`.
- Renders the shared document using `<blocks-renderer>` observing
  `runtime.getTree()`.

From the monorepo root:

```bash
cd examples/collaborative-blocks-app
pnpm install
pnpm dev
```

Then open the printed URL (usually http://localhost:5173). You can extend this
example to send local edits as `BlockDelta[]` and observe them in multiple
browser sessions.
