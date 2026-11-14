# Installing Anne's Office

Every [release](../../../releases) has one bundle per platform. Each bundle installs the Anne's Office apps side by side; nothing is shared between them, and each app can be removed on its own afterwards.

## Windows 10 and 11

Download `AnnesOffice-<version>-windows-x64-setup.exe` (or `-arm64-` on Windows on ARM) and run it. Tick the apps you want. Each app is installed for the current user by its own installer, with no administrator prompt.

SmartScreen may say "Windows protected your PC" for the setup and once more for each app's installer: choose **More info ▸ Run anyway**. The warning appears because the installers are not signed with a paid code-signing certificate; the checksums in `SHA256SUMS.txt` let you verify the download.

To remove an app: **Settings ▸ Apps ▸ Installed apps**, find the app, **Uninstall**. Anne's Office itself installs nothing of its own.

## macOS 12 and later

Download `AnnesOffice-<version>-mac.pkg`, open it, and untick any app you do not want on the *Installation Type* screen. The apps go into *Applications*.

The package and the apps are not notarized. If macOS refuses to open the package, right-click it and choose **Open**, or allow it in **System Settings ▸ Privacy & Security**. The first launch of each app may ask the same way.

Anne's Post's macOS build is for Apple silicon only. On an Intel Mac the installer leaves it out; its portable (Java) edition is on the [Anne's Post releases page](https://github.com/socrtwo/annes-post/releases).

To remove an app, drag it from *Applications* to the Trash.

## Linux

**Debian, Ubuntu, Linux Mint, Raspberry Pi OS, ChromeOS (Linux development environment)**: download `AnnesOffice-<version>-linux-<arch>.sh` for your architecture (`x64`, `arm64` for 64-bit Raspberry Pi OS and ARM Chromebooks, `armv7l` for 32-bit Raspberry Pi OS) and run

```bash
sh AnnesOffice-<version>-linux-<arch>.sh
```

It installs the apps' `.deb` packages with `apt-get install`, asking for your password through `sudo`. Options: `--apps pen,grid,post,stage,loom` (choose some), `--list` (show the contents), `--extract DIR` (only unpack the packages). The apps appear in the *Office* category of the applications menu and register for their file types. Remove any of them with `sudo apt remove quillpen` (or `quillgrid`, `quillpost`, `quillstage`, `quillloom`).

**Other distributions**: download `AnnesOffice-<version>-linux-<arch>-AppImages.tar.gz`, unpack it, make the files executable if needed, and run them. [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) adds them to the menu.

## ChromeOS

Three ways: the Android bundle (if your Chromebook runs Android apps), the Linux installer above (Linux development environment), or the web bundle hosted anywhere, which Chrome installs as apps.

## Android 7 and later

Download `AnnesOffice-<version>-android.zip`, unzip it, and open each APK. Android asks once to allow installs from your file manager. The apps register for *Open with* and *Share to* on their document types. Anne's Loom has no Android package yet: open its web app (below) in Chrome and choose *Add to Home screen*.

## iOS and iPadOS 15 and later

Download `AnnesOffice-<version>-ios-unsigned.zip`. The `.ipa` files inside are unsigned; sign and install each one with your own Apple ID using a sideloading tool such as AltStore or Sideloadly. A free Apple ID allows three sideloaded apps at a time and re-signing every seven days. Anne's Post has no device build for iOS yet, and Anne's Loom has no iOS package yet: open its web app (below) in Safari and choose *Add to Home Screen*.

## Web

Download `AnnesOffice-<version>-web.zip` and serve the unpacked folder from any web server (the apps need `http://` or `https://`, not `file://`). `index.html` is a launcher page with a card per app. Each app works offline after its first visit and can be installed from the browser's menu. Anne's Post's web edition is a Java server: unzip its archive, run `bin/quillpost-web` (Java 17 or later) and open the address it prints.

The launcher links each app's folder, named after its repository: `annes-pen/`, `annes-grid/`, `annes-stage/`, `annes-loom/`.

## Releases before 0.3.0

Anne's Office 0.1.0 and 0.2.0 named their files `QuillOffice-…` and did not include Anne's Loom; the web bundle's app folders were `QuillPen/` and so on. The steps above are otherwise the same.
