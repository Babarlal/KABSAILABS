/* ============================================================
   The receipt: what one task costs a year.

   One copy of the arithmetic, loaded by every page that shows the dials (the
   homepage #receipt section and /tools/cost-of-doing-it-by-hand), so the number
   a visitor sees on the tool page is always the number on the homepage. The
   markup lives in each page; this only needs the ids d1-d4, o1-o4, rHours,
   rLabour, rFix, rTotal and verdict to exist.

   50 working weeks a year, and a mistake costs four times the task's own minutes
   to clean up. Both are assumptions for ranking tasks against each other, not
   measured figures.
   ============================================================ */
(function(){
  'use strict';
  if (!document.getElementById('d1')) return;

  var d = [1,2,3,4].map(function(n){ return document.getElementById('d'+n); });
  var o = [1,2,3,4].map(function(n){ return document.getElementById('o'+n); });
  var money = function(n){ return '$' + Math.round(n).toLocaleString('en-US'); };
  function calc(){
    var times = +d[0].value, mins = +d[1].value, rate = +d[2].value, err = +d[3].value;
    o[0].textContent = times; o[1].textContent = mins; o[2].textContent = '$'+rate; o[3].textContent = err+'%';
    var hours = times * mins / 60 * 50;
    var labour = hours * rate;
    var fix = times * 50 * (err/100) * (mins*4/60) * rate;
    var total = labour + fix;
    document.getElementById('rHours').textContent = Math.round(hours).toLocaleString('en-US') + ' h';
    document.getElementById('rLabour').textContent = money(labour);
    document.getElementById('rFix').textContent = money(fix);
    document.getElementById('rTotal').textContent = money(total);
    var v = document.getElementById('verdict');
    if (total < 6000){
      v.className = 'verdict no';
      v.innerHTML = '<b>Don\'t automate this yet.</b>At this size a build would cost more than the task does. Write the task down as a checklist and come back when the volume doubles.';
    } else if (total < 15000){
      v.className = 'verdict yes';
      v.innerHTML = '<b>Worth a look.</b>A small build usually pays back inside a year here. The audit call decides whether it\'s a system or a spreadsheet fix.';
    } else {
      v.className = 'verdict yes';
      v.innerHTML = '<b>Build it.</b>This is the kind of task that pays for its own system in a few months. Book the audit and bring one week of real examples.';
    }
  }
  d.forEach(function(el){ el.addEventListener('input', calc); });
  calc();
})();
