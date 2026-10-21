/* Page widgets for /services/shopify-support-automation and its /lp/ copy: the proof
   tabs and the ticket cost calculator. The booking form is lp-booking.js and the hero
   scene is lp-support-scene.js, shared the same way as on the inventory pages. */

/* Proof tabs, keyboard accessible: arrows move between tabs, only the selected tab is
   in the tab order. */
(function(){
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.sp-tabs [role="tab"]'));
  if (!tabs.length) return;
  function sel(t){
    tabs.forEach(function(x){ var on = x === t; x.setAttribute("aria-selected", on ? "true" : "false"); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute("aria-controls")).hidden = !on; });
    t.focus();
  }
  tabs.forEach(function(t, i){
    t.addEventListener("click", function(){ sel(t); });
    t.addEventListener("keydown", function(e){
      if (e.key === "ArrowRight"){ e.preventDefault(); sel(tabs[(i + 1) % tabs.length]); }
      if (e.key === "ArrowLeft"){ e.preventDefault(); sel(tabs[(i - 1 + tabs.length) % tabs.length]); }
    });
  });
})();

/* Calculator. Every figure is the visitor's own input run through the formula printed
   under the result; nothing here is a benchmark. */
(function(){
  var g = function(id){ return document.getElementById(id); };
  if (!g("cT")) return;
  var fmt = function(n){ return Math.round(n).toLocaleString("en-US"); };
  function run(){
    var t = +g("cT").value, p = +g("cP").value / 100, m = +g("cM").value, r = +g("cR").value, s = +g("cS").value / 100;
    var tickets = t * p, hours = tickets * m / 60, cost = hours * r;
    g("oT").textContent = fmt(t); g("oP").textContent = Math.round(p*100) + "%"; g("oM").textContent = m + " min"; g("oR").textContent = "$" + r; g("oS").textContent = Math.round(s*100) + "%";
    g("vTickets").textContent = fmt(tickets);
    g("vNow").textContent = fmt(hours) + " h";
    g("vCost").textContent = "$" + fmt(cost) + " / month";
    g("vHours").textContent = fmt(hours * s) + " h";
    g("vSave").textContent = "$" + fmt(cost * s) + " / month";
  }
  ["cT","cP","cM","cR","cS"].forEach(function(id){ g(id).addEventListener("input", run); });
  run();
})();
