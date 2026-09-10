/* Extracted from the landing pages so /lp/*, the eCommerce page and the homepage
   share one copy. Behaviour is unchanged from the inline originals. */

/* --- Three.js loader (must run before the engine below) --- */
/* Three.js loader: cdnjs first (works in previews), esm.sh on the live site (CSP), 2D canvas if neither or no WebGL. */
window.__three = new Promise(function(res){
  var s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  s.onload=function(){res(window.THREE||null)};
  s.onerror=function(){ try{ import('https://esm.sh/three@0.128.0').then(function(m){res(m)},function(){res(null)}); }catch(e){res(null)} };
  document.head.appendChild(s);
});

/* --- scene engine --- */
(function(){
  var canvas=document.getElementById('scene'); if(!canvas) return;
  var wrap=canvas.parentElement, labelEls=[].slice.call(document.querySelectorAll('.node-label'));
  var MODE=canvas.dataset.mode||'stock', reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Scene colours come from the palette (see --scene-* in lp.css) so the canvas
     follows whichever colour scheme is active. The literals are the green defaults. */
  var cs=getComputedStyle(canvas);
  function tok(n,d){ var v=cs.getPropertyValue(n); return (v&&v.trim())||d; }
  var C={brand:tok('--scene-brand','#BFE9CF'),violet:tok('--scene-halo','#7CCFA0'),
         sat:tok('--scene-sat','#E3E8E1'),line:tok('--scene-line','#3F6656'),
         dim:tok('--scene-dim','#5E8A78'),warn:tok('--scene-warn','#E4552E'),
         ok:tok('--scene-ok','#BFE9CF')};
  /* ---- shared model ---- */
  var R=2.7, P=[[0,0,0]]; for(var i=0;i<4;i++){ var a=Math.PI/4+i*Math.PI/2; P.push([Math.cos(a)*R, Math.sin(i*1.7)*.45, Math.sin(a)*R]); }
  var curves=[]; for(var i=1;i<5;i++){ var m=[P[i][0]*.5,P[i][1]*.5+.9,P[i][2]*.5]; curves.push({a:P[0],m:m,b:P[i]}); }
  function bez(c,t){ var u=1-t; return [u*u*c.a[0]+2*u*t*c.m[0]+t*t*c.b[0], u*u*c.a[1]+2*u*t*c.m[1]+t*t*c.b[1], u*u*c.a[2]+2*u*t*c.m[2]+t*t*c.b[2]]; }
  var flows=[]; for(var i=1;i<5;i++){ var N=22,t=[]; for(var k=0;k<N;k++) t.push(Math.random()); flows.push({i:i,N:N,t:t,burst:null,pts:[],cols:[]}); }
  var nodeCol=[C.brand,C.sat,C.sat,C.sat,C.sat], haloScale=1, rotY=0, px=0, tx=0;
  var view={scale:1,gx:0,gy:0,cam:[0,1.7,7.6],look:[0,.4,0],fov:36,w:1,h:1};
  var timeline=[]; function schedule(fn,ms){ timeline.push({at:performance.now()+ms,fn:fn}); }
  /* ---- label state ---- */
  var counts=[41,41,41,41,41];
  function flash(i,cls){ var el=labelEls[i]; el.classList.remove('sold','synced'); if(cls){ el.classList.add(cls); setTimeout(function(){el.classList.remove(cls)},900);} }
  function setCount(i,v,cls){ counts[i]=v; labelEls[i].querySelector('.num').textContent=v; flash(i,cls); }
  function setStatus(i,txt,cls){ var st=labelEls[i].querySelector('.st'); if(st) st.textContent=txt; flash(i,cls); }
  function sale(){ var i=1+Math.floor(Math.random()*4), f=flows[i-1];
    nodeCol[i]=C.warn; setCount(i,counts[0]-1,'sold'); f.burst={dir:-1,t0:performance.now(),dur:650,color:C.warn};
    schedule(function(){ nodeCol[i]=C.sat; haloScale=1.55; nodeCol[0]=C.sat; var v=counts[0]-1; setCount(0,v,'synced');
      flows.forEach(function(g){ if(g.i!==i) g.burst={dir:1,t0:performance.now(),dur:520,color:C.ok}; });
      schedule(function(){ nodeCol[0]=C.brand; flows.forEach(function(g){ if(g.i!==i) setCount(g.i,v,'synced'); }); },540); },680);
    schedule(counts[0]<=31?restock:sale, 4200+Math.random()*1800); }
  function restock(){ var v=counts[0]+18; haloScale=1.8; flows.forEach(function(g){ g.burst={dir:1,t0:performance.now(),dur:700,color:C.ok}; }); setCount(0,v,'synced'); schedule(function(){ for(var i=1;i<5;i++) setCount(i,v,'synced'); },720); schedule(sale,4600); }
  /* flow mode (homepage): a trigger arrives from one tool, the agent acts, the other tools update */
  var OUT=JSON.parse(canvas.dataset.outcomes||'{}');
  function trigger(){ var i=1+Math.floor(Math.random()*4), f=flows[i-1], ev=OUT.triggers&&OUT.triggers[i-1]||'event';
    nodeCol[i]=C.brand; setStatus(i,ev,'sold'); f.burst={dir:-1,t0:performance.now(),dur:650,color:C.brand};
    schedule(function(){ nodeCol[i]=C.sat; haloScale=1.6; setStatus(0,'acting','synced');
      flows.forEach(function(g){ if(g.i!==i) g.burst={dir:1,t0:performance.now(),dur:560,color:C.ok}; });
      schedule(function(){ flows.forEach(function(g){ if(g.i!==i) setStatus(g.i,OUT.results&&OUT.results[g.i-1]||'updated','synced'); }); setStatus(0,'done','synced'); },580);
      schedule(function(){ for(var k=0;k<5;k++) setStatus(k,k?'listening':'ready',null); },3200); },680);
    schedule(trigger, 5200+Math.random()*1800); }
  /* ---- projection (used for labels in both renderers and for the 2D renderer) ---- */
  function world(p){ var c=Math.cos(rotY),s=Math.sin(rotY),x=p[0]*view.scale,y=p[1]*view.scale,z=p[2]*view.scale; return [c*x+s*z+view.gx, y+view.gy, -s*x+c*z]; }
  var basis={};
  function setupCam(){ var f=[view.look[0]-view.cam[0],view.look[1]-view.cam[1],view.look[2]-view.cam[2]], l=Math.hypot(f[0],f[1],f[2]); f=[f[0]/l,f[1]/l,f[2]/l];
    var r=[-f[2],0,f[0]]; var rl=Math.hypot(r[0],r[1],r[2]); r=[r[0]/rl,r[1]/rl,r[2]/rl]; var u=[r[1]*f[2]-r[2]*f[1], r[2]*f[0]-r[0]*f[2], r[0]*f[1]-r[1]*f[0]];
    basis={f:f,r:r,u:u,F:(view.h/2)/Math.tan(view.fov*Math.PI/360)}; }
  function project(w){ var d=[w[0]-view.cam[0],w[1]-view.cam[1],w[2]-view.cam[2]], z=d[0]*basis.f[0]+d[1]*basis.f[1]+d[2]*basis.f[2], x=d[0]*basis.r[0]+d[1]*basis.r[1]+d[2]*basis.r[2], y=d[0]*basis.u[0]+d[1]*basis.u[1]+d[2]*basis.u[2];
    return [view.w/2+x/z*basis.F, view.h/2-y/z*basis.F, z]; }
  function placeLabels(){ for(var i=0;i<5;i++){ var w=world(P[i]); w[1]+=(i?0.34:0.62)*view.scale; var q=project(w); labelEls[i].style.transform='translate('+q[0]+'px,'+q[1]+'px) translate(-50%,-100%)'; } }
  function layout(){ var w=canvas.clientWidth||wrap.clientWidth, h=canvas.clientHeight||wrap.clientHeight; view.w=w; view.h=h; view.gx=0;
    /* data-frame="card": a small square panel (the homepage hero visual). The narrow
       branch is tuned for a full-bleed phone hero and packs the nodes so tightly that
       the labels collide in a 430px box, so the card gets its own framing. */
    /* A short canvas (the homepage card, or the phone hero band where the scene is
       pinned to the top 44%) needs the graph spread across the box, not the tall
       full-bleed framing, or the five labels land on top of each other. */
    if(canvas.dataset.frame==='card' || h<540){ view.cam=[0,0,8.4]; view.look=[0,0,0]; view.scale=.86; view.gy=0; setupCam(); return; }
    if(w<700){ view.cam=[0,1.4,9]; view.look=[0,1.0,0]; view.scale=.5; view.gy=1.7; setupCam(); return; }
    /* Desktop. F is (h/2)/tan(fov/2) against a fixed camera distance, so the scene's
       on-screen size is a straight linear function of the HERO's height, while the
       headline is clamped and keeps its size. A short laptop viewport therefore
       shrinks the animation out of the composition. Give back most of the height the
       hero lost against a reference tall hero, cap it so the ring always fits the
       hero's width, and lift/shift it clear of the bottom-left copy as it grows.
       A tall wide hero resolves to zoom 1, so that composition is untouched. */
    var REF_H=980, camDist=7.6;
    var F=(h/2)/Math.tan(view.fov*Math.PI/360);
    var fit=(0.42*w*camDist)/(R*F);                     /* ring + labels stay inside the width */
    var wGate=Math.max(0,Math.min(1,(w-900)/300));      /* fade the compensation out on narrow desktops */
    var zoom=Math.max(1, 1+0.75*(REF_H/h-1));           /* only ever grows, never shrinks */
    zoom=1+(zoom-1)*wGate;
    zoom=Math.max(0.65, Math.min(zoom, 1.45, fit));
    var grow=zoom-1;
    view.cam=[0,1.7,camDist]; view.look=[0,.4,0];
    view.scale=zoom; view.gy=.9+grow*1.6; view.gx=grow*1.2;
    setupCam(); }
  function step(now){ px+=(tx-px)*.05; var t=now/1000; rotY=Math.sin(t*.12)*.28+px; haloScale+=(1-haloScale)*.08;
    for(var fi=0;fi<4;fi++){ var f=flows[fi], c=curves[fi];
      for(var k=0;k<f.N;k++){ var tt,col;
        if(f.burst){ var p=Math.min(1,(now-f.burst.t0)/f.burst.dur), spread=(k/f.N)*.18; tt=f.burst.dir>0?p*(1+spread)-spread:1-(p*(1+spread)-spread); tt=Math.max(0,Math.min(1,tt)); col=f.burst.color; if(p>=1) f.burst=null; }
        else { f.t[k]=(f.t[k]+.001)%1; tt=f.t[k]; col=C.dim; }
        f.pts[k]=bez(c,tt); f.cols[k]=col; } }
    for(var i=timeline.length-1;i>=0;i--){ if(now>=timeline[i].at){ var ev=timeline.splice(i,1)[0]; ev.fn(); } } }
  var visible=true, raf=null, render=null;
  addEventListener('pointermove',function(e){ if(e.pointerType==='mouse') tx=(e.clientX/innerWidth-.5)*.5; },{passive:true});
  function loop(){ raf=requestAnimationFrame(function(now){ raf=null; step(now); render(); placeLabels(); if(visible&&!reduce) loop(); }); }
  function start(){ layout(); step(performance.now()); render(); placeLabels(); labelEls.forEach(function(el){el.classList.add('ready')});
    addEventListener('resize',function(){ layout(); if(typeof render.resize==='function') render.resize(); render(); placeLabels(); },{passive:true});
    new IntersectionObserver(function(en){ visible=en[0].isIntersecting; if(visible&&!raf&&!reduce) loop(); },{threshold:.05}).observe(wrap);
    if(!reduce){ schedule(MODE==='flow'?trigger:sale,1600); loop(); } }
  /* ---- renderer A: Three.js ---- */
  function threeRenderer(THREE){
    var renderer; try{ renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true,powerPreference:'low-power'}); }catch(e){ return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
    var scene=new THREE.Scene(), cam=new THREE.PerspectiveCamera(view.fov,1,.1,60);
    var nodes=P.map(function(p,i){ var m=new THREE.Mesh(new THREE.SphereGeometry(i?0.2:0.42,28,20), new THREE.MeshBasicMaterial({color:new THREE.Color(nodeCol[i])})); scene.add(m); return m; });
    var halo=new THREE.Mesh(new THREE.IcosahedronGeometry(0.64,1), new THREE.MeshBasicMaterial({color:new THREE.Color(C.violet),wireframe:true,transparent:true,opacity:.5})); scene.add(halo);
    var ring=new THREE.Mesh(new THREE.TorusGeometry(R,0.006,6,120), new THREE.MeshBasicMaterial({color:new THREE.Color(C.line),transparent:true,opacity:.7})); scene.add(ring);
    var lines=curves.map(function(c){ var pts=[]; for(var k=0;k<=40;k++){ var b=bez(c,k/40); pts.push(new THREE.Vector3(b[0],b[1],b[2])); } var L=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({color:new THREE.Color(C.line),transparent:true,opacity:.7})); scene.add(L); return L; });
    var ptsObjs=flows.map(function(f){ var geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(f.N*3),3)); geo.setAttribute('color',new THREE.BufferAttribute(new Float32Array(f.N*3),3)); var o=new THREE.Points(geo,new THREE.PointsMaterial({size:.09,vertexColors:true,transparent:true,opacity:.95,sizeAttenuation:true})); scene.add(o); return o; });
    var D=260,dg=new THREE.BufferGeometry(),dp=new Float32Array(D*3); for(var i=0;i<D;i++){ dp[i*3]=(Math.random()-.5)*14; dp[i*3+1]=(Math.random()-.5)*8; dp[i*3+2]=(Math.random()-.5)*10; } dg.setAttribute('position',new THREE.BufferAttribute(dp,3)); scene.add(new THREE.Points(dg,new THREE.PointsMaterial({color:new THREE.Color(C.dim),size:.025,transparent:true,opacity:.55})));
    var group=new THREE.Group(); [ring,halo].concat(nodes,lines,ptsObjs).forEach(function(o){group.add(o)}); scene.add(group);
    var tmp=new THREE.Color();
    function r(){ group.rotation.y=rotY; group.scale.setScalar(view.scale); group.position.x=view.gx; group.position.y=view.gy; halo.scale.setScalar(haloScale); halo.rotation.y=performance.now()/4000; halo.rotation.z=performance.now()/9000;
      nodes.forEach(function(n,i){ n.material.color.set(nodeCol[i]); });
      ptsObjs.forEach(function(o,fi){ var f=flows[fi], pa=o.geometry.attributes.position.array, ca=o.geometry.attributes.color.array; for(var k=0;k<f.N;k++){ var p=f.pts[k]||[0,0,0]; pa[k*3]=p[0];pa[k*3+1]=p[1];pa[k*3+2]=p[2]; tmp.set(f.cols[k]||C.dim); ca[k*3]=tmp.r;ca[k*3+1]=tmp.g;ca[k*3+2]=tmp.b; } o.geometry.attributes.position.needsUpdate=true; o.geometry.attributes.color.needsUpdate=true; });
      cam.position.set(view.cam[0],view.cam[1],view.cam[2]); cam.lookAt(view.look[0],view.look[1],view.look[2]); renderer.render(scene,cam); }
    r.resize=function(){ renderer.setSize(view.w,view.h,false); cam.aspect=view.w/view.h; cam.updateProjectionMatrix(); };
    r.resize(); return r; }
  /* ---- renderer B: 2D canvas, same model, same projection ---- */
  function flatRenderer(){
    var ctx=canvas.getContext('2d'); if(!ctx) return null; var dpr=Math.min(devicePixelRatio||1,2);
    var dust=[]; for(var i=0;i<160;i++) dust.push([(Math.random()-.5)*14,(Math.random()-.5)*8,(Math.random()-.5)*10]);
    function r(){ ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,view.w,view.h);
      ctx.fillStyle=C.dim; ctx.globalAlpha=.5; dust.forEach(function(d){ var q=project(d); if(q[2]>0.5){ ctx.beginPath(); ctx.arc(q[0],q[1],1.1,0,6.28); ctx.fill(); } }); ctx.globalAlpha=1;
      ctx.strokeStyle=C.line; ctx.lineWidth=1; ctx.beginPath(); for(var k=0;k<=120;k++){ var a=k/120*6.2832, q=project(world([Math.cos(a)*R,0,Math.sin(a)*R])); if(k===0) ctx.moveTo(q[0],q[1]); else ctx.lineTo(q[0],q[1]); } ctx.stroke();
      curves.forEach(function(c){ ctx.beginPath(); for(var k=0;k<=40;k++){ var q=project(world(bez(c,k/40))); if(k===0) ctx.moveTo(q[0],q[1]); else ctx.lineTo(q[0],q[1]); } ctx.stroke(); });
      flows.forEach(function(f){ for(var k=0;k<f.N;k++){ var q=project(world(f.pts[k]||[0,0,0])); ctx.fillStyle=f.cols[k]||C.dim; ctx.beginPath(); ctx.arc(q[0],q[1],Math.max(1.2,basis.F*.045/q[2]),0,6.28); ctx.fill(); } });
      var order=[0,1,2,3,4].map(function(i){ return [i,project(world(P[i]))]; }).sort(function(a,b){ return b[1][2]-a[1][2]; });
      order.forEach(function(o){ var i=o[0], q=o[1], rad=(i?0.2:0.42)*view.scale*basis.F/q[2]; if(!i){ ctx.strokeStyle=C.violet; ctx.globalAlpha=.5; ctx.beginPath(); ctx.arc(q[0],q[1],rad*1.5*haloScale,0,6.28); ctx.stroke(); ctx.globalAlpha=1; } ctx.fillStyle=nodeCol[i]; ctx.beginPath(); ctx.arc(q[0],q[1],rad,0,6.28); ctx.fill(); }); }
    r.resize=function(){ canvas.width=view.w*dpr; canvas.height=view.h*dpr; }; r.resize(); return r; }
  /* Paint straight away with the 2D renderer: the hero must never sit empty while a
     CDN request is in flight. If Three.js arrives we swap in a fresh canvas and
     upgrade, because a canvas that has handed out a 2D context can never return a
     WebGL one. Any failure just leaves the 2D scene running. */
  render=flatRenderer();
  if(!render){ canvas.remove(); return; }
  start();
  window.__three.then(function(THREE){
    if(!THREE||reduce) return;
    try{
      var fresh=canvas.cloneNode(false), prev=canvas;
      prev.parentNode.insertBefore(fresh,prev);
      canvas=fresh;
      var up=threeRenderer(THREE);
      if(up){ prev.remove(); render=up; layout(); render.resize(); render(); placeLabels(); }
      else { fresh.remove(); canvas=prev; }
    }catch(e){ /* stay on the 2D renderer */ }
  },function(){});
})();
