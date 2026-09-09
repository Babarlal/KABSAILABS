/* Extracted from the landing pages so /lp/*, the eCommerce page and the homepage
   share one copy. Behaviour is unchanged from the inline originals. */

(function(){
  const rows=[...document.querySelectorAll('.row')], calc=document.getElementById('reveal-calc'), exit=document.getElementById('reveal-exit'), say=document.getElementById('say');
  const lines={amazon:'Amazon is the channel that oversells you. It sells fast and tells Shopify late.', marketplace:'Marketplaces are slow to hear about a sale and quick to sell the same unit.', '3pl':'Your warehouse counts one thing and your store counts another. Both are sure they are right.', multi:'More channels, more windows for the same unit to sell twice. Here is what that costs.'};
  const NAMES={amazon:'Shopify and Amazon',marketplace:'Shopify and eBay or Etsy','3pl':'Shopify and a 3PL',multi:'Several channels'};
  const $=id=>document.getElementById(id), money=n=>'$'+Math.round(n).toLocaleString('en-US');
  let current='';
  function num(id){ const v=parseFloat($(id).value); return isFinite(v)&&v>=0?v:0; }
  function compute(){ const o=num('oversells'),a=num('aov'),m=num('mins'),r=num('rate'),rev=o*a,hrs=o*m/60,cost=hrs*r,month=rev+cost;
    $('m1').textContent=`${o} × ${money(a)}`; $('v1').textContent=money(rev);
    $('m2').textContent=`${o} × ${m} min`; $('v2').textContent=(Math.round(hrs*10)/10).toLocaleString('en-US')+' h';
    $('m3').textContent=`${Math.round(hrs*10)/10} h × ${money(r)}`; $('v3').textContent=money(cost);
    $('v4').textContent=money(month); $('v5').textContent=money(month*12);
    window.__est=Math.round(month);
    if(current){ $('auRecapTap').textContent=NAMES[current]; $('auRecapEst').textContent=money(month)+' a month, by your numbers'; $('auRecapEstWrap').hidden=false; $('auRecap').hidden=false; } }
  function pick(key,scroll){ current=key; rows.forEach(r=>r.setAttribute('aria-pressed',String(r.dataset.tap===key)));
    if(key==='shopify-only'){ calc.classList.remove('on'); exit.classList.add('on'); $('auRecap').hidden=true; }
    else { exit.classList.remove('on'); calc.classList.add('on'); say.textContent=lines[key]||lines.multi; if(window.__setTap) window.__setTap(key); compute(); }
    if(scroll) (key==='shopify-only'?exit:calc).scrollIntoView({behavior:'smooth',block:'start'}); }
  rows.forEach(r=>r.addEventListener('click',()=>pick(r.dataset.tap,true)));
  $('retap').addEventListener('click',()=>{ exit.classList.remove('on'); rows.forEach(r=>r.setAttribute('aria-pressed','false')); document.getElementById('where').scrollIntoView({behavior:'smooth'}); });
  let raf; ['oversells','aov','mins','rate'].forEach(id=>$(id).addEventListener('input',()=>{ cancelAnimationFrame(raf); raf=requestAnimationFrame(compute); }));
  const q=new URLSearchParams(location.search).get('tap'); if(q&&(lines[q]||q==='shopify-only')) pick(q,false);
})();
