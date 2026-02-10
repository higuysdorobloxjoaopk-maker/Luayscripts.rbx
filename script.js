const OWNER = "higuysdorobloxjoaopk-maker";
const REPO = "Luayscripts.rbx";
const PATH = "scripts"; // pasta onde os scripts ficam no repo

const container = document.getElementById("scripts");
const searchInput = document.getElementById("search");
const emptyBox = document.getElementById("empty");

let allScripts = [];

async function loadScripts() {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`);
  const files = await res.json();

  for (const file of files) {
    if (!file.name.endsWith(".json")) continue;

    const data = await fetch(file.download_url).then(r => r.json());
    allScripts.push(data);
  }

  render(allScripts);
}

function render(list) {
  container.innerHTML = "";
  emptyBox.classList.add("hidden");

  if (list.length === 0) {
    emptyBox.classList.remove("hidden");
    return;
  }

  for (const s of list) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h2>${s.title}</h2>
      <div class="author">${s.author}</div>
      <pre>${s.script}</pre>
    `;
    container.appendChild(div);
  }
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();

  if (!q) {
    render(allScripts);
    return;
  }

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

loadScripts();
