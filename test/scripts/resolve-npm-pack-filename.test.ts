import { describe, expect, it } from "vitest";

import {
    parseNpmPackFilename,
    resolveNpmPackFilename,
} from "../../scripts/resolve-npm-pack-filename.mjs";

describe(resolveNpmPackFilename, () => {
    it("accepts the npm array output shape", () => {
        expect.assertions(1);

        expect(
            resolveNpmPackFilename([
                { filename: "eslint-plugin-file-progress-2-5.1.7.tgz" },
            ])
        ).toBe("eslint-plugin-file-progress-2-5.1.7.tgz");
    });

    it("accepts the npm 12 package-name-keyed output shape", () => {
        expect.assertions(1);

        expect(
            resolveNpmPackFilename({
                "eslint-plugin-file-progress-2": {
                    filename: "eslint-plugin-file-progress-2-5.1.7.tgz",
                },
            })
        ).toBe("eslint-plugin-file-progress-2-5.1.7.tgz");
    });

    it("rejects invalid input", () => {
        expect.assertions(1);

        expect(() => resolveNpmPackFilename(null)).toThrow(
            "Expected exactly one npm pack record, received 0."
        );
    });

    it.each([
        [[], 0],
        [[{ filename: "first.tgz" }, { filename: "second.tgz" }], 2],
    ])("rejects output containing %s package records", (output, count) => {
        expect.assertions(1);

        expect(() => resolveNpmPackFilename(output)).toThrow(
            `Expected exactly one npm pack record, received ${count}.`
        );
    });

    it.each([
        {},
        { filename: "" },
        { filename: " ".repeat(3) },
        { filename: 42 },
    ])("rejects a package record without a nonblank filename", (record) => {
        expect.assertions(1);

        expect(() => resolveNpmPackFilename([record])).toThrow(
            "The npm pack record must contain a nonblank filename."
        );
    });
});

describe(parseNpmPackFilename, () => {
    it("parses serialized npm 12 output", () => {
        expect.assertions(1);

        expect(
            parseNpmPackFilename(
                JSON.stringify({
                    "eslint-plugin-file-progress-2": {
                        filename: "eslint-plugin-file-progress-2-5.1.7.tgz",
                    },
                })
            )
        ).toBe("eslint-plugin-file-progress-2-5.1.7.tgz");
    });

    it("rejects invalid JSON", () => {
        expect.assertions(1);

        expect(() => parseNpmPackFilename("not JSON")).toThrow(SyntaxError);
    });
});
