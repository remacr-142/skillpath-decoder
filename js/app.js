// ═══════════════════════════════════════
//   SkillPath Decoder — Core App Logic
// ═══════════════════════════════════════

// ── STATE ──
let state = window.SP.loadState();
let selectedCareerId = null;

// ── TOAST ──
function showToast(msg, type = "success", icon = "✅") {
  const t = document.getElementById("toast");
  const m = document.getElementById("toastMsg");
  const i = document.getElementById("toastIcon");
  if (!t) return;
  m.textContent = msg;
  i.textContent = icon;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.classList.remove("show"); }, 3500);
}

// ── HELPERS ──
function getCareer() {
  return state ? window.SP.CAREER_PATHS[state.careerId] : null;
}

function getSkillStatus(skillId) {
  return state?.skills[skillId]?.status || "gap";
}

function getConfidence(skillId) {
  return state?.skills[skillId]?.confidence ?? 0;
}

function arePrereqsMet(skill) {
  if (!skill.prereqs || skill.prereqs.length === 0) return true;
  return skill.prereqs.every(p => getSkillStatus(p) === "mastered");
}

function computeStats() {
  if (!state) return { progress: 0, mastered: 0, learning: 0, gaps: 0, total: 0 };
  const skills = Object.values(state.skills);
  const mastered = skills.filter(s => s.status === "mastered").length;
  const learning = skills.filter(s => s.status === "learning").length;
  const gaps = skills.filter(s => s.status === "gap").length;
  const total = skills.length;
  const progress = total > 0 ? Math.round((mastered / total) * 100) : 0;
  return { progress, mastered, learning, gaps, total };
}

function getStatusBadge(status) {
  const map = { mastered: "badge-mastered", learning: "badge-learning", gap: "badge-gap", locked: "badge-locked" };
  const labels = { mastered: "✅ Mastered", learning: "🔵 Learning", gap: "⚠️ Gap", locked: "🔒 Locked" };
  return `<span class="skill-badge ${map[status] || 'badge-locked'}">${labels[status] || "Locked"}</span>`;
}

function getResourceIcon(type) {
  const icons = { youtube: "▶️", course: "📖", doc: "📄", cert: "🏅", project: "🛠️" };
  return icons[type] || "🔗";
}

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
    if (goalChip) { goalChip.textContent = career.emoji + " " + career.title; goalChip.style.display = ""; }
  } else {
    if (titleEl) titleEl.textContent = "No Goal Set";
    if (levelEl) levelEl.textContent = "Select a career";
    if (goalChip) goalChip.style.display = "none";
  }
}

// ── CAREER CARDS ──
function renderCareerGrid(containerId, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  Object.values(window.SP.CAREER_PATHS).forEach(career => {
    const card = document.createElement("div");
    card.className = "career-card" + (selectedCareerId === career.id ? " selected" : "");
    card.dataset.id = career.id;
    card.innerHTML = `
      <span class="career-emoji">${career.emoji}</span>
      <div class="career-title">${escapeHTML(career.title)}</div>
      <div class="career-level">${escapeHTML(career.level)}</div>
    `;
    card.addEventListener("click", () => {
      container.querySelectorAll(".career-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedCareerId = career.id;
      if (onSelect) onSelect(career.id);
    });
    container.appendChild(card);
  });
}

// ── DASHBOARD INITIALISATION ──
function initDashboard() {
  updateSidebarMeta();

  if (!state) {
    showOnboarding();
  } else {
    showDashboard();
  }

  // Sidebar mobile toggle
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");
  if (sidebarToggle) {
    sidebarToggle.style.display = "flex";
    sidebarToggle.addEventListener("click", () => sidebar?.classList.toggle("open"));
  }

  // Change goal
  document.getElementById("btn-change-goal")?.addEventListener("click", () => {
    renderCareerGrid("changeGoalGrid", null);
    document.getElementById("changeGoalModal")?.classList.add("open");
  });
  document.getElementById("closeChangeGoal")?.addEventListener("click", () => {
    document.getElementById("changeGoalModal")?.classList.remove("open");
  });
  document.getElementById("changeGoalGrid")?.addEventListener("click", (e) => {
    const card = e.target.closest(".career-card");
    if (!card) return;
    const newId = card.dataset.id;
    if (newId === state?.careerId) { document.getElementById("changeGoalModal")?.classList.remove("open"); return; }
    remapGoal(newId);
    document.getElementById("changeGoalModal")?.classList.remove("open");
    showToast("Career goal updated! Your skills have been remapped.", "success", "🔄");
    setTimeout(() => location.reload(), 1000);
  });

  document.querySelectorAll("[data-open-custom-goal]").forEach(button => {
    button.addEventListener("click", () => {
      document.getElementById("changeGoalModal")?.classList.remove("open");
      document.getElementById("customGoalModal")?.classList.add("open");
      document.getElementById("customCareerName")?.focus();
    });
  });
  document.getElementById("closeCustomGoal")?.addEventListener("click", closeCustomGoalModal);
  document.getElementById("customGoalModal")?.addEventListener("click", event => {
    if (event.target.id === "customGoalModal") closeCustomGoalModal();
  });
  document.getElementById("customGoalForm")?.addEventListener("submit", createCustomGoal);

  // Reset
  document.getElementById("btn-reset")?.addEventListener("click", () => {
    if (confirm("Reset all progress? This cannot be undone.")) {
      localStorage.removeItem("skillpath_data_v2");
      localStorage.removeItem("skillpath_custom_careers_v1");
      location.reload();
    }
  });
}

function closeCustomGoalModal() {
  document.getElementById("customGoalModal")?.classList.remove("open");
}

function createCustomGoal(event) {
  event.preventDefault();
  const error = document.getElementById("customGoalError");
  error.style.display = "none";

  const name = document.getElementById("customCareerName").value.trim();
  const level = document.getElementById("customCareerLevel").value;
  const lines = document.getElementById("customSkillsInput").value
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
  const rows = lines.map((line, index) => {
    const [skillName, category, prerequisites = ""] = line.split("|").map(part => part.trim());
    return {
      skillName,
      category: category || "Core Skills",
      prerequisiteNames: prerequisites.split(",").map(part => part.trim()).filter(Boolean),
      index,
    };
  });

  if (!name) {
    error.textContent = "Enter a career goal name.";
    error.style.display = "block";
    return;
  }
  if (!rows.length || rows.some(row => !row.skillName)) {
    error.textContent = "Add at least one skill name.";
    error.style.display = "block";
    return;
  }
  if (rows.length > 50 || rows.some(row => row.skillName.length > 80 || row.category.length > 60)) {
    error.textContent = "Add up to 50 skills. Skill names can be up to 80 characters and categories up to 60.";
    error.style.display = "block";
    return;
  }

  const byName = new Map();
  rows.forEach(row => {
    const key = row.skillName.toLowerCase();
    if (byName.has(key)) {
      error.textContent = `The skill "${row.skillName}" is listed more than once.`;
    }
    byName.set(key, row);
  });
  if (error.textContent) {
    error.style.display = "block";
    return;
  }

  for (const row of rows) {
    const unknown = row.prerequisiteNames.find(prerequisite => !byName.has(prerequisite.toLowerCase()));
    if (unknown) {
      error.textContent = `"${unknown}" is listed as a prerequisite but is not in your skills list.`;
      error.style.display = "block";
      return;
    }
    if (row.prerequisiteNames.some(prerequisite => prerequisite.toLowerCase() === row.skillName.toLowerCase())) {
      error.textContent = `"${row.skillName}" cannot be its own prerequisite.`;
      error.style.display = "block";
      return;
    }
  }

  const visiting = new Set();
  const visited = new Set();
  function hasCircularPrerequisite(row) {
    const key = row.skillName.toLowerCase();
    if (visiting.has(key)) return true;
    if (visited.has(key)) return false;
    visiting.add(key);
    const hasCycle = row.prerequisiteNames.some(name => hasCircularPrerequisite(byName.get(name.toLowerCase())));
    visiting.delete(key);
    visited.add(key);
    return hasCycle;
  }
  if (rows.some(hasCircularPrerequisite)) {
    error.textContent = "Prerequisites cannot form a cycle. Update the skill list and try again.";
    error.style.display = "block";
    return;
  }

  const careerId = `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const skillIds = new Map(rows.map(row => [
    row.skillName.toLowerCase(),
    `${careerId}-${row.skillName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "skill"}-${row.index + 1}`,
  ]));
  const career = {
    id: careerId,
    title: name,
    emoji: "✨",
    level,
    description: `Custom learning roadmap for ${name}`,
    custom: true,
    skills: rows.map(row => ({
      id: skillIds.get(row.skillName.toLowerCase()),
      name: row.skillName,
      category: row.category,
      level: "custom",
      prereqs: row.prerequisiteNames.map(prerequisite => skillIds.get(prerequisite.toLowerCase())),
      parallel: row.prerequisiteNames.length === 0,
      resources: [],
      customResources: [],
      quizQuestions: [],
      custom: true,
    })),
  };

  try {
    window.SP.saveCustomCareer(career);
    state = window.SP.createFreshState(careerId);
    window.SP.saveState(state);
  } catch (saveError) {
    error.textContent = `Could not save this career goal: ${saveError.message}`;
    error.style.display = "block";
    return;
  }

  closeCustomGoalModal();
  document.getElementById("customGoalForm").reset();
  showDashboard();
  showToast("Custom goal saved. Add resources and quiz questions from Skills.", "success", "✨");
}

function remapGoal(newCareerId) {
  const masteredSkillIds = state ? Object.keys(state.skills).filter(id => state.skills[id].status === "mastered") : [];
  const newState = window.SP.createFreshState(newCareerId);
  if (newState) {
    // Transfer mastered skills by name match
    const oldCareer = getCareer();
    const newCareer = window.SP.CAREER_PATHS[newCareerId];
    if (oldCareer && newCareer) {
      const oldSkillNames = {};
      oldCareer.skills.forEach(s => { oldSkillNames[s.id] = s.name; });
      newCareer.skills.forEach(s => {
        const wasMastered = masteredSkillIds.includes(s.id) ||
          Object.entries(oldSkillNames).some(([id, name]) => name === s.name && masteredSkillIds.includes(id));
        if (wasMastered) {
          newState.skills[s.id].status = "mastered";
          newState.skills[s.id].confidence = 9;
        }
      });
    }
    state = newState;
    window.SP.saveState(state);
  }
}

// ── ONBOARDING ──
function showOnboarding() {
  document.getElementById("onboardingView").style.display = "block";
  document.getElementById("dashboardView").style.display = "none";

  renderCareerGrid("careerGrid", (careerId) => {
    selectedCareerId = careerId;
    showAssessment(careerId);
  });
}

function showAssessment(careerId) {
  const career = window.SP.CAREER_PATHS[careerId];
  if (!career) return;
  const section = document.getElementById("assessmentSection");
  section.style.display = "block";
  section.scrollIntoView({ behavior: "smooth" });

  const grid = document.getElementById("assessmentGrid");
  grid.innerHTML = "";
  career.skills.forEach(skill => {
    const card = document.createElement("div");
    card.className = "skill-card";
    card.innerHTML = `
      <div class="skill-card-header">
        <div>
          <div class="skill-name">${escapeHTML(skill.name)}</div>
          <div class="skill-category">${escapeHTML(skill.category)} • ${escapeHTML(skill.level)}</div>
        </div>
      </div>
      <div class="skill-confidence">
        <div class="skill-confidence-label">
          <span>Confidence</span>
          <span id="conf-val-${skill.id}" class="text-cyan font-bold">0/10</span>
        </div>
        <input type="range" min="0" max="10" value="0" class="confidence-slider" id="conf-${skill.id}" />
      </div>
      <div class="flex gap-8 mt-8" id="status-preview-${skill.id}">
        <span class="skill-badge badge-gap">⚠️ Gap</span>
      </div>
    `;
    grid.appendChild(card);

    const slider = card.querySelector(`#conf-${skill.id}`);
    const valLabel = card.querySelector(`#conf-val-${skill.id}`);
    const statusEl = card.querySelector(`#status-preview-${skill.id}`);
    slider.addEventListener("input", () => {
      const v = parseInt(slider.value);
      valLabel.textContent = `${v}/10`;
      const s = v >= 8 ? "mastered" : v >= 4 ? "learning" : "gap";
      statusEl.innerHTML = getStatusBadge(s);
    });
  });

  document.getElementById("btnFinalise").addEventListener("click", () => {
    finaliseOnboarding(careerId, career);
  });
}

function finaliseOnboarding(careerId, career) {
  state = window.SP.createFreshState(careerId);
  career.skills.forEach(skill => {
    const slider = document.getElementById(`conf-${skill.id}`);
    const v = slider ? parseInt(slider.value) : 0;
    state.skills[skill.id].confidence = v;
    state.skills[skill.id].status = v >= 8 ? "mastered" : v >= 4 ? "learning" : "gap";
  });
  window.SP.saveState(state);
  showToast("🎉 Roadmap generated! Let's go!", "success", "🚀");
  setTimeout(() => showDashboard(), 500);
}

// ── DASHBOARD VIEW ──
function showDashboard() {
  document.getElementById("onboardingView").style.display = "none";
  document.getElementById("dashboardView").style.display = "block";
  updateSidebarMeta();

  const career = getCareer();
  if (!career) return;

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  document.getElementById("dashGreeting").textContent = `${greeting}! 👋`;
  document.getElementById("dashSub").textContent = `You're on your journey to become a ${career.title}. Keep it up!`;

  // Stats
  const stats = computeStats();
  animateNumber("statProgress", 0, stats.progress, "%");
  animateNumber("statMastered", 0, stats.mastered, "");
  animateNumber("statLearning", 0, stats.learning, "");
  animateNumber("statGaps", 0, stats.gaps, "");
  document.getElementById("statMasteredSub").textContent = `of ${stats.total} skills`;
  setTimeout(() => {
    const pb = document.getElementById("statProgressBar");
    if (pb) pb.style.width = stats.progress + "%";
  }, 100);

  // Next steps
  renderNextSteps(career);
  renderCategoryProgress(career);
  renderAvailableSkills(career);
  renderQuickQuizList(career);
}

function animateNumber(id, from, to, suffix) {
  const el = document.getElementById(id);
  if (!el) return;
  const duration = 800;
  const start = performance.now();
  function update(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (to - from) * ease) + suffix;
    if (t < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function renderNextSteps(career) {
  const container = document.getElementById("nextStepsList");
  if (!container) return;
  const steps = career.skills
    .filter(s => {
      const status = getSkillStatus(s.id);
      return status !== "mastered" && arePrereqsMet(s);
    })
    .slice(0, 4);

  if (steps.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:24px"><span class="empty-icon">🎉</span><p class="text-muted">All unlocked skills are mastered!</p></div>`;
    return;
  }
  container.innerHTML = steps.map(s => {
    const status = getSkillStatus(s.id);
    return `
      <div class="flex items-center gap-12 mb-16">
        <div style="width:36px;height:36px;border-radius:50%;background:rgba(124,58,237,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1rem;">
          ${status === "learning" ? "🔵" : "⚡"}
        </div>
        <div style="flex:1">
          <div class="font-bold text-sm text-white">${escapeHTML(s.name)}</div>
          <div class="text-xs text-muted">${escapeHTML(s.category)} • ${escapeHTML(s.level)}</div>
        </div>
        <a href="skills.html" class="btn btn-outline btn-sm" style="font-size:.75rem;padding:4px 12px">View</a>
      </div>
    `;
  }).join("");
}

function renderCategoryProgress(career) {
  const container = document.getElementById("categoryProgress");
  if (!container) return;
  const cats = {};
  career.skills.forEach(s => {
    if (!cats[s.category]) cats[s.category] = { total: 0, mastered: 0 };
    cats[s.category].total++;
    if (getSkillStatus(s.id) === "mastered") cats[s.category].mastered++;
  });
  const colors = ["violet","cyan","gold","green","violet","cyan"];
  container.innerHTML = Object.entries(cats).map(([cat, data], i) => {
    const pct = Math.round((data.mastered / data.total) * 100);
    return `
      <div class="mb-16">
        <div class="flex justify-between mb-8" style="font-size:.85rem">
          <span class="text-white">${escapeHTML(cat)}</span>
          <span class="text-muted">${data.mastered}/${data.total}</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar ${colors[i % colors.length]}" style="width:${pct}%;transition:width 1s ease"></div>
        </div>
      </div>
    `;
  }).join("");
}

function renderAvailableSkills(career) {
  const container = document.getElementById("availableSkills");
  if (!container) return;
  const avail = career.skills.filter(s => getSkillStatus(s.id) !== "mastered" && arePrereqsMet(s)).slice(0, 4);
  if (avail.length === 0) {
    container.innerHTML = `<p class="text-muted text-sm">No new skills to unlock right now.</p>`;
    return;
  }
  container.innerHTML = avail.map(s => `
    <div class="flex items-center gap-12 mb-12">
      <span style="font-size:1.2rem">${s.parallel ? "⚡" : "🔗"}</span>
      <div style="flex:1">
        <div class="font-bold text-sm text-white">${escapeHTML(s.name)}</div>
        <div class="text-xs text-muted">${s.parallel ? "Can learn in parallel" : "Sequential"}</div>
      </div>
      ${getStatusBadge(getSkillStatus(s.id))}
    </div>
  `).join("");
}

function renderQuickQuizList(career) {
  const container = document.getElementById("quickQuizList");
  if (!container) return;
  const quizzable = career.skills.filter(s =>
    (getSkillStatus(s.id) === "learning" || getSkillStatus(s.id) === "mastered") &&
    window.SP.getQuizForSkill(s.id, career.id).length > 0
  ).slice(0, 4);
  if (quizzable.length === 0) {
    container.innerHTML = career.custom
      ? `<p class="text-muted text-sm">Add skill-specific quiz questions from the Skills page to make them available here.</p>`
      : `<p class="text-muted text-sm">Start learning skills to unlock quizzes.</p>`;
    return;
  }
  container.innerHTML = quizzable.map(s => `
    <div class="flex items-center gap-12 mb-12">
      <span style="font-size:1.2rem">🎯</span>
      <div style="flex:1">
        <div class="font-bold text-sm text-white">${escapeHTML(s.name)}</div>
        <div class="text-xs text-muted">${state.skills[s.id]?.quizPassed ? "✅ Quiz passed" : "Quiz available"}</div>
      </div>
      <a href="quiz.html?skill=${s.id}" class="btn btn-outline btn-sm" style="font-size:.75rem;padding:4px 12px">
        ${state.skills[s.id]?.quizPassed ? "Retake" : "Take Quiz"}
      </a>
    </div>
  `).join("");
}

// ── INIT ──
document.addEventListener("DOMContentLoaded", initDashboard);
