const BASE_REPO_URL = "https://raw.githubusercontent.com/higuysdorobloxjoaopk-maker/Luayscripts.rbx/main";
const DATA_BASE_PATH = "data/informations/users/Scripts";

const params = new URLSearchParams(window.location.search);
const scriptId = params.get("id");

const titleEl = document.getElementById("script-title");
const descEl = document.getElementById("script-description");
const authorEl = document.getElementById("script-author");
const bannerEl = document.getElementById("script-banner");
const codeEl = document.getElementById("script-code");
const copyBtn = document.getElementById("copy-btn");
const downloadBtn = document.getElementById("download-btn");

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro ao buscar JSON");
  return res.json();
}

function getLuaUrl(script) {
  return `${BASE_REPO_URL}/${DATA_BASE_PATH}/${script.author.toLowerCase()}/${script.slug}/${script.slug}.lua`;
}

function getLoadstring(script) {
  return `loadstring(game:HttpGet("${getLuaUrl(script)}"))()`;
}

async function loadScript() {
  if (!scriptId) {
    codeEl.textContent = "❌ Script não encontrado.";
    return;
  }

  const [username, slug] = scriptId.split("-");

  const jsonUrl = `${BASE_REPO_URL}/${DATA_BASE_PATH}/${username}/${slug}/data.json`;

  try {
    const data = await fetchJson(jsonUrl);

    titleEl.textContent = data.title;
    descEl.textContent = data.description;
    authorEl.textContent = `por ${data.author}`;
    bannerEl.src = data.banner || "";
    bannerEl.style.display = data.banner ? "block" : "none";

    const luaUrl = getLuaUrl({ author: username, slug });

    const luaRes = await fetch(luaUrl);
    if (!luaRes.ok) throw new Error("Erro ao buscar código");

    const luaCode = await luaRes.text();
    codeEl.textContent = luaCode;

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(getLoadstring({ author: username, slug }));
      copyBtn.textContent = "✅ Copiado!";
      setTimeout(() => (copyBtn.textContent = "Copiar"), 1500);
    };

    downloadBtn.onclick = () => {
      window.open(luaUrl, "_blank");
    };

  } catch (err) {
    console.error(err);
    codeEl.textContent = "❌ Erro ao carregar script.";
  }
}

loadScript();
