# Building Anne's Office bundles

Anne's Office compiles nothing. It downloads each app's released files and wraps them. You need Node.js 22 and, per bundle, the packaging tool of that platform.

```bash
npm test                                # unit tests for the release matcher
npm run check                           # syntax of the scripts and installers
node scripts/resolve.mjs manifest       # manifest.json: the newest release of each app and its files
node scripts/resolve.mjs manifest --stable   # non-prerelease releases only (what a release uses)
bash tests/bundle-smoke.sh              # Linux installer and web/Android/iOS archives from a stand-in payload (needs dpkg-deb, zip)
```

Set `GITHUB_TOKEN` to raise the GitHub API rate limit (the workflows use the Actions token).

## Windows setup (any OS with NSIS 3)

```bash
node scripts/resolve.mjs download win-x64 --out payload      # or win-arm64
installers/windows/build.sh x64 payload out                  # Debian/Ubuntu: sudo apt install nsis
```

`installers/windows/AnnesOffice.nsi` is the installer script: a components page with one section per app, each running that app's own installer silently (`/S` for the NSIS installers of Anne's Pen, Anne's Grid and Anne's Stage; `msiexec /qn` for Anne's Post's MSI). An app that fails to install is reported at the end instead of stopping the others.

## macOS package (macOS only)

```bash
node scripts/resolve.mjs download mac --out payload
installers/macos/build-pkg.sh payload out
```

Each app bundle is extracted from its `.zip` or `.dmg`, wrapped with `pkgbuild`, and combined with `productbuild` into one package with a choice per app. The package is unsigned; signing and notarizing need an Apple Developer account and are not part of this repository.

## Linux installer and AppImages

```bash
node scripts/resolve.mjs download linux-deb-x64 linux-appimage-x64 --out payload   # or arm64, armv7l
installers/linux/build.sh x64 payload out
sh out/AnnesOffice-*-linux-x64.sh --list
```

The `.sh` is `installers/linux/install-header.sh` with a gzip tar of the `.deb` files appended.

## Web, Android and iOS archives

```bash
node scripts/resolve.mjs download web android ios --out payload
node scripts/bundle-portable.mjs web payload out
node scripts/bundle-portable.mjs android payload out
node scripts/bundle-portable.mjs ios payload out
```

## Adding or removing an app

Edit [suite.json](../suite.json): set `include`, and give the regular expressions that match the app's release file names (`{v}` is the version, `{tag}` the tag). Accept both prefixes, `^(?:Quill|Annes)Name-{v}-…`. Run `npm test` (the tests check the patterns against sample file lists) and `node scripts/resolve.mjs manifest --stable` to see what a real release matches.

A new app also needs a line in three installers, each keyed by the app's name in `suite.json`:

- `installers/windows/build.sh` maps it to an NSIS define prefix (`QuillLoom) p=LOOM`), and `installers/windows/AnnesOffice.nsi` gets an `!ifdef LOOM_FILE` section and description (`RunNsis` for an NSIS installer, `RunMsi` for an MSI). The CI compile step passes a stand-in file for each define.
- `installers/linux/install-header.sh` gets its short name in the default `APPS` list and a `case` line for its `.deb` file name.
- `tests/bundle-smoke.sh` gets a row in `APPS`.

The macOS package, the web, Android and iOS archives and the release notes pick the app up from the manifest.

## Releasing

Push a tag `v<version>` (the version in `package.json`), run **Release** from the Actions tab, or push a commit whose message contains `[release]`. The release notes name the version of each app that went in.

Every route bundles the apps' newest **stable** releases. To try the apps' `-build.N` prereleases, run **Release** from the Actions tab with *stable only* unticked; that suite release is then always marked as a prerelease, whatever *prerelease* says.

Before anything is published, the `install-windows`, `install-macos` and `install-linux` jobs install the real bundles on clean runners and fail the release if an app is missing afterwards. A failed install test leaves no release behind; the bundles are still attached to the run as artifacts for inspection.
