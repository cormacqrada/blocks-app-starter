#!/usr/bin/env node
import { Command } from "commander";
import { newBackendFastapi } from "./commands/new-backend-fastapi";

const program = new Command();

program
  .name("blocks-app")
  .description(
    "Blocks CLI for the Blocks ecosystem: Markdown as Data -> Executable Blocks -> Live Runtime -> Two-Way Serialization"
  );

program
  .command("new")
  .description("Create a new Blocks-aware application from a template")
  .argument("category", "application category, e.g. backend")
  .argument("template", "template name, e.g. fastapi")
  .argument("name", "application name")
  .action(async (category: string, template: string, name: string) => {
    if (category === "backend" && template === "fastapi") {
      await newBackendFastapi(name);
      return;
    }

    console.error(`Unknown template: ${category} ${template}`);
    process.exitCode = 1;
  });

program.parseAsync().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
