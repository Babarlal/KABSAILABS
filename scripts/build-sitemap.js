#!/usr/bin/env node
/* ============================================================
   Regenerate sitemap.xml from the pages that actually deploy.

     node scripts/build-sitemap.js          rebuild
     node scripts/build-sitemap.js --check  fail if it is out of date

   RUN THIS AFTER ADDING, REMOVING OR EDITING A PAGE. The previous sitemap was
   hand-maintained and drifted: it still claimed 2026-08-10 for pages that had
   changed on 2026-09-17, which tells Google nothing has changed since August.
   That is worse than omitting the field, and it works directly against getting
   the rewritten pages recrawled.

   Rules, all enforced here rather than remembered:
   - www host only
   - every deployed .html except those carrying a noindex robots meta
   - lastmod is the commit date of that file's last change, read from git, so it
     cannot be invented. A file with no commit yet is emitted without lastmod
     rather than with today's date.
   - no priority or changefreq; Google ignores both
   ============================================================ */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const HOST = 'https://www.kabsailabs.com';
process.chdir(ROOT);

const files = cp.execSync(
  'find . -name "*.html" -not -path "./node_modules/*" -not -path "./kabs-fixes/*" -not -path "./_qa/*"',
  { shell: 'bash' }).toString().trim().split('\n').map(f => f.replace(/^\.\//, '')).sort();

const noindex = f => /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(fs.readFileSync(f, 'utf8'));
const urlFor = f => f === 'index.html' ? HOST + '/' : HOST + '/' + f.replace(/\.html$/, '');

const lastmod = f => {
  try {
    const d = cp.execSync('git log -1 --format=%cs -- "' + f + '"', { encoding: 'utf8' }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
  } catch (e) { return null; }
};

const entries = [];
const skipped = [];
for (const f of files) {
  if (noindex(f)) { skipped.push(f); continue; }
  const d = lastmod(f);
  entries.push('  <url><loc>' + urlFor(f) + '</loc>' + (d ? '<lastmod>' + d + '</lastmod>' : '') + '</url>');
}

const header = '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<!--\n'
  + '  KABS AI LABS sitemap. GENERATED - do not hand-edit.\n'
  + '    node scripts/build-sitemap.js\n\n'
  + '  Every deployed page except those carrying a noindex robots meta, which at the time\n'
  + '  of writing are /404, /thank-you, /blog/template and the three /lp/ ad landing pages.\n'
  + '  lastmod is each file\'s last commit date from git, so it cannot drift from the truth\n'
  + '  or be invented. No priority or changefreq: Google ignores both.\n'
  + '-->\n';

const xml = header + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + entries.join('\n') + '\n</urlset>\n';

if (process.argv.includes('--check')) {
  const current = fs.existsSync('sitemap.xml') ? fs.readFileSync('sitemap.xml', 'utf8') : '';
  if (current.trim() !== xml.trim()) {
    console.error('sitemap.xml is out of date, run node scripts/build-sitemap.js');
    process.exit(1);
  }
  console.log('sitemap.xml is current (' + entries.length + ' urls)');
  process.exit(0);
}

fs.writeFileSync('sitemap.xml', xml);
console.log('sitemap.xml: ' + entries.length + ' urls, ' + skipped.length + ' noindex pages excluded');
skipped.forEach(s => console.log('  excluded: /' + s.replace(/\.html$/, '').replace(/^index$/, '')));
