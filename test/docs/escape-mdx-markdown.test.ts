import { expect, test } from "vitest";

// eslint-disable-next-line import-x/no-relative-packages -- Test intentionally exercises the local docs TypeDoc plugin core directly from the workspace.
import {
    escapeMdxSyntaxInSignatureLine,
    escapeMdxSyntaxInTypeDocMarkdown,
} from "../../docs/docusaurus/typedoc-plugins/escapeMdxMarkdownCore.mjs";

test("escapeMdxSyntaxInSignatureLine escapes mdx-significant type syntax", () => {
    expect(
        escapeMdxSyntaxInSignatureLine(
            "> **meta**: { } & [`Readonly`](https://example.com)<`T`>"
        )
    ).toBe(
        "> **meta**: &#123; &#125; & [`Readonly`](https://example.com)&lt;`T`>"
    );
});

test("escapeMdxSyntaxInTypeDocMarkdown leaves code fences untouched", () => {
    const markdown = [
        "# Example",
        "",
        "> **meta**: { `name`: `string`; }",
        "",
        "```ts",
        "type Example = { value: string }",
        "```",
    ].join("\n");

    expect(escapeMdxSyntaxInTypeDocMarkdown(markdown)).toBe(
        [
            "# Example",
            "",
            "> **meta**: &#123; `name`: `string`; &#125;",
            "",
            "```ts",
            "type Example = { value: string }",
            "```",
        ].join("\n")
    );
});
