import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { versionOf, matchAssets } from '../scripts/resolve.mjs';

const suite = JSON.parse(readFileSync(new URL('../suite.json', import.meta.url), 'utf8'));

test('versionOf strips v and build suffixes', () => {
  assert.equal(versionOf('v0.1.1-build.7'), '0.1.1');
  assert.equal(versionOf('v1.2.0'), '1.2.0');
  assert.equal(versionOf('2.0.0'), '2.0.0');
});

test('electron-builder style releases match every key', () => {
  const names = ['QuillStage-0.1.1-ios-unsigned.ipa', 'QuillStage-0.1.1-linux-amd64.deb', 'QuillStage-0.1.1-linux-arm64.AppImage', 'QuillStage-0.1.1-linux-arm64.deb', 'QuillStage-0.1.1-linux-armv7l.AppImage', 'QuillStage-0.1.1-linux-armv7l.deb', 'QuillStage-0.1.1-linux-x86_64.AppImage', 'QuillStage-0.1.1-mac-universal.dmg', 'QuillStage-0.1.1-mac-universal.zip', 'QuillStage-0.1.1-web.zip', 'QuillStage-0.1.1-windows-arm64-setup.exe', 'QuillStage-0.1.1-windows-portable.exe', 'QuillStage-0.1.1-windows-setup.exe', 'QuillStage-0.1.1-windows-x64-setup.exe', 'QuillStage-0.1.1.aab', 'QuillStage-0.1.1.apk', 'SHA256SUMS.txt'];
  const rel = { tag_name: 'v0.1.1-build.7', assets: names.map((n) => ({ name: n, browser_download_url: 'u/' + n, size: 1 })) };
  const got = matchAssets(suite.apps.QuillStage, rel);
  assert.deepEqual(Object.keys(got).sort(), Object.keys(suite.apps.QuillStage.assets).sort());
  assert.equal(got['win-x64'].name, 'QuillStage-0.1.1-windows-x64-setup.exe');
  assert.equal(got.mac.name, 'QuillStage-0.1.1-mac-universal.zip');
});

test('Anne\'s Post releases match by tag', () => {
  const names = ['quillpost-desktop-v1.4.0-windows-x64.msi', 'quillpost-desktop-v1.4.0-windows-x64-portable.zip', 'quillpost-desktop-v1.4.0-macos-arm64.dmg', 'quillpost-desktop-v1.4.0-linux-x64.deb', 'quillpost-desktop-v1.4.0-linux-arm64.deb', 'quillpost-v1.4.0-unsigned.apk', 'quillpost-v1.4.0-debug.apk', 'quillpost-web-v1.4.0-any-jvm.zip', 'QuillPost-iOS-simulator-v1.4.0.app.zip'];
  const rel = { tag_name: 'v1.4.0', assets: names.map((n) => ({ name: n, browser_download_url: 'u/' + n, size: 1 })) };
  const got = matchAssets(suite.apps.QuillPost, rel);
  assert.equal(got['win-x64'].name, 'quillpost-desktop-v1.4.0-windows-x64.msi');
  assert.equal(got.android.name, 'quillpost-v1.4.0-unsigned.apk');
  assert.equal(got.ios, undefined);
  assert.equal(got['win-arm64'], undefined);
});

test('Anne\'s Loom is included and its 0.1.0 release matches every desktop and web key', () => {
  assert.equal(suite.apps.QuillLoom.include, true);
  assert.deepEqual(Object.entries(suite.apps).filter(([, a]) => a.include).map(([n]) => n), ['QuillPen', 'QuillGrid', 'QuillPost', 'QuillStage', 'QuillLoom']);
  // The file list of the real Anne's Loom v0.1.0 release.
  const names = ['QuillLoom-0.1.0-linux-amd64.deb', 'QuillLoom-0.1.0-linux-arm64.AppImage', 'QuillLoom-0.1.0-linux-arm64.deb', 'QuillLoom-0.1.0-linux-armv7l.AppImage', 'QuillLoom-0.1.0-linux-armv7l.deb', 'QuillLoom-0.1.0-linux-x86_64.AppImage', 'QuillLoom-0.1.0-mac-universal.dmg', 'QuillLoom-0.1.0-mac-universal.zip', 'QuillLoom-0.1.0-web.zip', 'QuillLoom-0.1.0-windows-arm64-setup.exe', 'QuillLoom-0.1.0-windows-portable.exe', 'QuillLoom-0.1.0-windows-setup.exe', 'QuillLoom-0.1.0-windows-x64-setup.exe', 'SHA256SUMS.txt'];
  const rel = { tag_name: 'v0.1.0', assets: names.map((n) => ({ name: n, browser_download_url: 'u/' + n, size: 1 })) };
  const got = matchAssets(suite.apps.QuillLoom, rel);
  const want = Object.keys(suite.apps.QuillLoom.assets).filter((k) => k !== 'android' && k !== 'ios');
  assert.deepEqual(Object.keys(got).sort(), want.sort());
  assert.equal(got['win-x64'].name, 'QuillLoom-0.1.0-windows-x64-setup.exe');
});

test('patterns accept the Annes… file-name prefix as well as Quill…', () => {
  const names = ['AnnesPen-0.6.0-windows-x64-setup.exe', 'AnnesPen-0.6.0-mac-universal.zip', 'AnnesPen-0.6.0-linux-amd64.deb', 'AnnesPen-0.6.0-web.zip', 'SHA256SUMS.txt'];
  const got = matchAssets(suite.apps.QuillPen, { tag_name: 'v0.6.0', assets: names.map((n) => ({ name: n, browser_download_url: 'u/' + n, size: 1 })) });
  assert.equal(got['win-x64'].name, 'AnnesPen-0.6.0-windows-x64-setup.exe');
  assert.equal(got.mac.name, 'AnnesPen-0.6.0-mac-universal.zip');
  assert.equal(got['linux-deb-x64'].name, 'AnnesPen-0.6.0-linux-amd64.deb');
  const post = matchAssets(suite.apps.QuillPost, { tag_name: 'v1.7.0', assets: [{ name: 'annespost-desktop-v1.7.0-windows-x64.msi', browser_download_url: 'u', size: 1 }] });
  assert.equal(post['win-x64'].name, 'annespost-desktop-v1.7.0-windows-x64.msi');
});

test('a pattern does not match another app\'s files or another version', () => {
  const names = ['QuillGrid-0.5.0-windows-x64-setup.exe', 'QuillPen-0.4.9-windows-x64-setup.exe', 'XQuillPen-0.5.0-windows-x64-setup.exe'];
  const got = matchAssets(suite.apps.QuillPen, { tag_name: 'v0.5.0', assets: names.map((n) => ({ name: n, browser_download_url: 'u/' + n, size: 1 })) });
  assert.equal(got['win-x64'], undefined);
});
