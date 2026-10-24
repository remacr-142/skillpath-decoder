// ═══════════════════════════════════════
//   Resources Page Logic
// ═══════════════════════════════════════
const { CAREER_PATHS, RESOURCES_DB, loadState } = window.SP;

let state = loadState();
let activeType = "all";
let skillFilterVal = "all";

function getCareer() { return state ? CAREER_PATHS[state.careerId] : null; }
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function updateSidebarMeta() {
  const career = getCareer();
  const titleEl = document.getElementById("sidebarCareerTitle");
  const levelEl = document.getElementById("sidebarLevel");
  const goalChip = document.getElementById("topBarGoal");
  if (career) {
    if (titleEl) titleEl.textContent = career.title;
    if (levelEl) levelEl.textContent = career.level;
    if (goalChip) goalChip.textContent = career.emoji + " " + career.title;
  }
}

const TYPE_ICONS = { workshop: "🧑‍🏫", training: "🏫", youtube: "▶️", course: "📖", doc: "📄", cert: "🏅", project: "🛠️" };
const TYPE_LABELS = { workshop: "Workshop", training: "Training class", youtube: "Video", course: "Course", doc: "Reference", cert: "Certification", project: "Project" };

function renderResources() {
  const career = getCareer();
  if (!career) {
    document.getElementById("noGoalMsg").style.display = "block";
    return;
  }
  document.getElementById("resourcesContent").style.display = "block";

  // Check URL param
  const params = new URLSearchParams(window.location.search);
  const skillParam = params.get("skill");
  if (skillParam) {
    skillFilterVal = skillParam;
    const sel = document.getElementById("skillFilter");
    if (sel) sel.value = skillParam;
  }

  // Populate skill filter
  const sel = document.getElementById("skillFilter");
  if (sel && sel.options.length === 1) {
    career.skills.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.name;
      sel.appendChild(opt);
    });
    if (skillParam) sel.value = skillParam;
  }

  const list = document.getElementById("resourcesList");
  list.innerHTML = "";

  let totalResources = 0;

  career.skills.forEach(skill => {
    if (skillFilterVal !== "all" && skill.id !== skillFilterVal) return;
    if (!skill.resources || skill.resources.length === 0) return;

    const filteredRes = skill.resources
      .filter(rid => {
        const r = RESOURCES_DB[rid];
        if (!r) return false;
        if (activeType !== "all" && r.type !== activeType) return false;
        return true;
      });

    if (filteredRes.length === 0) return;
    totalResources += filteredRes.length;

    const group = document.createElement("div");
    group.className = "skill-group";
    group.innerHTML = `
      <div class="skill-group-header" onclick="toggleGroup(this.parentElement)">
        <span style="font-size:1.2rem">${getSkillEmoji(state?.skills[skill.id]?.status)}</span>
        <span class="skill-group-title">${escapeHTML(skill.name)}</span>
        <span class="skill-group-meta">${filteredRes.length} resource${filteredRes.length !== 1 ? "s" : ""} • ${escapeHTML(skill.category)}</span>
        <span class="skill-group-toggle">▼</span>
      </div>
      <div class="skill-group-resources">
        ${filteredRes.map(rid => {
          const r = RESOURCES_DB[rid];
          if (!r) return "";
          return `
            <div class="resource-card">
              <div class="resource-icon ${r.type}">${TYPE_ICONS[r.type] || "🔗"}</div>
              <div class="resource-info">
                <div class="resource-title">${escapeHTML(r.title)}</div>
                <div class="resource-meta">
                  ${escapeHTML(r.platform)} · ${TYPE_LABELS[r.type] || escapeHTML(r.type)} · ⏱ ${escapeHTML(r.duration)}
                  ${r.free ? '<span class="resource-free-badge">FREE</span>' : ""}
                </div>
              </div>
              <a href="${escapeHTML(r.url)}" target="_blank" rel="noopener" class="resource-link">
                Open ↗
              </a>
            </div>
          `;
        }).join("")}
      </div>
    `;
    list.appendChild(group);
  });

  if (totalResources === 0) {
    list.innerHTML = `<div class="empty-state">
      <span class="empty-icon">📭</span>
      <div class="empty-title">No resources found</div>
      <div class="empty-sub">Try a different filter or skill.</div>
    </div>`;
  }

  document.getElementById("resourcesSubtitle").textContent = `${totalResources} resources across your roadmap`;
}

function getSkillEmoji(status) {
  return status === "mastered" ? "✅" : status === "learning" ? "🔵" : "⚠️";
}

window.toggleGroup = function(groupEl) {
  groupEl.classList.toggle("collapsed");
};

document.getElementById("skillFilter")?.addEventListener("change", (e) => {
  skillFilterVal = e.target.value;
  renderResources();
});

document.querySelectorAll("[data-type]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-type]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeType = btn.dataset.type;
    renderResources();
  });
});

// Add filter-btn class to type buttons
document.querySelectorAll("#typeFilters button").forEach(btn => btn.classList.add("filter-btn"));

document.addEventListener("DOMContentLoaded", () => {
  updateSidebarMeta();
  renderResources();
});
