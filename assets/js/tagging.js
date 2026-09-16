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
    GTM_ID: 'GTM-PLACEHOLDER',   // replace with the real GTM-XXXXXXX container
    GA_ID:  'G-EMPMVS2NYX',      // existing GA4 property, kept

    /* The Google Ads conversion, counted on a completed booking. Paste the real value as
       AW-XXXXXXXXX/AbCdEfGhIjKlMnOp. The leading bracket is what the guard tests, so
       leave the brackets on until the conversion action exists: nothing fires against a
       placeholder. Moved here from lp-booking.js, which fired it at lead capture on two
       pages only; a booking can happen from any page, so the tag layer owns it. */
    ADS_CONVERSION_ID: '[ADS_CONVERSION_ID_PLACEHOLDER: AW-XXXXXXXXX/label]'
  };
  window.KABS_TAG = TAG;

  /* A value is not usable if it is blank, bracketed, or still says PLACEHOLDER.
     The bracket test is the same guard lp-booking.js already uses for
     ADS_CONVERSION_ID, kept so both files fail the same way. */
  function isPlaceholder(v) {
    return !v || v.indexOf('[') === 0 || v.indexOf('PLACEHOLDER') !== -1;
  }
  window.kabsIsPlaceholder = isPlaceholder;

  /* ---------- dataLayer and the gtag shim ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  /* ---------- Consent Mode v2 ----------
     Everything denied until the visitor chooses. Google Ads needs ad_storage to
     match a click to a conversion, so Accept now grants the ad signals as well
     as analytics. Reject leaves all of them denied. */
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  /* Keeps the gclid on the URL so a conversion can still be attributed while
     storage is denied. Does nothing once consent is granted. */
  gtag('set', 'url_passthrough', true);
  gtag('set', 'ads_data_redaction', true);

  function readConsent() {
    try { return localStorage.getItem('kabsConsent'); } catch (e) { return null; }
  }
  function writeConsent(v) {
    try { localStorage.setItem('kabsConsent', v); } catch (e) {}
  }

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

  function grantConsent() {
    writeConsent('granted');
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
    gtag('set', 'ads_data_redaction', false);
    loadGTM();
    loadGA();
  }
  function denyConsent() {
    writeConsent('denied');
    gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied'
    });
  }
  window.kabsConsent = { grant: grantConsent, deny: denyConsent, read: readConsent };

  if (readConsent() === 'granted') grantConsent();

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

  /* ---------- Calendly: a completed booking ----------
     This is the conversion. Calendly posts a message when the visitor actually
     finishes scheduling, which is the moment worth paying for: a lead form
     submission only means somebody typed an email, and Google should optimise
     for people who take a time. Opening the popup is a much weaker signal and
     is tracked separately in main.js.

     The listener is installed on every page, so a booking counts wherever the
     widget is embedded or popped, and it is installed once, so a booking cannot
     be counted twice. */
  window.addEventListener('message', function (e) {
    if (String(e.origin).indexOf('calendly.com') === -1) return;
    var d = e.data;
    if (d && d.event === 'calendly.event_scheduled') {
      window.kabsTrack('kabs_booking_completed', { method: 'calendly' });
      /* Direct Ads conversion alongside the dataLayer event, so it keeps working if
         the container is ever paused. Guarded, so a placeholder never fires. */
      if (typeof gtag === 'function' && !isPlaceholder(TAG.ADS_CONVERSION_ID)) {
        gtag('event', 'conversion', { send_to: TAG.ADS_CONVERSION_ID });
      }
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
