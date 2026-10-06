#!/usr/bin/env node
/* ============================================================
   Regenerate the blog cards on /blog and the homepage from the posts themselves.

     node scripts/build-blog-index.js          rebuild
     node scripts/build-blog-index.js --check  fail if either page is out of date

   RUN THIS AFTER ADDING OR EDITING A POST, then run build-sitemap.js. There is no
   list of posts to maintain: every blog/*.html is a card unless it carries a
   noindex robots meta (that is how blog/template.html stays out).

   Every field on a card is read off the post, never typed here:
   - title        the post's <title>, minus any " — KABS AI LABS" style suffix
   - description  the post's meta description
   - date         article:published_time, else the JSON-LD datePublished, else the
                  commit that first added the file. The last one is the same source
                  the BlogPosting schema on master was built from. A post with none
                  of the three stops the build rather than getting today's date.

   Order is newest first. Posts sharing a date keep their series order (the
   "05 / 24" in the kicker), with unnumbered posts such as the "Start here" guide
   ahead of the numbered ones. Any remaining tie is broken by when the file was
   first committed, newest first; a post not yet committed counts as newest.
   Published dates are never changed by this.

   The cards land between marker comments, so nothing else on either page moves:
     blog.html   <!-- BLOG-INDEX:START -->  ... <!-- BLOG-INDEX:END -->    all posts
     index.html  <!-- BLOG-LATEST:START --> ... <!-- BLOG-LATEST:END -->   newest 3
   ============================================================ */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
process.chdir(ROOT);

const LATEST_ON_HOME = 3;
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const pick = (html, re) => { const m = html.match(re); return m ? m[1].trim() : null; };

const firstCommitDate = f => {
  try {
    const out = cp.execSync('git log --diff-filter=A --follow --format=%cs -- "' + f + '"', { encoding: 'utf8' }).trim().split('\n');
    const d = out[out.length - 1];
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
  } catch (e) { return null; }
};

// Unix time of the commit that first added the file; uncommitted files sort as newest.
const firstCommitTime = f => {
  try {
    const out = cp.execSync('git log --diff-filter=A --follow --format=%ct -- "' + f + '"', { encoding: 'utf8' }).trim().split('\n');
    const t = Number(out[out.length - 1]);
    return Number.isFinite(t) && t > 0 ? t : Infinity;
  } catch (e) { return Infinity; }
};

const posts = [];
for (const name of fs.readdirSync('blog').filter(n => n.endsWith('.html')).sort()) {
  const file = 'blog/' + name;
  const html = fs.readFileSync(file, 'utf8');
  if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) continue;

  const title = pick(html, /<title>([^<]*)<\/title>/i);
  const description = pick(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const date = pick(html, /<meta\s+property="article:published_time"\s+content="(\d{4}-\d{2}-\d{2})/i)
    || pick(html, /"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})/)
    || firstCommitDate(file);
  if (!title || !description || !date) {
    console.error(file + ': missing ' + [!title && 'title', !description && 'description', !date && 'date'].filter(Boolean).join(', '));
    process.exit(1);
  }
  const num = pick(html, /<span class="num">\s*(\d+)\s*\//);
  posts.push({
    slug: name.replace(/\.html$/, ''),
    title: title.replace(/\s+[—·|-]\s+KABS AI LABS\s*$/i, ''),
    description,
    date,
    order: num ? Number(num) : 0,
    added: firstCommitTime(file),
  });
}

posts.sort((a, b) => b.date.localeCompare(a.date) || a.order - b.order
  || (a.added === b.added ? 0 : (b.added > a.added ? 1 : -1)) || a.slug.localeCompare(b.slug));

const human = d => { const [y, m, day] = d.split('-').map(Number); return day + ' ' + MONTHS[m - 1] + ' ' + y; };
const card = p => [
  '  <a class="card link" href="/blog/' + p.slug + '">',
  '    <div class="meta"><time datetime="' + p.date + '">' + human(p.date) + '</time></div>',
  '    <h3 style="font-size:18px">' + p.title + '</h3><p>' + p.description + '</p>',
  '    <span class="more">Read &rarr;</span>',
  '  </a>',
].join('\n');

const fill = (file, marker, list) => {
  const html = fs.readFileSync(file, 'utf8');
  const re = new RegExp('(<!-- ' + marker + ':START -->)[\\s\\S]*?(<!-- ' + marker + ':END -->)');
  if (!re.test(html)) { console.error(file + ': markers ' + marker + ':START/END not found'); process.exit(1); }
  return { file, html, next: html.replace(re, '$1\n' + list.map(card).join('\n') + '\n$2') };
};

const targets = [
  fill('blog.html', 'BLOG-INDEX', posts),
  fill('index.html', 'BLOG-LATEST', posts.slice(0, LATEST_ON_HOME)),
];

if (process.argv.includes('--check')) {
  const stale = targets.filter(t => t.html !== t.next).map(t => t.file);
  if (stale.length) { console.error('out of date: ' + stale.join(', ') + ', run node scripts/build-blog-index.js'); process.exit(1); }
  console.log('blog cards are current (' + posts.length + ' posts)');
  process.exit(0);
}

for (const t of targets) if (t.html !== t.next) fs.writeFileSync(t.file, t.next);
console.log(posts.length + ' posts on /blog, newest ' + LATEST_ON_HOME + ' on the homepage');
posts.forEach(p => console.log('  ' + p.date + '  /blog/' + p.slug));
