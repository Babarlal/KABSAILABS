/* Extracted from the landing pages so /lp/*, the eCommerce page and the homepage
   share one copy. Behaviour is unchanged from the inline originals. */

(function(){
  'use strict';
  var CALENDLY_URL='https://calendly.com/babarlal17/30min';
  var WEBHOOK_URL='https://script.google.com/macros/s/AKfycbyFP-P9I80X_QE02eQ8i4SioyqVlTeV36wEdbeF1V7Se3G2k4OE6zb4zk5El53b7-V9/exec';
  /* The Ads conversion moved to assets/js/tagging.js and now counts a completed
     Calendly booking rather than this form submit. Somebody typing an email is not what
     we are paying for; taking a time is. */
  var $=function(id){return document.getElementById(id);};
  var prog=$('auProg'), panels=[$('auStep1'),$('auStep2')], form=$('auForm'), submitBtn=$('auSubmit'), errBox=$('auError'), cal=$('auCal'), calLink=$('auCalLink'), doneMsg=$('auDone');
  var TAPS={amazon:'Shopify and Amazon',marketplace:'Shopify and eBay or Etsy','3pl':'Shopify and a 3PL',multi:'Several channels'};
  var q=new URLSearchParams(location.search), tap=q.get('tap');
  window.__setTap=function(key){ var r=document.querySelector('input[name="tap"][value="'+key+'"]'); if(r) r.checked=true; };
  if(tap&&TAPS[tap]) window.__setTap(tap);
  /* Ad click IDs and UTMs, captured on landing by tagging.js. They ride with the lead as
     hidden fields, and the UTMs go on to Calendly so the booking carries its campaign. */
  var attr=window.kabsAttribution?window.kabsAttribution():{};
  Object.keys(attr).forEach(function(k){ var el=form.querySelector('input[type="hidden"][name="'+k+'"]');
    if(!el){ el=document.createElement('input'); el.type='hidden'; el.name=k; form.appendChild(el); } el.value=attr[k]; });
  var CAL_UTM=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  function calUtm(){ return CAL_UTM.filter(function(k){return attr[k];}).map(function(k){return '&'+k+'='+encodeURIComponent(attr[k]);}).join(''); }
  if(calLink) calLink.href=CALENDLY_URL+'?hide_gdpr_banner=1'+calUtm();
  function goto(n){ panels.forEach(function(p,i){p.hidden=(i!==n-1);}); Array.prototype.forEach.call(prog.children,function(li,i){ if(i<n) li.setAttribute('data-on','1'); else li.removeAttribute('data-on'); if(i===n-1) li.setAttribute('aria-current','step'); else li.removeAttribute('aria-current'); });
    var h=panels[n-1].querySelector('h2'); if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});} $('book').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}); }
  document.querySelectorAll('[data-back]').forEach(function(b){ b.addEventListener('click',function(){goto(1);}); });
  var leadSent=false;
  function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function fail(msg,el){ errBox.textContent=msg; errBox.hidden=false; if(el) el.focus(); }
  form.addEventListener('submit',function(e){ e.preventDefault(); errBox.hidden=true;
    var name=$('auName').value.trim(), email=$('auEmail').value.trim(), store=$('auStore').value.trim(), mobile=$('auMobile').value.trim();
    var sel=document.querySelector('input[name="tap"]:checked'), channels=sel?TAPS[sel.value]:'';
    var est=(window.__est!=null)?String(window.__est):'';
    if(!name) return fail('Please enter your name.',$('auName'));
    if(!validEmail(email)) return fail('Please enter a valid email address.',$('auEmail'));
    submitBtn.disabled=true; submitBtn.textContent='One moment';
    var lead={name:name,email:email,mobile:mobile,store:store,channels:channels,oversell_estimate_month:est,industry:'Retail and ecommerce',task_time_sink:'Inventory sync / overselling',source:(($('book')&&$('book').dataset.source)||'inventory_sync_lp'),page_url:location.href,timestamp_utc:new Date().toISOString()};
    form.querySelectorAll('input[type="hidden"]').forEach(function(el){ lead[el.name]=el.value; });
    function proceed(){ var notes='Store: '+(store||'not given')+' | Channels: '+(channels||'not given')+' | Oversell estimate: '+(est?'$'+est+'/mo':'not run')+' | Mobile: '+(mobile||'not given');
      var url=CALENDLY_URL+'?hide_gdpr_banner=1&name='+encodeURIComponent(name)+'&email='+encodeURIComponent(email)+'&a1='+encodeURIComponent(notes)+calUtm();
      /* embed_domain and embed_type are what Calendly's own widget.js adds. Without them
         Calendly posts nothing to the parent page, so calendly.event_scheduled never
         arrived and no booking was counted. The new tab link is not embedded, so it
         keeps the plain URL. */
      cal.src=url+'&embed_domain='+encodeURIComponent(location.hostname)+'&embed_type=Inline'; calLink.href=url; submitBtn.disabled=false; submitBtn.textContent='Book the free audit';
      /* Soft signal, not the conversion: the visitor has given us their details and is
         about to see the calendar. The conversion fires when they actually book. */
      if(window.kabsTrack) kabsTrack('kabs_audit_form_success',{form_name:'lp-audit',form_page:location.pathname});
      if(window.kabsGa4Event&&!leadSent){ leadSent=true; kabsGa4Event('generate_lead',{form_name:'lp-audit'}); }
      goto(2); }
    try{ fetch(WEBHOOK_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(lead)}).then(proceed,proceed); }catch(err){ proceed(); } });
  /* Presentation only. The kabs_booking_completed event for this same message is pushed
     once, in tagging.js, which listens on every page. Pushing it here too would count a
     single booking twice. */
  window.addEventListener('message',function(e){ if(e.origin!=='https://calendly.com') return; var d=e.data; if(d&&d.event==='calendly.event_scheduled') doneMsg.hidden=false; });
  var bar=$('sticky'), book=$('book'), top=document.querySelector('.hero, .risk-head'), topOut=false, bookIn=false;
  var io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.target===top) topOut=!en.isIntersecting; if(en.target===book) bookIn=en.isIntersecting; }); bar.classList.toggle('show',topOut&&!bookIn); },{threshold:.1});
  if(top) io.observe(top); io.observe(book);
})();
