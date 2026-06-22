# KABS AI LABS — website

A fast, static, multi-page site. No build step, no framework — just HTML, one CSS file, and one JS file. Edit any page directly and redeploy.

---

## Deploy to Vercel (5 minutes)

**Option A — drag & drop**
1. Go to https://vercel.com → **Add New → Project**.
2. Drag this whole folder (or the `.zip`) into the import screen.
3. Framework preset: **Other**. Build command: *(leave empty)*. Output dir: *(leave empty / `.`)*.
4. Click **Deploy**.

**Option B — Vercel CLI**
```bash
npm i -g vercel
cd kabs-site
vercel        # follow prompts, then `vercel --prod`
```

`vercel.json` is already set with `cleanUrls` so `/services` serves `services.html` automatically.

### Connect your domain (kabsailabs.com)
1. In the Vercel project: **Settings → Domains → Add** → `kabsailabs.com` (and `www.kabsailabs.com`).
2. Vercel shows you DNS records. In **Namecheap → Domain List → Manage → Advanced DNS**, add them:
   - Usually an **A record** `@ → 76.76.21.21`, and a **CNAME** `www → cname.vercel-dns.com`. (Use whatever Vercel actually displays — it's authoritative.)
3. Wait for DNS to propagate (minutes to a couple hours). Done — HTTPS is automatic.

> Note: your email (Namecheap Private Email) uses **MX** records, which are separate. Adding Vercel's A/CNAME records does **not** affect email.

---

## Where to edit things

| You want to change… | Edit this |
|---|---|
| Colors, fonts, spacing (whole site) | `assets/css/styles.css` → the `:root` tokens at the top |
| The header / nav / footer (one place for all pages) | `assets/js/main.js` |
| Your logo | `assets/img/logo.svg` **and** the `LOGO` variable in `assets/js/main.js` (the header uses the inline one) |
| Page content | the individual `.html` file for that page |

### Integration IDs (one place — top of `assets/js/main.js`)
```js
var CONFIG = {
  GTM_ID:       "",   // paste "GTM-XXXXXXX" to turn on Google Tag Manager / GA4 everywhere
  CALENDLY_URL: "",   // paste your Calendly link to make "Book a call" buttons open a popup
  whatsapp:     "14068677425",
  email:        "hello@kabsailabs.com"
};
```
- **GTM / GA4:** set `GTM_ID` once → it loads on every page. (Put your GA4 tag inside GTM.)
- **Calendly:** set `CALENDLY_URL` → every `data-cta` button opens the popup. If left empty, those buttons go to `/audit` instead.
- **WhatsApp:** the floating chat button and footer already point to `+1 406 867 7425`.

### Forms (Contact, Audit, Agency Partner, Lead magnets)
Forms now **open the visitor's email client** (`mailto:hello@kabsailabs.com`) pre-filled with their answers — handled by `setupMailForms()` in `main.js`. No third-party form handler is required, and nothing is silently lost.
- To switch to a hosted handler later (Formspree, Basin, Web3Forms, your own endpoint), set each form's `action=` to your endpoint URL and remove the `data-mailto` attribute so the JS handler stops intercepting the submit.

---

## Adding blog posts & case studies
These were intentionally left empty for you.
- **New blog post:** copy `blog/template.html` → `blog/your-slug.html`, edit it, then add a card on `blog.html` (there's a copy-paste snippet commented inside that file).
- **New case study:** six example studies now live at `case-studies/{northwind-onboarding-agent, cedarbrook-intake-agent, maple-data-infrastructure, larkfield-lifecycle-automation, brightleaf-voice-ai, atlas-ai-receptionist}.html`, each labeled as an illustrative example. The cards on `case-studies.html` point to them. To add a real one, copy any of those (or `case-studies/template.html`, which is `noindex`) → `case-studies/your-slug.html`, edit it, add it to `sitemap.xml`, and link a card from `case-studies.html`.

With `cleanUrls`, `blog/your-slug.html` is served at `/blog/your-slug`.

---

## Page list (26 pages + 2 templates)
Core: `/`, `/services`, `/about`, `/contact`, `/blog`
Services: `/services/ai-automation`, `/services/workflow-automation`, `/services/analytics`, `/services/analytics/ga4-gtm`, `/services/gohighlevel-automation`, `/services/voice-ai`, `/services/white-label`
Industries: `/services/industries/{marketing-agencies, real-estate, ecommerce, saas, healthcare}`
Resources: `/case-studies`, `/resources/dental-ai-receptionist-blueprint`, `/resources/dental-front-desk-checklist`
Landing: `/lp/dental-voice-ai`
Conversion: `/audit`, `/contact/agency-partner`
Legal: `/terms`, `/privacy`  ·  Careers: `/careers`
Templates (empty): `/blog/template`, `/case-studies/template`

---

## Regenerating (optional)
The pages were produced by `build.py` (kept one level up, outside this folder). You don't need it — edit the HTML directly. But if you ever want to bulk-change structure, edit `build.py` and re-run `python3 build.py`.

## Before you go live — quick checklist
- [ ] Replace logo files + `LOGO` in `main.js`
- [ ] Set `GTM_ID` (Calendly is already wired to `https://calendly.com/babarlal-kabsailabs`)
- [ ] (Optional) Point forms at a hosted handler instead of `mailto:` — see Forms above
- [ ] Swap the illustrative case studies / stats for real ones as you ship them
- [ ] Export `assets/img/og-image.svg` to a 1200×630 **PNG** for full social-preview support (LinkedIn/X don't always render SVG), then update the `og:image`/`twitter:image` URLs
- [ ] Confirm the domain redirect: `kabsailabs.com` → `www.kabsailabs.com` (vercel.json handles it; also set www as primary in Vercel project domains)
- [ ] Have a professional review `/terms` and `/privacy`

## Tool logos (homepage)
Brand logos live in `assets/img/logos/` as individual SVG files. The marquee, the node diagram, and the orbiting-logo panel all pull from there — drop in or swap any `*.svg` to change them. These marks are the trademarks of their respective owners and are shown only to indicate the tools we integrate with; follow each brand's guidelines for your own use. The signal-pulse, orbit, and bar animations live in `styles.css` and respect "reduce motion" system settings.
