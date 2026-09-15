/* ============================================================
   Proof gallery
   Renders the real portfolio builds from /assets/data/portfolio-builds.json
   into any <div data-gallery="<set>"> on the page.

     <div data-gallery="rag"></div>
     <div data-gallery="workflow" data-gallery-cta="See the workflows we've shipped"></div>

   Five builds or fewer render as a static grid of .gcard, because a handful of
   real builds reads better standing still. More than five render as the dark
   two column scroller, .port-glass, which the CSS pauses on hover and stops
   entirely under prefers-reduced-motion.

   The sets below are explicit slug lists rather than a filter over the industry
   field, because the pages were designed around particular builds: the RAG page
   shows five, only four of which carry RAG in their stack. Editing a set here
   changes that page's gallery.
   ============================================================ */
(function () {
  var DATA_URL = '/assets/data/portfolio-builds.json';
  var PORTFOLIO = 'https://babar-portfolio-sigma.vercel.app';

  var SETS = {
    /* /services/ai-automation — agent, support and lead builds */
    agents: [
      'rag-support-agent-human-handoff',
      'whatsapp-ai-support-agent-rag-human-handoff',
      'ai-customer-support-agent-for-e-commerce-order-lookups-returns-product-q-and-a-a',
      'ai-ticket-triage-n8n-fastapi',
      'ai-powered-rag-chatbot-for-the-fast-bite-seamless-ordering-and-query-handling',
      'ai-voice-receptionist-for-plumbing-businesses',
      'voice-agent-rag-post-call-automation',
      'ai-lead-capture-qualification',
      'ai-powered-lead-tracking-and-follow-ups',
      'ai-inquiry-triage-smart-routing-real-estate',
      'event-driven-order-automation-fastapi-n8n',
      'automated-returns-review-engine'
    ],
    /* /services/workflow-automation — Commerce, Scheduling & Ops, Documents & Finance, Lifecycle & Revenue */
    workflow: [
      'event-driven-order-automation-fastapi-n8n',
      'ai-powered-automating-calls-and-meeting-scheduling',
      'automated-heli-and-pilot-scheduling-bokun-google-calendar-deterministic',
      'ai-invoice-extraction-pipeline',
      'two-source-reconciliation-workflow',
      'post-purchase-subscriber-lifecycle-automation-gohighlevel',
      'ai-voice-receptionist-for-plumbing-businesses',
      'whatsapp-ai-support-agent-rag-human-handoff',
      'ai-customer-support-agent-for-e-commerce-order-lookups-returns-product-q-and-a-a',
      'voice-agent-rag-post-call-automation',
      'ai-powered-lead-tracking-and-follow-ups',
      'automated-returns-review-engine'
    ],
    /* /services/rag-knowledge-base — the five retrieval builds */
    rag: [
      'rag-support-agent-human-handoff',
      'whatsapp-ai-support-agent-rag-human-handoff',
      'ai-powered-rag-chatbot-for-the-fast-bite-seamless-ordering-and-query-handling',
      'voice-agent-rag-post-call-automation',
      'ai-customer-support-agent-for-e-commerce-order-lookups-returns-product-q-and-a-a'
    ],
    /* /services/ai-for-trades — voice and the paperwork that follows a call */
    voice: [
      'ai-voice-receptionist-for-plumbing-businesses',
      'voice-agent-rag-post-call-automation',
      'ai-powered-automating-calls-and-meeting-scheduling',
      'ai-invoice-extraction-pipeline',
      'payroll-and-invoice-validation-engine'
    ],
    /* /services/industries/marketing-agencies — Content & Campaigns, Lead & Sales, Scheduling & Ops */
    agencies: [
      'ai-powered-automated-email-campaign-testing-and-reporting',
      'ai-powered-social-post-generator-from-spreadsheet-to-socials-in-seconds',
      'smart-ai-podcast-audio-script-generator-from-bbc-news',
      'ai-lead-capture-qualification',
      'ai-powered-lead-tracking-and-follow-ups',
      'ai-inquiry-triage-smart-routing-real-estate'
    ],
    /* /services/industries/real-estate */
    realestate: [
      'ai-inquiry-triage-smart-routing-real-estate',
      'ai-lead-capture-qualification',
      'ai-powered-lead-tracking-and-follow-ups',
      'ai-powered-automating-calls-and-meeting-scheduling'
    ],
    /* /services/industries/saas — the dunning, win-back and lifecycle builds lead */
    saas: [
      'failed-payment-recovery-automated-dunning-gohighlevel',
      'cancellation-win-back-automated-reactivation-gohighlevel',
      'post-purchase-subscriber-lifecycle-automation-gohighlevel',
      'refill-reminder-preventing-the-gap-gohighlevel',
      'lead-capture-and-follow-up-automation-in-gohighlevel',
      'ai-ticket-triage-n8n-fastapi'
    ],
    /* /services/industries/healthcare — receptionist, scheduling, RAG handoff */
    healthcare: [
      'ai-voice-receptionist-for-plumbing-businesses',
      'voice-agent-rag-post-call-automation',
      'ai-powered-automating-calls-and-meeting-scheduling',
      'rag-support-agent-human-handoff',
      'whatsapp-ai-support-agent-rag-human-handoff'
    ],
    /* /industries/plumbers */
    plumbers: [
      'ai-voice-receptionist-for-plumbing-businesses',
      'voice-agent-rag-post-call-automation',
      'ai-powered-automating-calls-and-meeting-scheduling',
      'ai-invoice-extraction-pipeline'
    ]
  };

  /* A stack entry only gets an <img> when we actually ship that logo. Asking for
     one we do not have would still render, because of the onerror below, but it
     costs a request and puts a 404 in the console on every page view. The names
     that resolve to nothing, RAG, FastAPI, WhatsApp, Bokun, JobAdder, render as
     a text chip, which is what the design intends for them anyway. */
  var HAVE_LOGO = {
    airtable: 1, calendar: 1, claude: 1, ga4: 1, gemini: 1, gmail: 1, gohighlevel: 1,
    googlecloud: 1, gtm: 1, hubspot: 1, huggingface: 1, langchain: 1, looker: 1, make: 1,
    microsoft365: 1, mongodb: 1, n8n: 1, notion: 1, openai: 1, perplexity: 1, pinecone: 1,
    postgresql: 1, powerbi: 1, python: 1, salesforce: 1, sheets: 1, shopify: 1, slack: 1,
    stripe: 1, supabase: 1, twilio: 1, zapier: 1
  };
  var LOGO = {
    'google sheets': 'sheets',
    'google calendar': 'calendar'
  };
  function logoFile(name) {
    var k = String(name).toLowerCase();
    var f = LOGO[k] || k.replace(/[^a-z0-9]+/g, '');
    return HAVE_LOGO[f] ? f : null;
  }

  /* One glyph for every card: the previews use the same node diagram throughout. */
  var THUMB = '<svg viewBox="0 0 40 40" fill="none">' +
    '<rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.6"/>' +
    '<rect x="24" y="5" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.6"/>' +
    '<rect x="24" y="27" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.6"/>' +
    '<path d="M16 13h4a4 4 0 0 1 4 4v0M16 13h4a4 4 0 0 0 4-4v0M24 31h-4a4 4 0 0 1-4-4v-6" stroke="currentColor" stroke-width="1.6"/></svg>';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function clip(s, n) {
    s = String(s == null ? '' : s);
    return s.length > n ? s.slice(0, n - 1).replace(/[\s,;:.]+$/, '') + '…' : s;
  }

  function chips(stack) {
    return (stack || []).map(function (s) {
      var f = logoFile(s);
      var img = f ? '<img src="/assets/img/logos/' + esc(f) + '.svg" alt="" onerror="this.remove()">' : '';
      return '<span class="pc">' + img + esc(s) + '</span>';
    }).join('');
  }

  function card(b, cls, taglineLimit) {
    var tag = taglineLimit && b.tagline ? '<p>' + esc(clip(b.tagline, taglineLimit)) + '</p>' : '';
    return '<a class="' + cls + '" href="' + PORTFOLIO + '/work/' + esc(b.slug) + '" target="_blank" rel="noopener">' +
      '<div class="pc-head"><span class="pc-tag">' + esc(b.industry) + '</span>' +
      '<span class="pc-thumb" aria-hidden="true">' + THUMB + '</span></div>' +
      '<h3>' + esc(b.title) + '</h3>' + tag +
      '<div class="pc-chips">' + chips(b.stack) + '</div>' +
      '<span class="pc-go">View build →</span></a>';
  }

  function head(label, total) {
    return '<div class="port-head">' +
      '<span class="ph-l"><span class="p"></span>' + esc(label) + '</span>' +
      '<a class="ph-all" href="' + PORTFOLIO + '" target="_blank" rel="noopener">All ' + total + ' builds →</a>' +
      '</div>';
  }

  /* The scroller loops by translating a column up by half its height, so each
     column has to carry its cards twice or the loop jumps. */
  function column(list, dur, rev) {
    var cards = list.map(function (b) { return card(b, 'pcard', 108); }).join('');
    return '<div class="port-col' + (rev ? ' rev' : '') + '" style="--dur:' + dur + '">' + cards + cards + '</div>';
  }

  function render(el, builds, total) {
    var label = el.getAttribute('data-gallery-label') || 'From the live portfolio';
    var variant = el.getAttribute('data-gallery-variant') ||
      (builds.length > 5 ? 'scroll' : 'static');
    var cta = el.getAttribute('data-gallery-cta');

    if (variant === 'static') {
      el.innerHTML = head(label, total) +
        '<div class="gcard-grid">' + builds.map(function (b) { return card(b, 'gcard', 150); }).join('') + '</div>';
      return;
    }

    /* Split round-robin so each column mixes categories rather than running one
       category down one side. */
    var cols = [[], [], []];
    builds.forEach(function (b, i) { cols[i % 3].push(b); });
    var durs = ['34s', '40s', '46s'];
    var glass = '<div class="port-glass" aria-label="Recent automation builds">' +
      cols.map(function (c, i) { return c.length ? column(c, durs[i], i === 1) : ''; }).join('') +
      '</div>';
    el.innerHTML = head(label, total) + glass +
      (cta ? '<a class="port-cta" href="' + PORTFOLIO + '" target="_blank" rel="noopener">' + esc(cta) + ' →</a>' : '');
  }

  function boot(all) {
    var index = {};
    all.forEach(function (b) { index[b.slug] = b; });
    var nodes = document.querySelectorAll('[data-gallery]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute('data-gallery');
      var slugs = SETS[key];
      if (!slugs) { el.remove(); continue; }
      var builds = slugs.map(function (s) { return index[s]; }).filter(Boolean);
      if (!builds.length) { el.remove(); continue; }
      el.classList.add('port');
      render(el, builds, all.length);
    }
  }

  /* A gallery that cannot load its data leaves nothing behind rather than an
     empty frame: the page still reads without it. */
  function start() {
    fetch(DATA_URL, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (Array.isArray(d) && d.length) boot(d); else drop(); })
      .catch(drop);
  }
  function drop() {
    var n = document.querySelectorAll('[data-gallery]');
    for (var i = 0; i < n.length; i++) n[i].remove();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
