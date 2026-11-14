# Anne's Office

*The Anne's Office suite in one download: [Anne's Pen](https://github.com/socrtwo/annes-pen) (documents), [Anne's Grid](https://github.com/socrtwo/annes-grid) (spreadsheets), [Anne's Post](https://github.com/socrtwo/annes-post) (email), [Anne's Stage](https://github.com/socrtwo/annes-stage) (presentations) and [Anne's Loom](https://github.com/socrtwo/annes-loom) (web sites).*

The five apps are developed and released in their own repositories. Anne's Office adds nothing to them; it is the installer that puts them on a computer together. Each **Anne's Office release** takes the newest stable release of every app and packages them per platform:

| Platform | What you download | What it does |
|---|---|---|
| **Windows 10/11** (x64, ARM) | `AnnesOffice-<version>-windows-<arch>-setup.exe` | One setup with a tick box per app. It runs each app's own installer silently, for the current user. Apps appear separately in the Start menu and in *Apps & features*, so any one can be removed on its own. |
| **macOS 12+** | `AnnesOffice-<version>-mac.pkg` | An installer package with one choice per app; installs into *Applications*. |
| **Debian, Ubuntu, Raspberry Pi OS, ChromeOS (Linux)** | `AnnesOffice-<version>-linux-<arch>.sh` | A self-extracting installer: `sh AnnesOffice-….sh` installs the apps' `.deb` packages with `apt`. `--apps pen,grid` installs some (`pen`, `grid`, `post`, `stage`, `loom`); `--list` shows what is inside; `--extract DIR` only unpacks the packages. x64, arm64 and armv7l. |
| **Other Linux** | `AnnesOffice-<version>-linux-<arch>-AppImages.tar.gz` | The apps' AppImages. |
| **Android 7+** | `AnnesOffice-<version>-android.zip` | The apps' APKs with a README. Android has no multi-app installer, so each APK is opened in turn. |
| **iOS / iPadOS 15+** | `AnnesOffice-<version>-ios-unsigned.zip` | The unsigned `.ipa` files, to sign with your own Apple ID (AltStore, Sideloadly). |
| **Web** | `AnnesOffice-<version>-web.zip` | Every app's web build in its own folder plus a launcher page, for any web server or GitHub Pages. The apps work offline after the first visit and can be installed from the browser. |

The release notes list the exact version of each app in the bundle, and `SHA256SUMS.txt` the checksum of every file. [docs/INSTALL.md](docs/INSTALL.md) has the steps for each platform.

Up to 0.2.0 the bundle files were named `QuillOffice-…`; from 0.3.0 they are `AnnesOffice-…`. The apps inside keep their own file and package names (`QuillPen-….exe`, the `quillpen` package); [suite.json](suite.json) accepts both the `Quill…` and the `Annes…` prefix, so an app can rename its release files without breaking the bundle.

## How a release is built

`.github/workflows/release.yml` runs on a tag `v<version>`, a manual run from the Actions tab, or a commit whose message contains `[release]` (the last two publish a prerelease named `v<version>-build.<run>`):

1. **Resolve** — `scripts/resolve.mjs` asks GitHub for the newest release of each app in [suite.json](suite.json) (stable releases only; a manual run with *stable only* unticked takes the apps' prereleases instead, and the suite release is then always a prerelease) and matches its files against the patterns there. The result is `manifest.json`, which is also attached to the release.
2. **Download and verify** — each bundle job downloads only the files it needs and checks them against the app's `SHA256SUMS.txt` where the app publishes one.
3. **Bundle** — `installers/windows` (NSIS, built on Linux with `makensis`), `installers/macos` (`pkgbuild` and `productbuild`), `installers/linux` (a shell header with a tar payload), and `scripts/bundle-portable.mjs` for the web, Android and iOS archives.
4. **Install test** — the Windows x64 setup is run silently on a clean Windows runner (every app must appear in *Apps & features*), the macOS package is installed on a macOS runner (every app must be in *Applications*), and the Linux `.sh` installs its packages on Ubuntu (every package must be installed). The web, Android and iOS archives are checked for each app's files.
5. **Publish** — checksums, release notes with the component versions, one GitHub release. The release is published only when every platform bundle built and every install test passed, so a release never ships a partial or broken suite.

An app whose release has no file for a platform is left out of that platform's bundle and named in the release notes (Anne's Loom has no Android or iOS build yet, so those bundles point to its web app).

Nothing is recompiled here; the apps' own CI builds and tests them. See [docs/BUILD.md](docs/BUILD.md) to build a bundle locally.

The repository's description, homepage and topics live in [AnnesOffice.meta.json](AnnesOffice.meta.json); `bash scripts/set-repo-metadata.sh` applies them with the GitHub CLI (`--dry-run` prints the command).

## Known limits

- The desktop apps are not code-signed, so Windows SmartScreen and macOS Gatekeeper ask once per app (the installers say so).
- Anne's Post's desktop builds exist for Windows x64, macOS on Apple silicon, and Linux x64/arm64 only. The Windows on ARM setup leaves it out (its x64 build runs through emulation when installed separately); the macOS package skips it on Intel Macs; its iOS release is a simulator build and is not bundled. Its web edition is a Java server rather than a static site and is included as its own zip with instructions.
- On a Linux system without a desktop (a server, Raspberry Pi OS Lite), Anne's Post's `.deb` fails to configure: its install script needs a system menu directory (`/etc/xdg/menus`). `sudo mkdir -p /etc/xdg/menus` before installing works around it, or leave it out with `--apps pen,grid,stage,loom`.
- Anne's Loom has no Android or iOS package yet; on phones and tablets use its web app from the web bundle.
- The install tests cover Windows x64, macOS on Apple silicon and Linux x64. The Windows on ARM setup, Intel Macs and the Linux arm64 and armv7l installers are built the same way but not installed in CI.
- A bundle is only as current as the apps' releases at the moment it was built; it does not update itself. Each app keeps its own update path.

## The Anne's Office suite

| App | What it is | Repository |
|---|---|---|
| **Anne's Pen** | Word processor | https://github.com/socrtwo/annes-pen |
| **Anne's Grid** | Spreadsheet | https://github.com/socrtwo/annes-grid |
| **Anne's Post** | Email, calendar and contacts | https://github.com/socrtwo/annes-post |
| **Anne's Stage** | Presentations | https://github.com/socrtwo/annes-stage |
| **Anne's Loom** | Web site editor | https://github.com/socrtwo/annes-loom |
| **Anne's Office** | The suite's combined installers (this project) | https://github.com/socrtwo/annes-office |

## License

[MIT](LICENSE). Copyright (c) 2026 Paul D Pruitt. The bundled apps are each MIT-licensed in their own repositories, with their own third-party notices.

## Legal

Anne's Office and the Anne's Office apps are independent, clean-room projects. They are not affiliated with, endorsed by, or sponsored by Microsoft, Apple, Google, The Document Foundation, or any other vendor. Product names appear only to describe file-format compatibility (nominative use). See [docs/LEGAL.md](docs/LEGAL.md).
