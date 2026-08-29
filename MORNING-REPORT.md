# Morning report

Branch `site-audit-fixes`, 21 commits, working tree clean. Nothing was deployed
and nothing was pushed. No Vercel command was run at any point.

Every bracket placeholder is exactly as you left it: 23 tokens across
`about.html`, `index.html` and `privacy.html`. Nothing was invented anywhere.

---

## 1. What was committed

Oldest first. Each commit stands alone and reverts cleanly.

### Phase 1, critical functionality

**`2e11988` Services dropdown stays open**
`.menu-panel` opens at `top: calc(100% + 14px)`. That 14px was dead space: the
cursor left `.has-menu`, `:hover` dropped, the panel closed before you reached
it. A transparent 14px `::before` on the panel now bridges the gap. It is a
descendant of `.has-menu`, so hover stays continuous, and it inherits
`visibility:hidden` when closed, so it never intercepts clicks on neighbouring
nav links. All 28 dropdown links were resolved against the file list: all exist.

**`5ec604f` Way back from both pitch pages**
Neither pitch page linked to `/`. The wordmark is now an anchor to `/`, and the
top strip carries "Back to website" and "Retour au site". Both use each page's
own embedded styles; the shared header is still not imported.

**`66a5c13` English page stops serving French audio**
`demonstration-en.html` reused the three French `.wav` files and its lead
admitted it. The `REC` array is now empty, so no French clip is injected, and a
marked placeholder points the visitor at `/demonstration` if they want to hear
the agent working today. Player machinery is intact: adding `{t,d,s}` entries
back renders the players again.

**`0a01dbf` Corrected the stale audio README**
It pointed at `assets/js/demo-player.js`, which does not exist anywhere. The
player is inline in `demonstration.html`. The three audio paths themselves
resolve and were never broken.

### Cleanup

**`bd99574` Removed the three duplicate pages under `/kabs-fixes`**
`about` and `privacy` were byte identical to the root copies; `thank-you`
differed by one missing stylesheet link. No inbound links, in no sitemap.

**`99291fb` `87c27af` `c42bd62` `ff95ddb` `04bceea` The blog reorganisation**
`blog.html` rendered an empty index; the real listing was `blog/index.html`,
outside the shared header with a non-www canonical. All 25 posts are now carded
on `/blog`, `blog/index.html` is deleted, every post's nav points at `/blog`,
every canonical was corrected, and all 25 posts are in the sitemap.

There are 25 posts, not 24 or 26. The old grid showed 24 and linked
`getting-started-with-ai-in-2026` from a sentence above it with no card.

**`93738b8` `8ac833c` `8c18411` `7bab370` `06d12dc` `d50866b` Posts on shared chrome**
`blog.css` could not simply load next to `styles.css`. It declared its own
`:root` tokens and styled bare `body`, `a`, `h1` to `h3`. Five token names
collide with different values, including `--radius` at 6px against the site's
14px, used in 45 places. Both declared them at `:root`, so load order alone
decided whether the article or the chrome rendered wrong.

`assets/css/blog-post.css` is the same rules with tokens moved onto `.blogpost`
and every selector scoped to it. Article styling reaches the article and stops
before the header and footer. Article text is byte identical on all 25, verified
against the previous commit; the only added text is the skip link. `blog.css` is
deleted, and the post template now matches the live posts.

### Phase 2

**`fcf83b7` Retired claims removed**
"Built for Scale & Speed" became "By the numbers". The "98% Client Satisfaction"
cell is gone, and the phrase was removed from the FAQ answer and from the
FAQPage JSON-LD, where it was being served to search engines. 500+, 30k+, 120+
and the 1,284,560 counter are untouched.

Layout: `.impact-side` declared three grid rows while holding two cells, on all
15 pages using the block. Removing the 98% cell would have exposed the gap, so
it is now two rows.

**`bb708f5` Charts rebuilt**
The bar block looked like a placeholder for two reasons. Four flat translucent
bars with no baseline, and an animation that was dead code: `revealBars()` only
observed `.impact-bars.anim`, and no page carried `anim`. Added a baseline,
gradient fills, a stronger accent bar, more room and an "Illustrative" note, all
via pseudo-elements so 14 pages pick it up with no markup change. `main.js` now
adds `.anim` itself, only when motion is allowed, so without JS or under
reduced motion the bars render at full height instead of collapsing to nothing.
No new dependency, no CSP change. `.analytics-viz` and `.ngraph` untouched.

**`872765d` Case-study template aligned**
The six live studies already share one spine. The template used "Technical
Implementation" where they use "How We Built It". Renamed, TOC updated, the
`cs-illus` illustrative note added, and the required spine documented. Nothing
populated.

**`a2446b9` `eeafc1b` Copy review**
42 replacements of shared boilerplate across 26 pages, then 189 text nodes
rewritten, then 45 repairs where the first pass left a comma joining two
independent clauses. Sentences were restructured, not repunctuated: a full stop
where two clauses stand alone, a colon where the dash introduced a list, a comma
only where the phrase is genuinely subordinate. One AI tell removed: the impact
lead read "our automation is built to deliver measurable ROI", which asserts
nothing.

Four homepage strings appear twice, in the visible FAQ and in the JSON-LD. Both
copies were updated together so the schema still matches the page.

---

## 2. Deliberately not done

**Everything you listed as off limits.** All 23 bracket placeholders, the French
persona on the English pitch page, the demo media block, the logo swap, the
portfolio case studies, and the homepage marquee.

**Phase 3 visual work: I made no speculative changes.** You authorised small
spacing and hierarchy fixes where the layout is visibly flat. I cannot render
the site, so "visibly flat" is not something I can judge from source without
guessing, and you said to leave judgment calls. Instead I looked for defects
provable from the code and found the motion system already sound:

- `scrollReveal()` is correctly guarded. `.reveal{opacity:0}` sits inside a
  `prefers-reduced-motion: no-preference` block and JS only adds the class when
  motion is allowed, so nothing is ever hidden with no way back.
- Focus states are covered. A global `a:focus-visible` rule reaches every card
  and link, and `.skip:focus` moves the skip link on screen.
- No colour seam on the blog posts: `--bg` and `--paper` are both `#ffffff`.

The one real defect in that area, the dead bar animation, is fixed in `bb708f5`.

**The French pitch page copy.** 20 prose dashes remain in `demonstration.html`.
Rewriting French sales copy is a judgment call and a clumsy edit there is
expensive. English pages are done.

---

## 3. What I need from you

### A. Real values, nothing can proceed without them

These are all still placeholders, untouched.

| Where | Token | Note |
|---|---|---|
| `about.html` JSON-LD | `[STREET]` `[CITY]` `[STATE]` `[ZIP]` `[COUNTRY CODE]` | **Served to Google as your registered address.** Highest priority on this list. |
| `about.html` JSON-LD | `[FOUNDER FULL NAME]` `[FOUNDER LINKEDIN URL]` `[COMPANY LINKEDIN URL]` | Also in `sameAs` |
| `about.html` visible | `[FOUNDER FULL NAME]` in an `<h3>` and an image `alt` | Visible on the live page |
| `about.html` visible | `[REAL QUOTE]` in a blockquote | Visible on the live page |
| `about.html` visible | `Building automation since [YEAR]. [N] projects delivered.` | |
| `about.html` | Two bracketed founder-bio paragraphs | |
| `index.html` | `Measured across all client workflows since [YEAR]. Updated [MONTH YEAR].` | |
| `privacy.html` | `[DATE]` `[JURISDICTION]` `[NUMBER]` `[X]` `[FULL ADDRESS]` | Legal page |

### B. Blocked on assets

1. **English demo media.** Drop the file in `assets/video/` or `assets/audio/`,
   then either add a `REC` entry or swap the `.demo-pending` block for a
   `<video>`. Three `TODO(asset)` markers mark the spots. If it is an embed
   rather than a file, `frame-src` in `vercel.json` needs the domain added.
2. **Logo set.** Skipped entirely as instructed.
3. **Portfolio case studies.** Template is ready; nothing fabricated.

### C. Decisions

1. **The English pitch page still sells to a French market.** "Plomberie
   Durand", a Lyon address, a French mobile number, and copy saying the agent
   "answers in natural French" and "switches to English on request". Left alone
   because changing it is a market decision, not a translation. Tell me which
   market that page is for.
2. **French pitch page dashes.** Rewrite them or leave them?
3. **`kabs-fixes/` still exists.** I removed only the three pages you approved.
   The rest is the previous audit's patch bundle: a README,
   `apply-audit-fixes.mjs`, and merge copies of `vercel.json`, `sitemap.xml`,
   `main.js`, `audit-patches.css` and `api/submit-form.js`. Its `vercel.json`
   carries a `_comment_MERGE` field and an older, narrower CSP. Nothing links to
   it, but `kabs-fixes/sitemap.xml` and the nested assets are still served. Say
   the word and it goes.
4. **Blog posts have no JSON-LD.** The template has `BlogPosting` and
   `BreadcrumbList`; the 25 live posts have neither. I did not add it because
   the schema wants `datePublished` and `dateModified` and the posts record no
   date. Give me dates, or say "omit the date fields" and I will add the rest.
5. **Blog posts have no breadcrumb.** Every other content page has one. Adding
   it is a small consistency win but it changes visible article content, so I
   left it.
6. **`.barchart` is dead CSS.** 11 rules in `styles.css`, no HTML uses it.
   Safe to delete on your word.
7. **`/blog` had two candidate files.** Resolved: `blog.html` is canonical.
   Worth knowing the old `blog/index.html` content is recoverable from git.
8. **Chart labels.** You asked for simple labels. I added none. The inline
   heights, 50 70 60 90, are relative shapes with no source, and putting numbers
   on them would give them a precision they do not have. They carry an
   "Illustrative" note instead. If you have real figures, they go in as
   `data-` attributes and I will label the bars properly.

---

## 4. Verification

Run across all 68 pages after the final commit:

- No div imbalance, no duplicate or unclosed `html` / `body` / `head` / `main`
- Every JSON-LD block parses
- No malformed HTML comments
- No broken internal links. The only two flagged are `REPLACE_PREV_SLUG` and
  `REPLACE_NEXT_SLUG` in `blog/template.html`, which are intended tokens
- Sitemap: 64 URLs, all unique, all www, none ending `.html`, every URL has a
  file and every blog post has a URL
- Neither retired claim appears anywhere in visible copy, FAQ text or schema
- `blog.css` gone, nothing references it
- 23 bracket placeholders present and unchanged
- `main.js` passes `node --check`; `styles.css`, `audit-patches.css` and
  `blog-post.css` have balanced braces

**Cannot be verified without a deploy or a browser:** the Retell web call on
`/demo`, Calendly, form submissions, analytics, actual rendering of the rebuilt
bars and the blog posts in Inter, and the dropdown hover bridge across browsers.
