(function () {
  "use strict";
  function track(name, data) {
    try {
      var clean = {};
      Object.keys(data || {}).slice(0, 2).forEach(function (k) {
        var v = data[k];
        if (v === undefined || v === null || v === "") return;
        clean[k] = typeof v === "number" || typeof v === "boolean" ? v : String(v).slice(0, 255);
      });
      if (window.va) window.va("event", { name: name, data: clean });
      if (window.CP_ANALYTICS_DEBUG) console.log("[analytics]", name, clean);
    } catch (e) { /* analytics must never break the page */ }
  }
  function text(el) {
    var strong = el.querySelector && el.querySelector("strong");  
    if (strong && !el.getAttribute("data-track")) el = strong;
    return (el.getAttribute("data-track") || el.getAttribute("aria-label") || el.textContent || "")
      .replace(/\s+/g, " ").replace(/[↗→]/g, "").trim().slice(0, 80);
  }
  function sectionOf(el) {
    if (el.closest(".header")) return "header";
    if (el.closest("footer")) return "footer";
    if (el.closest("#story")) return "story-popup";
    var s = el.closest("section");
    if (!s) return "page";
    if (s.id === "top") return "hero";
    return s.id || (s.classList.contains("closing") ? "closing" : "page");
  }
  function slugFromHash() {
    var m = location.hash.match(/^#story-(.+)$/);
    return m ? decodeURIComponent(m[1]) : "";
  }
  var lastCardClick = 0;
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var row = t.closest(".cat[data-cat]");
    if (row) { track("Category select", { category: row.getAttribute("data-cat"), from: "categories-list" }); return; }
    var tab = t.closest("[data-tabs] .tab");
    if (tab) {
      var group = tab.closest("[data-tabs]").getAttribute("data-tabs");
      if (tab.getAttribute("aria-selected") !== "true")
        track("Category select", { category: tab.getAttribute("data-id"), from: group === "path" ? "path-tabs" : "credentials-tabs" });
      return;
    }
    var sum = t.closest("details > summary");
    if (sum) {
      var d = sum.parentElement;
      track("FAQ toggle", { question: d.id || text(sum), action: d.open ? "close" : "open" });
      return;
    }
    if (t.closest("#spot-next, #spot-prev")) {
      var dir = t.closest("#spot-next") ? "next" : "previous";
      setTimeout(function () { track("Spotlight nav", { direction: dir, showing: spotShowing() }); }, 600);
      ignoreSwipeUntil = Date.now() + 1200;
      return;
    }
    if (t.closest(".spot-card")) { lastCardClick = Date.now(); return; } 
    if (t.closest(".story-x")) return;                                  
    var logo = t.closest("#partner-logos .logo-tile");
    if (logo) {
      var img = logo.querySelector("img");
      track("Logo click", { partner: img ? img.alt : text(logo) });
      return;
    }
    var el = t.closest("a, button");
    if (!el) return;
    var label = text(el) + (el.getAttribute("aria-disabled") === "true" ? " (coming soon)" : "");
    var href = el.getAttribute("href") || "";
    var external = /^mailto:/i.test(href) || (el.host && el.host !== location.host && /^https?:/i.test(el.href));
    if (external) {
      track("Outbound click", { label: label, to: /^mailto:/i.test(href) ? href : el.host + el.pathname });
    } else {
      track("Click", { label: label, section: sectionOf(el) });
    }
  }, true);
  document.addEventListener("auxclick", function (e) {
    if (e.button !== 1 || !e.target.closest) return;
    var a = e.target.closest("a[href]");
    if (a && a.host && a.host !== location.host)
      track("Outbound click", { label: text(a) + " (new tab)", to: a.host + a.pathname });
  }, true);
  var seenStep = {};
  document.querySelectorAll("#timeline .steps li").forEach(function (li, i) {
    li.addEventListener("mouseenter", function () {
      if (seenStep[i]) return;
      seenStep[i] = true;
      var h = li.querySelector("h3");
      track("Timeline step", { step: i + 1, title: h ? h.textContent.trim() : "" });
    });
  });
  var track_ = document.getElementById("spot-track");
  var ignoreSwipeUntil = 0;
  function spotShowing() {
    var c = document.getElementById("spot-count");
    return c ? c.textContent.replace(/\s+/g, "") : "";
  }
  if (track_) {
    var swipeTimer, startLeft = null;
    track_.addEventListener("scroll", function () {
      if (startLeft === null) startLeft = track_.scrollLeft;
      clearTimeout(swipeTimer);
      swipeTimer = setTimeout(function () {
        var moved = Math.abs(track_.scrollLeft - startLeft) > 40;
        startLeft = null;
        if (moved && Date.now() > ignoreSwipeUntil) track("Spotlight swipe", { showing: spotShowing() });
      }, 400);
    }, { passive: true });
  }
  var dlg = document.getElementById("story");
  if (dlg) {
    var openSlug = "", openedAt = 0, readSent = false;
    new MutationObserver(function () {
      if (dlg.open && !openSlug) {
        openSlug = slugFromHash() || "unknown";
        openedAt = Date.now();
        readSent = false;
        track("Story open", { partner: openSlug, via: Date.now() - lastCardClick < 1500 ? "card" : "shared-link" });
      }
    }).observe(dlg, { attributes: true, attributeFilter: ["open"] });
    dlg.addEventListener("close", function () {
      if (!openSlug) return;
      track("Story close", { partner: openSlug, seconds: Math.round((Date.now() - openedAt) / 1000) });
      openSlug = "";
    });
    dlg.addEventListener("scroll", function () {
      if (readSent || !openSlug) return;
      if (dlg.scrollTop + dlg.clientHeight >= dlg.scrollHeight - 40) {
        readSent = true;
        track("Story read", { partner: openSlug });
      }
    }, { passive: true });
  }
  if ("IntersectionObserver" in window) {
    var seenSec = {}, dwell = new Map();
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var name = e.target.tagName === "FOOTER" ? "footer" : sectionOf(e.target.querySelector("*") || e.target);
        if (!e.isIntersecting) { clearTimeout(dwell.get(e.target)); return; }
        if (seenSec[name]) return;
        dwell.set(e.target, setTimeout(function () {
          seenSec[name] = true;
          track("Section view", { section: name });
          sio.unobserve(e.target);
        }, 1000));
      });
    }, { threshold: 0.4 });
    document.querySelectorAll("main > section, footer").forEach(function (s) { sio.observe(s); });
  }
  var marks = [25, 50, 75, 90, 100], hit = {}, sraf;
  function depth() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var pct = h <= 0 ? 100 : Math.round(window.scrollY / h * 100);
    marks.forEach(function (m) {
      if (pct >= m && !hit[m]) { hit[m] = true; track("Scroll depth", { percent: m }); }
    });
  }
  window.addEventListener("scroll", function () { cancelAnimationFrame(sraf); sraf = requestAnimationFrame(depth); }, { passive: true });
  var visibleMs = 0, lastTick = Date.now(), timeMarks = [30, 60, 120, 300], timeHit = {};
  setInterval(function () {
    var now = Date.now();
    if (document.visibilityState === "visible") visibleMs += now - lastTick;
    lastTick = now;
    timeMarks.forEach(function (s) {
      if (visibleMs >= s * 1000 && !timeHit[s]) { timeHit[s] = true; track("Time on page", { seconds: s }); }
    });
  }, 5000);
  document.addEventListener("copy", function () {
    var sel = window.getSelection && window.getSelection();
    var s = sel ? String(sel).trim() : "";
    if (!s) return;
    var node = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement);
    track("Copy", { text: s.slice(0, 80), section: node ? sectionOf(node) : "page" });
  });
})();