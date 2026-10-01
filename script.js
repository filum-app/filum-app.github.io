/* ═══════════ Filum — interactions du site ═══════════ */

/* ─── Navigation : fond au défilement ─── */
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ─── Apparitions au défilement ─── */
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ─── Compteurs animés ─── */
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const dur = 1400;
  const t0 = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.innerHTML = prefix + Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const countObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting && !e.target.dataset.done) {
        e.target.dataset.done = "1";
        animateCount(e.target);
      }
    }),
  { threshold: 0.6 }
);
document.querySelectorAll(".stat-num").forEach((el) => countObserver.observe(el));

/* ─── Le graphe interactif ─── */
// Les fiches sont injectées par scripts/build-site.ts dans #graph-data, en français ou en
// anglais selon la page. Ce fichier ne contient donc plus une seule chaîne de texte : il
// reste unique et partagé par les deux langues.
const GRAPH = JSON.parse(document.getElementById("graph-data").textContent);
const graphPanel = document.getElementById("graphPanel");

function renderGraphPanel(cle) {
  const d = GRAPH.find((g) => g.cle === cle);
  if (!d) return;
  graphPanel.innerHTML = `
    <h3>${d.titre}</h3>
    <p class="gp-ex">${d.ex}</p>
    <p>${d.corps}</p>
    <div class="gp-chips">${d.puces.map((c) => `<span>${c}</span>`).join("")}</div>`;
  graphPanel.style.animation = "none";
  void graphPanel.offsetWidth; // relance l'animation
  graphPanel.style.animation = "";
}
document.querySelectorAll(".gnode").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll(".gnode").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderGraphPanel(btn.dataset.node);
  })
);
renderGraphPanel(GRAPH[0].cle);

/* ─── Tour du produit ─── */
const tourImg = document.getElementById("tourImg");
const tourCaption = document.getElementById("tourCaption");
const tourTitle = document.getElementById("tourTitle");
document.querySelectorAll(".ttab").forEach((tab) =>
  tab.addEventListener("click", () => {
    document.querySelectorAll(".ttab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    tourImg.classList.add("fading");
    setTimeout(() => {
      // Le chemin des captures dépend de la page : /en/ remonte d'un cran. On le déduit de
      // l'image déjà en place plutôt que de le coder en dur — le script reste unique.
      const racine = tourImg.getAttribute("src").replace(/assets\/.*$/, "");
      tourImg.src = `${racine}assets/${tab.dataset.shot}.png`;
      tourImg.onload = () => tourImg.classList.remove("fading");
      tourCaption.textContent = tab.dataset.caption;
      tourTitle.textContent = "filum — " + tab.querySelector("strong").textContent.toLowerCase();
    }, 180);
  })
);

/* ─── Lightbox ─── */
const lightbox = document.getElementById("lightbox");
const lightboxImg = lightbox.querySelector("img");
document.querySelectorAll(".tour-stage .browser-frame, .hero-shot .browser-frame, .module-figure .browser-frame").forEach((frame) =>
  frame.addEventListener("click", () => {
    lightboxImg.src = frame.querySelector("img").src;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  })
);
const closeLightbox = () => {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
};
lightbox.addEventListener("click", closeLightbox);
document.addEventListener("keydown", (e) => e.key === "Escape" && closeLightbox());
