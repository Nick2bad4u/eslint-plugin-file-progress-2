# Release workflow

`eslint-plugin-file-progress-2` no longer uses Changesets.

Releases are published manually from the GitHub Actions **Release** workflow in `.github/workflows/release.yml`.

## Local preflight

Before triggering a release, validate the branch locally:

```bash
npm run release:check
```

That command runs the repository's complete release gate, including:

- package builds and generated API documentation
- all configured linters, type checks, and tests
- documentation synchronization, demo checks, and link validation
- a final npm pack dry run

## Triggering a release

Open **Actions → Release → Run workflow** and provide either:

- a `release_type` of `patch`, `minor`, or `major`, or
- an explicit `version` in `x.y.z` format

Select the verified source branch in the workflow's **Use workflow from**
selector and provide the same branch in the `ref` input. The dispatch event and
the requested release branch must resolve to the same commit.

The workflow will:

1. validate the requested branch and version input
2. check out the immutable dispatch SHA and require the source branch to still
   point to it
3. verify the package with `npm run release:check`
4. bump `package.json` and `package-lock.json`
5. commit and tag `chore: release vX.Y.Z`
6. atomically push the branch commit and annotated tag
7. prepare matching `.tgz` and `.zip` release assets
8. publish the already-verified repository directory to npm with provenance,
   suppressing lifecycle scripts so a transient second validation cannot strand
   the atomically pushed release commit and tag
9. require npm `gitHead` to match the release commit and the registry tarball
   to be byte-identical to the prepared `.tgz`
10. create the matching GitHub release

## Release notes

Release notes are generated from git history with:

```bash
npm run changelog:release-notes -- --output temp/release-notes.md --tag vX.Y.Z
```

The same script is used by the workflow before the GitHub release is created.

## Operational notes

- The workflow prevents publishing a version that already exists on npm.
- The workflow checks out the dispatch SHA rather than a mutable branch tip. If
  the source branch moves, start a new dispatch from the newly verified commit;
  do not rerun the stale workflow event.
- A rerun is safe only when the source branch still points to the original
  dispatch SHA and no release mutation occurred. The immutable-source check
  enforces this before installation or publication.
- The release commit is created by `github-actions[bot]`.
- npm provenance identifies the verified dispatch source SHA, while npm
  `gitHead` identifies the workflow-created release commit.
- The GitHub `.tgz` is the same tarball that registry verification downloads
  with bounded retries after publication; a byte mismatch blocks GitHub Release
  creation.
- The plugin metadata version is read from `package.json`, so the published package and exported metadata stay in sync.
