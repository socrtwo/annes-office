#!/usr/bin/env bash
# Builds the Linux installer, the AppImages archive and the web, Android and iOS archives from a stand-in
# payload (tiny real .deb packages and placeholder files for the five apps), then checks what they contain.
# Needs dpkg-deb, zip and unzip. Runs in CI and locally:  bash tests/bundle-smoke.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
W="$(mktemp -d)"; trap 'rm -rf "$W"' EXIT
P="$W/payload"; mkdir -p "$P"
fail() { echo "FAIL: $*"; exit 1; }

# app key, label, repo, version, deb package, file prefix
APPS='QuillPen	Anne'"'"'s Pen	annes-pen	0.5.0	quillpen	QuillPen
QuillGrid	Anne'"'"'s Grid	annes-grid	0.4.0	quillgrid	QuillGrid
QuillPost	Anne'"'"'s Post	annes-post	1.6.0	quillpost	quillpost-desktop-v1.6.0
QuillStage	Anne'"'"'s Stage	annes-stage	0.2.0	quillstage	QuillStage
QuillLoom	Anne'"'"'s Loom	annes-loom	0.1.0	quillloom	QuillLoom'

items='[]'
while IFS=$'\t' read -r key label repo ver pkg prefix; do
  d="$W/deb-$pkg"; mkdir -p "$d/DEBIAN"
  printf 'Package: %s\nVersion: %s\nArchitecture: all\nMaintainer: test <test@example.invalid>\nDescription: stand-in\n' "$pkg" "$ver" > "$d/DEBIAN/control"
  if [ "$key" = QuillPost ]; then deb="$prefix-linux-x64.deb"; web="quillpost-web-v1.6.0-any-jvm.zip"; apk="quillpost-v1.6.0-unsigned.apk"
  else deb="$prefix-$ver-linux-amd64.deb"; web="$prefix-$ver-web.zip"; apk="$prefix-$ver.apk"; fi
  dpkg-deb --build --root-owner-group "$d" "$P/$deb" >/dev/null
  wd="$W/web-$pkg"; mkdir -p "$wd"; echo "<title>$label</title>" > "$wd/index.html"; (cd "$wd" && zip -q "$P/$web" index.html)
  add() { items="$(node -e "const a=JSON.parse(process.argv[1]);a.push({app:process.argv[2],key:process.argv[3],file:process.argv[4],version:process.argv[5]});console.log(JSON.stringify(a))" "$items" "$key" "$1" "$2" "$ver")"; }
  add linux-deb-x64 "$deb"; add web "$web"
  if [ "$key" != QuillPost ]; then echo x > "$P/$prefix-$ver-linux-x86_64.AppImage"; add linux-appimage-x64 "$prefix-$ver-linux-x86_64.AppImage"; fi
  # Anne's Loom has no Android or iOS build, Anne's Post no iOS device build.
  if [ "$key" != QuillLoom ]; then echo x > "$P/$apk"; add android "$apk"; fi
  if [ "$key" != QuillLoom ] && [ "$key" != QuillPost ]; then echo x > "$P/$prefix-$ver-ios-unsigned.ipa"; add ios "$prefix-$ver-ios-unsigned.ipa"; fi
done <<< "$APPS"
echo "$items" > "$P/payload.json"
node -e "
  const items = require('$P/payload.json'); const apps = {};
  for (const line of process.argv[1].split('\n')) {
    const [key, label, repo, ver] = line.split('\t');
    const assets = {}; for (const x of items.filter((i) => i.app === key)) assets[x.key] = { name: x.file };
    apps[key] = { included: true, found: true, repo, label, summary: 'test', id: 'test.' + repo, tag: 'v' + ver, version: ver, prerelease: false, url: 'u', assets };
  }
  require('fs').writeFileSync('$W/manifest.json', JSON.stringify({ apps }, null, 2));
" "$APPS"

VERSION="$(node -p "require('$ROOT/package.json').version")"
OUT="$W/out"
bash "$ROOT/installers/linux/build.sh" x64 "$P" "$OUT" >/dev/null
SH="$OUT/AnnesOffice-$VERSION-linux-x64.sh"
[ -x "$SH" ] || fail "no Linux installer"
list="$(sh "$SH" --list)"; echo "$list"
for l in "Anne's Pen" "Anne's Grid" "Anne's Post" "Anne's Stage" "Anne's Loom"; do echo "$list" | grep -q "^$l " || fail "--list does not name $l"; done
sh "$SH" --extract "$W/x" >/dev/null
[ "$(ls "$W/x"/*.deb | wc -l)" -eq 5 ] || fail "--extract did not give five packages"
if sh "$SH" --apps nosuchapp >/dev/null 2>&1; then fail "--apps with no match did not fail"; fi
[ "$(tar -tzf "$OUT/AnnesOffice-$VERSION-linux-x64-AppImages.tar.gz" | grep -c '\.AppImage$')" -eq 4 ] || fail "AppImages archive"

for k in web android ios; do node "$ROOT/scripts/bundle-portable.mjs" "$k" "$P" "$OUT" >/dev/null; done
web="$(unzip -l "$OUT/AnnesOffice-$VERSION-web.zip")"
for r in annes-pen annes-grid annes-stage annes-loom; do echo "$web" | grep -q " $r/index.html$" || fail "web zip has no $r/index.html"; done
echo "$web" | grep -q " quillpost-web-v1.6.0-any-jvm.zip$" || fail "web zip lacks Anne's Post's server"
unzip -p "$OUT/AnnesOffice-$VERSION-web.zip" index.html | grep -q 'href="annes-loom/"' || fail "launcher does not link Anne's Loom"
unzip -p "$OUT/AnnesOffice-$VERSION-android.zip" README.txt | grep -q "Anne's Loom has no Android package" || fail "Android README does not mention Anne's Loom"
unzip -p "$OUT/AnnesOffice-$VERSION-ios-unsigned.zip" README.txt | grep -q "Anne's Loom has no iOS package" || fail "iOS README does not mention Anne's Loom"
unzip -p "$OUT/AnnesOffice-$VERSION-android.zip" README.txt | grep -q "(Anne's Pen 0.5.0)" || fail "Android README does not use display names"

notes="$(node "$ROOT/scripts/release-notes.mjs" "$W/manifest.json" "$OUT")"
echo "$notes" | grep -q "| Anne's Loom (test) | 0.1.0 |" || fail "release notes miss Anne's Loom"
echo "$notes" | grep -q "not in this bundle: Anne's Loom; use the web app" || fail "release notes miss the Android/iOS note"
echo "bundle smoke test passed"
