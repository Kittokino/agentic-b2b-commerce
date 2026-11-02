// Counts visits with GoatCounter (https://www.goatcounter.com): no cookies, and only the author can
// see the numbers. Each page counts one visit when it opens; count(name) adds an event, such as a
// slide or a scene reached, once per visit.
// The author's own visits are left out: open any page once with ?me at the end of the address, and
// this browser is no longer counted (?me=off counts it again). GoatCounter reads the same setting.
(function () {
  try {
    const q = new URLSearchParams(location.search);
    if (q.has('me')) {
      if (q.get('me') === 'off') localStorage.removeItem('skipgc'); else localStorage.setItem('skipgc', 't');
    }
  } catch (e) { /* storage blocked: count as a normal visitor */ }

  const seen = new Set();
  const queue = [];
  window.count = function (name) {
    try { if (localStorage.getItem('skipgc') === 't') return; } catch (e) { /* count as normal */ }
    if (seen.has(name)) return;
    seen.add(name);
    const gc = window.goatcounter;
    if (gc && gc.count) gc.count({ path: name, title: name, event: true });
    else queue.push(name);
  };

  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.dataset.goatcounter = 'https://kittokino.goatcounter.com/count';
  s.onload = () => queue.splice(0).forEach(name => window.goatcounter.count({ path: name, title: name, event: true }));
  document.head.appendChild(s);
})();
