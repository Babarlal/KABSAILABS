#!/usr/bin/env node
/**
 * KABS AI LABS — bulk audit fixes
 *
 * Applies the repetitive, mechanical fixes across every .html file in the
 * project. These are the ones that are identical on 37 pages and tedious
 * to do by hand.
 *
 *   node scripts/apply-audit-fixes.mjs            # dry run, shows a diff summary
 *   node scripts/apply-audit-fixes.mjs --write    # writes changes
 *   node scripts/apply-audit-fixes.mjs --write --backup
 *
 * No dependencies. Node 18+.
 *
 * What it does NOT do — these need a human:
 *   - remove the fake counter / activity feed (see README, index.html)
 *   - remove the "illustrative home-services company" testimonial
 *   - rewrite /about, /privacy
 *   - anything requiring your real details
 */

import { readFileSync, writeFileSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = process.argv.find(a => a.startsWith('--root='))?.split('=')[1] || process.cwd();
const WRITE = process.argv.includes('--write');
const BACKUP = process.argv.includes('--backup');
// kabs-fixes is the staging copy of this package. Processing it would rewrite
// the pristine originals we diff against, so it is skipped.
const SKIP_DIRS = new Set(['node_modules', '.git', '.vercel', 'dist', 'build', '.next', 'kabs-fixes']);

/* ---------- fixes ---------- */

const fixes = [
  {
    id: 'og-image-png',
    label: 'og:image → PNG (SVG previews do not render on LinkedIn/Slack/WhatsApp/X)',
    apply(html) {
      let out = html.replace(
        /(<meta\s+(?:property|name)="(?:og:image|twitter:image)"\s+content="[^"]*?og-image)\.svg(")/g,
        '$1.png$2'
      );
      // add og:image:type once, right after the og:image tag, if absent
      if (/property="og:image"/.test(out) && !/property="og:image:type"/.test(out)) {
        out = out.replace(
          /(<meta property="og:image" content="[^"]*">)/,
          '$1\n<meta property="og:image:type" content="image/png">'
        );
      }
      return out;
    }
  },

  {
    id: 'img-lazy',
    label: 'add loading="lazy" decoding="async" to images that lack them',
    apply(html) {
      return html.replace(/<img\b([^>]*?)>/g, (tag, attrs) => {
        if (/\bloading=/.test(attrs) && /\bdecoding=/.test(attrs)) return tag;
        let a = attrs;
        if (!/\bloading=/.test(a)) a = ' loading="lazy"' + a;
        if (!/\bdecoding=/.test(a)) a = ' decoding="async"' + a;
        return `<img${a}>`;
      });
    }
  },

  {
    id: 'heading-order',
    label: 'promote <h4> inside <main> to <h3 class="as-h4"> (WCAG 1.3.1 — h2→h4 skips a level)',
    apply(html) {
      const start = html.indexOf('<main');
      const end = html.lastIndexOf('</main>');
      if (start === -1 || end === -1) return html;
      const head = html.slice(0, start);
      const body = html.slice(start, end);
      const tail = html.slice(end);

      const fixed = body
        .replace(/<h4>/g, '<h3 class="as-h4">')
        .replace(/<h4 class="([^"]*)">/g, '<h3 class="$1 as-h4">')
        .replace(/<h4\b([^>]*)>/g, '<h3$1 class="as-h4">')
        .replace(/<\/h4>/g, '</h3>');

      return head + fixed + tail;
    }
  },

  {
    id: 'form-endpoint',
    label: 'point forms at /api/submit-form instead of mailto:',
    apply(html) {
      return html.replace(/<form\b([^>]*)>/g, (tag, attrs) => {
        if (!/data-mailto=/.test(attrs)) return tag;
        let a = attrs
          .replace(/\s*action="mailto:[^"]*"/g, '')
          .replace(/\s*enctype="text\/plain"/g, '')
          .replace(/\s*method="POST"/gi, '');
        a = ' action="/api/submit-form" method="post"' + a;
        if (!/data-form=/.test(a)) a += ' data-form';
        return `<form${a}>`;
      });
    }
  },

  {
    id: 'form-autocomplete',
    label: 'add autocomplete + inputmode hints to form fields',
    apply(html) {
      const map = [
        [/name="name"/, 'autocomplete="name"'],
        [/name="email"/, 'autocomplete="email" inputmode="email"'],
        [/name="company"/, 'autocomplete="organization"'],
        [/name="website"/, 'autocomplete="url" inputmode="url"'],
        [/name="phone"/, 'autocomplete="tel" inputmode="tel"']
      ];
      return html.replace(/<input\b([^>]*)>/g, (tag, attrs) => {
        if (/\bautocomplete=/.test(attrs)) return tag;
        if (/type="hidden"/.test(attrs)) return tag;
        for (const [test, add] of map) {
          if (test.test(attrs)) {
            let a = attrs;
            if (!/\btype=/.test(a) && !/name="email"/.test(a)) a = ' type="text"' + a;
            return `<input${a} ${add}>`;
          }
        }
        return tag;
      });
    }
  },

  {
    id: 'dead-blog-pills',
    label: 'remove "Learn more" pills that link to the empty /blog',
    apply(html) {
      return html.replace(
        /<div class="learn-pills">([\s\S]*?)<\/div>/g,
        (block, inner) => {
          const cleaned = inner.replace(/<a href="\/blog"[^>]*>[\s\S]*?<\/a>/g, '');
          // If nothing survives, drop the whole block and its section-head sibling is left alone.
          if (!/<a /.test(cleaned)) return '';
          return `<div class="learn-pills">${cleaned}</div>`;
        }
      );
    }
  },

  {
    id: 'noscript-nav',
    label: 'add /demo to the no-JS nav fallback',
    apply(html) {
      return html.replace(
        /(<nav class="nojs-nav" aria-label="Primary"><a href="\/">Home<\/a><a href="\/services">Services<\/a>)(<a href="\/demo">Live demo<\/a>)?/g,
        // Idempotent: pages that already list /demo (e.g. thank-you.html, which
        // ships with it) must not get a second copy on a re-run.
        '$1<a href="/demo">Live demo</a>'
      );
    }
  },

  {
    id: 'patch-css',
    label: 'load audit-patches.css after styles.css',
    apply(html) {
      if (/audit-patches\.css/.test(html)) return html;
      return html.replace(
        /(<link rel="stylesheet" href="(?:https:\/\/www\.kabsailabs\.com)?\/assets\/css\/styles\.css">)/,
        '$1\n<link rel="stylesheet" href="/assets/css/audit-patches.css">'
      );
    }
  }
];

/* ---------- runner ---------- */

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (extname(p) === '.html') out.push(p);
  }
  return out;
}

const files = walk(ROOT);
if (!files.length) {
  console.error(`No .html files found under ${ROOT}. Run this from your project root, or pass --root=/path/to/site`);
  process.exit(1);
}

console.log(`${WRITE ? 'Applying' : 'Dry run —'} ${fixes.length} fixes across ${files.length} HTML files\n`);

const tally = Object.fromEntries(fixes.map(f => [f.id, 0]));
let changedFiles = 0;

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  let html = original;
  const applied = [];

  for (const fix of fixes) {
    const before = html;
    html = fix.apply(html);
    if (html !== before) { applied.push(fix.id); tally[fix.id]++; }
  }

  if (html !== original) {
    changedFiles++;
    console.log(`  ${relative(ROOT, file)}`);
    console.log(`      ${applied.join(', ')}`);
    if (WRITE) {
      if (BACKUP) copyFileSync(file, file + '.bak');
      writeFileSync(file, html, 'utf8');
    }
  }
}

console.log(`\n${changedFiles} file(s) ${WRITE ? 'changed' : 'would change'}\n`);
for (const fix of fixes) {
  console.log(`  ${String(tally[fix.id]).padStart(3)}  ${fix.id.padEnd(20)} ${fix.label}`);
}

if (!WRITE) {
  console.log('\nNothing written. Re-run with --write (add --backup to keep .bak copies).');
} else {
  console.log('\nDone. Now check git diff before committing — especially the heading-order fix.');
}
