// ═══════════════════════════════════════
//   Roadmap Page Logic
// ═══════════════════════════════════════
const { CAREER_PATHS, loadState, saveState } = window.SP;

let state = loadState();
let currentSkillId = null;
let currentStatus = "gap";

function getCareer() { return state ? CAREER_PATHS[state.careerId] : null; }
function getSkillStatus(id) { return state?.skills[id]?.status || "gap"; }
function getConfidence(id) { return state?.skills[id]?.confidence ?? 0; }
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}
function arePrereqsMet(skill) {
  if (!skill.prereqs?.length) return true;
  return skill.prereqs.every(p => getSkillStatus(p) === "mastered");
}

function showToast(msg, type = "success", icon = "✅") {
  const t = document.getElementById("toast");
  const m = document.getElementById("toastMsg");
  const i = document.getElementById("toastIcon");
  if (!t) return;
  m.textContent = msg;
  i.textContent = icon;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove("show"), 3000);
}

function updateSidebarMeta() {
  const career = getCareer();
  const titleEl = document.getElementById("sidebarCareerTitle");
  const levelEl = document.getElementById("sidebarLevel");
  const goalChip = document.getElementById("topBarGoal");
  if (career) {
    if (titleEl) titleEl.textContent = career.title;
    if (levelEl) levelEl.textContent = career.level;
    if (goalChip) { goalChip.textContent = career.emoji + " " + career.title; }
  }
}

// ── STAGE COMPUTATION ──
// Build stages using topological sort respecting prerequisites
function buildStages(career) {
  const skillMap = {};
  career.skills.forEach(s => { skillMap[s.id] = s; });

  const inDegree = {};
  const adjList = {};
  career.skills.forEach(s => { inDegree[s.id] = 0; adjList[s.id] = []; });
  career.skills.forEach(s => {
    s.prereqs.forEach(p => {
      if (adjList[p]) adjList[p].push(s.id);
      inDegree[s.id] = (inDegree[s.id] || 0) + 1;
    });
  });

  // BFS to assign stage levels
  const stageLevels = {};
  const queue = career.skills.filter(s => !s.prereqs?.length).map(s => s.id);
  queue.forEach(id => { stageLevels[id] = 0; });

  const visited = new Set(queue);
  let qi = 0;
  while (qi < queue.length) {
    const id = queue[qi++];
    adjList[id].forEach(next => {
      const level = Math.max(stageLevels[next] || 0, stageLevels[id] + 1);
      stageLevels[next] = level;
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    });
  }

  // Group by stage
  const stageMap = {};
  career.skills.forEach(s => {
    const lvl = stageLevels[s.id] ?? 0;
    if (!stageMap[lvl]) stageMap[lvl] = [];
    stageMap[lvl].push(s);
  });

  return Object.entries(stageMap).sort((a, b) => a[0] - b[0]).map(([lvl, skills]) => ({
    level: parseInt(lvl),
    label: getLevelLabel(parseInt(lvl)),
    skills,
  }));
}

function getLevelLabel(lvl) {
  const labels = ["Foundation & Basics", "Core Skills", "Intermediate Skills", "Advanced Skills", "Expert & Mastery", "Professional"];
  return labels[lvl] || `Stage ${lvl + 1}`;
}

// ── RENDER ROADMAP ──
function renderRoadmap() {
  const career = getCareer();
  if (!career) {
    document.getElementById("noGoalMsg").style.display = "block";
    return;
  }
  document.getElementById("roadmapContent").style.display = "block";

  const stages = buildStages(career);
  const container = document.getElementById("roadmapStages");
  container.innerHTML = "";

  stages.forEach((stage, si) => {
    const stageEl = document.createElement("div");
    stageEl.className = "roadmap-stage";
    stageEl.innerHTML = `
      <div class="stage-header">
        <span class="stage-badge">Stage ${stage.level + 1}</span>
        <span class="stage-label">${stage.label}</span>
        <div class="stage-line"></div>
        <span class="text-muted text-xs">${stage.skills.length} skill${stage.skills.length !== 1 ? "s" : ""}</span>
      </div>
      <div class="stage-skills" id="stage-skills-${si}"></div>
    `;
    container.appendChild(stageEl);

    const skillsContainer = stageEl.querySelector(`#stage-skills-${si}`);
    stage.skills.forEach(skill => {
      const status = getSkillStatus(skill.id);
      const unlocked = arePrereqsMet(skill);
      const conf = getConfidence(skill.id);
      const nodeStatus = !unlocked ? "locked" : status;

      const node = document.createElement("div");
      node.className = `roadmap-skill-node status-${nodeStatus} ${nodeStatus === "gap" && unlocked ? "unlocked" : ""}`;
      node.innerHTML = `
        <div class="node-status-dot"></div>
        <div class="node-name">${escapeHTML(skill.name)}</div>
        <div class="node-category">${escapeHTML(skill.category)}</div>
        <div class="node-conf-bar">
          <div class="node-conf-fill" style="width:${conf * 10}%"></div>
        </div>
        <div class="node-prereqs">${
          !unlocked
            ? `🔒 Needs: ${skill.prereqs.filter(p => getSkillStatus(p) !== "mastered").map(p => {
                const ps = career.skills.find(s => s.id === p);
                return ps ? ps.name : p;
              }).join(", ")}`
            : `Confidence: ${conf}/10`
        }</div>
        ${skill.parallel ? `<span class="parallel-tag">⚡ Can parallel</span>` : ""}
      `;

      if (unlocked) {
        node.addEventListener("click", () => openUpdateModal(skill));
      }
      skillsContainer.appendChild(node);
    });
  });
}

// ── SKILL UPDATE MODAL ──
function openUpdateModal(skill) {
  currentSkillId = skill.id;
  const s = state.skills[skill.id];
  currentStatus = s?.status || "gap";

  document.getElementById("updateSkillTitle").textContent = skill.name;
  document.getElementById("updateSkillCategory").textContent = `${skill.category} • ${skill.level}`;

  const slider = document.getElementById("modalConfSlider");
  const confBig = document.getElementById("confBig");
  slider.value = s?.confidence ?? 5;
  confBig.textContent = slider.value;

  slider.addEventListener("input", () => { confBig.textContent = slider.value; });

  setActiveStatus(currentStatus);

  document.getElementById("btnGoToResources").href = `resources.html?skill=${skill.id}`;
  document.getElementById("btnGoToQuiz").href = `quiz.html?skill=${skill.id}`;

  document.getElementById("updateSkillModal").classList.add("open");
}

function setActiveStatus(status) {
  currentStatus = status;
  ["gap","learning","mastered"].forEach(s => {
    const btn = document.getElementById(`btn-status-${s}`);
    btn.className = "status-btn";
    if (s === status) btn.classList.add(`active-${s}`);
  });
}

document.querySelectorAll("[data-status]").forEach(btn => {
  btn.addEventListener("click", () => setActiveStatus(btn.dataset.status));
});

document.getElementById("closeUpdateSkill")?.addEventListener("click", () => {
  document.getElementById("updateSkillModal").classList.remove("open");
});

document.getElementById("btnSaveSkill")?.addEventListener("click", () => {
  if (!currentSkillId || !state) return;
  const conf = parseInt(document.getElementById("modalConfSlider").value);
  state.skills[currentSkillId].confidence = conf;
  state.skills[currentSkillId].status = currentStatus;
  state.skills[currentSkillId].lastUpdated = new Date().toISOString();
  saveState(state);
  document.getElementById("updateSkillModal").classList.remove("open");
  showToast("Skill updated! Roadmap refreshed.", "success", "✅");
  renderRoadmap();
});

document.addEventListener("DOMContentLoaded", () => {
  updateSidebarMeta();
  renderRoadmap();
});
