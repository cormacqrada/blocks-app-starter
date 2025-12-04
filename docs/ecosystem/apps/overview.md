# Docs App
The Docs App reimagines documentation as a fully composable, executable application . Instead of static Markdown pages, every document becomes a live environment powered by the same Blocks Runtime that drives your other apps


**Markdown as Data, Rendered Through a Live Runtime**

  Documentation begins as plain Markdown, but is rendered through a runtime capable of **live logic** , **interactive UI** , and **composable block structures** . The Markdown source becomes the schema that defines a document’s block structure.

**Documentation Itself Becomes an App**

  The Docs App treats every document as a **first-class application** :


  * Each section, example, or snippet is a **live block instance** running in the page.
  * Blocks are executable, so **the doc is the demo** .
  * Docs, apps, and block manifests all share the **same schema** —no separate docs system.

**One Manifest for Docs and Apps**

  The platform uses a single Blocks manifest for everything:

  * Docs and apps use the same manifest—no switching or duplication.
  * Docs can **edit themselves** , modify their own block tree, and regenerate Markdown.
  * Because docs share the same runtime, they can **trigger actions** , interact with data sources, and run logic.

 **Git-backed, Markdown-first, Extensible, Vendor-neutral**

  * Markdown remains the source of truth, stored in the repo.
  * A GitHub Action (from the Blocks Starter repo pattern) parses `docs/*.md` and converts them into a block manifest, emitting `json/dist/blocks`.
  * The result is deployed as a **docs-as-app** experience.
  * Extensibility comes through **web components** —an open platform, portable via JSON, not tied to a specific vendor.

**Two-Way Serialization: Markdown ↔ Blocks**

  Every Markdown element becomes a block node when parsed.

  And the reverse is true:

  Modifying blocks in the Docs App re-serializes them back into Markdown.

  This two-way sync turns documentation into a **low-code authoring environment** :

  * Writers can edit documentation visually, inline.
  * Developers can work in Markdown and version control.
  * The system automatically keeps both representations in sync.

 **Docs App as CMS + IDE**

  Because content, UI, and code all come from one manifest:

  * The Docs App acts as both **CMS** (editable live content) and **IDE** (block configuration, logic, and structure).
  * Blocks can be dragged in, configured, or rearranged directly in the live doc.
  * Auto-saving can target local storage or a Git-backed API.

 **Example Workflow**

  1. A writer drags an “API Example” block into the page.
  2. The block viewer updates the underlying JSON manifest.
  3. The system re-serializes the block tree into Markdown.
  4. The Markdown becomes the persisted representation of the doc.
  5. On the next deployment, the GitHub Action rebuilds the doc as a Blocks App.

  Each page is simply a **collection of block instances** —a living surface.

 **Build, Explore, Edit — Directly Inside the Docs**

  Users can:

  * Edit text inline
  * Configure block properties
  * Add new blocks
  * Trigger actions and run live examples
  * Explore how the system works by *using* the system inside the docs themselves

  The result: documentation becomes a **self-demonstrating** , **self-editable** , **self-executing** environment


# Learning App

  * Turn anything you care about into something you can master your way
  * A platform that lets you turn any content into an adaptive interactive learning experience blending the openendness of Quizlet with the personalization and engagement mechanichs of Duolingo


# Financial App

The **Financial App** is a Blocks-native application designed to unify money-related tasks—budgeting, forecasting, planning, modeling, and visualizing—inside a **live, composable interface** powered by the block runtime.

Instead of being a static dashboard or a CRUD-heavy finance tool, the Financial App treats **financial logic as dynamic blocks** , and **every chart, transaction feed, goal, or model is itself executable and composable** .

It becomes not just a “tool,” but a **live financial workspace** .


The Financial App makes **finance an interactive environment** , not a static report.

* Every financial feature is a **block** (UI block, data block, model block).
* Blocks can subscribe to, transform, or model incoming data.
* Finance logic becomes **modular, combinable, and shareable** .
* Users can build dashboards, models, or workflows by assembling blocks—no code needed, but code possible.