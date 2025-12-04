<!-- BLOCKS:{"id":"api-example-doc","blocks":[{"id":"api-example-block","type":"data","version":"1.0.0","properties":{"label":"API Example","method":"GET","url":"https://api.example.com/data"},"inputs":[],"outputs":[],"schema":"blocks.schema.json"}],"collections":[{"name":"api_responses","items":[],"relationships":{},"version":"1.0.0","schema":"collection.schema.json"}]} -->

# API Example Block

This document is **self-demonstrating** and **self-editable**:

1. A writer drags an **API Example** block into the page.
2. The block viewer updates the JSON manifest (the block tree above).
3. The system re-serializes the block tree into Markdown (this file).
4. Markdown becomes the persisted representation under Git.
5. A GitHub Action rebuilds the doc as a Blocks App.

The leading HTML comment (`<!-- BLOCKS:... -->`) contains the canonical
`BlockTree` JSON used by the runtime.
