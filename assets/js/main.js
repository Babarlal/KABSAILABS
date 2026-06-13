/* ============================================================
   KABS AI LABS — site script (light theme)
   Header, announcement bar, and footer live HERE (one place to
   edit them for every page). Integration IDs are at the top.
   ============================================================ */

/* ---------- CONFIG: edit these ---------- */
var CONFIG = {
  brand:       "KABS AI LABS",
  email:       "hello@kabsailabs.com",
  whatsapp:    "14068677425",                 // digits only, no + or spaces
  domain:      "kabsailabs.com",
  GTM_ID:      "",                            // "GTM-XXXXXXX" to enable GA4/GTM everywhere
  CALENDLY_URL:"",                            // your Calendly link -> data-cta buttons open a popup
  ctaFallback: "/audit"
};

/* ---------- announcement bar items (edit freely) ---------- */
var ANNOUNCE = [
  "New: White-Label GA4 &amp; GTM Setup for Agencies",
  "AI Voice Agents for Plumbers, HVAC &amp; Local Services",
  "AI-Powered Automation — Built for Scale",
  "Agency Partners: Offer custom automation to your clients",
  "RAG &amp; Knowledge-Base systems for Legal &amp; Medical docs"
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
    ["GA4 &amp; GTM Setup", "/services/analytics/ga4-gtm"],
    ["GoHighLevel Automation", "/services/gohighlevel-automation"],
    ["White Label", "/services/white-label"]
  ],
  industries: [
    ["Marketing Agencies", "/services/industries/marketing-agencies"],
    ["Real Estate", "/services/industries/real-estate"],
    ["eCommerce", "/services/industries/ecommerce"],
    ["SaaS Startups", "/services/industries/saas"],
    ["Healthcare", "/services/industries/healthcare"]
  ],
  resources: [
    ["Case Studies", "/case-studies"],
    ["Blog", "/blog"],
    ["AI Receptionist Blueprint", "/resources/dental-ai-receptionist-blueprint"],
    ["Front Desk Checklist", "/resources/dental-front-desk-checklist"]
  ],
  company: [
    ["About", "/about"],
    ["Careers", "/careers"],
    ["Contact", "/contact"],
    ["Agency Partners", "/contact/agency-partner"]
  ]
};

/* ---------- logo (dark text for white background) ---------- */
var LOGO = '' +
'<svg viewBox="0 0 188 36" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="KABS AI LABS">' +
  '<defs><linearGradient id="kg" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#2f6ad6"/><stop offset="1" stop-color="#5a3fd6"/>' +
  '</linearGradient></defs>' +
  '<rect x="1" y="3" width="30" height="30" rx="8" fill="url(#kg)"/>' +
  '<path d="M11 11v14M11 18l8-7M11 18l8 7" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
  '<text x="42" y="18" font-family="Space Grotesk, sans-serif" font-size="16.5" font-weight="700" fill="#141922" letter-spacing="-0.3">KABS</text>' +
  '<text x="42" y="30" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#5c6675" letter-spacing="2.4">AI LABS</text>' +
'</svg>';

/* ---------- helpers ---------- */
function waLink(){
  var msg = encodeURIComponent("Hi KABS AI LABS — I came from " + CONFIG.domain + " and would like to chat.");
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

/* ---------- announcement bar ---------- */
function buildAnnounce(){
  var items = ANNOUNCE.map(function(t){
    return '<span><b>'+t+'</b><span class="arr">&rarr;</span></span>';
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
  var mega = '<div class="menu-panel" role="menu">'+
      menuCol('Services', NAV.services)+ menuCol('Industries', NAV.industries)+ menuCol('Resources', NAV.resources)+
    '</div>';
  return '<header class="site-header"><div class="container"><div class="nav">'+
    '<a class="logo" href="/" aria-label="KABS AI LABS home">'+LOGO+'</a>'+
    '<nav class="nav-main" aria-label="Primary">'+
      '<a class="nav-link" href="/">Home</a>'+
      '<div class="has-menu"><a class="nav-link" href="/services" aria-haspopup="true">Services <span aria-hidden="true">&#9662;</span></a>'+mega+'</div>'+
      '<a class="nav-link" href="/case-studies">Work</a>'+
      '<a class="nav-link" href="/blog">Blog</a>'+
      '<a class="nav-link" href="/about">About</a>'+
    '</nav>'+
    '<div class="nav-right">'+
      '<a class="btn btn-ghost" href="/contact">Contact</a>'+
      '<a class="btn btn-primary" href="'+(CONFIG.CALENDLY_URL||CONFIG.ctaFallback)+'" data-cta>Book a call &rarr;</a>'+
      '<button class="hamburger" aria-label="Open menu" aria-expanded="false">&#9776;</button>'+
    '</div>'+
  '</div></div>'+
  '<div class="mobile-menu"><div class="container">'+
    '<a href="/">Home</a><a href="/services">Services</a><a href="/case-studies">Work</a><a href="/blog">Blog</a><a href="/about">About</a>'+
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
        '<div class="foot-social">'+
          '<a href="'+waLink()+'" target="_blank" rel="noopener" aria-label="WhatsApp">WA</a>'+
          '<a href="https://www.linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn">in</a>'+
          '<a href="https://x.com/" target="_blank" rel="noopener" aria-label="X">X</a></div></div>'+
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
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.9.9-2.8-.2-.3A8 8 0 1 1 12 20zm4.6-6c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.2-.7.8-.8 1-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.6 4c2.1.8 2.1.6 2.5.5a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3z"/></svg>'+
    'Chat with us</a></div>';
}

/* ---------- GTM ---------- */
function loadGTM(){
  if (!CONFIG.GTM_ID) return;
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
    var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
    j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer',CONFIG.GTM_ID);
  var ns=document.createElement('noscript');
  ns.innerHTML='<iframe src="https://www.googletagmanager.com/ns.html?id='+CONFIG.GTM_ID+'" height="0" width="0" style="display:none;visibility:hidden"></iframe>';
  document.body.insertBefore(ns, document.body.firstChild);
}

/* ---------- Calendly ---------- */
function setupCalendly(){
  if (!CONFIG.CALENDLY_URL) return;
  var css=document.createElement('link');css.rel='stylesheet';css.href='https://assets.calendly.com/assets/external/widget.css';document.head.appendChild(css);
  var js=document.createElement('script');js.src='https://assets.calendly.com/assets/external/widget.js';js.async=true;document.head.appendChild(js);
  document.querySelectorAll('[data-cta]').forEach(function(el){
    el.addEventListener('click', function(e){
      if (window.Calendly){ e.preventDefault(); window.Calendly.initPopupWidget({url:CONFIG.CALENDLY_URL}); }
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
    });
  }
}
function duplicateMarquees(){
  document.querySelectorAll('.marquee-track, .tool-track').forEach(function(t){ t.innerHTML += t.innerHTML; });
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
      requestAnimationFrame(tick); io.unobserve(el);
    });
  }, {threshold:.5});
  els.forEach(function(el){ io.observe(el); });
}
/* reveal animated bars (impact + barchart) when scrolled into view */
function revealBars(){
  var els = document.querySelectorAll('.barchart, .impact-bars.anim');
  if(!('IntersectionObserver' in window) || !els.length) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  }, {threshold:.35});
  els.forEach(function(el){ io.observe(el); });
}
/* honor reduced-motion: drop SVG signal pulses */
function respectReducedMotion(){
  if(!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('animate, animateMotion, animateTransform').forEach(function(a){ a.remove(); });
}
/* case-study sticky table of contents */
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
  // scroll progress (fills the bar + percent, like the reference)
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

/* ---------- init ---------- */
document.addEventListener('DOMContentLoaded', function(){
  var layout = document.body.getAttribute('data-layout') || 'default';
  var h=document.getElementById('site-header');
  if(h){ h.innerHTML = (layout!=='lp' ? buildAnnounce() : '') + buildHeader(); }
  var f=document.getElementById('site-footer'); if(f) f.innerHTML=buildFooter();
  if (layout !== 'lp'){ document.body.insertAdjacentHTML('beforeend', buildFab()); }
  setupNav(); duplicateMarquees(); countUp(); revealBars(); setupTOC(); setupCalendly(); loadGTM(); respectReducedMotion();
});
