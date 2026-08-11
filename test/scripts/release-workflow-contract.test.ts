import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const releaseWorkflowUrl = new URL(
    "../../.github/workflows/release.yml",
    import.meta.url
);

const readReleaseWorkflow = async (): Promise<string> =>
    readFile(releaseWorkflowUrl, "utf8");

describe("release workflow integrity contract", () => {
    it("checks out and verifies the immutable dispatch source", async () => {
        expect.assertions(5);

        const workflow = await readReleaseWorkflow();

        // eslint-disable-next-line no-template-curly-in-string -- The literal GitHub expression is the workflow contract under test.
        expect(workflow).toContain('ref: "${{ github.sha }}"');
        expect(workflow).toContain('- name: "Verify immutable release source"');
        // eslint-disable-next-line no-template-curly-in-string -- The literal GitHub expression is the workflow contract under test.
        expect(workflow).toContain('DISPATCH_SHA: "${{ github.sha }}"');
        expect(workflow).toContain(
            'if [ "$remote_sha" != "$DISPATCH_SHA" ]; then'
        );
        expect(workflow).not.toContain(
            // eslint-disable-next-line no-template-curly-in-string -- The literal GitHub expression is the forbidden mutable checkout contract.
            'ref: "${{ steps.target_ref.outputs.ref }}"'
        );
    });

    it("publishes atomically from the verified repository directory", async () => {
        expect.assertions(3);

        const workflow = await readReleaseWorkflow();

        expect(workflow).toContain("git push --atomic origin");
        expect(workflow).toContain(
            'run: "npm publish . --access public --provenance --ignore-scripts"'
        );
        expect(workflow).not.toContain("npm publish temp/release-assets/");
    });

    it("requires registry gitHead and tarball parity", async () => {
        expect.assertions(9);

        const workflow = await readReleaseWorkflow();

        expect(workflow).toContain('- name: "Verify published npm artifact"');
        expect(workflow).toContain(
            'if [ "$registry_git_head" != "$expected_git_head" ]; then'
        );
        expect(workflow).toContain(
            'if ! cmp --silent "$expected_archive" "$published_archive"; then'
        );
        expect(workflow).toContain("for attempt in $(seq 1 12); do");
        expect(workflow).toContain(
            "node scripts/resolve-npm-view-manifest-field.mjs version"
        );
        expect(workflow).toContain(
            "node scripts/resolve-npm-view-manifest-field.mjs gitHead"
        );
        expect(workflow).toContain(
            'if npm pack "$package_spec" --json --pack-destination "$published_directory" > "$published_pack_output"; then'
        );
        expect(workflow).toContain(
            'if [ "$package_downloaded" != "true" ]; then'
        );
        expect(workflow).toContain(
            // eslint-disable-next-line no-template-curly-in-string -- The literal GitHub expression is the workflow contract under test.
            'echo "- npm gitHead: \\`${{ steps.published.outputs.git_head }}\\`"'
        );
    });
});
