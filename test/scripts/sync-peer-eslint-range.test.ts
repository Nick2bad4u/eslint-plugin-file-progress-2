import { describe, expect, it } from "vitest";

import { resolvePeerEslintRange } from "../../scripts/sync-peer-eslint-range.mjs";

describe(resolvePeerEslintRange, () => {
    it("preserves the supported floor for the current development major", () => {
        expect.assertions(1);

        expect(resolvePeerEslintRange("^9.0.0 || ^10.5.0", "^10.8.1")).toBe(
            "^9.0.0 || ^10.5.0"
        );
    });

    it("adds a range when development adopts a new ESLint major", () => {
        expect.assertions(1);

        expect(resolvePeerEslintRange("^9.0.0 || ^10.5.0", "^11.0.0")).toBe(
            "^9.0.0 || ^10.5.0 || ^11.0.0"
        );
    });

    it("uses the repository baseline when the existing range is missing", () => {
        expect.assertions(1);

        expect(resolvePeerEslintRange(undefined, "^10.8.1")).toBe(
            "^9.0.0 || ^10.8.1"
        );
    });

    it("does not append an unparsable development range", () => {
        expect.assertions(1);

        expect(resolvePeerEslintRange("^9.0.0", "latest")).toBe("^9.0.0");
    });
});
