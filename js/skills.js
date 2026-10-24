// ═══════════════════════════════════════
//   Skills Page Logic
// ═══════════════════════════════════════
const { CAREER_PATHS, loadState, saveState } = window.SP;

let state = loadState();
let activeFilter = "all";
let currentEditId = null;

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
  if (!t) return;
  document.getElementById("toastMsg").textContent = msg;
  document.getElementById("toastIcon").textContent = icon;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove("show"), 3000);
}

function getStatusBadge(status) {
  const map = { mastered: "badge-mastered", learning: "badge-learning", gap: "badge-gap", locked: "badge-locked" };
  const labels = { mastered: "✅ Mastered", learning: "🔵 Learning", gap: "⚠️ Gap", locked: "🔒 Locked" };
  return `<span class="skill-badge ${map[status] || 'badge-locked'}">${labels[status] || "Locked"}</span>`;
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

function renderSkills() {
  const career = getCareer();
  if (!career) {
    document.getElementById("noGoalMsg").style.display = "block";
    return;
  }
  document.getElementById("skillsContent").style.display = "block";
  document.getElementById("skillsPageTitle").textContent = `${career.emoji} ${career.title} Skills`;
  const stats = computeStats(career);
  document.getElementById("skillsPageSub").textContent =
    `${stats.mastered} mastered · ${stats.learning} in progress · ${stats.gaps} gaps · ${career.skills.length} total`;

  const searchTerm = document.getElementById("skillSearch")?.value?.toLowerCase() || "";
  const grid = document.getElementById("skillsGrid");
  grid.innerHTML = "";

  let shown = 0;
  career.skills.forEach(skill => {
    const status = getSkillStatus(skill.id);
    const unlocked = arePrereqsMet(skill);
    const effectiveStatus = unlocked ? status : "locked";
    const conf = getConfidence(skill.id);

    // Filter
    if (activeFilter === "gap" && status !== "gap") return;
    if (activeFilter === "learning" && status !== "learning") return;
    if (activeFilter === "mastered" && status !== "mastered") return;
    if (activeFilter === "unlocked" && (!unlocked || status === "mastered")) return;
    if (searchTerm && !skill.name.toLowerCase().includes(searchTerm) && !skill.category.toLowerCase().includes(searchTerm)) return;

    shown++;
    const prereqNames = skill.prereqs.map(p => {
      const ps = career.skills.find(s => s.id === p);
      return ps ? `<span class="prereq-tag">${getSkillStatus(p) === "mastered" ? "✅" : "🔒"} ${escapeHTML(ps.name)}</span>` : "";
    }).join("");

    const card = document.createElement("div");
    card.className = "skill-card" + (effectiveStatus === "locked" ? " opacity: 0.6" : "");
    card.style.opacity = effectiveStatus === "locked" ? "0.6" : "1";
    card.innerHTML = `
      <div class="skill-card-header">
        <div>
          <div class="skill-name">${escapeHTML(skill.name)}</div>
          <div class="skill-category">${escapeHTML(skill.category)} • <span style="text-transform:capitalize">${escapeHTML(skill.level)}</span></div>
        </div>
        ${getStatusBadge(effectiveStatus)}
      </div>
      <div class="skill-confidence">
        <div class="skill-confidence-label">
          <span>Confidence</span>
          <span class="text-cyan font-bold">${conf}/10</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar multi" style="width:${conf * 10}%"></div>
        </div>
      </div>
      ${prereqNames ? `<div class="mt-8" style="font-size:.75rem;color:var(--text-3)">Prereqs: ${prereqNames}</div>` : ""}
      <div class="skill-meta">
        ${skill.parallel ? '<span class="chip cyan">⚡ Parallel</span>' : '<span class="chip">🔗 Sequential</span>'}
        ${state.skills[skill.id]?.quizPassed ? '<span class="chip" style="background:rgba(16,185,129,.15);border-color:rgba(16,185,129,.3);color:var(--green)">🎯 Quiz Passed</span>' : ""}
      </div>
      ${unlocked || career.custom ? `
      <div class="skill-card-actions">
        <button class="btn btn-outline" onclick="openModal('${skill.id}')">Edit</button>
        <a href="resources.html?skill=${skill.id}" class="btn btn-ghost">📚</a>
        <a href="quiz.html?skill=${skill.id}" class="btn btn-ghost">🎯</a>
      </div>` : `<div class="mt-12 text-xs text-muted">🔒 Complete prerequisites first</div>`}
    `;
    grid.appendChild(card);
  });

  if (shown === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <span class="empty-icon">🔍</span>
      <div class="empty-title">No skills match</div>
      <div class="empty-sub">Try a different filter or search term.</div>
    </div>`;
  }
}

function computeStats(career) {
  let mastered = 0, learning = 0, gaps = 0;
  career.skills.forEach(s => {
    const st = getSkillStatus(s.id);
    if (st === "mastered") mastered++;
    else if (st === "learning") learning++;
    else gaps++;
  });
  return { mastered, learning, gaps };
}

function openModal(skillId) {
  currentEditId = skillId;
  const career = getCareer();
  const skill = career?.skills.find(s => s.id === skillId);
  if (!skill) return;

  document.getElementById("modalSkillTitle").textContent = skill.name;
  document.getElementById("modalSkillDesc").textContent = `${skill.category} • ${skill.level} • ${skill.parallel ? "Can be learned in parallel" : "Sequential"}`;
  document.getElementById("modalSlider").value = getConfidence(skillId);
  document.getElementById("modalConfVal").textContent = `${getConfidence(skillId)}/10`;
  document.getElementById("modalStatus").value = getSkillStatus(skillId);
  document.getElementById("modalResourcesLink").href = `resources.html?skill=${skillId}`;
  document.getElementById("modalQuizLink").href = `quiz.html?skill=${skillId}`;
  const customFields = document.getElementById("customSkillContentFields");
  if (customFields) {
    customFields.style.display = career.custom ? "block" : "none";
    document.getElementById("customContentError").style.display = "none";
    if (career.custom) {
      document.getElementById("modalResources").value = (skill.customResources || [])
        .map(resource => `${resource.title} | ${resource.url} | ${resource.type} | ${resource.free ? "free" : "paid"} | ${resource.duration}`)
        .join("\n");
      document.getElementById("modalQuizQuestions").value = (skill.quizQuestions || [])
        .map(question => [
          question.q,
          question.options[question.correct],
          ...question.options.filter((_, index) => index !== question.correct),
          question.explanation,
        ].join(" | "))
        .join("\n");
    }
  }
  document.getElementById("updateSkillModal").classList.add("open");
}

window.openModal = openModal;

function parseCustomResources(value, career, skill) {
  const types = new Set(["workshop", "training", "course", "youtube", "doc", "cert", "project"]);
  return value.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map((line, index) => {
    const [title, rawUrl, rawType = "doc", rawAccess = "", rawDuration = "Self-paced"] = line.split("|").map(part => part.trim());
    if (!title || !rawUrl) throw new Error("Each resource needs a title and a URL, separated by |.");
    let url;
    try {
      url = new URL(rawUrl);
    } catch {
      throw new Error(`"${rawUrl}" is not a valid resource URL.`);
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Resource links must use http:// or https://.");
    }
    const type = rawType.toLowerCase();
    if (!types.has(type)) throw new Error(`"${rawType}" is not a supported resource type.`);
    const access = rawAccess.toLowerCase();
    if (access && access !== "free" && access !== "paid") {
      throw new Error(`"${rawAccess}" must be "free" or "paid".`);
    }
    return {
      id: `resource-${career.id}-${skill.id}-${index}`,
      title,
      type,
      platform: url.hostname,
      url: url.href,
      free: access === "free",
      duration: rawDuration || "Self-paced",
    };
  });
}

function parseCustomQuiz(value) {
  return value.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
    const parts = line.split("|").map(part => part.trim());
    if (parts.length !== 6 || parts.some(part => !part)) {
      throw new Error("Each quiz line needs a question, correct answer, three wrong answers, and an explanation, separated by |.");
    }
    const [q, correctAnswer, ...rest] = parts;
    const explanation = rest.pop();
    return { q, options: [correctAnswer, ...rest], correct: 0, explanation };
  });
}

function saveCustomContent(career, skill) {
  const resources = parseCustomResources(document.getElementById("modalResources").value, career, skill);
  const quizQuestions = parseCustomQuiz(document.getElementById("modalQuizQuestions").value);
  const updatedCareer = JSON.parse(JSON.stringify(career));
  const updatedSkill = updatedCareer.skills.find(item => item.id === skill.id);
  updatedSkill.customResources = resources;
  updatedSkill.resources = resources.map(resource => resource.id);
  updatedSkill.quizQuestions = quizQuestions;
  window.SP.saveCustomCareer(updatedCareer);
}

document.getElementById("modalSlider")?.addEventListener("input", (e) => {
  document.getElementById("modalConfVal").textContent = `${e.target.value}/10`;
});

document.getElementById("btnSaveModal")?.addEventListener("click", () => {
  if (!currentEditId || !state) return;
  const conf = parseInt(document.getElementById("modalSlider").value);
  const status = document.getElementById("modalStatus").value;
  const career = getCareer();
  if (career?.custom) {
    const skill = career.skills.find(item => item.id === currentEditId);
    const error = document.getElementById("customContentError");
    try {
      saveCustomContent(career, skill);
      error.style.display = "none";
    } catch (saveError) {
      error.textContent = saveError.message;
      error.style.display = "block";
      return;
    }
  }
  state.skills[currentEditId].confidence = conf;
  state.skills[currentEditId].status = status;
  state.skills[currentEditId].lastUpdated = new Date().toISOString();
  saveState(state);
  document.getElementById("updateSkillModal").classList.remove("open");
  showToast("Skill updated!", "success", "✅");
  renderSkills();
});

document.getElementById("closeModal")?.addEventListener("click", () => {
  document.getElementById("updateSkillModal").classList.remove("open");
});

// Filters
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderSkills();
  });
});

document.getElementById("skillSearch")?.addEventListener("input", renderSkills);

document.addEventListener("DOMContentLoaded", () => {
  updateSidebarMeta();
  renderSkills();
});
