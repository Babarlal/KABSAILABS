#!/usr/bin/env node
/* ============================================================
   Regenerate the .min.css / .min.js files the pages actually load.

     node scripts/minify-assets.js          rebuild all
     node scripts/minify-assets.js --check  fail if any is stale

   The .css and .js sources stay the editable truth, comments and all. Only the
   generated .min files ship, and every page references those.

   RUN THIS AFTER EDITING ANY CSS OR JS, or the site serves the old bytes. The
   --check mode exists so that is caught rather than deployed: it compares each
   source's mtime against its generated file and exits non-zero if a source is
   newer.

   Why the pages load minified files at all: measured on a throttled mobile
   profile with brotli on, interleaved so machine drift could not colour it,
   first contentful paint went 1952ms to 1424ms on the homepage and 1516ms to
   1332ms on /lp/inventory-sync. Brotli already squeezes comments well, so the
   win is smaller than the raw byte count suggests, but it is real and it lands
   on the render-blocking path.

   Requires clean-css and terser. They are dev-only and not committed:
     npm install --no-save clean-css terser
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CSS = ['styles', 'audit-patches', 'pages-green', 'lp', 'site-chrome', 'blog-post'];
const JS  = ['main', 'tagging', 'proof-gallery', 'lp-scene', 'lp-booking', 'lp-picker'];

const cssPath = n => path.join(ROOT, 'assets/css', n + '.css');
const cssMin  = n => path.join(ROOT, 'assets/css', n + '.min.css');
const jsPath  = n => path.join(ROOT, 'assets/js', n + '.js');
const jsMin   = n => path.join(ROOT, 'assets/js', n + '.min.js');

if (process.argv.includes('--check')) {
  const stale = [];
  for (const n of CSS) {
    if (!fs.existsSync(cssMin(n))) { stale.push(n + '.min.css missing'); continue; }
    if (fs.statSync(cssPath(n)).mtimeMs > fs.statSync(cssMin(n)).mtimeMs) stale.push(n + '.css is newer than its .min.css');
  }
  for (const n of JS) {
    if (!fs.existsSync(jsMin(n))) { stale.push(n + '.min.js missing'); continue; }
    if (fs.statSync(jsPath(n)).mtimeMs > fs.statSync(jsMin(n)).mtimeMs) stale.push(n + '.js is newer than its .min.js');
  }
  if (stale.length) {
    console.error('STALE, run node scripts/minify-assets.js:');
    stale.forEach(s => console.error('  ' + s));
    process.exit(1);
  }
  console.log('all generated assets are current');
  process.exit(0);
}

(async () => {
  const CleanCSS = require('clean-css');
  const terser = require('terser');
  let raw = 0, min = 0;

  for (const n of CSS) {
    const src = fs.readFileSync(cssPath(n), 'utf8');
    const res = new CleanCSS({ level: 2 }).minify(src);
    if (res.errors.length) throw new Error(n + '.css: ' + res.errors.join('; '));
    // A remote @import is left alone on purpose; clean-css warns that it did not inline it.
    fs.writeFileSync(cssMin(n), res.styles + '\n');
    raw += src.length; min += res.styles.length;
    console.log('  ' + (n + '.css').padEnd(22) + (src.length / 1024).toFixed(1) + 'K -> ' + (res.styles.length / 1024).toFixed(1) + 'K');
  }
  for (const n of JS) {
    const src = fs.readFileSync(jsPath(n), 'utf8');
    const res = await terser.minify(src, { compress: true, mangle: true, format: { comments: false } });
    if (res.error) throw res.error;
    fs.writeFileSync(jsMin(n), res.code + '\n');
    raw += src.length; min += res.code.length;
    console.log('  ' + (n + '.js').padEnd(22) + (src.length / 1024).toFixed(1) + 'K -> ' + (res.code.length / 1024).toFixed(1) + 'K');
  }
  console.log('  ' + 'TOTAL'.padEnd(22) + (raw / 1024).toFixed(1) + 'K -> ' + (min / 1024).toFixed(1) + 'K');
})();
