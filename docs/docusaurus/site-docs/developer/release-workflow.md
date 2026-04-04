# Release workflow

`eslint-plugin-file-progress-2` no longer uses Changesets.

Releases are published manually from the GitHub Actions **Release** workflow in `.github/workflows/release.yml`.

## Local preflight

Before triggering a release, validate the branch locally:

```bash
npm run release:check
```

That command runs:

- `npm run check`
- `npm run publint`

## Triggering a release

Open **Actions → Release → Run workflow** and provide either:

- a `release_type` of `patch`, `minor`, or `major`, or
- an explicit `version` in `x.y.z` format

The workflow will:

1. validate the requested version input
2. verify the package with `npm run release:check`
3. bump `package.json` and `package-lock.json`
4. commit and tag `chore: release vX.Y.Z`
5. push the branch commit and tag
6. publish to npm with provenance
7. create the matching GitHub release

## Release notes

Release notes are generated from git history with:

```bash
npm run changelog:release-notes -- --output temp/release-notes.md --tag vX.Y.Z
```

The same script is used by the workflow before the GitHub release is created.

## Operational notes

- The workflow prevents publishing a version that already exists on npm.
- The release commit is created by `github-actions[bot]`.
- The plugin metadata version is read from `package.json`, so the published package and exported metadata stay in sync.
