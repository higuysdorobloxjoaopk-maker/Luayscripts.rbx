const OWNER = "higuysdorobloxjoaopk-maker";
const REPO = "Luayscripts.rbx";
const BASE_PATH = "data/informations/users/Scripts";

const scriptsContainer = document.getElementById("scripts");
const searchInput = document.getElementById("search");
const emptyBox = document.getElementById("empty");

// Modal
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalBanner = document.getElementById("modalBanner");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalAuthor = document.getElementById("modalAuthor");
const modalCode = document.getElementById("modalCode");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

let allScripts = [];

// ====================== GITHUB HELPERS ======================

async function gh(path) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`);
  if (!res.ok) throw new Error("GitHub API error");
  return res.json();
}

// ====================== LOAD ======================

async function loadScripts() {
  allScripts = [];
  scriptsContainer.innerHTML = "";

  let users;
  try {
    users = await gh(BASE_PATH);
  } catch (e) {
    console.error("Erro ao carregar usuários:", e);
    return showEmpty();
  }

  for (const user of users) {
    if (user.type !== "dir") continue;

    let scripts;
    try {
      scripts = await gh(`${BASE_PATH}/${user.name}`);
    } catch {
      continue;
    }

    for (const scriptFolder of scripts) {
      if (scriptFolder.type !== "dir") continue;

      try {
        const dataFile = await gh(`${BASE_PATH}/${user.name}/${scriptFolder.name}/data.json`);
        const content = atob(dataFile.content);
        const data = JSON.parse(content);

        data._creatorFolder = user.name;
        data._slug = scriptFolder.name;

        // RAW sempre vem do data.json
        data._rawUrl = data.raw_url || "";

        allScripts.push(data);
      } catch (e) {
        console.warn("Erro ao ler script:", user.name, scriptFolder.name, e);
      }
    }
  }

  render(allScripts);
}

// ====================== RENDER ======================

function render(list) {
  scriptsContainer.innerHTML = "";
  emptyBox.classList.add("hidden");

  if (!list || list.length === 0) {
    return showEmpty();
  }

  for (const s of list) {
    const card = document.createElement("div");
    card.className = "script-card";

    const banner = s.banner || "assets/default-banner.jpg";
    const title = s.title || "Sem título";
    const desc = s.description || "";
    const author = s.author || "Desconhecido";

    card.innerHTML = `
      <div class="card-banner" style="background-image:url('${escapeAttr(banner)}')"></div>
      <div class="card-body">
        <div class="card-title">${escapeHTML(title)}</div>
        <div class="card-desc">${escapeHTML(desc)}</div>
        <div class="card-author">${escapeHTML(author)}</div>
      </div>
    `;

    card.onclick = () => openModal(s);
    scriptsContainer.appendChild(card);
  }
}

// ====================== SEARCH ======================

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return render(allScripts);

  const result = allScripts.filter(s =>
    (s.title || "").toLowerCase().includes(q) ||
    (s.author || "").toLowerCase().includes(q)
  );

  render(result);
});

// ====================== MODAL ======================

function openModal(s) {
  modal.classList.remove("hidden");

  modalBanner.style.backgroundImage = `url('${s.banner || "assets/default-banner.jpg"}')`;
  modalTitle.textContent = s.title || "";
  modalDesc.textContent = s.description || "";
  modalAuthor.textContent = s.author || "";

  const raw = s._rawUrl;
  const loadstring = `loadstring(game:HttpGet("${raw}"))()`;

  modalCode.textContent = loadstring;

  copyBtn.onclick = () => {
    navigator.clipboard.writeText(loadstring);
    copyBtn.textContent = "Copiado!";
    setTimeout(() => (copyBtn.textContent = "Copiar"), 1200);
  };

  downloadBtn.onclick = () => {
    window.open(raw, "_blank");
  };
}

modalClose.onclick = () => modal.classList.add("hidden");
modal.onclick = e => {
  if (e.target === modal) modal.classList.add("hidden");
};

// ====================== EMPTY ======================

function showEmpty() {
  emptyBox.classList.remove("hidden");
  scriptsContainer.innerHTML = "";
}

// ====================== UTILS ======================

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, m =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m])
  );
}

function escapeAttr(text) {
  return String(text).replace(/"/g, "&quot;");
}

// ====================== INIT ======================

loadScripts();
