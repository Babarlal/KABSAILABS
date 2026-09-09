/* ============================================================
   KABS AI LABS — site script (light theme)
   PATCHED per site audit, August 2026.

   Changes from the previous version:
   - GA4 now runs behind Consent Mode v2, denied by default. It no longer
     sets cookies before the visitor chooses. Cookie bar has Accept + Reject.
   - Forms POST to /api/submit-form instead of opening the visitor's mail
     client, then redirect to /thank-you for conversion tracking.
   - Booking popup fires on exit-intent, or after 45s + 50% scroll — not 5s.
     Suppressed on /audit, /contact, /demo and /thank-you.
   - Popup traps focus and restores it on close (was failing WCAG 2.4.3).
   - Footer social links come from CONFIG and are omitted when empty.
     No more links pointing at linkedin.com and x.com homepages.
   - /demo added to the nav.
   - Decorative emoji and dingbats get aria-hidden at runtime.
   - Marquees stop for prefers-reduced-motion users.
   ============================================================ */

/* ---------- CONFIG: edit these ---------- */
var CONFIG = {
  brand:        "KABS AI LABS",
  email:        "hello@kabsailabs.com",
  whatsapp:     "14068677425",                 // digits only, no + or spaces
  domain:       "kabsailabs.com",
  GTM_ID:       "",                            // "GTM-XXXXXXX" to enable GTM everywhere
  GA_ID:        "G-EMPMVS2NYX",
  CALENDLY_URL: "https://calendly.com/babarlal17/30min",
  ctaFallback:  "/audit",                      // used only if Calendly fails to load
  formEndpoint: "/api/submit-form",
  thankYouUrl:  "/thank-you",

  // TODO: fill these in. Leave a value empty and the icon is simply not rendered —
  // that is deliberate. A link to linkedin.com is worse than no link at all.
  social: {
    linkedin: "",   // e.g. "https://www.linkedin.com/company/kabs-ai-labs"
    x:        ""    // e.g. "https://x.com/kabsailabs"
  }
};

/* ---------- announcement bar items (edit freely) ---------- */
var ANNOUNCE = [
  "AI Voice Agents for Plumbers, HVAC &amp; Local Services",
  "Talk to our live AI receptionist. No phone call needed",
  "Agency Partners: Offer custom automation to your clients",
  "RAG &amp; Knowledge Base systems for Legal &amp; Medical docs"
];

/* ---------- nav model (edit links here) ---------- */
var NAV = {
  services: [
    ["AI Agents &amp; Automation", "/services/ai-automation"],
    ["Workflow Automation", "/services/workflow-automation"],
    ["RAG / Knowledge Base", "/services/rag-knowledge-base"],
    ["Voice AI Agents", "/services/voice-ai"],
    ["AI for Plumbers &amp; Trades", "/services/ai-for-trades"],
    ["AI for Legal &amp; Medical Docs", "/services/ai-legal-medical-docs"],
    ["Analytics", "/services/analytics"],
    ["GoHighLevel Automation", "/services/gohighlevel-automation"],
    ["White Label", "/services/white-label"]
  ],
  industries: [
    ["Plumbers", "/industries/plumbers"],
    ["Marketing Agencies", "/services/industries/marketing-agencies"],
    ["Real Estate", "/services/industries/real-estate"],
    ["eCommerce", "/services/industries/ecommerce"],
    ["SaaS Startups", "/services/industries/saas"],
    ["Healthcare", "/services/industries/healthcare"]
  ],
  resources: [
    ["Live AI Voice Demo", "/demo"],            // promoted: this is the best asset on the site
    ["Case Studies", "/case-studies"],
    ["Blog", "/blog"],
    ["AI Receptionist Blueprint", "/resources/dental-ai-receptionist-blueprint"],
    ["Front Desk Checklist", "/resources/dental-front-desk-checklist"],
    ["Démonstration (FR)", "/demonstration"],
    ["Demo walkthrough (EN)", "/demonstration-en"]
  ],
  company: [
    ["Careers", "/careers"],
    ["Contact", "/contact"],
    ["Agency Partners", "/contact/agency-partner"]
  ]
};

/* ---------- logo (black mark, for light backgrounds) ----------
   Header and footer both sit on light backgrounds (.site-header is white,
   .site-footer is --bg-tint #f4f6f8), so one black mark serves all three
   render points. The white file is at /assets/img/logo-kabs-white.png for
   whenever a dark section needs it.
   width/height are the file's real pixels (809x266) so the browser reserves
   the right box before the image loads; .logo img in styles.css scales it by
   height. Same file in header and footer, so the footer copy is a cache hit. */
var LOGO = '<img src="/assets/img/logo-kabs-black.png" alt="KABS AI LABS" width="809" height="266" loading="eager" decoding="async">';

/* ---------- helpers ---------- */
function reducedMotion(){
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}
function waLink(){
  var msg = encodeURIComponent("Hi KABS AI LABS. I came from " + CONFIG.domain + " and would like to chat.");
  return "https://wa.me/" + CONFIG.whatsapp + "?text=" + msg;
}
function col(title, items){
  return '<div class="foot-col"><h4>'+title+'</h4><ul>'+
    items.map(function(i){return '<li><a href="'+i[1]+'">'+i[0]+'</a></li>';}).join('')+'</ul></div>';
}
function menuCol(title, items){
  return '<div class="menu-col"><h5>'+title+'</h5>'+
    items.map(function(i){return '<a href="'+i[1]+'">'+i[0]+'</a>';}).join('')+'</div>';
}

/* ============================================================
   CONSENT — GA4 behind Consent Mode v2, denied by default.
   Nothing analytics-related loads until the visitor decides.
   ============================================================ */
window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }
window.gtag = gtag;

gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});

function readConsent(){
  try { return localStorage.getItem('kabsConsent'); } catch(e){ return null; }
}
function writeConsent(v){
  try { localStorage.setItem('kabsConsent', v); } catch(e){}
}

var gaLoaded = false;
function loadGA(){
  if (gaLoaded || !CONFIG.GA_ID) return;
  gaLoaded = true;
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + CONFIG.GA_ID;
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', CONFIG.GA_ID, { anonymize_ip: true });
}

function grantConsent(){
  writeConsent('granted');
  gtag('consent', 'update', {
    ad_storage: 'denied',          // we don't run ads; keep this denied
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted'
  });
  loadGA();
}
function denyConsent(){
  writeConsent('denied');
  gtag('consent', 'update', { analytics_storage: 'denied' });
}

// Returning visitor who already accepted
if (readConsent() === 'granted') grantConsent();

/* ---------- cookie / analytics notice ---------- */
function setupCookieNotice(){
  if (readConsent()) return;

  var bar = document.createElement('div');
  bar.className = 'cookie-bar';
  bar.setAttribute('role','region');
  bar.setAttribute('aria-label','Cookie notice');
  bar.innerHTML =
    '<span>We use analytics cookies to understand how the site is used. '
  + 'See our <a href="/privacy">Privacy Policy</a>.</span>'
  + '<span class="cookie-btns">'
  +   '<button type="button" class="cookie-no">Reject</button>'
  +   '<button type="button" class="cookie-ok">Accept</button>'
  + '</span>';

  var css = document.createElement('style');
  css.textContent =
    '.cookie-bar{position:fixed;left:16px;right:16px;bottom:16px;z-index:9998;max-width:680px;margin:0 auto;display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:center;background:#0f172a;color:#e7ecf5;border:1px solid #24304d;border-radius:12px;padding:12px 16px;font-family:Inter,system-ui,sans-serif;font-size:13.5px;line-height:1.5;box-shadow:0 20px 40px -20px rgba(15,23,42,.6)}'
  + '.cookie-bar a{color:#8fb2f0;text-decoration:underline}'
  + '.cookie-btns{display:flex;gap:8px;flex:none}'
  + '.cookie-ok,.cookie-no{min-height:44px;border-radius:8px;padding:10px 18px;font-weight:600;font-size:13.5px;cursor:pointer;font-family:inherit;border:1px solid transparent}'
  + '.cookie-ok{background:#2f6ad6;color:#fff}'
  + '.cookie-ok:hover{background:#2a5ec0}'
  + '.cookie-no{background:transparent;color:#c3cee2;border-color:#3a4766}'
  + '.cookie-no:hover{background:#1a2439;color:#e7ecf5}'
  + '@media(max-width:520px){.cookie-bar{bottom:88px}.cookie-btns{width:100%}.cookie-ok,.cookie-no{flex:1}}';
  document.head.appendChild(css);
  document.body.appendChild(bar);

  function close(){ if (bar.parentNode) bar.parentNode.removeChild(bar); }
  bar.querySelector('.cookie-ok').addEventListener('click', function(){ grantConsent(); close(); });
  bar.querySelector('.cookie-no').addEventListener('click', function(){ denyConsent(); close(); });
}

/* ---------- announcement bar ---------- */
function buildAnnounce(){
  var items = ANNOUNCE.map(function(t){
    return '<span><b>'+t+'</b><span class="arr" aria-hidden="true">&rarr;</span></span>';
  }).join('');
  return '<div class="announce"><div class="marquee-track">'+items+'</div></div>';
}

/* ---------- header ---------- */
function buildHeader(){
  var layout = document.body.getAttribute('data-layout') || 'default';
  if (layout === 'lp'){
    return '<header class="site-header"><div class="container"><div class="nav">'+
      '<a class="logo" href="/" aria-label="KABS AI LABS home">'+LOGO+'</a>'+
      '<div class="nav-right"><a class="btn btn-accent" href="'+(CONFIG.CALENDLY_URL||CONFIG.ctaFallback)+'" data-cta>Book a free demo</a></div>'+
    '</div></div></header>';
  }
  var mega = '<div class="menu-panel" id="services-menu" role="menu">'+
      menuCol('Services', NAV.services)+ menuCol('Industries', NAV.industries)+ menuCol('Resources', NAV.resources)+
    '</div>';
  return '<header class="site-header"><div class="container"><div class="nav">'+
    '<a class="logo" href="/" aria-label="KABS AI LABS home">'+LOGO+'</a>'+
    '<nav class="nav-main" aria-label="Primary">'+
      '<a class="nav-link" href="/">Home</a>'+
      '<div class="has-menu"><a class="nav-link" href="/services">Services</a>'+
        '<button type="button" class="menu-toggle" aria-haspopup="true" aria-expanded="false" aria-controls="services-menu" aria-label="Open Services menu"><span aria-hidden="true">&#9662;</span></button>'+
      mega+'</div>'+
      '<a class="nav-link" href="/demo">Live demo</a>'+
      '<a class="nav-link" href="/case-studies">Work</a>'+
    '</nav>'+
    '<div class="nav-right">'+
      '<a class="btn btn-ghost" href="/contact">Contact</a>'+
      '<a class="btn btn-primary" href="'+(CONFIG.CALENDLY_URL||CONFIG.ctaFallback)+'" data-cta>Book a call &rarr;</a>'+
      '<button class="hamburger" aria-label="Open menu" aria-expanded="false">&#9776;</button>'+
    '</div>'+
  '</div></div>'+
  '<div class="mobile-menu"><div class="container">'+
    '<a href="/">Home</a><a href="/services">Services</a><a href="/demo">Live demo</a><a href="/case-studies">Work</a><a href="/blog">Blog</a>'+
    '<div class="m-group">Services</div>'+ NAV.services.map(function(i){return '<a href="'+i[1]+'">'+i[0]+'</a>';}).join('') +
    '<div class="m-group">Industries</div>'+ NAV.industries.map(function(i){return '<a href="'+i[1]+'">'+i[0]+'</a>';}).join('') +
    '<div class="m-group">Company</div>'+ NAV.company.map(function(i){return '<a href="'+i[1]+'">'+i[0]+'</a>';}).join('') +
    '<a class="btn btn-primary btn-block" href="'+(CONFIG.CALENDLY_URL||CONFIG.ctaFallback)+'" data-cta>Book a call</a>'+
  '</div></div></header>';
}

/* ---------- footer ---------- */
function buildFooter(){
  var layout = document.body.getAttribute('data-layout') || 'default';
  var year = new Date().getFullYear();
  if (layout === 'lp'){
    return '<footer class="site-footer"><div class="container"><div class="foot-bottom">'+
      '<span>&copy; '+year+' '+CONFIG.brand+'. All rights reserved.</span><span class="mono">'+CONFIG.email+'</span>'+
    '</div></div></footer>';
  }

  // Only render social icons we actually have. An empty string renders nothing.
  var social = '<a href="'+waLink()+'" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">WA</a>';
  if (CONFIG.social.linkedin) social += '<a href="'+CONFIG.social.linkedin+'" target="_blank" rel="noopener" aria-label="KABS AI LABS on LinkedIn">in</a>';
  if (CONFIG.social.x)        social += '<a href="'+CONFIG.social.x+'" target="_blank" rel="noopener" aria-label="KABS AI LABS on X">X</a>';

  var q = encodeURIComponent("Summarize "+CONFIG.domain);
  var ai = '<div class="ai-summary"><span class="lbl">Ask AI about us</span>'+
      '<a href="https://chatgpt.com/?q='+q+'" target="_blank" rel="noopener">ChatGPT</a>'+
      '<a href="https://www.perplexity.ai/search?q='+q+'" target="_blank" rel="noopener">Perplexity</a>'+
      '<a href="https://claude.ai/new?q='+q+'" target="_blank" rel="noopener">Claude</a>'+
      '<a href="https://www.google.com/search?q='+q+'" target="_blank" rel="noopener">Google</a></div>';

  return '<footer class="site-footer"><div class="container">'+
    '<div class="foot-grid">'+
      '<div class="foot-brand"><a class="logo" href="/" aria-label="KABS AI LABS home">'+LOGO+'</a>'+
        '<p>AI agents, automation &amp; analytics that replace manual work and run 24/7.</p>'+
        '<div class="foot-social">'+social+'</div>'+
        // TODO: replace with your registered entity name and address.
        // Several EU jurisdictions require this, and it is the cheapest trust signal available.
        '<p class="foot-legal"><!-- KABS AI LABS LLC · [street], [city], [state] [zip] --></p>'+
      '</div>'+
      col('Services', NAV.services.slice(0,6))+ col('Industries', NAV.industries)+
      col('Resources', NAV.resources)+ col('Company', NAV.company)+
    '</div>'+ ai +
    '<div class="foot-bottom"><span>&copy; '+year+' '+CONFIG.brand+'. All rights reserved.</span>'+
      '<span><a href="/privacy">Privacy</a> &middot; <a href="/terms">Terms</a> &middot; <span class="mono">'+CONFIG.email+'</span></span>'+
    '</div></div></footer>';
}

/* ---------- floating whatsapp ---------- */
function buildFab(){
  return '<div class="fab"><a class="fab-btn" href="'+waLink()+'" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">'+
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.9.9-2.8-.2-.3A8 8 0 1 1 12 20zm4.6-6c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.2-.7.8-.8 1-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.6 4c2.1.8 2.1.6 2.5.5a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3z"/></svg>'+
    'Chat with us</a></div>';
}

/* ---------- GTM ---------- */
function loadGTM(){
  if (!CONFIG.GTM_ID || readConsent() !== 'granted') return;
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
    var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
    j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer',CONFIG.GTM_ID);
}

/* ---------- Vercel Speed Insights ---------- */
function loadSpeedInsights(){
  window.si = window.si || function(){ (window.siq = window.siq || []).push(arguments); };
  var s = document.createElement('script');
  s.defer = true;
  s.src = '/_vercel/speed-insights/script.js';
  document.head.appendChild(s);
}

/* ---------- Calendly ----------
   Loaded lazily on first intent rather than on every page view. */
var calendlyLoading = false;
function ensureCalendlyAssets(){
  if (calendlyLoading || !CONFIG.CALENDLY_URL) return;
  calendlyLoading = true;
  if (!document.querySelector('link[href*="assets.calendly.com/assets/external/widget.css"]')){
    var css=document.createElement('link');css.rel='stylesheet';css.href='https://assets.calendly.com/assets/external/widget.css';document.head.appendChild(css);
  }
  if (!window.Calendly && !document.querySelector('script[src*="assets.calendly.com/assets/external/widget.js"]')){
    var js=document.createElement('script');js.src='https://assets.calendly.com/assets/external/widget.js';js.async=true;document.head.appendChild(js);
  }
}
function openCalendly(){
  if (window.Calendly && window.Calendly.initPopupWidget){
    window.Calendly.initPopupWidget({url: CONFIG.CALENDLY_URL});
  } else {
    window.open(CONFIG.CALENDLY_URL, "_blank", "noopener");
  }
  if (window.gtag) gtag('event', 'booking_widget_open', { method: 'calendly' });
}
function setupCalendly(){
  if (!CONFIG.CALENDLY_URL) return;
  var ctas = document.querySelectorAll('[data-cta]');
  if (!ctas.length) return;

  // Preload assets when the visitor shows intent, not on page load.
  var warm = function(){ ensureCalendlyAssets(); };
  ctas.forEach(function(el){
    el.addEventListener('mouseenter', warm, {once:true});
    el.addEventListener('focus', warm, {once:true});
    el.addEventListener('touchstart', warm, {once:true, passive:true});
    el.addEventListener('click', function(e){
      ensureCalendlyAssets();
      if (window.Calendly){ e.preventDefault(); openCalendly(); }
      // else: the href fallback takes over, exactly as before
    });
  });
}

/* ---------- interactions ---------- */
function setupNav(){
  var path = document.body.getAttribute('data-path');
  document.querySelectorAll('.nav-link, .menu-col a').forEach(function(a){
    if (a.getAttribute('href') === path) a.setAttribute('aria-current','page');
  });
  var burger = document.querySelector('.hamburger'), menu = document.querySelector('.mobile-menu');
  if (burger && menu){
    burger.addEventListener('click', function(){
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true':'false');
      burger.innerHTML = open ? '&times;' : '&#9776;';
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }
  var hasMenu = document.querySelector('.has-menu'),
      mToggle = hasMenu && hasMenu.querySelector('.menu-toggle');
  if (hasMenu && mToggle){
    var setOpen = function(open){ hasMenu.classList.toggle('open', open); mToggle.setAttribute('aria-expanded', open ? 'true' : 'false'); };
    mToggle.addEventListener('click', function(){ setOpen(!hasMenu.classList.contains('open')); });
    document.addEventListener('click', function(e){ if (!hasMenu.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && hasMenu.classList.contains('open')){ setOpen(false); mToggle.focus(); } });
  }
}

/* Marquees: don't duplicate content (and don't animate) for reduced-motion users. */
function duplicateMarquees(){
  if (reducedMotion()) {
    document.querySelectorAll('.marquee, .marquee-track, .tool-track').forEach(function(t){
      t.classList.add('marquee-static');
    });
    return;
  }
  document.querySelectorAll('.marquee-track, .tool-track').forEach(function(t){ t.innerHTML += t.innerHTML; });
}

/* Hide decorative glyphs from assistive tech. These carry no information —
   the adjacent text does — but screen readers announce them by name. */
function hideDecorativeGlyphs(){
  var sel = '.ic,.ibic,.bic,.why-ic,.fr-ic,.sparkle,.ck,.mk,.arr,.pm,.fic,.chat-av,.pdot,.up,.n';
  document.querySelectorAll(sel).forEach(function(el){
    if (!el.hasAttribute('aria-hidden')) el.setAttribute('aria-hidden','true');
  });
}

function countUp(){
  var els = document.querySelectorAll('[data-target]');
  if (!('IntersectionObserver' in window) || !els.length) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      var el=en.target, target=parseFloat(el.getAttribute('data-target')), suffix=el.getAttribute('data-suffix')||'', comma=el.getAttribute('data-comma'), t0=performance.now();
      function fmt(n){return comma? n.toLocaleString('en-US') : ''+n;}
      function tick(now){var p=Math.min((now-t0)/1000,1);el.textContent=fmt(Math.round(target*p))+suffix;if(p<1)requestAnimationFrame(tick);}
      if (reducedMotion()) { el.textContent = fmt(target)+suffix; }
      else { requestAnimationFrame(tick); }
      io.unobserve(el);
    });
  }, {threshold:.5});
  els.forEach(function(el){ io.observe(el); });
}

function revealBars(){
  /* The selector used to require .anim, which no page ever set, so the bars
     never animated. main.js adds .anim itself now, and only when motion is
     allowed: without JS or with reduced motion the bars stay at full height
     instead of collapsing to scaleY(0) with nothing to restore them. */
  var els = document.querySelectorAll('.barchart, .impact-bars');
  if(!els.length) return;
  if(!('IntersectionObserver' in window) || reducedMotion()) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  }, {threshold:.35});
  els.forEach(function(el){ el.classList.add('anim'); io.observe(el); });
}

function scrollReveal(){
  if(!('IntersectionObserver' in window)) return;
  if(reducedMotion()) return;
  var sel = '.section-head,.build-panel>div,.card,.impact-big,.impact-cell,'
          + '.impact-banner,.voice-card,.step,.flow-step,.cs-figure,.quote,.compare>.col,'
          + '.live-band,.case-band,.feedback,.related-grid>*,.learn-pills';
  var els = [].slice.call(document.querySelectorAll(sel));
  if(!els.length) return;
  els.forEach(function(el){ el.classList.add('reveal'); });
  els.forEach(function(el){
    var sibs = [].slice.call(el.parentNode.children).filter(function(c){ return c.classList.contains('reveal'); });
    var i = sibs.indexOf(el);
    if(i > 0) el.style.setProperty('--rd', (Math.min(i,4) * 0.06) + 's');
  });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      var el = en.target;
      el.classList.add('in');
      io.unobserve(el);
      el.addEventListener('animationend', function(){ el.classList.remove('reveal','in'); el.style.removeProperty('--rd'); }, {once:true});
    });
  }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(el){ io.observe(el); });
}

function respectReducedMotion(){
  if(!reducedMotion()) return;
  document.querySelectorAll('animate, animateMotion, animateTransform').forEach(function(a){ a.remove(); });
}

function setupShare(){
  var boxes = document.querySelectorAll('.share'); if(!boxes.length) return;
  var url = location.href.split('#')[0];
  var title = (document.querySelector('h1') ? document.querySelector('h1').textContent : document.title).trim();
  var u = encodeURIComponent(url), t = encodeURIComponent(title);
  boxes.forEach(function(box){
    box.querySelectorAll('a[data-share]').forEach(function(a){
      var kind = a.getAttribute('data-share');
      if (kind === 'linkedin'){
        a.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + u;
        a.target = '_blank'; a.rel = 'noopener';
      } else if (kind === 'x'){
        a.href = 'https://twitter.com/intent/tweet?url=' + u + '&text=' + t;
        a.target = '_blank'; a.rel = 'noopener';
      } else if (kind === 'copy'){
        a.href = url;
        a.addEventListener('click', function(e){
          e.preventDefault();
          var done = function(){ var o=a.textContent; a.textContent='✓'; setTimeout(function(){ a.textContent=o; }, 1200); };
          if (navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(url).then(done, function(){}); }
          else { window.prompt('Copy this link:', url); }
        });
      }
    });
  });
}

/* ============================================================
   FORMS — real submission.
   Previously these opened the visitor's mail client and hoped
   they finished the job. Now they POST to /api/submit-form.
   ============================================================ */
function setupForms(){
  var forms = document.querySelectorAll('form[data-mailto], form[data-form]');
  forms.forEach(function(form){
    form.removeAttribute('action');
    form.removeAttribute('enctype');
    form.setAttribute('method','post');
    form.setAttribute('novalidate','');

    // honeypot
    if (!form.querySelector('input[name="website_url"]')){
      var hp = document.createElement('div');
      hp.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden';
      hp.setAttribute('aria-hidden','true');
      hp.innerHTML = '<label>Leave this empty<input type="text" name="website_url" tabindex="-1" autocomplete="off"></label>';
      form.appendChild(hp);
    }

    var status = form.querySelector('.form-status');
    if (!status){
      status = document.createElement('p');
      status.className = 'form-status';
      status.setAttribute('role','status');
      status.setAttribute('aria-live','polite');
      var note = form.querySelector('.form-note');
      if (note) note.parentNode.insertBefore(status, note);
      else form.appendChild(status);
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (form.reportValidity && !form.reportValidity()) return;

      var btn = form.querySelector('button[type="submit"], button:not([type])');
      var original = btn ? btn.textContent : '';
      if (btn){ btn.disabled = true; btn.textContent = 'Sending…'; }
      status.className = 'form-status';
      status.textContent = '';

      var data = {};
      form.querySelectorAll('input, textarea, select').forEach(function(el){
        if (!el.name || el.type === 'submit') return;
        data[el.name] = el.value;
      });
      var subj = form.querySelector('input[name="_subject"]');
      data._form = subj ? subj.value : (document.body.getAttribute('data-path') || 'website');
      data._page = location.href;

      fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(function(r){ return r.json().catch(function(){ return {ok:false}; }).then(function(j){ return {status:r.status, body:j}; }); })
      .then(function(res){
        if (res.body && res.body.ok){
          if (window.gtag) gtag('event', 'generate_lead', { form: data._form });
          window.location.href = CONFIG.thankYouUrl;
          return;
        }
        throw new Error((res.body && res.body.error) || 'Something went wrong.');
      })
      .catch(function(err){
        status.className = 'form-status is-error';
        status.textContent = err.message + ' You can also email us directly at ' + CONFIG.email + '.';
        if (btn){ btn.disabled = false; btn.textContent = original; }
      });
    });
  });
}

function setupTOC(){
  var toc = document.querySelector('.toc'); if(!toc) return;
  var links = toc.querySelectorAll('a'); if(!links.length) return;
  var map = {};
  links.forEach(function(a){ var id=a.getAttribute('href').slice(1); var t=document.getElementById(id); if(t) map[id]=a; });
  if(!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        links.forEach(function(l){l.classList.remove('active');});
        if(map[en.target.id]) map[en.target.id].classList.add('active');
      }
    });
  }, {rootMargin:'-90px 0px -65% 0px'});
  Object.keys(map).forEach(function(id){ io.observe(document.getElementById(id)); });
  var bar = toc.querySelector('.bar i'), pct = toc.querySelector('.pct');
  var body = document.querySelector('.cs-body');
  if (bar && body){
    var update = function(){
      var rect = body.getBoundingClientRect();
      var total = rect.height - window.innerHeight + 200;
      var done = Math.min(Math.max(-rect.top + 120, 0), total);
      var p = total > 0 ? Math.round(done/total*100) : 0;
      bar.style.width = p + '%'; if(pct) pct.textContent = p + '%';
    };
    window.addEventListener('scroll', update, {passive:true}); update();
  }
}

/* Ensure the skip link exists even on pages that forgot it (e.g. /404). */
function ensureSkipLink(){
  if (document.querySelector('a.skip')) return;
  if (!document.getElementById('main')) return;
  var a = document.createElement('a');
  a.className = 'skip'; a.href = '#main'; a.textContent = 'Skip to content';
  document.body.insertBefore(a, document.body.firstChild);
}

/* ---------- init ---------- */
document.addEventListener('DOMContentLoaded', function(){
  var layout = document.body.getAttribute('data-layout') || 'default';
  var h=document.getElementById('site-header');
  if(h){ h.innerHTML = (layout!=='lp' ? buildAnnounce() : '') + buildHeader(); }
  var f=document.getElementById('site-footer'); if(f) f.innerHTML=buildFooter();
  if (layout !== 'lp'){ document.body.insertAdjacentHTML('beforeend', buildFab()); }

  ensureSkipLink();
  setupNav();
  duplicateMarquees();
  hideDecorativeGlyphs();
  countUp();
  revealBars();
  scrollReveal();
  setupTOC();
  setupShare();
  setupForms();
  setupCalendly();
  loadGTM();
  loadSpeedInsights();
  respectReducedMotion();
  setupCookieNotice();
});

/* ============================================================
   BOOKING POPUP
   Was: every page, every visit, 5 seconds after load.
   Now: exit-intent, or 45s dwell + 50% scroll. Once per session.
   Never on pages where the visitor is already converting.
   Focus is trapped inside the dialog and restored on close.
   ============================================================ */
(function(){
  var SUPPRESS_ON = ['/audit', '/contact', '/demo', '/thank-you', '/contact/agency-partner'];
  var DWELL_MS    = 45000;
  var SCROLL_PCT  = 0.5;
  var WA_MSG      = "Hi KABS AI LABS, I'd like to book a quick call about automating my business.";

  var path = (document.body && document.body.getAttribute('data-path')) || location.pathname;
  if (SUPPRESS_ON.indexOf(path) !== -1) return;
  if ((document.body && document.body.getAttribute('data-layout')) === 'lp') return;
  try { if (sessionStorage.getItem("kabsPopShown")) return; } catch(e){}

  var waHref = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(WA_MSG);
  var dwellMet = false, scrollMet = false, fired = false, lastFocus = null;

  setTimeout(function(){ dwellMet = true; }, DWELL_MS);
  window.addEventListener('scroll', function(){
    var h = document.documentElement;
    var pct = (h.scrollTop + window.innerHeight) / Math.max(h.scrollHeight, 1);
    if (pct >= SCROLL_PCT) scrollMet = true;
    if (dwellMet && scrollMet) inject();
  }, {passive:true});

  // Exit intent (desktop): cursor leaves through the top of the viewport
  document.addEventListener('mouseout', function(e){
    if (e.clientY <= 0 && !e.relatedTarget) inject();
  });

  function inject(){
    if (fired || !document.body || document.getElementById("kabsPop")) return;
    fired = true;
    try { sessionStorage.setItem("kabsPopShown", "1"); } catch(e){}
    ensureCalendlyAssets();

    var css = document.createElement("style");
    css.textContent =
      '.kabs-pop-ov{position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.55);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .3s ease}'
    + '.kabs-pop-ov.show{opacity:1}'
    + '.kabs-pop{background:#fff;border:1px solid #e5e9f0;border-radius:18px;max-width:420px;width:100%;padding:30px 28px 24px;position:relative;box-shadow:0 40px 80px -30px rgba(15,23,42,.5);transform:translateY(12px) scale(.97);transition:transform .3s ease;font-family:Inter,system-ui,sans-serif}'
    + '.kabs-pop-ov.show .kabs-pop{transform:none}'
    + '.kabs-pop-x{position:absolute;top:12px;right:12px;width:44px;height:44px;border:none;background:#f4f6f8;border-radius:8px;color:#5b6675;font-size:18px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center}'
    + '.kabs-pop-x:hover{background:#e9edf3}'
    + '.kabs-pop-badge{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:#2f6ad6;background:#eef4ff;border-radius:100px;padding:5px 12px;margin-bottom:14px}'
    + '.kabs-pop h3{font-family:"Space Grotesk",Inter,sans-serif;font-size:22px;line-height:1.2;color:#141922;margin:0 0 8px}'
    + '.kabs-pop p{font-size:14.5px;line-height:1.55;color:#5b6675;margin:0 0 20px}'
    + '.kabs-pop-btns{display:flex;flex-direction:column;gap:10px}'
    + '.kabs-pop-btn{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;min-height:48px;padding:13px 18px;border:none;border-radius:11px;font-family:inherit;font-size:14.5px;font-weight:600;text-decoration:none;cursor:pointer;transition:transform .15s ease}'
    + '.kabs-pop-btn:hover{transform:translateY(-1px)}'
    + '.kabs-pop-call{background:#141922;color:#fff}'
    + '.kabs-pop-wa{background:#25D366;color:#fff}'
    + '.kabs-pop-later{display:block;width:100%;min-height:44px;text-align:center;margin-top:10px;font-size:13px;color:#6b7688;background:none;border:none;cursor:pointer}'
    + '.kabs-pop-later:hover{color:#3f4856}'
    + '.kabs-pop :focus-visible{outline:3px solid #2f6ad6;outline-offset:2px}'
    + '@media(prefers-reduced-motion:reduce){.kabs-pop-ov,.kabs-pop{transition:none}}';
    document.head.appendChild(css);

    lastFocus = document.activeElement;

    var ov = document.createElement("div");
    ov.className="kabs-pop-ov"; ov.id="kabsPop";
    ov.innerHTML =
      '<div class="kabs-pop" role="dialog" aria-modal="true" aria-labelledby="kabsPopTitle">'
    +   '<button class="kabs-pop-x" aria-label="Close">&times;</button>'
    +   '<span class="kabs-pop-badge"><span aria-hidden="true">&#10022;</span> Free 30 min audit</span>'
    +   '<h3 id="kabsPopTitle">Ready to stop doing it by hand?</h3>'
    +   '<p>Book a free call and we\'ll map the 3 highest-ROI automations for your business, or message us on WhatsApp, whatever\'s easier.</p>'
    +   '<div class="kabs-pop-btns">'
    +     '<button class="kabs-pop-btn kabs-pop-call" id="kabsBook">Book a call</button>'
    +     '<a class="kabs-pop-btn kabs-pop-wa" href="' + waHref + '" target="_blank" rel="noopener">Message us on WhatsApp</a>'
    +   '</div>'
    +   '<button class="kabs-pop-later">Maybe later</button>'
    + '</div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function(){ ov.classList.add("show"); });

    var dialog = ov.querySelector('.kabs-pop');
    var focusables = dialog.querySelectorAll('button, [href]');
    var first = focusables[0], last = focusables[focusables.length - 1];
    first.focus();

    function onKey(e){
      if (e.key === "Escape") { close(); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
    function close(){
      ov.classList.remove("show");
      setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, 300);
      document.removeEventListener("keydown", onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    ov.querySelector(".kabs-pop-x").addEventListener("click", close);
    ov.querySelector(".kabs-pop-later").addEventListener("click", close);
    ov.querySelector("#kabsBook").addEventListener("click", function(){ openCalendly(); close(); });
    ov.addEventListener("click", function(e){ if(e.target === ov) close(); });
    document.addEventListener("keydown", onKey);
  }
})();
