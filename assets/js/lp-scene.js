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

  /* ---- framing ------------------------------------------------------------
     Scale and position are solved against the scene's own box, not against the
     viewport, and the solve is continuous: there is no width where the framing
     jumps. Two things follow. The scene keeps its on-screen size when a laptop
     viewport is short, because F is proportional to the box height and the
     scale rises to cancel that. And it can never reach past the box, because
     the same solve is what sets the scale in the first place. */

  /* Label boxes, remeasured each layout: they are the widest part of the scene
     and their width depends on the font that actually loaded. */
  var lbox=[[96,64],[86,58],[86,58],[86,58],[86,58]];
  function measureLabels(){ for(var i=0;i<5;i++){ var el=labelEls[i], w=el.offsetWidth, h=el.offsetHeight;
    if(w>0&&h>0) lbox[i]=[w*1.06+8, h*1.04+4]; } }        /* margin for a status word changing length */
  function widestLabel(){ var m=0; for(var i=0;i<5;i++) m=Math.max(m,lbox[i][0]); return m; }

  /* Largest scale whose ring silhouette still clears a half width of A. The
     ring is a circle of radius R*s seen from d, so it spans R*s*F/sqrt(d^2 -
     (R*s)^2) either side of centre; this is that solved for s. */
  function scaleForHalf(A,F){ var d=view.cam[2]; if(A<=1) return .2; return (A*d)/(R*Math.sqrt(F*F+A*A)); }

  /* The landing pages float their nav over the scene. It is part of the box the
     scene has to share, so the band starts under it rather than behind it and a
     channel label never lands on the wordmark. Measured against the canvas,
     which is the coordinate space the labels are placed in, so a page whose
     header sits in normal flow reports nothing to avoid. */
  function topObstruction(){
    var n=document.querySelector('nav'); if(!n) return 0;
    var ns=getComputedStyle(n);
    if(ns.position!=='absolute'&&ns.position!=='fixed') return 0;
    var cr=canvas.getBoundingClientRect(), nr=n.getBoundingClientRect();
    return Math.max(0, Math.min(nr.bottom-cr.top+6, cr.height*0.35));
  }

  /* Projected bounds in box coordinates, over the rotations the scene actually
     reaches. Two things this deliberately does not do. It does not sample a
     whole turn: step() holds rotY to a slow sway of .28 plus up to .25 of
     pointer parallax, so a full turn would bound configurations it never
     reaches and shrink the scene for nothing. And labelsOnly leaves the orbit
     ring out, because the labels are the readable part and the thing that has
     to clear the headline, while the ring is a thin line meant to run on behind
     the copy under its gradient; fitting the height to the ring instead starves
     the scene on a short laptop. */
  var ROT_MAX=0.28+0.25+0.02;
  function sceneBox(labelsOnly){
    var l=1e9,r=-1e9,t=1e9,b=-1e9,keep=rotY,i,k,q,wp,N=9;
    for(k=0;k<N;k++){ rotY=-ROT_MAX+k*(2*ROT_MAX/(N-1));
      for(i=0;i<5;i++){ wp=world(P[i]); wp[1]+=(i?0.34:0.62)*view.scale; q=project(wp);
        l=Math.min(l,q[0]-lbox[i][0]/2); r=Math.max(r,q[0]+lbox[i][0]/2);
        t=Math.min(t,q[1]-lbox[i][1]);   b=Math.max(b,q[1]); } }
    rotY=keep;
    if(!labelsOnly) for(k=0;k<24;k++){ var a=k*Math.PI/12; q=project(world([Math.cos(a)*R,0,Math.sin(a)*R]));
      l=Math.min(l,q[0]); r=Math.max(r,q[0]); t=Math.min(t,q[1]); b=Math.max(b,q[1]); }
    return {l:l,r:r,t:t,b:b,w:r-l,h:b-t};
  }
  /* Slide the scene until it sits on (cx,cy): x against the full box, because
     nothing at all may cross the left or right edge, y against whichever box
     the caller is composing to. gx and gy are world units and the shift they
     produce on screen is depth dependent, so this corrects rather than solves. */
  function frameTo(cx,cy,yLabels){
    for(var it=0;it<3;it++){ setupCam();
      var fb=sceneBox(false), yb=yLabels?sceneBox(true):fb, z=view.cam[2];
      view.gx+=((cx-(fb.l+fb.r)/2)*z)/basis.F;
      view.gy-=((cy-(yb.t+yb.b)/2)*z)/basis.F; }
    setupCam();
  }

  function layout(){
    var w=canvas.clientWidth||wrap.clientWidth, h=canvas.clientHeight||wrap.clientHeight;
    if(!w||!h) return;
    view.w=w; view.h=h; view.gx=0; view.gy=0;
    measureLabels();
    var F=(h/2)/Math.tan(view.fov*Math.PI/360);
    var pad=Math.max(10,Math.min(22,w*0.018));
    /* A short box is the phone band or a square card: the copy sits outside it,
       so the scene gets the whole box. A tall box is the full bleed hero, where
       the copy sits over the lower part and the scene has to stay above it. */
    var band=(canvas.dataset.frame==='card' || h<540 || w<700);
    /* The band framing lifts the camera further than the hero's. The ring is a
       shallow ellipse at the hero's angle, so in a short wide band it would draw
       as a flat line with empty space under it; the extra tilt opens it into a
       ring that reads, and spreads the labels apart vertically as well. */
    view.cam=band?[0,2.55,8.0]:[0,1.7,7.6];
    view.look=band?[0,.15,0]:[0,.4,0];
    var sFit=scaleForHalf(w/2-pad-widestLabel()/2, F);
    var s, bandT=pad+topObstruction(), bandB=h-pad;
    if(band){
      /* Fill: on a phone the band is only as tall as the cluster needs, so the
         width is what binds and the scene should take all of it. */
      s=Math.min(sFit,2.4);
    }else{
      /* Hold: REF_H is the tall window height at which the scale is 1, so a
         1920 by 1080 hero resolves to exactly the framing it had before, and a
         shorter hero scales up to keep s*F, the on-screen size, level. */
      var REF_H=1040;
      s=Math.min(Math.max(1,REF_H/h), 1.60, sFit);
      /* The copy sits at the bottom under a gradient scrim and the scene is
         meant to run behind it, so the floor is the headline's top edge, not
         the top of the copy block. Anchoring to the eyebrow instead starves the
         scene of height on a short laptop and shrinks it away to nothing. */
      var hr=wrap.getBoundingClientRect();
      var h1=wrap.querySelector('.hero-copy h1')||wrap.querySelector('h1');
      bandB=h1?(h1.getBoundingClientRect().top-hr.top-10):h*0.74;
      if(bandB<bandT+140) bandB=bandT+140;
    }
    /* Where the scene sits in its band. On the hero 0.536 is where it already
       sat on a tall window, so 1920 is unchanged, and it drifts up as it grows
       so the copy keeps its air. */
    function cyFor(sv){ return band?(bandT+bandB)/2
      :bandT+(bandB-bandT)*Math.max(.34,Math.min(.60,.536-.10*(sv-1))); }
    /* On the hero the ring may run off the top and behind the copy, which is how
       it always read; the labels are the readable part and must stay whole and
       clear of the headline. In a phone band nothing sits over it, so the whole
       scene has to fit. */
    var yLabels=!band;
    function fits(sv){
      view.scale=sv; frameTo(w/2,cyFor(sv),yLabels);
      var fb=sceneBox(false), yb=yLabels?sceneBox(true):fb;
      return fb.w<=(w-2*pad)+0.5 && yb.h<=(bandB-bandT)+0.5 && yb.t>=bandT-0.5;
    }
    /* Bisect rather than step down. Most of the label block's height is a fixed
       pixel cost that barely moves with the scale, so a coarse multiplicative
       step gives away a fifth of the scene to clear a few pixels of overflow. */
    if(!fits(s)){
      var lo=0.3, hi=s;
      for(var g=0;g<14;g++){ var mid=(lo+hi)/2; if(fits(mid)) lo=mid; else hi=mid; }
      s=lo; fits(s);
    }
    var cy=cyFor(s);
    /* Then bias right by whatever slack is genuinely there, so a grown scene
       clears the copy without ever crossing the box edge. At scale 1 the bias
       is zero and the composition is untouched. */
    var bx2=sceneBox(false), bias=Math.min((s-1)*0.10*w, Math.max(0,(w-pad)-bx2.r));
    if(bias>0.5) frameTo(w/2+bias,cy,yLabels);
    /* Last guard: nothing crosses the left or right edge, nothing is clipped off
       the top, and no label reaches below the floor, whatever the solve produced. */
    var fb2=sceneBox(false), yb2=yLabels?sceneBox(true):fb2, dx=0, dy=0;
    if(fb2.l<pad) dx=pad-fb2.l; else if(fb2.r>w-pad) dx=(w-pad)-fb2.r;
    if(yb2.t<pad) dy=pad-yb2.t; else if(yb2.b>bandB) dy=bandB-yb2.b;
    if(dx||dy) frameTo((fb2.l+fb2.r)/2+dx,(yb2.t+yb2.b)/2+dy,yLabels);
  }
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
  function reflow(){ layout(); if(render&&typeof render.resize==='function') render.resize(); if(render) render(); placeLabels(); }
  function start(){ layout(); step(performance.now()); render(); placeLabels(); labelEls.forEach(function(el){el.classList.add('ready')});
    addEventListener('resize',reflow,{passive:true});
    /* The framing is solved against the label widths and the headline's position,
       and both move when the webfonts land, so solve again once they have. */
    if(document.fonts&&document.fonts.ready) document.fonts.ready.then(reflow,function(){});
    /* The hero's own box is what the solve reads, so watch that rather than the
       window: it also catches the phone address bar collapsing the viewport. */
    if(window.ResizeObserver){ try{ new ResizeObserver(reflow).observe(wrap); }catch(e){} }
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
