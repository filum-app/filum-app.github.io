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
const GRAPH = {
  besoin: {
    title: "Besoin",
    ex: "« UN-40 — Le laboratoire doit obtenir des résultats d'électrolytes fiables dès le premier passage de l'échantillon. »",
    body: "Le point de départ du fil : l'usage prévu, la douleur terrain, la demande clinique. Chaque besoin est rattaché à son activité R&D et relié aux exigences qu'il motive — dès le départ, on sait pourquoi chaque exigence existe.",
    chips: ["Saisi sur l'activité", "Relié aux exigences", "Repris dans le NDR généré (Background & Purpose)"],
  },
  exigence: {
    title: "Exigence",
    ex: "« La pièce à main shall rester sous 48 °C au contact osseux en usage continu. » — REQ-3002, criticité haute",
    body: "L'entrée de conception, formulée en « shall », avec sa catégorie (mécanique, électrique, logiciel…) et sa criticité. Les exigences se hiérarchisent (système → sous-système, relation N–M) et se lient aux clauses normatives applicables — IEC 61010, 61326, 62366… — depuis la bibliothèque intégrée.",
    chips: ["Hiérarchie système → sous-système", "Bibliothèque de normes intégrée", "Alerte si non couverte"],
  },
  spec: {
    title: "Spécification",
    ex: "« SPEC-5 — étanchéité du joint de tête : 500 cycles autoclave sans fissuration » — statut : OK / NOK / Justifié / N-A / En attente",
    body: "La sortie de conception : une valeur mesurable, une méthode de vérification, un statut qui vit avec le projet. Une spécification peut couvrir plusieurs exigences — la relation N–M observée dans les vrais dossiers est native. Et quand un essai échoue, le NOK se voit partout où le fil passe.",
    chips: ["Statut modifiable en un clic", "Journalisé à chaque changement", "Multi-exigences"],
  },
  essai: {
    title: "Essai",
    ex: "« VER-3 — endurance autoclave, plan PLN-3010 : 3/3 unités conformes à 500 cycles »",
    body: "Le protocole avec son critère d'acceptation défini a priori, ses résultats et ses preuves. Un échec ne se perd pas dans un rapport : VER-3 en échec a ouvert la non-conformité NC-1 automatiquement. Tout ce qu'un auditeur demande, structuré d'avance.",
    chips: ["Critères d'acceptation structurés", "Échec → non-conformité tracée", "Relié aux spécifications"],
  },
  resultat: {
    title: "Résultat",
    ex: "« Pass — re-vérification VER-3 après CAPA-1 : 3/3 unités à 500 cycles, joint FKM »",
    body: "Le verdict de l'essai avec ses conditions, son exécutant et sa date. Importez le CSV du banc de mesure : Filum le conserve intact et calcule automatiquement n, moyenne, écart-type, min et max par colonne — et les études CLSI y ajoutent ANOVA, régressions et limites de détection.",
    chips: ["Import CSV du banc", "Statistiques automatiques", "Moteur CLSI intégré"],
  },
  preuve: {
    title: "Preuve",
    ex: "« essai-endurance-ver3.csv — donnée brute conservée telle qu'importée »",
    body: "L'enregistrement versé au dossier. La donnée brute n'est jamais retouchée (ALCOA+ : originale, durable) ; elle reste consultable dans la visionneuse et téléchargeable à l'identique. C'est elle qui ferme le fil — et qui reverdit la spécification.",
    chips: ["Donnée brute intacte", "Visionneuse intégrée", "Reprise dans le DHF généré"],
  },
  risque: {
    title: "Risque (ISO 14971)",
    ex: "« R-1 — Énergie thermique au contact osseux → nécrose thermique » — initial S4×P3, résiduel S4×P1, maîtrisé",
    body: "La dimension transverse : un danger appelle une maîtrise, et la maîtrise doit être vérifiée par le graphe — elle n'est « vérifiée » que si les spécifications et essais qui la portent sont clos favorablement. Filum signale tout risque dont la maîtrise n'a pas de preuve, et le RMF se génère en .docx.",
    chips: ["Maîtrise vérifiée par le graphe", "Matrice 5×5, zones ALARP", "RMF généré en .docx"],
  },
};

const graphPanel = document.getElementById("graphPanel");
function renderGraphPanel(key) {
  const d = GRAPH[key];
  graphPanel.innerHTML = `
    <h3>${d.title}</h3>
    <p class="gp-ex">${d.ex}</p>
    <p>${d.body}</p>
    <div class="gp-chips">${d.chips.map((c) => `<span>${c}</span>`).join("")}</div>`;
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
renderGraphPanel("besoin");

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
      tourImg.src = `assets/${tab.dataset.shot}.png`;
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
