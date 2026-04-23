import {
    escapeMdxSyntaxInSignatureLine,
    escapeMdxSyntaxInTypeDocMarkdown,
} from "@eslint-plugin-file-progress-2/docs/typedoc-plugins/escapeMdxMarkdownCore.mjs";
import { describe, expect, it } from "vitest";

describe("escapeMdxMarkdown TypeDoc helpers", () => {
    it("escapeMdxSyntaxInSignatureLine escapes mdx-significant type syntax", () => {
        expect.hasAssertions();

        expect(
            escapeMdxSyntaxInSignatureLine(
                "> **meta**: { } & [`Readonly`](https://example.com)<`T`>"
            )
        ).toBe(
            "> **meta**: &#123; &#125; & [`Readonly`](https://example.com)&lt;`T`>"
        );
    });

    it("escapeMdxSyntaxInTypeDocMarkdown leaves code fences untouched", () => {
        expect.hasAssertions();

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
});
