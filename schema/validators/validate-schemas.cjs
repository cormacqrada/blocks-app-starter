#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");

const ajv = new Ajv({ allErrors: true });

const schemaDir = path.join(__dirname, "..", "..");

const files = [
  "schema/blocks.schema.json",
  "schema/collection.schema.json",
  "schema/manifest.schema.json"
];

for (const file of files) {
  const full = path.join(schemaDir, file.replace(/^schema\//, "schema/"));
  const raw = fs.readFileSync(full, "utf8");
  const schema = JSON.parse(raw);
  try {
    ajv.compile(schema);
    console.log(`✔ Compiled ${file}`);
  } catch (err) {
    console.error(`✖ Failed to compile ${file}`);
    console.error(err.message || err);
    process.exitCode = 1;
  }
}
