# @blocks/renderer

Web Components runtime for Blocks documents.

- Consumes Markdown with an embedded `<!-- BLOCKS:... -->` header.
- Uses `@blocks/runtime` to deserialize and execute the BlockTree.
- Renders Markdown to HTML via `marked`.
- Optionally renders a debug JSON view of the executed BlockTree.

## Usage

Register the component in your web app:

```ts
import { registerBlocksRenderer } from "@blocks/renderer";

registerBlocksRenderer();
```

Then use it in HTML:

```html
<blocks-renderer debug="true">
<!-- BLOCKS:{"id":"doc","blocks":[],"collections":[]} -->

# Hello Blocks
</blocks-renderer>
```
