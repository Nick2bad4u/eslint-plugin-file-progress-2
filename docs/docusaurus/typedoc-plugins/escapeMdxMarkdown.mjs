// @ts-check

import { PageEvent } from "typedoc";

import { escapeMdxSyntaxInTypeDocMarkdown } from "./escapeMdxMarkdownCore.mjs";

/**
 * Renderer hook: runs after a page has been rendered.
 *
 * @param {import("typedoc").PageEvent} page
 */
function onPageEnd(page) {
    if (typeof page.contents !== "string") {
        return;
    }

    if (!page.url.endsWith(".md") && !page.url.endsWith(".mdx")) {
        return;
    }

    page.contents = escapeMdxSyntaxInTypeDocMarkdown(page.contents);
}

/**
 * TypeDoc plugin entrypoint.
 *
 * @param {import("typedoc").Application} app
 */
export function load(app) {
    app.renderer.on(PageEvent.END, onPageEnd);
}
