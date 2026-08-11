import { describe, expect, it } from "vitest";

import {
    parseNpmViewManifestField,
    resolveNpmViewManifestField,
} from "../../scripts/resolve-npm-view-manifest-field.mjs";

describe(resolveNpmViewManifestField, () => {
    it("accepts an npm manifest object", () => {
        expect.assertions(1);

        expect(
            resolveNpmViewManifestField(
                { gitHead: "release-commit", version: "5.1.8" },
                "version"
            )
        ).toBe("5.1.8");
    });

    it("accepts the one-element array emitted for an exact version", () => {
        expect.assertions(1);

        expect(
            resolveNpmViewManifestField(
                [{ gitHead: "release-commit", version: "5.1.8" }],
                "gitHead"
            )
        ).toBe("release-commit");
    });

    it("rejects invalid input", () => {
        expect.assertions(1);

        expect(() => resolveNpmViewManifestField(null, "version")).toThrow(
            "The npm view manifest must contain a nonblank version field."
        );
    });

    it.each([
        [[], 0],
        [[{ version: "5.1.8" }, { version: "5.1.9" }], 2],
    ])("rejects output containing %s manifests", (output, count) => {
        expect.assertions(1);

        expect(() => resolveNpmViewManifestField(output, "version")).toThrow(
            `Expected exactly one npm view manifest, received ${count}.`
        );
    });

    it.each([
        {},
        { version: "" },
        { version: " ".repeat(3) },
        { version: 518 },
    ])("rejects a manifest without a nonblank string field", (manifest) => {
        expect.assertions(1);

        expect(() => resolveNpmViewManifestField(manifest, "version")).toThrow(
            "The npm view manifest must contain a nonblank version field."
        );
    });
});

describe(parseNpmViewManifestField, () => {
    it("parses serialized array output", () => {
        expect.assertions(1);

        expect(
            parseNpmViewManifestField(
                JSON.stringify([{ version: "5.1.8" }]),
                "version"
            )
        ).toBe("5.1.8");
    });

    it("rejects invalid JSON", () => {
        expect.assertions(1);

        expect(() => parseNpmViewManifestField("not JSON", "version")).toThrow(
            SyntaxError
        );
    });
});
