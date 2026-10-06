#!/usr/bin/env node
/* ============================================================
   Build the case study pages from scripts/case-studies-content.js.

     node scripts/build-case-studies.js          rebuild
     node scripts/build-case-studies.js --check  fail if anything is out of date

   Writes:
   - case-studies/<slug>.html            one page per build
   - the build list on case-studies.html between CASE-STUDIES:START/END markers,
     so the list is in the HTML at build time and proof-gallery.js only wires
     the category filters
   - assets/data/portfolio-builds.json   the published builds, read by the
     service page galleries

   Published means not noindex. Noindex builds get a page but stay out of the
   list, the JSON and (because build-sitemap.js skips noindex) the sitemap.

   RUN THIS AFTER EDITING THE CONTENT FILE, then build-sitemap.js.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
process.chdir(ROOT);
const HOST = 'https://www.kabsailabs.com';
const PUBLISHED_ON = '2026-10-06';
const builds = require('./case-studies-content.js');
const CHECK = process.argv.includes('--check');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const ld = o => JSON.stringify(o, null, 2).replace(/</g, '\\u003c');

/* Width and height straight from the JPEG, so the markup never disagrees with
   the file it points at. */
function jpegSize(file) {
  const b = fs.readFileSync(file);
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xFF) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error('no SOF in ' + file);
}

/* Link text for a blog post is the post's own title, so it cannot drift. */
function postTitle(href) {
  const f = href.replace(/^\//, '') + '.html';
  if (!fs.existsSync(f)) throw new Error('linked post missing: ' + href);
  const t = fs.readFileSync(f, 'utf8').match(/<title>([^<]*)<\/title>/)[1];
  return t.replace(/\s+[—·|-]\s+KABS AI LABS\s*$/i, '').replace(/&amp;/g, '&');
}
function pageExists(href) {
  const p = href.replace(/^\//, '');
  return fs.existsSync(p + '.html') || fs.existsSync(path.join(p, 'index.html'));
}

/* Same logo rules as proof-gallery.js: only names we ship a logo for get one. */
const HAVE_LOGO = new Set(['airtable', 'calendar', 'claude', 'ga4', 'gemini', 'gmail', 'gohighlevel', 'googlecloud', 'gtm', 'hubspot', 'huggingface', 'langchain', 'looker', 'make', 'microsoft365', 'mongodb', 'n8n', 'notion', 'openai', 'perplexity', 'pinecone', 'postgresql', 'powerbi', 'python', 'salesforce', 'sheets', 'shopify', 'slack', 'stripe', 'supabase', 'twilio', 'zapier']);
const LOGO_ALIAS = { 'google sheets': 'sheets', 'google calendar': 'calendar', 'google gemini': 'gemini' };
function logoFile(name) {
  const k = String(name).toLowerCase();
  const f = LOGO_ALIAS[k] || k.replace(/[^a-z0-9]+/g, '');
  return HAVE_LOGO.has(f) ? f : null;
}
const THUMB = '<svg viewBox="0 0 40 40" fill="none"><rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.6"/><rect x="24" y="5" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.6"/><rect x="24" y="27" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M16 13h4a4 4 0 0 1 4 4v0M16 13h4a4 4 0 0 0 4-4v0M24 31h-4a4 4 0 0 1-4-4v-6" stroke="currentColor" stroke-width="1.6"/></svg>';
function clip(s, n) { return s.length > n ? s.slice(0, n - 1).replace(/[\s,;:.]+$/, '') + '…' : s; }

function card(b) {
  const chips = b.tools.map(t => { const f = logoFile(t); return '<span class="pc">' + (f ? '<img src="/assets/img/logos/' + f + '.svg" alt="">' : '') + esc(t) + '</span>'; }).join('');
  return '<a class="gcard" href="/case-studies/' + b.slug + '">' +
    '<div class="pc-head"><span class="pc-tag">' + esc(b.category) + '</span><span class="pc-thumb" aria-hidden="true">' + THUMB + '</span></div>' +
    '<h3>' + esc(b.cardTitle) + '</h3><p>' + esc(clip(b.summary, 150)) + '</p>' +
    '<div class="pc-chips">' + chips + '</div><span class="pc-go">Read the case study →</span></a>';
}

function figure(b, n, first, sizes) {
  const meta = b.imgs[n];
  if (!meta) throw new Error(b.slug + ': no alt/caption for image ' + n);
  const base = '/assets/img/work/' + b.slug + '/' + String(n).padStart(2, '0');
  const { w, h } = sizes[n];
  return '<figure class="cs-fig"><picture><source type="image/webp" srcset="' + base + '.webp">' +
    '<img src="' + base + '.jpg" width="' + w + '" height="' + h + '" alt="' + esc(meta.alt) + '"' +
    (first ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"></picture>' +
    '<figcaption>' + esc(meta.caption) + '</figcaption></figure>';
}

function page(b) {
  const url = HOST + '/case-studies/' + b.slug;
  const dir = 'assets/img/work/' + b.slug;
  const nums = Object.keys(b.imgs).map(Number).sort((x, y) => x - y);
  const sizes = {};
  for (const n of nums) {
    const base = dir + '/' + String(n).padStart(2, '0');
    if (!fs.existsSync(base + '.jpg') || !fs.existsSync(base + '.webp')) throw new Error('missing image ' + base);
    sizes[n] = jpegSize(base + '.jpg');
  }
  const used = b.how.filter(x => x.img).map(x => x.img);
  if (used.join() !== nums.join()) throw new Error(b.slug + ': images in `how` must be every image, in order (' + used + ' vs ' + nums + ')');
  if (!b.noindex && nums.length < 2) throw new Error(b.slug + ': published builds need at least 2 images');
  for (const l of [b.service].concat(b.posts)) if (!pageExists(l.href)) throw new Error(b.slug + ': link target missing ' + l.href);

  const first = nums.length ? { src: HOST + '/' + dir + '/01.jpg', w: sizes[1].w, h: sizes[1].h, alt: b.imgs[1].alt }
    : { src: HOST + '/assets/img/og-image.png', w: 1200, h: 630, alt: 'KABS AI LABS: AI agents, automation and analytics, built end to end.' };
  const docTitle = b.cardTitle + ' · Case study · KABS AI LABS';

  let firstImg = true;
  const how = b.how.map(x => {
    if (x.p) return '<p>' + esc(x.p) + '</p>';
    if (x.h3) return '<h3>' + esc(x.h3) + '</h3>';
    if (x.ol) return '<ol>' + x.ol.map(i => '<li>' + esc(i) + '</li>').join('') + '</ol>';
    if (x.ul) return '<ul class="plain">' + x.ul.map(i => '<li>' + esc(i) + '</li>').join('') + '</ul>';
    if (x.img) { const f = figure(b, x.img, firstImg, sizes); firstImg = false; return f; }
    throw new Error('unknown block in ' + b.slug);
  }).join('\n');

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article', headline: b.title, description: b.description, url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        datePublished: PUBLISHED_ON, dateModified: PUBLISHED_ON, image: first.src,
        author: { '@id': HOST + '/#organization' }, publisher: { '@id': HOST + '/#organization' }
      },
      {
        '@type': 'Organization', '@id': HOST + '/#organization', name: 'KABS AI LABS', url: HOST + '/',
        logo: { '@type': 'ImageObject', url: HOST + '/assets/img/logo-kabs-black.png', width: 274, height: 90 }
      },
      {
        '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: HOST + '/' },
          { '@type': 'ListItem', position: 2, name: 'Work', item: HOST + '/case-studies' },
          { '@type': 'ListItem', position: 3, name: b.cardTitle, item: url }
        ]
      }
    ]
  };

  const related = [{ href: b.service.href, text: b.service.text }].concat(b.posts.map(p => ({ href: p.href, text: postTitle(p.href) })));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(docTitle)}</title>
<meta name="description" content="${esc(b.description)}">
${b.noindex ? '<meta name="robots" content="noindex, follow">\n' : ''}<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(b.cardTitle)}">
<meta property="og:description" content="${esc(b.description)}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="KABS AI LABS">
<meta property="og:image" content="${first.src}">
<meta property="og:image:width" content="${first.w}">
<meta property="og:image:height" content="${first.h}">
<meta property="og:image:alt" content="${esc(first.alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(b.cardTitle)}">
<meta name="twitter:description" content="${esc(b.description)}">
<meta name="twitter:image" content="${first.src}">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,300..900,0..100&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/styles.min.css">
<link rel="stylesheet" href="/assets/css/audit-patches.min.css">
<link rel="stylesheet" href="/assets/css/blog-post.min.css">
<script src="/assets/js/tagging.min.js" defer></script>
<script src="/assets/js/main.min.js" defer></script>
<script type="application/ld+json">
${ld(graph)}
</script>
</head>
<body data-path="/case-studies/${b.slug}" data-layout="default">
<a class="skip" href="#main">Skip to content</a>
<div id="site-header"><noscript><nav class="nojs-nav" aria-label="Primary"><a href="/">Home</a><a href="/services">Services</a><a href="/demo">Live demo</a><a href="/pricing">Pricing</a><a href="/case-studies">Work</a><a href="/blog">Blog</a><a href="/contact">Contact</a></nav></noscript></div>
<main id="main">
<div class="blogpost">
<article class="case-study"><div class="wrap">
<p class="kicker"><a href="/case-studies">Case study</a> &nbsp;&middot;&nbsp; ${esc(b.category)}</p>
<h1>${esc(b.title)}</h1>
<p class="cs-summary">${esc(b.summary)}</p>
<h2>The problem</h2>
${b.problem.map(p => '<p>' + esc(p) + '</p>').join('\n')}
<h2>How it works</h2>
${how}
<h2>What a person still handles</h2>
<ul class="plain">${b.human.map(h => '<li>' + esc(h) + '</li>').join('')}</ul>
<h2>Built with</h2>
<ul class="cs-tools">${b.tools.map(t => '<li>' + esc(t) + '</li>').join('')}</ul>
<p>${esc(b.builtWith)}</p>
<div class="cta">
<h2>Your build starts with the arithmetic.</h2>
<p>Bring a week of real examples to the free audit. We come back with the three worth doing first, what each is worth, and a fixed price. If a cheaper tool already covers it, we say so.</p>
<a class="btn" href="/audit">Book the free audit &#8594;</a>
</div>
<section class="related" aria-labelledby="related-h">
<h2 id="related-h">Related</h2>
<ul>
${related.map(r => '<li><a href="' + r.href + '">' + esc(r.text) + '</a></li>').join('\n')}
</ul>
<p><a href="/case-studies">All case studies</a></p>
</section>
</div></article>
</div>
</main>
<div id="site-footer"><noscript><nav class="nojs-nav" aria-label="Secondary"><a href="/pricing">Pricing</a><a href="/careers">Careers</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav></noscript></div>
</body>
</html>
`;
}

function hub(published) {
  const cats = [...new Set(published.map(b => b.category))].sort();
  const chips = '<div class="cs-filter" role="group" aria-label="Filter builds by category">' +
    '<button type="button" class="cs-chip on" data-i="" aria-pressed="true">All <span class="n">' + published.length + '</span></button>' +
    cats.map(c => '<button type="button" class="cs-chip" data-i="' + slugify(c) + '" aria-pressed="false">' + esc(c) +
      ' <span class="n">' + published.filter(b => b.category === c).length + '</span></button>').join('') + '</div>';
  return '\n' + chips + '\n<p class="cs-count" role="status" aria-live="polite">Showing all ' + published.length + ' builds</p>\n' +
    '<div class="gcard-grid">\n' + published.map(b => '<div class="cs-item" data-i="' + slugify(b.category) + '">' + card(b) + '</div>').join('\n') + '\n</div>\n';
}

/* ---- assemble ---- */
const seen = new Set();
for (const b of builds) { if (seen.has(b.slug)) throw new Error('duplicate slug ' + b.slug); seen.add(b.slug); }
const published = builds.filter(b => !b.noindex);
const out = {};
for (const b of builds) out['case-studies/' + b.slug + '.html'] = page(b);

const hubFile = 'case-studies.html';
const hubHtml = fs.readFileSync(hubFile, 'utf8');
const A = '<!-- CASE-STUDIES:START -->', Z = '<!-- CASE-STUDIES:END -->';
const ai = hubHtml.indexOf(A), zi = hubHtml.indexOf(Z);
if (ai < 0 || zi < ai) throw new Error('case-studies.html needs the CASE-STUDIES markers');
out[hubFile] = hubHtml.slice(0, ai + A.length) + hub(published) + hubHtml.slice(zi);

out['assets/data/portfolio-builds.json'] = JSON.stringify(published.map(b => ({
  slug: b.slug, title: b.cardTitle, industry: b.category, stack: b.tools, tagline: b.summary
})), null, 1) + '\n';

const norm = s => s.replace(/\r\n/g, '\n');
const stale = Object.entries(out).filter(([f, c]) => !fs.existsSync(f) || norm(fs.readFileSync(f, 'utf8')) !== norm(c)).map(([f]) => f);
const strays = fs.existsSync('case-studies') ? fs.readdirSync('case-studies').filter(f => f.endsWith('.html') && !seen.has(f.replace(/\.html$/, ''))) : [];
if (CHECK) {
  if (stale.length || strays.length) {
    console.error('case studies out of date, run node scripts/build-case-studies.js');
    stale.forEach(f => console.error('  stale: ' + f)); strays.forEach(f => console.error('  not in content file: case-studies/' + f));
    process.exit(1);
  }
  console.log('case studies are current (' + published.length + ' published, ' + (builds.length - published.length) + ' noindex)');
  process.exit(0);
}
fs.mkdirSync('case-studies', { recursive: true });
for (const [f, c] of Object.entries(out)) if (stale.includes(f)) fs.writeFileSync(f, c);
for (const f of strays) console.warn('note: case-studies/' + f + ' is not in the content file');
console.log(published.length + ' published, ' + (builds.length - published.length) + ' noindex, ' + stale.length + ' files written');
