# KABS AI LABS — audit fix package

Everything from the audit that I could build without access to your repo. Drop these
into your project, run one script, fill in the blanks I've marked, and deploy.

**Estimated time: 2–3 hours**, most of which is you writing your own About copy.

---

## What's in here

```
vercel.json                        security headers + asset caching   (MERGE, don't replace)
api/submit-form.js                 real form handler                  (new file)
assets/js/main.js                  patched — replaces yours           (replace)
assets/css/audit-patches.css       CSS overrides                      (new file)
thank-you.html                     post-submit page                   (new file)
about.html                         rewritten, blanks marked           (replace)
privacy.html                       rewritten, blanks marked           (replace)
sitemap.xml                        adds /demo, adds lastmod           (replace)
scripts/apply-audit-fixes.mjs      bulk fixes across all 37 pages     (run once)
```

---

## Order of operations

### 1. Branch first

```bash
git checkout -b audit-fixes
```

Everything below is reversible if you do this.

### 2. Copy the files in

Match the paths above relative to your project root. **`vercel.json` is the exception** —
you almost certainly already have one (your URLs are extensionless, which means
`cleanUrls` or a rewrites block is already configured). Open both, copy the `headers`
array from mine into yours, and leave your existing config alone.

### 3. Run the bulk script

```bash
node scripts/apply-audit-fixes.mjs            # dry run — shows what would change
node scripts/apply-audit-fixes.mjs --write
git diff
```

Eight fixes across every `.html` file:

| Fix | What it does |
|---|---|
| `og-image-png` | `og-image.svg` → `og-image.png` + adds `og:image:type`. SVG previews don't render on LinkedIn, Slack, WhatsApp or X. |
| `img-lazy` | Adds `loading="lazy" decoding="async"` where missing. Your homepage had these; the service pages didn't. |
| `heading-order` | Promotes `<h4>` inside `<main>` to `<h3 class="as-h4">`. Fixes the h2→h4 skip. The CSS patch preserves the exact previous sizing. |
| `form-endpoint` | Strips `action="mailto:"` and points forms at `/api/submit-form`. |
| `form-autocomplete` | Adds `autocomplete` and `inputmode` to name/email/company/website fields. |
| `dead-blog-pills` | Removes the "Learn more" pills pointing at your empty blog. |
| `noscript-nav` | Adds `/demo` to the no-JS nav fallback. |
| `patch-css` | Links `audit-patches.css` after `styles.css`. |

Verified against your actual markup before shipping. Add `--backup` if you want `.bak` copies.

### 4. Make the OG image

The script points every page at `/assets/img/og-image.png`. **You need to create it** —
1200×630 PNG. If you have the SVG, `rvg-convert` or any design tool will export it.
Until this file exists, social previews stay broken.

While you're there: export a 512×512 `logo-512.png` and update `Organization.logo` in
your JSON-LD. It currently points at `favicon.svg`, which Google may ignore for the
knowledge panel.

### 5. Configure the form handler

In Vercel → Settings → Environment Variables:

```
RESEND_API_KEY    re_xxxxx          # resend.com, free tier is 3,000/mo
LEAD_TO_EMAIL     hello@kabsailabs.com
LEAD_FROM_EMAIL   website@kabsailabs.com   # must be a verified domain in Resend
LEAD_WEBHOOK_URL  https://kabsailabs.app.n8n.cloud/webhook/...   # optional
```

That last one is worth doing. You have n8n running already — wiring your own lead
form into your own workflow engine is both better ops and a story you can tell on a
sales call.

Test after deploying: submit `/contact`, confirm the email lands, confirm you get
redirected to `/thank-you`.

### 6. Fill in the blanks

Every placeholder is marked `[LIKE THIS]`. Search for `[` across the three files:

- **`assets/js/main.js`** — `CONFIG.social.linkedin` and `CONFIG.social.x`.
  Leave them empty and the icons simply don't render. That's deliberate — no icon
  beats an icon that goes to `linkedin.com`.
- **`about.html`** — founder name, headshot, bio, LinkedIn, location, year founded,
  registered entity, and the self-hosting section.
- **`privacy.html`** — company name, registered address, jurisdiction, retention
  periods, and Retell's actual retention setting on your account.

---

## The manual edits — things a script shouldn't touch

### 🔴 A. Remove the fake counter and activity feed — `index.html`

The inline `<script>` at the bottom of your homepage runs
`val += Math.floor(Math.random()*8)+2` every 700ms and invents "recent activity"
from a hardcoded array. **Delete that entire IIFE**, then replace the `live-band`
section markup with something true:

```html
<section class="section" style="padding-top:0"><div class="container">
  <div class="live-band">
    <span class="lb-eyebrow">We free people from busywork</span>
    <div class="live-counter"><span data-target="1284560" data-suffix="" data-comma="1">1,284,560</span></div>
    <div class="lb-label">repetitive tasks automated to date</div>
    <p style="margin-top:18px;font-size:13px;color:var(--faint)">
      Measured across all client workflows since [YEAR]. Updated [MONTH YEAR].
    </p>
  </div>
</div></section>
```

This reuses your existing `countUp()` animation, so it still counts up on scroll —
it just counts up to a number that's real and then stops. Same visual energy, none
of the risk. **If you can't defend 1,284,560, use a number you can.** A verified
1,284 is worth more than an invented 1.2 million.

The same applies to `500+ workflows / 30k+ hours / 120+ projects / 98% satisfaction`.
Those appear in your homepage FAQ **schema**, which means you're submitting them to
Google as machine-readable factual claims. Either substantiate them or soften the
wording.

### 🔴 B. Remove the fake testimonial — `services/voice-ai.html`

```html
<figcaption><b>Owner</b> · illustrative home-services company</figcaption>
```

Delete the whole `<figure class="quote">` block. A testimonial captioned
"illustrative" tells the reader you have no real ones. Check the other nine service
pages for the same pattern.

### 🔴 C. Delete the leaked dev comment — `blog.html`

```html
<p>Duplicate <span class="mono">/blog/template.html</span> for each new post, then add a card here.</p>
```

That's internal instructions published to visitors. Also check whether
`https://www.kabsailabs.com/blog/template.html` is publicly reachable and remove it
if so.

### 🟠 D. Link `/demo` from the homepage hero — `index.html`

The nav now includes it, but the hero is where it matters:

```html
<div class="btn-row">
  <a class="btn btn-primary" href="/audit" data-cta>Book a free consultation →</a>
  <a class="btn btn-ghost" href="/demo">Talk to a live AI agent →</a>
</div>
```

Add the same to `/services/voice-ai`, `/services/ai-for-trades`, and
`/industries/plumbers`. Right now the voice-AI page has a fake testimonial about a
voice agent and no link to the real one sitting at `/demo`.

### 🟠 E. Rate-limit `/api/create-web-call`

I deliberately didn't test this — a POST would have minted a billable Retell session.
But the client code calls it with no auth and no challenge, so anyone can script it
and burn your Retell balance.

Add the same in-memory rate limiter from `api/submit-form.js` (2–3 sessions per IP
per hour), restrict CORS to your own origin, and **set a hard monthly spend cap in
the Retell dashboard** as a backstop.

Also on `/demo`, in `renderTranscript()`:

```js
// currently: transcriptEl.innerHTML = items.map(...)  — renders remote content unescaped
// use textContent per line instead
```

### 🟡 F. Decide what `/demonstration` is

If it's a **private client proposal**: move it to `/proposals/{slug}`, add
`<meta name="robots" content="noindex">`, remove it from the nav, and delete both
entries from the sitemap.

If it's a **public landing page**: give it the site template, add a meta description
and canonical, pair it with `/demonstration-en` via `hreflang`, and externalise those
base64 fonts — they're pushing the document past 150KB before any content loads.

Either way, fix the pricing contradiction. It says "à partir de 400 €/mois" and then
"la plupart des plombiers se situent entre 300 et 400 €/mois" a few lines later.

---

## After deploying — verify

```bash
# security headers
curl -sI https://www.kabsailabs.com/ | grep -iE 'content-security|x-content-type|referrer|permissions'

# no analytics cookie before consent — open in a clean profile,
# check Application → Cookies. Should be empty until you click Accept.

# form
# submit /contact, confirm email arrives, confirm redirect to /thank-you
```

Then run PageSpeed Insights on `/` and `/services/voice-ai`. Every performance
finding in the audit was a structural prediction — this is where you find out how
close I was. The CLS number is the one to watch: the header is still injected by
JS, and `audit-patches.css` only reserves space for it. **The real fix is
server-rendering the header and footer**, which needs a build step I couldn't add
from outside.

---

## What I could not do

| | Why |
|---|---|
| Server-render the header/footer | Needs a static site generator or build step in your repo |
| Verify anything visually | No browser, no screenshots — CSS read from source |
| Test the mobile fixes | Same. The counter overflow fix is arithmetic, not observation |
| Write your About copy | Only you know it |
| Produce a real case study | Needs a real client and their sign-off |
| Confirm `/api/create-web-call` is exploitable | Testing it would have cost you money |
