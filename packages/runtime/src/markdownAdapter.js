export function markdownToBlockTree(id, markdown) {
    const lines = markdown.split(/\r?\n/);
    const blocks = [];
    let currentParagraph = [];
    let inCode = false;
    let codeLang = "";
    let codeLines = [];
    let counter = 0;
    const flushParagraph = () => {
        if (!currentParagraph.length)
            return;
        const text = currentParagraph.join("\n").trim();
        if (!text) {
            currentParagraph = [];
            return;
        }
        blocks.push({
            id: `p${++counter}`,
            type: "visual",
            version: "1.0.0",
            properties: {
                element: "paragraph",
                text
            },
            inputs: [],
            outputs: [],
            schema: "blocks.schema.json"
        });
        currentParagraph = [];
    };
    const flushCode = () => {
        if (!inCode)
            return;
        blocks.push({
            id: `code${++counter}`,
            type: "visual",
            version: "1.0.0",
            properties: {
                element: "code",
                language: codeLang,
                text: codeLines.join("\n")
            },
            inputs: [],
            outputs: [],
            schema: "blocks.schema.json"
        });
        inCode = false;
        codeLang = "";
        codeLines = [];
    };
    for (const rawLine of lines) {
        const line = rawLine;
        if (line.startsWith("```")) {
            if (!inCode) {
                flushParagraph();
                inCode = true;
                codeLang = line.slice(3).trim();
                codeLines = [];
            }
            else {
                flushCode();
            }
            continue;
        }
        if (inCode) {
            codeLines.push(line);
            continue;
        }
        const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
            flushParagraph();
            const level = headingMatch[1].length;
            const text = headingMatch[2].trim();
            blocks.push({
                id: `h${++counter}`,
                type: "visual",
                version: "1.0.0",
                properties: {
                    element: "heading",
                    level,
                    text
                },
                inputs: [],
                outputs: [],
                schema: "blocks.schema.json"
            });
            continue;
        }
        const bqMatch = line.match(/^>\s?(.*)$/);
        if (bqMatch) {
            flushParagraph();
            const text = bqMatch[1].trim();
            blocks.push({
                id: `quote${++counter}`,
                type: "visual",
                version: "1.0.0",
                properties: {
                    element: "blockquote",
                    text
                },
                inputs: [],
                outputs: [],
                schema: "blocks.schema.json"
            });
            continue;
        }
        if (!line.trim()) {
            flushParagraph();
            continue;
        }
        currentParagraph.push(line);
    }
    flushParagraph();
    flushCode();
    return {
        id,
        blocks,
        collections: []
    };
}
/**
 * Convenience adapter that treats the entire markdown document as a single
 * "replace root" delta.
 */
export function markdownToReplaceDelta(id, markdown) {
    const tree = markdownToBlockTree(id, markdown);
    return [
        {
            kind: "update",
            path: "root",
            block: tree
        }
    ];
}
