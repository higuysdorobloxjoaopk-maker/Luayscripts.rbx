const scriptsGrid = document.getElementById("scripts");
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalAuthor = document.getElementById("modalAuthor");
const modalCode = document.getElementById("modalCode");
const modalBanner = document.getElementById("modalBanner");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const searchInput = document.getElementById("search");
const emptyBox = document.getElementById("empty");

let allScripts = [];

// ======================= LOAD =======================

async function loadScripts() {
  try {
    const res = await fetch("data/index.json?cache=" + Date.now());
    const data = await res.json();
    allScripts = data;
    renderScripts(data);
  } catch (e) {
    console.error("Erro ao carregar scripts:", e);
    emptyBox.classList.remove("hidden");
  }
}

// ======================= RENDER =======================

function renderScripts(list) {
  scriptsGrid.innerHTML = "";
  emptyBox.classList.toggle("hidden", list.length !== 0);

  list.forEach(script => {
    const card = document.createElement("div");
    card.className = "script-card";

    const img = document.createElement("img");
    img.src = script.banner || "assets/default-banner.jpg";
    img.alt = script.title;

    const title = document.createElement("div");
    title.className = "script-title";
    title.textContent = script.title;

    const author = document.createElement("div");
    author.className = "script-author";
    author.textContent = "by " + script.author;

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(author);

    card.onclick = () => openModal(script);
    scriptsGrid.appendChild(card);
  });
}

// ======================= MODAL =======================

function openModal(script) {
  modal.classList.remove("hidden");

  modalTitle.textContent = script.title;
  modalDesc.textContent = script.description || "";
  modalAuthor.textContent = "by " + script.author;

  modalBanner.style.backgroundImage = `url(${script.banner || "assets/default-banner.jpg"})`;

  const raw = script.raw_url;

  modalCode.textContent = `loadstring(game:HttpGet("${raw}"))()`;

  copyBtn.onclick = () => {
    navigator.clipboard.writeText(modalCode.textContent);
    copyBtn.textContent = "Copiado!";
    setTimeout(() => copyBtn.textContent = "Copiar", 1200);
  };

  downloadBtn.onclick = () => {
    window.open(raw, "_blank");
  };
}

// ======================= CLOSE =======================

modalClose.onclick = () => modal.classList.add("hidden");
modal.onclick = e => {
  if (e.target === modal) modal.classList.add("hidden");
};

// ======================= SEARCH =======================

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  const filtered = allScripts.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.author.toLowerCase().includes(q)
  );
  renderScripts(filtered);
});

// ======================= INIT =======================

loadScripts();
