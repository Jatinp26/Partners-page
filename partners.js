(function () {
  "use strict";
  var CONTENT = "content/partners.json";
  var grid = document.getElementById("partner-logos");
  var track = document.getElementById("spot-track");
  var dlg = document.getElementById("story");
  if (!grid && !track) return;
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function logoHTML(p, onDark, cls) {
    var src = (onDark && p.logoOnDark) || p.logo;
    var word = '<span class="logo-word">' + esc(p.name) + "</span>";
    if (!src) return '<span class="' + cls + '">' + word + "</span>";
    return '<span class="' + cls + '"><img src="' + esc(src) + '" alt="' + esc(p.name) + '" loading="lazy" ' +
      'onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'logo-word\',textContent:this.alt}))"></span>';
  }
  fetch(CONTENT, { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (list) {
      list = (Array.isArray(list) ? list : []).filter(function (p) { return p && p.name; });
      renderGrid(list);
      renderSpotlight(list.filter(function (p) { return p.spotlight; }));
    })
    .catch(function (e) { console.error("Could not load " + CONTENT + ":", e); });
  function renderGrid(list) {
    if (!grid || !list.length) return;
    grid.innerHTML = list.map(function (p) {
      return '<div class="logo-tile">' + logoHTML(p, false, "logo-img") +
        (p.note ? "<small>" + esc(p.note) + "</small>" : "") + "</div>";
    }).join("");
  }
  function renderSpotlight(list) {
    if (!track) return;
    var section = document.getElementById("spotlight");
    if (!list.length) { if (section) section.hidden = true; return; }
    var bySlug = {};
    list.forEach(function (p) { bySlug[p.slug] = p; });
    track.innerHTML = list.map(function (p) {
      var s = p.spotlight;
      return '<li class="spot-card">' +
        '<div class="spot-top"><span class="spot-cat">' + esc(p.category) + '</span>' +
        '<button type="button" class="plus" data-story="' + esc(p.slug) + '" aria-label="Read the ' + esc(p.name) + ' story">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button></div>' +
        logoHTML(p, true, "spot-logo") +
        '<blockquote class="spot-quote"><span class="q">“</span>' + esc(s.cardQuote || s.quote) + '<span class="q">”</span></blockquote>' +
        '<div class="spot-foot"><div class="who"><strong>' + esc(s.person) + "</strong><span>" + esc(s.role) + "</span></div>" +
        '<button type="button" class="read" data-story="' + esc(p.slug) + '">Read story <span aria-hidden="true">→</span></button></div>' +
        "</li>";
    }).join("");
    track.addEventListener("click", function (e) {
      var b = e.target.closest("[data-story]") || e.target.closest(".spot-card");
      if (!b) return;
      var slug = b.getAttribute("data-story") || b.querySelector("[data-story]").getAttribute("data-story");
      open(slug, b);
    });
    var prev = document.getElementById("spot-prev"), next = document.getElementById("spot-next");
    var count = document.getElementById("spot-count"), bar = document.getElementById("spot-bar");
    var cards = [].slice.call(track.children);
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function update() {
      var w = cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16);
      var first = Math.round(track.scrollLeft / w);
      var perView = Math.max(1, Math.round((track.clientWidth + 16) / w));
      var last = Math.min(cards.length, first + perView);
      count.innerHTML = "<b>" + pad(first + 1) + (last > first + 1 ? "–" + pad(last) : "") + "</b> / " + pad(cards.length);
      bar.style.width = (last / cards.length * 100) + "%";
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      var nav = document.querySelector(".spot-nav");
      if (nav) nav.hidden = cards.length <= perView;
    }
    function page(dir) { track.scrollBy({ left: dir * track.clientWidth, behavior: "smooth" }); }
    prev.addEventListener("click", function () { page(-1); });
    next.addEventListener("click", function () { page(1); });
    var raf;
    track.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); });
    window.addEventListener("resize", update);
    update();
    var lastFocus = null;
    function open(slug, opener) {
      var p = bySlug[slug];
      if (!p || !dlg) return;
      var s = p.spotlight;
      lastFocus = opener || document.activeElement;
      document.getElementById("story-body").innerHTML =
        '<div class="story-head">' + logoHTML(p, true, "story-logo") + '<span class="spot-cat">' + esc(p.category) + "</span></div>" +
        '<div class="story-grid">' +
          '<div class="story-who"><strong id="story-title">' + esc(s.person) + "</strong><span>" + esc(s.role) + "</span></div>" +
          '<div class="story-main"><blockquote class="story-quote"><span class="q">“</span>' + esc(s.quote || s.cardQuote) + '<span class="q">”</span></blockquote>' +
          ((s.about && s.about.length) ? '<div class="story-about"><h3>About the collaboration</h3>' +
            [].concat(s.about).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") + "</div>" : "") +
          "</div></div>";
      if (!dlg.open) dlg.showModal();
      dlg.scrollTop = 0;
      document.documentElement.classList.add("no-scroll");
      if (location.hash !== "#story-" + slug) history.replaceState(null, "", "#story-" + slug);
    }
    function close() { if (dlg.open) dlg.close(); }
    dlg.addEventListener("close", function () {
      document.documentElement.classList.remove("no-scroll");
      if (/^#story-/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search + "#spotlight");
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    });
    dlg.querySelector(".story-x").addEventListener("click", close);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); }); // click outside the panel
    function fromHash() {
      var m = location.hash.match(/^#story-(.+)$/);
      if (m && bySlug[decodeURIComponent(m[1])]) {
        var sec = document.getElementById("spotlight");
        if (sec) sec.scrollIntoView();
        open(decodeURIComponent(m[1]));
      }
    }
    window.addEventListener("hashchange", fromHash);
    fromHash();
  }
})();