// ═══════════════════════════════════════
//   Quiz Page Logic
// ═══════════════════════════════════════
const { CAREER_PATHS, getQuizForSkill, loadState, saveState } = window.SP;

let state = loadState();
let currentQuiz = [];
let currentSkillId = null;
let currentQIndex = 0;
let score = 0;
let answered = false;

function getCareer() { return state ? CAREER_PATHS[state.careerId] : null; }
function getSkillStatus(id) { return state?.skills[id]?.status || "gap"; }
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
  setTimeout(() => t.classList.remove("show"), 3200);
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

// ── HUB ──
function renderHub() {
  const career = getCareer();
  if (!career) {
    document.getElementById("noGoalMsg").style.display = "block";
    return;
  }

  const grid = document.getElementById("quizHubGrid");
  grid.innerHTML = "";

  career.skills.forEach(skill => {
    const status = getSkillStatus(skill.id);
    const unlocked = arePrereqsMet(skill);
    const passed = state?.skills[skill.id]?.quizPassed;
    const questions = getQuizForSkill(skill.id, career.id);
    const hasQuiz = questions.length > 0;

    const card = document.createElement("div");
    card.className = "quiz-hub-card";
    if (!unlocked || !hasQuiz) { card.style.opacity = "0.5"; card.style.cursor = "default"; }
    card.innerHTML = `
      <div class="quiz-hub-icon">${passed ? "✅" : unlocked ? "🎯" : "🔒"}</div>
      <div class="quiz-hub-name">${escapeHTML(skill.name)}</div>
      <div class="quiz-hub-meta">${escapeHTML(skill.category)} • ${questions.length} question${questions.length === 1 ? "" : "s"}</div>
      <div class="quiz-hub-status">
        ${passed
          ? `<span class="chip" style="background:rgba(16,185,129,.15);color:var(--green);border-color:rgba(16,185,129,.3)">✅ Passed</span>`
          : unlocked
            ? hasQuiz
              ? `<span class="chip violet">Available</span>`
              : `<span class="chip">Add questions in Skills</span>`
            : `<span class="chip">🔒 Locked</span>`
        }
        <span class="text-xs text-muted ml-auto">${getSkillStatus(skill.id) === "mastered" ? "Mastered" : status}</span>
      </div>
    `;
    if (unlocked && hasQuiz) {
      card.addEventListener("click", () => startQuiz(skill));
    }
    grid.appendChild(card);
  });
}

// ── START QUIZ ──
function startQuiz(skill) {
  currentSkillId = skill.id;
  currentQIndex = 0;
  score = 0;
  answered = false;
  currentQuiz = [...getQuizForSkill(skill.id, getCareer().id)].sort(() => Math.random() - 0.5).slice(0, 5);
  if (currentQuiz.length === 0) return;

  document.getElementById("quizHub").style.display = "none";
  document.getElementById("quizResults").style.display = "none";
  document.getElementById("quizActive").style.display = "block";
  document.getElementById("quizActiveTitle").textContent = skill.name;
  document.getElementById("quizActiveCategory").textContent = `${skill.category} • ${currentQuiz.length} Question${currentQuiz.length === 1 ? "" : "s"}`;

  renderQuestion();
}

// ── RENDER QUESTION ──
function renderQuestion() {
  answered = false;
  const q = currentQuiz[currentQIndex];
  const total = currentQuiz.length;
  const pct = (currentQIndex / total) * 100;

  document.getElementById("quizProgressText").textContent = `Question ${currentQIndex + 1} of ${total}`;
  document.getElementById("quizProgressBar").style.width = pct + "%";
  document.getElementById("quizQuestion").textContent = q.q;
  document.getElementById("quizExplanation").style.display = "none";
  document.getElementById("quizNextWrap").style.display = "none";

  const optContainer = document.getElementById("quizOptions");
  optContainer.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = opt;
    btn.addEventListener("click", () => selectAnswer(i, q));
    optContainer.appendChild(btn);
  });
}

// ── SELECT ANSWER ──
function selectAnswer(chosen, q) {
  if (answered) return;
  answered = true;

  const opts = document.querySelectorAll(".quiz-option");
  opts.forEach((btn, i) => {
    if (i === q.correct) btn.classList.add("correct");
    else if (i === chosen && chosen !== q.correct) btn.classList.add("wrong");
    btn.disabled = true;
  });

  if (chosen === q.correct) score++;

  const expl = document.getElementById("quizExplanation");
  expl.textContent = `💡 ${q.explanation}`;
  expl.style.display = "block";

  const nextWrap = document.getElementById("quizNextWrap");
  nextWrap.style.display = "flex";
  document.getElementById("quizNextBtn").textContent =
    currentQIndex + 1 < currentQuiz.length ? "Next Question →" : "See Results →";
}

// ── NEXT ──
document.getElementById("quizNextBtn")?.addEventListener("click", () => {
  currentQIndex++;
  if (currentQIndex < currentQuiz.length) {
    renderQuestion();
  } else {
    showResults();
  }
});

// ── RESULTS ──
function showResults() {
  document.getElementById("quizActive").style.display = "none";
  document.getElementById("quizResults").style.display = "block";

  const pct = Math.round((score / currentQuiz.length) * 100);
  const passed = pct >= 60;

  document.getElementById("resultPct").textContent = pct + "%";
  document.getElementById("resultCorrectLabel").textContent = `${score}/${currentQuiz.length} correct`;
  document.getElementById("resultRing").className = `result-score-ring ${passed ? "pass" : "fail"}`;

  let grade, msg;
  if (pct === 100) { grade = "🏆 Perfect!"; msg = "Outstanding! You've demonstrated expert-level knowledge. Skill marked as mastered!"; }
  else if (pct >= 80) { grade = "🌟 Excellent!"; msg = "Great work! You have a strong grasp of this skill. Marked as mastered!"; }
  else if (pct >= 60) { grade = "✅ Passed!"; msg = "Good job! You've passed the quiz. Keep practising to strengthen your knowledge."; }
  else if (pct >= 40) { grade = "📚 Keep Going"; msg = "You're on the right track! Review the resources and try again."; }
  else { grade = "💪 Keep Practising"; msg = "This skill needs more work. Check the resources and try again when ready."; }

  document.getElementById("resultGrade").textContent = grade;
  document.getElementById("resultGrade").className = `result-grade ${passed ? "pass" : "fail"}`;
  document.getElementById("resultMsg").textContent = msg;

  // Update state
  if (state && state.skills[currentSkillId]) {
    state.skills[currentSkillId].quizPassed = passed;
    if (passed && state.skills[currentSkillId].status !== "mastered") {
      state.skills[currentSkillId].status = "mastered";
      state.skills[currentSkillId].confidence = Math.max(state.skills[currentSkillId].confidence, Math.round(pct / 10));
    }
    saveState(state);
  }

  if (passed) {
    launchConfetti();
    showToast("🎉 Quiz passed! Skill updated.", "success", "🏆");
  }

  // Re-render so retake reflects new state
  document.getElementById("btnRetakeQuiz").onclick = () => {
    const career = getCareer();
    const skill = career?.skills.find(s => s.id === currentSkillId);
    if (skill) startQuiz(skill);
  };
  document.getElementById("btnBackToHub").onclick = goBackToHub;
}

function goBackToHub() {
  document.getElementById("quizResults").style.display = "none";
  document.getElementById("quizActive").style.display = "none";
  document.getElementById("quizHub").style.display = "block";
  // Refresh hub to show updated pass status
  state = loadState();
  renderHub();
}

// ── BACK BUTTON ──
document.getElementById("quizBackBtn")?.addEventListener("click", () => {
  document.getElementById("quizActive").style.display = "none";
  document.getElementById("quizHub").style.display = "block";
});

// ── CONFETTI ──
function launchConfetti() {
  const colors = ["#7c3aed","#06b6d4","#f59e0b","#10b981","#f43f5e","#8b5cf6"];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.cssText = `
      left:${Math.random() * 100}vw;
      top:-20px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      width:${Math.random() * 10 + 5}px;
      height:${Math.random() * 10 + 5}px;
      border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
      animation-duration:${Math.random() * 2 + 1.5}s;
      animation-delay:${Math.random() * 0.8}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

// ── URL PARAM ──
function checkUrlParam() {
  const params = new URLSearchParams(window.location.search);
  const skillParam = params.get("skill");
  if (skillParam) {
    const career = getCareer();
    const skill = career?.skills.find(s => s.id === skillParam);
    if (skill && arePrereqsMet(skill) && getQuizForSkill(skill.id, career.id).length > 0) {
      startQuiz(skill);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateSidebarMeta();
  renderHub();
  checkUrlParam();
});
