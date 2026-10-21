/* Extracted from the landing pages so /lp/*, the eCommerce page and the homepage
   share one copy. Behaviour is unchanged from the inline originals.

   Two forms use it. The inventory pages ask where the store sells (tap chips, optional
   oversell estimate). The support automation pages ask for orders per month (#auOrders)
   and the helpdesk, and show a third "You're booked." panel (#auDone) after booking.
   The support form is recognised by #auOrders; anything else gets the inventory flow,
   unchanged. */

(function(){
  'use strict';
  var CALENDLY_URL='https://calendly.com/babarlal17/30min';
  var WEBHOOK_URL='https://script.google.com/macros/s/AKfycbyFP-P9I80X_QE02eQ8i4SioyqVlTeV36wEdbeF1V7Se3G2k4OE6zb4zk5El53b7-V9/exec';
  /* The Ads conversion moved to assets/js/tagging.js and now counts a completed
     Calendly booking rather than this form submit. Somebody typing an email is not what
     we are paying for; taking a time is. */
  var $=function(id){return document.getElementById(id);};
  var SUPPORT=!!$('auOrders');
  var prog=$('auProg'), panels=[$('auStep1'),$('auStep2')], form=$('auForm'), submitBtn=$('auSubmit'), errBox=$('auError'), cal=$('auCal'), calLink=$('auCalLink'), doneMsg=$('auDone');
  if(SUPPORT) panels.push(doneMsg);
  var submitLabel=submitBtn.textContent;
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
  /* The progress bar has two steps; the support page's third panel (booked) keeps both lit. */
  function goto(n){ var cur=Math.min(n,prog.children.length)-1; panels.forEach(function(p,i){p.hidden=(i!==n-1);}); Array.prototype.forEach.call(prog.children,function(li,i){ if(i<n) li.setAttribute('data-on','1'); else li.removeAttribute('data-on'); if(i===cur) li.setAttribute('aria-current','step'); else li.removeAttribute('aria-current'); });
    var h=panels[n-1].querySelector('h2,h3'); if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});} $('book').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}); }
  document.querySelectorAll('[data-back]').forEach(function(b){ b.addEventListener('click',function(){goto(1);}); });
  var leadSent=false;
  function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function fail(msg,el){ errBox.textContent=msg; errBox.hidden=false; if(el) el.focus(); return null; }
  /* Each collector validates its form and returns the lead row plus the Calendly notes,
     or null after showing the error. */
  function inventoryLead(){
    var name=$('auName').value.trim(), email=$('auEmail').value.trim(), store=$('auStore').value.trim(), mobile=$('auMobile').value.trim();
    var sel=document.querySelector('input[name="tap"]:checked'), channels=sel?TAPS[sel.value]:'';
    var est=(window.__est!=null)?String(window.__est):'';
    if(!name) return fail('Please enter your name.',$('auName'));
    if(!validEmail(email)) return fail('Please enter a valid email address.',$('auEmail'));
    return {lead:{name:name,email:email,mobile:mobile,store:store,channels:channels,oversell_estimate_month:est,industry:'Retail and ecommerce',task_time_sink:'Inventory sync / overselling',source:(($('book')&&$('book').dataset.source)||'inventory_sync_lp'),page_url:location.href,timestamp_utc:new Date().toISOString()},
      notes:'Store: '+(store||'not given')+' | Channels: '+(channels||'not given')+' | Oversell estimate: '+(est?'$'+est+'/mo':'not run')+' | Mobile: '+(mobile||'not given')};
  }
  /* Helpdesk is optional. The other four are what we need to read the store before the call. */
  function supportLead(){
    var name=$('auName').value.trim(), email=$('auEmail').value.trim(), store=$('auStore').value.trim(), orders=$('auOrders').value;
    var hd=form.querySelector('input[name="helpdesk"]:checked'), helpdesk=hd?hd.value:'';
    if(!name) return fail('Add your name.',$('auName'));
    if(!validEmail(email)) return fail('Add an email we can send the invite to.',$('auEmail'));
    if(!store) return fail('Add your store URL, so we can look before the call.',$('auStore'));
    if(!orders) return fail('Pick a rough monthly order count.',$('auOrders'));
    return {lead:{name:name,email:email,mobile:'',store:store,orders_month:orders,helpdesk:helpdesk,industry:'Retail and ecommerce',task_time_sink:'Customer support automation',source:(($('book')&&$('book').dataset.source)||'support_automation_lp'),page_url:location.href,timestamp_utc:new Date().toISOString()},
      notes:'Store: '+store+' | Orders/mo: '+orders+' | Helpdesk: '+(helpdesk||'not given')+' | Page: support automation'};
  }
  form.addEventListener('submit',function(e){ e.preventDefault(); errBox.hidden=true;
    var got=SUPPORT?supportLead():inventoryLead(); if(!got) return;
    var lead=got.lead, notes=got.notes;
    submitBtn.disabled=true; submitBtn.textContent='One moment';
    form.querySelectorAll('input[type="hidden"]').forEach(function(el){ lead[el.name]=el.value; });
    function proceed(){
      var url=CALENDLY_URL+'?hide_gdpr_banner=1&name='+encodeURIComponent(lead.name)+'&email='+encodeURIComponent(lead.email)+'&a1='+encodeURIComponent(notes)+calUtm();
      /* embed_domain and embed_type are what Calendly's own widget.js adds. Without them
         Calendly posts nothing to the parent page, so calendly.event_scheduled never
         arrived and no booking was counted. The new tab link is not embedded, so it
         keeps the plain URL. */
      cal.src=url+'&embed_domain='+encodeURIComponent(location.hostname)+'&embed_type=Inline'; calLink.href=url; submitBtn.disabled=false; submitBtn.textContent=submitLabel;
      /* Soft signal, not the conversion: the visitor has given us their details and is
         about to see the calendar. The conversion fires when they actually book. */
      if(window.kabsTrack) kabsTrack('kabs_audit_form_success',{form_name:'lp-audit',form_page:location.pathname});
      if(window.kabsGa4Event&&!leadSent){ leadSent=true; kabsGa4Event('generate_lead',{form_name:'lp-audit'}); }
      goto(2); }
    try{ fetch(WEBHOOK_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(lead)}).then(proceed,proceed); }catch(err){ proceed(); } });
  /* Presentation only. The kabs_booking_completed event for this same message is pushed
     once, in tagging.js, which listens on every page. Pushing it here too would count a
     single booking twice. */
  var booked=false;
  window.addEventListener('message',function(e){ if(e.origin!=='https://calendly.com') return; var d=e.data; if(!(d&&d.event==='calendly.event_scheduled')) return;
    if(!SUPPORT){ doneMsg.hidden=false; return; }
    if(!booked){ booked=true; goto(3); } });
  var bar=$('sticky'), book=$('book');
  /* Support page: the bar shows once the visitor has reached the booking section and
     scrolled away from it, and hides whenever the section is back in view. */
  if(SUPPORT){
    if(bar&&('IntersectionObserver' in window)){ var seen=false;
      new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting) seen=true; bar.classList.toggle('show',seen&&!en.isIntersecting); }); },{threshold:0}).observe(book); }
    return;
  }
  var top=document.querySelector('.hero, .risk-head'), topOut=false, bookIn=false;
  var io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.target===top) topOut=!en.isIntersecting; if(en.target===book) bookIn=en.isIntersecting; }); bar.classList.toggle('show',topOut&&!bookIn); },{threshold:.1});
  if(top) io.observe(top); io.observe(book);
})();
