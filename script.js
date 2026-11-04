// Canton Partners Program — interactions
//
// LINKS: every destination that is still being decided lives here, so it can be
// updated in one place. Leave a value empty ("") and the button stays in place
// but is marked as unavailable instead of linking nowhere.
var LINKS = {
  directory: "https://canton-partners.vercel.app/", // SI dashboard (partner directory)
  apply:     "",  // Build partner application form (TBD)
  interest:  "",  // Register-your-interest intake form for Grow / Scale (TBD)
  contact:   "",  // "Talk to the Foundation" contact form (TBD, confirm with ops)
  spotlight: "",  // Partner spotlight blog post (TBD)
  terms:     ""   // Program Terms & Conditions (TBD, with Legal)
};
// Appended to form links so submissions can be attributed to this page.
var SOURCE_PARAM = "utm_source=canton-partners-program";

(function () {
  // ---- Wire up link targets -------------------------------------------------
  document.querySelectorAll('[data-link]').forEach(function (a) {
    var url = LINKS[a.getAttribute('data-link')];
    if (!url) {
      a.setAttribute('aria-disabled', 'true');
      a.setAttribute('title', 'Coming soon');
      a.style.opacity = '.55';
      a.style.cursor = 'not-allowed';
      a.addEventListener('click', function (e) { e.preventDefault(); });
      return;
    }
    var key = a.getAttribute('data-link');
    if (key !== 'directory' && key !== 'spotlight' && key !== 'terms') {
      var track = a.getAttribute('data-track-param');
      url += (url.indexOf('?') > -1 ? '&' : '?') + SOURCE_PARAM + (track ? '&track=' + track : '');
    }
    a.href = url;
    if (/^https?:/.test(url) && url.indexOf(location.host) === -1) a.rel = 'noopener';
  });

  // ---- Partner type tabs (Build / Grow / Scale), kept in sync ---------------
  var TRACKS = ['build', 'grow', 'scale'];
  var tablists = Array.prototype.slice.call(document.querySelectorAll('[role="tablist"]'));

  function select(track, focusTab) {
    if (TRACKS.indexOf(track) === -1) return;
    tablists.forEach(function (list) {
      list.querySelectorAll('[role="tab"]').forEach(function (tab) {
        var on = tab.getAttribute('data-track') === track;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
        if (on && focusTab === list) tab.focus();
      });
    });
  }

  tablists.forEach(function (list) {
    list.addEventListener('click', function (e) {
      var tab = e.target.closest('[role="tab"]');
      if (tab) select(tab.getAttribute('data-track'));
    });
    list.addEventListener('keydown', function (e) {
      var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next.getAttribute('data-track'), list); }
    });
  });

  // Partner-type links in "Three Ways Partners Help" (#build, #grow, #scale)
  function fromHash() {
    var h = location.hash.slice(1);
    if (TRACKS.indexOf(h) > -1) {
      select(h);
      var path = document.querySelector('#path .tabs-label') || document.getElementById('path');
      if (path) path.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    var el = h && document.getElementById(h);
    if (el && el.tagName === 'DETAILS') el.open = true;
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();

  // ---- Highlight the nav link for the section in view ----------------------
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav ul a[href^="#"]'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }
})();
