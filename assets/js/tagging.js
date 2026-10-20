/* ============================================================
   KABS AI LABS — consent, Google Tag Manager, conversion events.

   This file exists because the two ad landing pages do not load main.js. They
   had no tag of any kind, so the Ads conversion line in lp-booking.js was
   guarded on a gtag() that never existed there, and the pages we buy traffic to
   were the only pages measuring nothing. Everything tag-related now lives here
   and every page loads it, main.js pages and /lp/ pages alike.

   Load order on every page: tagging.js, then main.js. Both are deferred, so
   they run in document order and main.js can rely on window.kabsConsent and
   window.kabsTrack already existing.

   GA4 is served through GTM, not alongside it. If GTM_ID holds a real
   container, this file does NOT also load gtag.js, because GA4 configured in
   both places counts every pageview twice. With GTM still a placeholder the
   direct GA4 load is kept, so analytics keeps working until the container is
   live. Either way the measurement ID is the existing property.
   ============================================================ */

(function () {
  'use strict';

  var TAG = {
    GTM_ID: 'GTM-NPG4QTSR',      // live container; GA4 is configured inside it
    GA_ID:  'G-EMPMVS2NYX',      // existing GA4 property, kept

    /* Google Ads, the conversion counted on a completed Calendly booking. Paste the
       account ID (AW-...) and the label of the booking conversion action. While either
       still contains XXXX the Ads tag is not loaded and no conversion fires, so a
       placeholder can never send a hit. GA4 needs no placeholder here: it is already
       live through the GTM container above, and loading it a second time would count
       every pageview twice. */
    GOOGLE_ADS_ID: 'AW-11086913678',
    GOOGLE_ADS_BOOKING_LABEL: 'HsA0CPz52qMdEI7B06Yp'
  };
  window.KABS_TAG = TAG;

  /* A value is not usable if it is blank, bracketed, says PLACEHOLDER, or still
     holds the XXXX of the shipped placeholders. */
  function isPlaceholder(v) {
    return !v || v.indexOf('[') === 0 || v.indexOf('PLACEHOLDER') !== -1 || v.indexOf('XXXX') !== -1;
  }
  function adsReady() {
    return !isPlaceholder(TAG.GOOGLE_ADS_ID) && !isPlaceholder(TAG.GOOGLE_ADS_BOOKING_LABEL);
  }
  window.kabsIsPlaceholder = isPlaceholder;

  /* ---------- dataLayer and the gtag shim ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  /* ---------- Consent Mode v2, by region ----------
     Set before any Google tag loads. Visitors in the EEA, the UK and Switzerland
     start with every storage signal denied until they choose, because consent law
     there requires opt in. Everywhere else starts granted. The region specific
     default wins over the global one for visitors in those regions, whatever the
     order, so both are set here and Google picks per visitor.

     The banner still shows to everyone. Accept or Reject updates the signals and
     is remembered, so a visitor outside Europe who rejects stays rejected. */
  var CONSENT_REGIONS = [
    // EU member states
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
    'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
    // rest of the EEA, then the UK and Switzerland
    'IS', 'LI', 'NO', 'GB', 'CH'
  ];
  var ALL_GRANTED = { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' };
  var ALL_DENIED  = { ad_storage: 'denied',  ad_user_data: 'denied',  ad_personalization: 'denied',  analytics_storage: 'denied' };

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
    region: CONSENT_REGIONS
  });
  gtag('consent', 'default', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted'
  });

  /* Keeps the gclid on the URL, and strips ad identifiers from hits, wherever
     ad_storage is denied. Neither does anything where it is granted. */
  gtag('set', 'url_passthrough', true);
  gtag('set', 'ads_data_redaction', true);

  function readConsent() {
    try { return localStorage.getItem('kabsConsent'); } catch (e) { return null; }
  }
  function writeConsent(v) {
    try { localStorage.setItem('kabsConsent', v); } catch (e) {}
  }

  // A remembered choice overrides the regional default before any tag reads it.
  var stored = readConsent();
  if (stored === 'granted') gtag('consent', 'update', ALL_GRANTED);
  else if (stored === 'denied') gtag('consent', 'update', ALL_DENIED);

  /* ---------- loaders ---------- */
  var gtmLoaded = false;
  function loadGTM() {
    if (gtmLoaded || isPlaceholder(TAG.GTM_ID)) return;
    gtmLoaded = true;
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + TAG.GTM_ID;
    document.head.appendChild(s);

    // the noscript half of the container snippet
    var n = document.createElement('noscript');
    var f = document.createElement('iframe');
    f.src = 'https://www.googletagmanager.com/ns.html?id=' + TAG.GTM_ID;
    f.height = '0'; f.width = '0';
    f.style.display = 'none'; f.style.visibility = 'hidden';
    n.appendChild(f);
    if (document.body) document.body.insertBefore(n, document.body.firstChild);
  }

  var gaLoaded = false;
  function loadGA() {
    // Only when GTM is not live, otherwise GA4 would be configured twice.
    if (gaLoaded || !isPlaceholder(TAG.GTM_ID) || isPlaceholder(TAG.GA_ID)) return;
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + TAG.GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', TAG.GA_ID, { anonymize_ip: true });
  }

  /* Google Ads gets its own gtag.js because the GTM container carries GA4 only, no
     Ads tag. One loader, called once at startup, so it runs once per page. */
  var adsLoaded = false;
  function loadAds() {
    if (adsLoaded || isPlaceholder(TAG.GOOGLE_ADS_ID)) return;
    adsLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + TAG.GOOGLE_ADS_ID;
    document.head.appendChild(s);
    if (!gaLoaded) gtag('js', new Date());
    gtag('config', TAG.GOOGLE_ADS_ID);
  }

  function grantConsent() {
    writeConsent('granted');
    gtag('consent', 'update', ALL_GRANTED);
  }
  function denyConsent() {
    writeConsent('denied');
    gtag('consent', 'update', ALL_DENIED);
  }
  window.kabsConsent = { grant: grantConsent, deny: denyConsent, read: readConsent };

  /* Tags load straight away; Consent Mode, not the banner, decides what they may
     store and send. The Ads tag still stays off while its IDs are placeholders. */
  loadGTM();
  loadGA();
  loadAds();

  /* ---------- the one way anything on this site reports a conversion ----------
     Pushes a named event onto the dataLayer for GTM to trigger on. Safe to call
     before consent: the push is queued and Consent Mode decides what leaves the
     browser. Event names are listed in the ads-prep report. */
  window.kabsTrack = function (name, params) {
    var payload = { event: name };
    if (params) { for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) payload[k] = params[k]; }
    payload.page_path = location.pathname;
    window.dataLayer.push(payload);
    return payload;
  };

  /* A named GA4 event. Sent with send_to so it reaches the GA4 property only, never
     the Ads account. The Google tag inside GTM reads gtag() commands off the same
     dataLayer, so this works without a second GA4 install. Callers pass no personal
     data: no name, email, phone or store URL in params. */
  window.kabsGa4Event = function (name, params) {
    if (isPlaceholder(TAG.GA_ID)) return;
    var p = { send_to: TAG.GA_ID };
    if (params) { for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) p[k] = params[k]; }
    gtag('event', name, p);
  };

  /* ---------- ad click attribution ----------
     Read once on landing and kept for the session, so the click IDs and UTMs still
     reach the lead row and the Calendly booking after the visitor scrolls, goes Back,
     or opens a second page. A later URL without any of these keys leaves the stored
     set alone; a new ad click with its own keys replaces it. */
  var ATTR_KEYS = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var attrMemory = {};
  (function captureAttribution() {
    var q, found = {}, any = false;
    try { q = new URLSearchParams(location.search); } catch (e) { return; }
    ATTR_KEYS.forEach(function (k) {
      var v = q.get(k);
      if (v) { found[k] = v.slice(0, 200); any = true; }
    });
    if (any) {
      attrMemory = found;
      try { sessionStorage.setItem('kabsAttribution', JSON.stringify(found)); } catch (e) {}
    }
  })();
  window.kabsAttribution = function () {
    var stored = null;
    try { stored = JSON.parse(sessionStorage.getItem('kabsAttribution') || 'null'); } catch (e) {}
    var out = {}, src = stored || attrMemory;
    ATTR_KEYS.forEach(function (k) { out[k] = (src && typeof src[k] === 'string') ? src[k] : ''; });
    return out;
  };
  window.kabsAttributionKeys = ATTR_KEYS.slice();

  /* ---------- Calendly: a completed booking ----------
     This is the conversion. Calendly posts a message when the visitor actually
     finishes scheduling, which is the moment worth paying for: a lead form
     submission only means somebody typed an email, and Google should optimise
     for people who take a time. Opening the popup is a much weaker signal and
     is tracked separately in main.js.

     The listener is installed on every page, so a booking counts wherever the
     widget is embedded or popped, and it is installed once, so a booking cannot
     be counted twice. */
  var bookingsSeen = {};
  function firstTimeFor(key, persist) {
    if (bookingsSeen[key]) return false;
    bookingsSeen[key] = true;
    if (!persist) return true;
    /* Session memory as well, so a reload of the confirmation, or a second embed of the
       same booking on another page, cannot count it again. */
    try {
      var seen = JSON.parse(sessionStorage.getItem('kabsBookingsSeen') || '[]');
      if (seen.indexOf(key) !== -1) return false;
      seen.push(key);
      sessionStorage.setItem('kabsBookingsSeen', JSON.stringify(seen.slice(-20)));
    } catch (e) {}
    return true;
  }

  window.addEventListener('message', function (e) {
    // Exact origin: a substring test would also accept a host like evilcalendly.com.
    if (e.origin !== 'https://calendly.com') return;
    var d = e.data;
    if (!d || d.event !== 'calendly.event_scheduled') return;
    /* The invitee URI identifies one booking and holds no personal data. If Calendly
       ever drops it, one booking per page view is the safe fallback. */
    var p = d.payload || {};
    var uri = (p.invitee && p.invitee.uri) || (p.event && p.event.uri) || '';
    if (!firstTimeFor(uri || 'this-page', !!uri)) return;

    window.kabsTrack('kabs_booking_completed', { method: 'calendly' });
    window.kabsGa4Event('book_audit', { method: 'calendly' });
    /* Direct Ads conversion, guarded, so a placeholder never fires. */
    if (adsReady()) {
      gtag('event', 'conversion', { send_to: TAG.GOOGLE_ADS_ID + '/' + TAG.GOOGLE_ADS_BOOKING_LABEL });
    }
  });

  /* ---------- WhatsApp ----------
     Delegated, because the floating button is painted by main.js after this
     file runs and inline wa.me links appear in page copy too. */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="wa.me/"]') : null;
    if (!a) return;
    window.kabsTrack('kabs_whatsapp_click', { link_url: a.getAttribute('href') });
  }, true);

  /* ---------- cookie notice ----------
     Moved here from main.js so the /lp/ pages get it too. Without a notice on
     those pages consent could never be granted, and an ad visitor would stay
     untracked no matter what the container was set up to do. Self-contained
     styling, so it renders the same on pages that do not load styles.css. */
  function setupCookieNotice() {
    if (readConsent()) return;
    if (document.querySelector('.cookie-bar')) return;

    var bar = document.createElement('div');
    bar.className = 'cookie-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookie notice');
    bar.innerHTML =
      '<span>We use analytics and advertising cookies to understand how the site is used '
    + 'and to measure our ads. See our <a href="/privacy">Privacy Policy</a>.</span>'
    + '<span class="cookie-btns">'
    +   '<button type="button" class="cookie-no">Reject</button>'
    +   '<button type="button" class="cookie-ok">Accept</button>'
    + '</span>';

    var css = document.createElement('style');
    css.textContent =
      '.cookie-bar{position:fixed;left:16px;right:16px;bottom:16px;z-index:9998;max-width:680px;margin:0 auto;display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:center;background:#0F2B24;color:#E8F0EA;border:1px solid #1E4638;border-radius:12px;padding:12px 16px;font-family:"Instrument Sans",system-ui,sans-serif;font-size:13.5px;line-height:1.5;box-shadow:0 20px 40px -20px rgba(15,43,36,.6)}'
    + '.cookie-bar a{color:#7CCFA0;text-decoration:underline}'
    + '.cookie-btns{display:flex;gap:8px;flex:none}'
    + '.cookie-ok,.cookie-no{min-height:44px;border-radius:8px;padding:10px 18px;font-weight:600;font-size:13.5px;cursor:pointer;font-family:inherit;border:1px solid transparent}'
    + '.cookie-ok{background:#1F6B4E;color:#fff}'
    + '.cookie-ok:hover{background:#174F3A}'
    + '.cookie-no{background:transparent;color:#B7CBC0;border-color:#2A5546}'
    + '.cookie-no:hover{background:#173A30;color:#E8F0EA}'
    + '@media(max-width:520px){.cookie-bar{bottom:88px}.cookie-btns{width:100%}.cookie-ok,.cookie-no{flex:1}}';
    document.head.appendChild(css);
    document.body.appendChild(bar);

    function close() { if (bar.parentNode) bar.parentNode.removeChild(bar); }
    bar.querySelector('.cookie-ok').addEventListener('click', function () { grantConsent(); close(); });
    bar.querySelector('.cookie-no').addEventListener('click', function () { denyConsent(); close(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCookieNotice);
  } else {
    setupCookieNotice();
  }
})();
