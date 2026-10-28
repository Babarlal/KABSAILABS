/* ============================================================
   Microsoft Clarity session recordings, on the two ad landing pages only
   (/lp/shopify-support-automation and /lp/shopify-inventory-sync). Nothing loads
   it on any other page: scripts/build-ad-pages.js adds the tag to those copies.

   It does nothing at all while CLARITY_ID is still the placeholder below: no
   request, no window.clarity. Put the project ID from clarity.microsoft.com
   (Settings > Overview) in its place.

   Consent follows tagging.js:
   - a stored choice wins: Accept loads Clarity, Reject never does;
   - with no choice yet, visitors in the EEA, the UK and Switzerland wait for
     Accept, everyone else (the US included) is granted by default.
   tagging.js leaves the region to Google, which reads it from the visitor's IP.
   Clarity has nothing like that and this static site has no server side, so the
   region here comes from the browser's time zone. Europe and the North Atlantic
   EEA islands count as a consent region; an unknown time zone does too, so a
   doubtful case waits for Accept rather than recording.
   Accept on the cookie bar loads Clarity there and then. Reject after it has
   loaded sends Clarity the denied consent signal.

   This file reads the consent tagging.js stores and never writes it, and it
   pushes nothing to the dataLayer, so no tracking event changes.
   ============================================================ */
(function () {
  'use strict';

  var CLARITY_ID = 'z4vwrps1oh';
  /* A real project ID is a short run of lowercase letters and digits. The
     placeholder (capitals, underscore) can never pass, so this cannot switch
     itself off by accident when the ID is pasted in. */
  if (!/^[a-z0-9]{6,20}$/.test(CLARITY_ID)) return;

  var CONSENT_ZONE = /^(Europe\/|Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe)|Arctic\/Longyearbyen)/;

  function stored() {
    try { return localStorage.getItem('kabsConsent'); } catch (e) { return null; }
  }
  function inConsentRegion() {
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    return !tz || CONSENT_ZONE.test(tz);
  }

  var loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
    window.clarity('consentv2', { ad_Storage: 'granted', analytics_Storage: 'granted' });
  }

  var choice = stored();
  if (choice === 'granted' || (choice !== 'denied' && !inConsentRegion())) load();

  /* The cookie bar's own buttons, read after tagging.js has stored the choice. */
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('.cookie-ok, .cookie-no') : null;
    if (!t) return;
    setTimeout(function () {
      var now = stored();
      if (now === 'granted') load();
      else if (now === 'denied' && loaded && window.clarity) window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
    }, 0);
  }, true);
})();
