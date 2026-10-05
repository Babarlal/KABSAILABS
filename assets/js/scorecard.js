/* ============================================================
   Automation Readiness Scorecard, /tools/automation-readiness-scorecard

   Two questions, answered live as the visitor picks:
     1. which of eight functions costs the most hours a week
     2. whether the data is clean enough to build on

   The rules are the ones the pillar post states, not new numbers:
   - a task under two hours a week gets a checklist, not a system
   - data in screenshots or a notebook gets fixed before anything is built
   - nobody checking the first month of outputs means we do not ship

   Hours per band use the midpoint of the band the visitor picked, and "over 10"
   counts as 10, so the yearly figure is a floor for ranking, not a measurement.
   ============================================================ */
(function(){
  'use strict';
  var form = document.getElementById('scorecard');
  if (!form) return;

  var BAND_HOURS = { '0': 0, '1': 1, '2': 3.5, '3': 7.5, '4': 10 };
  var out = document.getElementById('scoreOut');

  function fnRows(){
    return Array.prototype.map.call(form.querySelectorAll('select[data-fn]'), function(s){
      return { name: s.getAttribute('data-fn'), band: s.value, hours: s.value === '' ? null : BAND_HOURS[s.value] };
    });
  }
  function dataAnswers(){
    return Array.prototype.map.call(form.querySelectorAll('[data-q]'), function(q){
      var picked = q.querySelector('input:checked');
      return { id: q.getAttribute('data-q'), fix: q.getAttribute('data-fix'), val: picked ? picked.value : null };
    });
  }
  function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function render(){
    var rows = fnRows(), answered = rows.filter(function(r){ return r.hours !== null; });
    var data = dataAnswers(), dataDone = data.filter(function(a){ return a.val !== null; });
    var html = '';

    if (!answered.length){
      html += '<div class="slip"><h2>Your result</h2><p class="empty">Pick an answer for each function and the ranking appears here.</p></div>';
      out.innerHTML = html;
      return;
    }

    var ranked = answered.slice().sort(function(a, b){ return b.hours - a.hours; });
    var top = ranked[0], max = top.hours || 1;
    html += '<div class="slip"><h2>Leaking most</h2>';
    if (top.hours < 2){
      html += '<p>Nothing you picked takes two hours a week or more. At that size a task gets a checklist, not a system, so keep your money for now.</p>';
    } else {
      html += '<p><b>' + esc(top.name) + '</b>, at least ' + Math.round(top.hours * 52).toLocaleString('en-US') +
        ' hours a year on the answer you gave. Start there, not with the most exciting one.</p>';
    }
    html += '<ul class="rank">' + ranked.map(function(r){
      return '<li><span>' + esc(r.name) + '</span><span>' + (r.hours >= 10 ? '10+' : r.hours) + ' h/wk</span>' +
        '<span class="rank-bar" aria-hidden="true"><i style="width:' + Math.round(r.hours / max * 100) + '%"></i></span></li>';
    }).join('') + '</ul>';
    if (answered.length < rows.length) html += '<p class="empty">' + (rows.length - answered.length) + ' of 8 still unanswered.</p>';
    html += '</div>';

    var v = '';
    if (dataDone.length < data.length){
      v = '<div class="verdict"><b>Data check</b>Answer the four data questions to see whether you could build on what you have.</div>';
    } else {
      var gaps = data.filter(function(a){ return a.val === 'no'; });
      var noOwner = gaps.some(function(a){ return a.id === 'owner'; });
      var dataGaps = gaps.filter(function(a){ return a.id !== 'owner'; });
      if (!gaps.length){
        v = '<div class="verdict yes"><b>Clean enough to build on.</b>Your data lives somewhere a system can read it, and someone will check the first month. Put the top task through the cost calculator next.</div>';
      } else if (dataGaps.length){
        v = '<div class="verdict no"><b>Fix the data first.</b>Automating a broken input just delivers wrong answers faster. Start here: ' +
          dataGaps.map(function(a){ return esc(a.fix); }).join('; ') + '.' + (noOwner ? ' And name the person who will read the first month of outputs.' : '') + '</div>';
      } else {
        v = '<div class="verdict no"><b>Not ready to ship yet.</b>The data is fine, but every system needs a person reading its outputs for the first month before it is trusted. Name that person first.</div>';
      }
    }
    out.innerHTML = html + v;
  }

  form.addEventListener('change', render);
  form.addEventListener('submit', function(e){ e.preventDefault(); render(); });
  render();
})();
