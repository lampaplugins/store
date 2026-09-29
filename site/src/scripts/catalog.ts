const COPY_MS = 2000;

function copyText(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      if (!document.execCommand("copy")) throw new Error("copy failed");
      resolve();
    } catch (err) {
      reject(err);
    } finally {
      document.body.removeChild(ta);
    }
  });
}

function flashButton(btn: HTMLElement, ok: boolean) {
  const prev = btn.textContent;
  const cls = ok ? "copied" : "copy-error";
  btn.textContent = ok ? "Скопировано" : "Ошибка";
  btn.classList.remove("copied", "copy-error");
  btn.classList.add(cls);
  setTimeout(() => {
    btn.textContent = prev;
    btn.classList.remove(cls);
  }, COPY_MS);
}

function initCopy() {
  document.querySelectorAll<HTMLElement>("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-copy") || "";
      copyText(text)
        .then(() => flashButton(btn, true))
        .catch(() => flashButton(btn, false));
    });
  });

  const storeUrl = document.getElementById("store-url");
  storeUrl?.addEventListener("click", () => {
    const range = document.createRange();
    range.selectNodeContents(storeUrl);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  });
}

function initCatalog() {
  const q = document.getElementById("catalog-q") as HTMLInputElement | null;
  const countEl = document.getElementById("catalog-count");
  const emptyEl = document.getElementById("catalog-empty");
  const chips = Array.from(document.querySelectorAll<HTMLButtonElement>(".chip[data-hpu]"));
  const plugins = Array.from(document.querySelectorAll<HTMLElement>("[data-plugin]"));
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
  if (!q || !chips.length) return;

  let activeHpu = "all";

  function apply() {
    const query = q!.value.trim().toLowerCase();
    let visible = 0;

    plugins.forEach((el) => {
      const hpu = el.getAttribute("data-hpu") || "";
      const hay = el.getAttribute("data-hay") || "";
      const matchCat = activeHpu === "all" || hpu === activeHpu;
      const matchQ = !query || hay.includes(query);
      const show = matchCat && matchQ;
      el.hidden = !show;
      if (show) visible++;
    });

    sections.forEach((sec) => {
      const any = sec.querySelectorAll<HTMLElement>("[data-plugin]:not([hidden])").length > 0;
      sec.hidden = !any;
    });

    if (countEl) countEl.textContent = `Показано ${visible} из ${plugins.length}`;
    if (emptyEl) {
      emptyEl.hidden = visible > 0;
      emptyEl.classList.toggle("is-visible", visible === 0);
    }
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeHpu = chip.getAttribute("data-hpu") || "all";
      chips.forEach((c) => c.setAttribute("aria-pressed", c === chip ? "true" : "false"));
      apply();
    });
  });

  q.addEventListener("input", apply);
}

initCopy();
initCatalog();
