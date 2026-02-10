const OWNER = "higuysdorobloxjoaopk-maker";
const REPO = "Luayscripts.rbx";
const BASE_PATH = "data/informations/users/Scripts";

const container = document.getElementById("scripts");
const searchInput = document.getElementById("search");
const emptyBox = document.getElementById("empty");

let allScripts = [];

// ======================= LOAD =======================

async function gh(path) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`);
  if (!res.ok) throw new Error("GitHub error");
  return res.json();
}

async function loadScripts() {
  allScripts = [];
  const users = await gh(BASE_PATH);

  for (const user of users) {
    if (user.type !== "dir") continue;

    const scripts = await gh(`${BASE_PATH}/${user.name}`);
    for (const script of scripts) {
      if (script.type !== "dir") continue;

      const dataFile = await gh(`${BASE_PATH}/${user.name}/${script.name}/data.json`);
      const content = atob(dataFile.content);
      const data = JSON.parse(content);

      data._creator = user.name;
      data._slug = script.name;

      allScripts.push(data);
    }
  }

  render(allScripts);
}

// ======================= RENDER =======================

function render(list) {
  container.innerHTML = "";
  emptyBox.classList.add("hidden");

  if (list.length === 0) {
    emptyBox.classList.remove("hidden");
    return;
  }

  for (const s of list) {
    const card = document.createElement("div");
    card.className = "script-card";
    card.innerHTML = `
      <div class="banner" style="background-image:url('${s.banner || ""}')"></div>
      <h2>${escapeHTML(s.title)}</h2>
      <p>${escapeHTML(s.description)}</p>
      <div class="author">
        <img src="https://cdn.discordapp.com/avatars/${s.author_id}/${s.avatar || ""}.png?size=64"
             onerror="this.style.display='none'">
        <span>${escapeHTML(s.author)}</span>
      </div>
    `;

    card.onclick = () => openScript(s);
    container.appendChild(card);
  }
}

// ======================= SEARCH =======================

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();

  if (!q) return render(allScripts);

  let result = [];

  if (q.includes(".")) {
    const [creator, script] = q.split(".");
    result = allScripts.filter(s =>
      s.author.toLowerCase().includes(creator) &&
      (!script || s.title.toLowerCase().includes(script))
    );
  } else {
    const words = q.split(" ");
    result = allScripts.filter(s =>
      words.every(w =>
        s.title.toLowerCase().includes(w) ||
        s.author.toLowerCase().includes(w)
      )
    );
  }

  render(result);
});

// ======================= VIEW PAGE =======================

function openScript(s) {
  const modal = document.getElementById("modal");
  modal.classList.remove("hidden");

  modal.querySelector(".modal-banner").style.backgroundImage = `url('${s.banner || ""}')`;
  modal.querySelector(".modal-title").textContent = s.title;
  modal.querySelector(".modal-desc").textContent = s.description;
  modal.querySelector(".modal-author").textContent = s.author;
  modal.querySelector(".modal-code").textContent = s.script;

  modal.querySelector(".copy-btn").onclick = () => {
    navigator.clipboard.writeText(s.script);
  };

  modal.querySelector(".download-btn").onclick = () => {
    const blob = new Blob([s.script], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${s._slug}.txt`;
    a.click();
  };
}

// ======================= UTILS =======================

function escapeHTML(text) {
  return text.replace(/[&<>"']/g, m =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m])
  );
}

// ======================= INIT =======================

loadScripts();
