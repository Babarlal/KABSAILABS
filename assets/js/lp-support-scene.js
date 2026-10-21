/* Hero scene for /services/shopify-support-automation and its /lp/ copy.
   Messages arrive from channels, Shopify data answers most of them (mint), the rest
   go to a person (coral). Plain 2D canvas on purpose: no three.js on this page, so the
   hero stays light. Pauses off screen and in a hidden tab, and draws one still frame
   for reduced motion. The canvas is decorative and aria-hidden. */

(function(){
  var cv = document.getElementById("scene"); if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* Colours come from the palette (--scene-* in lp.css), like lp-scene.js. The literals
     are the green defaults the draft was drawn with. */
  var cs = getComputedStyle(cv);
  function tok(n, d){ var v = cs.getPropertyValue(n); return (v && v.trim()) || d; }
  var C = {brand:tok("--scene-brand","#BFE9CF"), halo:tok("--scene-halo","#7CCFA0"), sat:tok("--scene-sat","#E3E8E1"),
           line:tok("--scene-line","#3F6656"), dim:tok("--scene-dim","#5E8A78"), warn:tok("--scene-warn","#E4552E")};
  var nodes = [
    {id:"shop", x:.50, y:.50, r:34, label:"Shopify", sub:"orders + tracking", core:true},
    {id:"email", x:.15, y:.28, r:9, label:"Email", src:true},
    {id:"chat", x:.13, y:.74, r:9, label:"Chat", src:true},
    {id:"wa", x:.32, y:.88, r:9, label:"WhatsApp", src:true},
    {id:"desk", x:.82, y:.24, r:9, label:"Helpdesk", src:true},
    {id:"team", x:.86, y:.72, r:13, label:"Your team", team:true}
  ];
  var byId = {}; nodes.forEach(function(n){ byId[n.id] = n; });
  var W = 0, H = 0, dpr = 1, parts = [], last = 0, spawnT = 0, running = false, ans = 0, hum = 0;
  var tA = document.getElementById("tAns"), tH = document.getElementById("tHum");

  function size(){
    /* DPR capped at 2: a 3x phone gains nothing visible and pays 2.25x the fill cost. */
    var b = cv.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = b.width; H = b.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    var narrow = W < 620;
    /* Nodes are laid out in the band above the tally, so no node or label can sit on
       the counters whatever the scene height or how the tally wraps. */
    var tally = document.querySelector(".sp-tally"), U = H;
    if (tally){ var tt = tally.getBoundingClientRect().top - b.top; if (tt > 0) U = Math.min(H, tt - 6); }
    nodes.forEach(function(n){ n.px = n.x * W; n.py = n.y * U; n.pr = narrow && n.core ? 26 : n.r; });
    if (narrow){
      byId.email.px = W*.12; byId.desk.px = W*.86; byId.team.px = W*.86;
      /* On a phone the hub sits a little higher and WhatsApp moves up and in, so its
         label clears both the hub caption and the Chat node at 320px. Helpdesk drops
         below the "Illustration" note, which sits top right at this width. */
      byId.shop.py = U*.46; byId.wa.px = W*.28; byId.wa.py = U - byId.wa.r - 5;
      byId.desk.py = U*.33;
    }
  }
  function ctrl(a, b){ var mx = (a.px + b.px)/2, my = (a.py + b.py)/2; return {x: mx, y: my - Math.abs(a.px - b.px)*.18 - 14}; }
  function bez(a, c, b, t){ var u = 1 - t; return {x: u*u*a.px + 2*u*t*c.x + t*t*b.px, y: u*u*a.py + 2*u*t*c.y + t*t*b.py}; }
  /* About one in five goes to a person. An illustration of the hand-off, not a measured rate. */
  function spawn(){
    var srcs = nodes.filter(function(n){ return n.src; });
    var s = srcs[Math.floor(Math.random()*srcs.length)];
    parts.push({from:s, to:byId.shop, t:0, speed:.42 + Math.random()*.25, phase:"in", human: Math.random() < .2});
  }
  function drawEdges(){
    ctx.lineWidth = 1; ctx.strokeStyle = C.line; ctx.globalAlpha = .55;
    nodes.forEach(function(n){ if (n.core) return; var c = ctrl(n, byId.shop); ctx.beginPath(); ctx.moveTo(n.px, n.py); ctx.quadraticCurveTo(c.x, c.y, byId.shop.px, byId.shop.py); ctx.stroke(); });
    ctx.globalAlpha = 1;
  }
  function drawNodes(now){
    nodes.forEach(function(n){
      if (n.core){
        var pulse = reduce ? 0 : (Math.sin(now/700) + 1) * 4;
        var g = ctx.createRadialGradient(n.px, n.py, 0, n.px, n.py, n.pr*2.4 + pulse);
        g.addColorStop(0, "rgba(124,207,160,.35)"); g.addColorStop(1, "rgba(124,207,160,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.px, n.py, n.pr*2.4 + pulse, 0, 6.283); ctx.fill();
        ctx.fillStyle = C.brand; ctx.beginPath(); ctx.arc(n.px, n.py, n.pr, 0, 6.283); ctx.fill();
        ctx.strokeStyle = C.halo; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(n.px, n.py, n.pr + 7, 0, 6.283); ctx.stroke();
        ctx.fillStyle = "#0F2B24"; ctx.font = "600 13px 'Instrument Sans', sans-serif"; ctx.textAlign = "center"; ctx.fillText(n.label, n.px, n.py + 4);
        ctx.fillStyle = C.dim; ctx.font = "500 11px 'JetBrains Mono', monospace"; ctx.fillText(n.sub, n.px, n.py + n.pr + 24);
      } else {
        ctx.fillStyle = "#0F2B24"; ctx.strokeStyle = n.team ? C.warn : C.sat; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(n.px, n.py, n.pr, 0, 6.283); ctx.fill(); ctx.stroke();
        ctx.fillStyle = n.team ? "#F6B3A2" : C.sat; ctx.font = "500 13px 'Instrument Sans', sans-serif"; ctx.textAlign = "center";
        ctx.fillText(n.label, n.px, n.py - n.pr - 9);
      }
    });
  }
  function drawParts(dt){
    for (var i = parts.length - 1; i >= 0; i--){
      var p = parts[i]; p.t += dt * p.speed;
      if (p.t >= 1){
        if (p.phase === "in"){ p.phase = "out"; p.t = 0; p.from = byId.shop; p.to = p.human ? byId.team : p.origin || p.to; }
        else { if (p.human){ hum++; tH.textContent = hum; } else { ans++; tA.textContent = ans; } parts.splice(i,1); continue; }
      }
      if (p.phase === "in" && !p.origin) p.origin = p.from;
      if (p.phase === "out" && !p.human) p.to = p.origin;
      var c = ctrl(p.from === byId.shop ? p.to : p.from, byId.shop);
      var a = p.from, b = p.to, pt = bez(a, c, b, p.t);
      var col = p.phase === "in" ? C.sat : (p.human ? C.warn : C.halo);
      ctx.fillStyle = col; ctx.globalAlpha = .25; ctx.beginPath(); ctx.arc(pt.x, pt.y, 7, 0, 6.283); ctx.fill();
      ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(pt.x, pt.y, 3.2, 0, 6.283); ctx.fill();
    }
  }
  function frame(now){
    if (!running) return;
    /* dt capped so a dropped frame or a resumed tab never teleports the dots. */
    var dt = Math.min((now - (last || now)) / 1000, .05); last = now;
    spawnT -= dt; if (spawnT <= 0){ spawn(); spawnT = .55 + Math.random()*.6; }
    paint(now, dt);
    requestAnimationFrame(frame);
  }
  function paint(now, dt){ ctx.clearRect(0,0,W,H); drawEdges(); drawParts(dt); drawNodes(now); }
  function start(){ if (running || !inView || document.hidden) return; running = true; last = 0; requestAnimationFrame(frame); }
  function still(){
    ctx.clearRect(0,0,W,H); drawEdges();
    [[byId.email,.5,C.sat],[byId.desk,.35,C.halo],[byId.team,.6,C.warn],[byId.chat,.55,C.halo]].forEach(function(s){
      var c = ctrl(s[0], byId.shop), p = bez(s[0], c, byId.shop, s[1]); ctx.fillStyle = s[2]; ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, 6.283); ctx.fill();
    });
    drawNodes(0); tA.textContent = "–"; tH.textContent = "–";
  }
  /* Resizing clears the canvas. A paused scene repaints where it stopped, without
     advancing, so the counters keep their numbers. */
  function relayout(){ size(); if (reduce) still(); else if (!running) paint(performance.now(), 0); }
  size(); window.addEventListener("resize", relayout);
  /* The tally's height, and so the band above it, depends on the web font. */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  if (reduce){ still(); return; }
  /* Runs only while the canvas is on screen and the tab is visible. */
  var inView = !("IntersectionObserver" in window);
  if (!inView){
    new IntersectionObserver(function(en){ en.forEach(function(e){ inView = e.isIntersecting; if (inView) start(); else running = false; }); }).observe(cv);
  } else start();
  document.addEventListener("visibilitychange", function(){ if (document.hidden) running = false; else start(); });
})();
