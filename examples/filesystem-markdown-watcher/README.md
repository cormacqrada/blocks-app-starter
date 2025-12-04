# Filesystem Markdown Watcher

This example demonstrates **watching a markdown file on the filesystem** and automatically generating and rendering the BlockTree in a web browser as the file is edited.

## How It Works

1. **Author edits Markdown file** in an external editor (filesystem)
2. **Server watches the file** using `fs.watchFile`
3. **Markdown is converted to BlockTree** using `markdownToBlockTree`
4. **BlockTree updates are broadcast** to connected clients via WebSocket
5. **Browser renders the BlockTree** using `<blocks-renderer>`

## Run Locally

From the monorepo root:

```bash
pnpm install
```

Then, from this directory:

```bash
cd examples/filesystem-markdown-watcher
pnpm install
pnpm dev
```

The server will:
- Create an `example.md` file if it doesn't exist
- Start a web server on http://localhost:5174
- Watch the markdown file for changes

Open http://localhost:5174 in your browser, then edit `example.md` in your external editor. Changes will appear in the browser in real-time!

## Custom Markdown File

To watch a different markdown file, set the `MARKDOWN_FILE` environment variable:

```bash
MARKDOWN_FILE=/path/to/your/file.md pnpm dev
```

## Architecture

```
External Editor → Markdown File (filesystem)
                      ↓
              fs.watchFile (Node.js)
                      ↓
          markdownToBlockTree()
                      ↓
              WebSocket Broadcast
                      ↓
         Browser (<blocks-renderer>)
```

This demonstrates the **filesystem → BlockTree → Web Components** flow, enabling live preview of markdown documents edited in external editors like VS Code, Vim, or any text editor.

