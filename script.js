var LINKS = {
  dashboard: "https://directory.partners.canton.foundation/",
  apply:     "",
  terms:     "" 
};
var SOURCE_PARAM = "utm_source=canton-partners-program";
var STEP = {
  business:  { title: "Business Case", body: "Foundation-led workshops covering institutional requirements on Canton and how your team can address them." },
  businessOrg: { title: "Business Case", body: "Foundation-led workshops covering institutional requirements on Canton and how your organization can address them." },
  labs:      { title: "Technical Labs", body: "Hands-on labs led by Developer Relations, concluding with a fully configured local development environment." },
  certify:   { title: "Certification", body: "Self-paced Daml 3 certification, supported by Developer Relations office hours and a dedicated forum channel.", link: { text: "Canton Developer Certification ↗", href: "https://certification.canton.foundation/" } },
  prove:     { title: "Validation", body: "Run a validator node, deploy a DAR, and execute a smart contract on DevNet for verification by Developer Relations." },
  join:      { title: "Onboarding and Listing", body: "Complete onboarding with the Foundation and be listed in the Canton Partners Directory.", hi: true }
};
var CRED = {
  certify:  "Daml 3 certification for at least 15% of your Canton engineering team (minimum of two engineers).",
  workshop: "Participation in Foundation-led business workshops.",
  pipeline: "Monthly pipeline and growth calls with the program team.",
  devnet:   "Successful deployment of a validator node, a DAR, and a smart contract on DevNet.",
  delivery: "A proven track record on Canton, with at least one completed proof of concept or production deployment.",
  dealflow: "Monthly deal flow reviews with the program team."
};
var FULL_BENEFITS = [
  "Official listing in the Canton Partners Directory.",
  "Free certification for your engineers.",
  "Invitations to partner roundtables, workshops, and ecosystem events.",
  "Access to the latest Canton ecosystem updates.",
  "Co-marketing opportunities with the Foundation."
];
var LIGHT_BENEFITS = [
  "Official listing in the Canton Partners Directory.",
  "Invitations to partner roundtables, workshops, and ecosystem events.",
  "Access to the latest Canton ecosystem updates.",
  "Co-marketing opportunities with the Foundation."
];
var TECH_PATH = [STEP.business, STEP.labs, STEP.certify, STEP.prove, STEP.join];
var TECH_CREDS = [CRED.certify, CRED.workshop, CRED.pipeline, CRED.devnet, CRED.delivery];
var CATEGORIES = {
  tech:     { label: "Technology & Implementation", steps: TECH_PATH, takes: TECH_CREDS, gets: FULL_BENEFITS },
  security: { label: "Security",                    steps: TECH_PATH, takes: TECH_CREDS, gets: FULL_BENEFITS },
  infra:    { label: "Infrastructure",              steps: TECH_PATH, takes: TECH_CREDS, gets: FULL_BENEFITS },
  advisory: { label: "Advisory & Consulting",       steps: [STEP.businessOrg, STEP.join], takes: [CRED.workshop, CRED.pipeline], gets: LIGHT_BENEFITS },
  gtm:      { label: "Market & GTM",                steps: [STEP.businessOrg, STEP.join], takes: [CRED.workshop, CRED.pipeline], gets: LIGHT_BENEFITS },
  capital:  { label: "Capital",                     steps: [STEP.businessOrg, STEP.join], takes: [CRED.dealflow], gets: LIGHT_BENEFITS }
};
var ORDER = ["tech", "security", "infra", "advisory", "gtm", "capital"];
(function () {
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  var TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';
  document.querySelectorAll("[data-link]").forEach(function (a) {
    var key = a.getAttribute("data-link"), url = LINKS[key];
    if (!url) {
      a.setAttribute("aria-disabled", "true"); a.title = "Coming soon";
      a.style.opacity = ".55"; a.style.cursor = "not-allowed";
      a.addEventListener("click", function (e) { e.preventDefault(); });
      return;
    }
    if (key === "apply") url += (url.indexOf("?") > -1 ? "&" : "?") + SOURCE_PARAM;
    a.href = url;
  });
  var state = { path: "tech", req: "tech" };
  function buildTabs(list, group) {
    list.innerHTML = ORDER.map(function (id) {
      return '<button type="button" role="tab" class="tab" id="tab-' + group + '-' + id + '" data-id="' + id + '">' + esc(CATEGORIES[id].label) + "</button>";
    }).join("");
    list.addEventListener("click", function (e) {
      var b = e.target.closest(".tab"); if (b) select(group, b.getAttribute("data-id"));
    });
    list.addEventListener("keydown", function (e) {
      var tabs = [].slice.call(list.querySelectorAll(".tab")), i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var n = null;
      if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") n = tabs[0];
      if (e.key === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); select(group, n.getAttribute("data-id")); n.focus(); }
    });
  }
  function renderPath() {
    var c = CATEGORIES[state.path], panel = document.getElementById("path-panel");
    panel.querySelector(".cat-title").textContent = c.label;
    panel.querySelector(".stepcards").innerHTML = c.steps.map(function (s, i) {
      return '<div class="stepcard' + (s.hi ? " hi" : "") + '"><div class="n">' + String(i + 1).padStart(2, "0") + "</div><h4>" + esc(s.title) + "</h4><p>" + esc(s.body) + "</p>" +
        (s.link ? '<a href="' + s.link.href + '">' + esc(s.link.text) + "</a>" : "") + "</div>";
    }).join("");
    panel.setAttribute("aria-labelledby", "tab-path-" + state.path);
  }
  function renderReq() {
    var c = CATEGORIES[state.req], panel = document.getElementById("req-panel");
    panel.querySelector(".cb-cat").textContent = c.label.toUpperCase();
    panel.querySelector('[data-list="takes"]').innerHTML = c.takes.map(function (t) { return "<li>" + TICK + "<span>" + esc(t) + "</span></li>"; }).join("");
    panel.querySelector('[data-list="gets"]').innerHTML = c.gets.map(function (t) { return "<li>" + TICK + "<span>" + esc(t) + "</span></li>"; }).join("");
    panel.setAttribute("aria-labelledby", "tab-req-" + state.req);
  }
  function select(group, id) {
    if (!CATEGORIES[id]) return;
    state[group] = id;
    document.querySelectorAll('[data-tabs="' + group + '"] .tab').forEach(function (b) {
      var on = b.getAttribute("data-id") === id;
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    group === "path" ? renderPath() : renderReq();
  }
  document.querySelectorAll("[data-tabs]").forEach(function (list) { buildTabs(list, list.getAttribute("data-tabs")); });
  select("path", "tech"); select("req", "tech");
  document.querySelectorAll(".cat[data-cat]").forEach(function (row) {
    row.addEventListener("click", function () {
      var id = row.getAttribute("data-cat");
      select("path", id); select("req", id);
    });
  });
  var tl = document.getElementById("timeline");
  if (tl) {
    var items = [].slice.call(tl.querySelectorAll(".steps li"));
    var bar = tl.querySelector(".tl-progress");
    var hovering = false;
    function setStep(n) {
      items.forEach(function (li, i) { li.classList.toggle("on", i <= n); li.classList.toggle("current", i === n); });
      bar.style.width = "calc((100% + 32px) * " + Math.max(0, n) + " / 4)";
    }
    items.forEach(function (li, i) {
      li.addEventListener("mouseenter", function () { hovering = true; setStep(i); });
    });
    tl.querySelector(".steps").addEventListener("mouseleave", function () { hovering = false; setStep(3); });
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    function run() {
      if (reduce) { setStep(3); return; }
      [0, 1, 2, 3].forEach(function (n, k) { setTimeout(function () { if (!hovering) setStep(n); }, 250 + k * 520); });
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { run(); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(tl);
    } else { setStep(3); }
  }
  function openFromHash() {
    var el = location.hash && document.getElementById(location.hash.slice(1));
    if (el && el.tagName === "DETAILS") el.open = true;
  }
  window.addEventListener("hashchange", openFromHash); openFromHash();
  var links = [].slice.call(document.querySelectorAll('.header nav a[href^="#"]'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  if ("IntersectionObserver" in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(function (s) { nio.observe(s); });
  }
})();