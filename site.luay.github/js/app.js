const scriptsContainer = document.getElementById("scripts");
const searchInput = document.getElementById("search");
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalBanner = document.getElementById("modalBanner");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalAuthor = document.getElementById("modalAuthor");
const modalCode = document.getElementById("modalCode");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const emptyState = document.getElementById("empty");

let allScripts = [];

/* ======================= UTIL ======================= */

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showModal() {
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function hideModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
  modalCode.textContent = "";
}

modalClose.onclick = hideModal;
modal.onclick = e => {
  if (e.target === modal) hideModal();
};

/* ======================= LOAD SCRIPTS ======================= */

async function loadScripts() {
  try {
    const res = await fetch("data/scripts.json");
    const list = await res.json();
    allScripts = list;
    renderScripts(list);
  } catch (err) {
    console.error("Erro ao carregar scripts:", err);
  }
}

/* ======================= RENDER LIST ======================= */

function renderScripts(list) {
  scriptsContainer.innerHTML = "";

  if (!list.length) {
    emptyState.classList.remove("hidden");
    return;
  } else {
    emptyState.classList.add("hidden");
  }

  for (const script of list) {
    const card = document.createElement("div");
    card.className = "script-card";

    card.innerHTML = `
      <div class="script-thumb" style="background-image:url('${script.banner || "assets/no-banner.png"}')"></div>
      <div class="script-info">
        <div class="script-title">${escapeHTML(script.title)}</div>
        <div class="script-author">por ${escapeHTML(script.author)}</div>
      </div>
    `;

    card.onclick = () => openModal(script);
    scriptsContainer.appendChild(card);
  }
}

/* ======================= MODAL ======================= */

async function openModal(script) {
  modalTitle.textContent = script.title;
  modalDesc.textContent = script.description || "";
  modalAuthor.textContent = `por ${script.author}`;
  modalBanner.style.backgroundImage = `url('${script.banner || "assets/no-banner.png"}')`;

  modalCode.textContent = "Carregando script...";

  try {
    const res = await fetch(script.raw_url);
    if (!res.ok) throw new Error("Erro ao baixar código");
    const code = await res.text();
    modalCode.textContent = code;

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(code);
      copyBtn.textContent = "Copiado!";
      setTimeout(() => (copyBtn.textContent = "Copiar"), 1200);
    };

    downloadBtn.onclick = () => {
      const blob = new Blob([code], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${script.id || "script"}.lua`;
      a.click();
      URL.revokeObjectURL(a.href);
    };
  } catch (err) {
    modalCode.textContent = "Erro ao carregar o script.";
    console.error(err);
  }

  showModal();
}

/* ======================= SEARCH ======================= */

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  const filtered = allScripts.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.author.toLowerCase().includes(q)
  );
  renderScripts(filtered);
});

/* ======================= INIT ======================= */

loadScripts();
