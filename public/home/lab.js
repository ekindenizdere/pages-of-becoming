// Lab chrome: motion toggle + section counter. Exposes window.LAB for prototypes.
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stored = null;
  try { stored = localStorage.getItem("pob-motion"); } catch { /* storage unavailable */ }
  const listeners = new Set();
  const LAB = {
    motion: stored === null ? !reduced : stored === "on",
    onMotion(cb) { listeners.add(cb); cb(LAB.motion); },
  };
  window.LAB = LAB;

  const apply = () => {
    document.documentElement.dataset.motion = LAB.motion ? "on" : "off";
    const btn = document.querySelector("[data-motion-toggle]");
    if (btn) {
      btn.setAttribute("aria-pressed", String(LAB.motion));
      const M = (window.POB_I18N && window.POB_I18N.motion) || ["Motion on", "Motion off"];
      btn.textContent = LAB.motion ? M[0] : M[1];
    }
    listeners.forEach((cb) => cb(LAB.motion));
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("[data-motion-toggle]")?.addEventListener("click", () => {
      LAB.motion = !LAB.motion;
      try { localStorage.setItem("pob-motion", LAB.motion ? "on" : "off"); } catch { /* ignore */ }
      apply();
    });
    apply();

    const sections = [...document.querySelectorAll(".lab-section")];
    const ticks = document.querySelector(".lab-bottom .ticks");
    const label = document.querySelector("[data-counter]");
    const name = document.querySelector("[data-counter-name]");
    if (!sections.length || !ticks) return;
    ticks.innerHTML = sections.map(() => "<i></i>").join("");
    const pad = (n) => String(n).padStart(2, "0");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = sections.indexOf(e.target);
        [...ticks.children].forEach((t, j) => t.classList.toggle("on", j <= i));
        label.textContent = `${pad(i + 1)} / ${pad(sections.length)}`;
        if (name) name.textContent = e.target.dataset.name || "";
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => io.observe(s));
  });
})();
