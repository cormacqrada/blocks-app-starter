#!/usr/bin/env node
// This script now uses the shared markdown adapter from @blocks/runtime.
const fs = require("fs");
const path = require("path");
const { markdownToBlockTree } = require("../packages/runtime/dist/markdownAdapter.js");

if (process.argv.length < 3) {
  console.error("Usage: node scripts/watch-markdown.cjs <file.md>");
  process.exit(1);
}

const targetPath = path.resolve(process.cwd(), process.argv[2]);

if (!fs.existsSync(targetPath)) {
  console.error(`File not found: ${targetPath}`);
  process.exit(1);
}

console.log(`Watching markdown file: ${targetPath}`);

let lastContent = fs.readFileSync(targetPath, "utf8");

function logTreeFromMarkdown(markdown) {
  const tree = markdownToBlockTree(path.basename(targetPath), markdown);
  console.log("\n--- BlockTree updated ---");
  console.dir(tree, { depth: null, colors: true });
}

logTreeFromMarkdown(lastContent);

fs.watch(targetPath, { persistent: true }, (eventType) => {
  if (eventType !== "change") return;
  try {
    const current = fs.readFileSync(targetPath, "utf8");
    if (current === lastContent) return;
    lastContent = current;
    logTreeFromMarkdown(current);
  } catch (err) {
    console.error("Error reading file:", err);
  }
});
