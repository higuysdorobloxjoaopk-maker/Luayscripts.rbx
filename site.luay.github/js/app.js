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
const rawBtn = document.getElementById("rawBtn");
const commentsBox = document.querySelector(".comments-list");
const commentInput = document.querySelector(".comment-input input");
const commentBtn = document.querySelector(".comment-input button");

let currentThreadUrl = null;
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
        data._luaPath = `${BASE_PATH}/${user.name}/${scriptFolder.name}/${scriptFolder.name}.lua`;
        data._rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${data._luaPath}`;

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

  if (!list || list.length === 0) return showEmpty();

  for (const s of list) {
    const card = document.createElement("div");
    card.className = "script-card";

    const isOfficial = s.author?.toLowerCase() === "luay";

    card.innerHTML = `
      <div class="card-banner" style="background-image:url('${escapeAttr(s.banner || "")}')"></div>
      <div class="card-body">
        <div class="card-title">${escapeHTML(s.title || "Sem título")}</div>
        <div class="card-desc">${escapeHTML(s.description || "")}</div>
        <div class="card-author">
          <span>${escapeHTML(s.author || "Desconhecido")}</span>
          ${isOfficial ? `<span class="official-badge">OFICIAL</span>` : ``}
        </div>
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

  let result = [];

  if (q.includes(".")) {
    const [creator, script] = q.split(".");
    result = allScripts.filter(s =>
      (s.author || "").toLowerCase().includes(creator) &&
      (!script || (s.title || "").toLowerCase().includes(script))
    );
  } else {
    const words = q.split(" ");
    result = allScripts.filter(s =>
      words.every(w =>
        (s.title || "").toLowerCase().includes(w) ||
        (s.author || "").toLowerCase().includes(w)
      )
    );
  }

  render(result);
});

// ====================== MODAL ======================

async function openModal(s) {
  modal.classList.remove("hidden");

  modalBanner.style.backgroundImage = `url('${s.banner || ""}')`;
  modalTitle.textContent = s.title || "";
  modalDesc.textContent = s.description || "";

  const isOfficial = s.author?.toLowerCase() === "luay";
  modalAuthor.innerHTML = `
    <span>${escapeHTML(s.author || "")}</span>
    ${isOfficial ? `<span class="official-badge">OFICIAL</span>` : ``}
  `;

  modalCode.textContent = "Carregando código...";

  try {
    const res = await fetch(s._rawUrl);
    const code = await res.text();
    modalCode.textContent = code;

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(code);
      copyBtn.textContent = "Copiado!";
      setTimeout(() => copyBtn.textContent = "Copiar", 1200);
    };

    downloadBtn.onclick = () => {
      const blob = new Blob([code], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${(s._slug || "script")}.lua`;
      a.click();
    };

    rawBtn.onclick = () => {
      navigator.clipboard.writeText(s._rawUrl);
      window.open(s._rawUrl, "_blank");
    };

  } catch (e) {
    modalCode.textContent = "Erro ao carregar o script.";
  }

  loadComments(s);
}

modalClose.onclick = () => modal.classList.add("hidden");
modal.onclick = e => {
  if (e.target === modal) modal.classList.add("hidden");
};

// ====================== COMMENTS ======================

function loadComments(script) {
  commentsBox.innerHTML = "Clique abaixo para comentar no Discord.";
  currentThreadUrl = script.thread_url || null;
}

commentInput.onclick = () => {
  if (currentThreadUrl) window.open(currentThreadUrl, "_blank");
};

commentBtn.onclick = () => {
  if (currentThreadUrl) window.open(currentThreadUrl, "_blank");
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
