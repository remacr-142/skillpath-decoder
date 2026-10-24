import { authPageUrl, setRememberSession, supabase, supabaseConfigured } from "./supabase.js";

const authForm = document.getElementById("authForm");
const authTabs = [...document.querySelectorAll("[data-auth-mode]")];
const authTabList = document.querySelector(".auth-tabs");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authMessage = document.getElementById("authMessage");
const submitButton = document.getElementById("submitButton");
const nameField = document.getElementById("nameField");
const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const password = document.getElementById("password");
const passwordLabel = document.querySelector('label[for="password"]');
const passwordHint = document.getElementById("passwordHint");
const confirmField = document.getElementById("confirmField");
const confirmPassword = document.getElementById("confirmPassword");
const termsField = document.getElementById("termsField");
const acceptTerms = document.getElementById("acceptTerms");
const loginOptions = document.getElementById("loginOptions");
let authMode = "login";

function setMessage(message, type = "info") {
  authMessage.textContent = message;
  authMessage.className = `auth-message auth-message--${type}`;
  authMessage.hidden = false;
}

function setAuthMode(mode) {
  authMode = mode;
  const registering = mode === "register";
  const resetting = mode === "reset";
  authTabs.forEach(tab => {
    const selected = tab.dataset.authMode === (registering ? "register" : "login");
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  authTabList.hidden = resetting;
  authTitle.textContent = registering
    ? "Create your account"
    : resetting ? "Choose a new password" : "Welcome back";
  authSubtitle.textContent = registering
    ? "Start building a career path that’s yours."
    : resetting
      ? "Enter a new password for your account."
      : "Sign in to pick up where you left off.";
  passwordLabel.textContent = resetting ? "New password" : "Password";
  submitButton.innerHTML = registering
    ? 'Create account <span aria-hidden="true">→</span>'
    : resetting
      ? 'Update password <span aria-hidden="true">→</span>'
      : 'Sign in <span aria-hidden="true">→</span>';

  nameField.hidden = !registering;
  fullName.disabled = !registering;
  fullName.required = registering;
  confirmField.hidden = !registering;
  confirmPassword.disabled = !registering;
  confirmPassword.required = registering;
  password.minLength = registering || resetting ? 8 : 0;
  password.autocomplete = registering || resetting ? "new-password" : "current-password";
  passwordHint.hidden = !(registering || resetting);
  passwordHint.textContent = "Use at least 8 characters.";
  termsField.hidden = !registering;
  acceptTerms.disabled = !registering;
  acceptTerms.required = registering;
  loginOptions.hidden = registering || resetting;
  authMessage.hidden = true;
  authForm.reset();
}

function safeReturnPath() {
  const allowedPages = new Set([
    "dashboard.html",
    "roadmap.html",
    "skills.html",
    "resources.html",
    "quiz.html",
  ]);
  const requested = new URLSearchParams(window.location.search).get("returnTo");
  if (!requested) return "dashboard.html";
  const target = new URL(requested, window.location.href);
  if (target.origin !== window.location.origin || !allowedPages.has(target.pathname.split("/").pop())) {
    return "dashboard.html";
  }
  return `${target.pathname}${target.search}${target.hash}`;
}

function setBusy(busy, label) {
  submitButton.disabled = busy;
  submitButton.textContent = busy ? label : "";
  if (!busy) {
    submitButton.innerHTML = authMode === "register"
      ? 'Create account <span aria-hidden="true">→</span>'
      : authMode === "reset"
        ? 'Update password <span aria-hidden="true">→</span>'
        : 'Sign in <span aria-hidden="true">→</span>';
  }
}

authTabs.forEach(tab => {
  tab.addEventListener("click", () => setAuthMode(tab.dataset.authMode));
  tab.addEventListener("keydown", event => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextMode = authMode === "login" ? "register" : "login";
    setAuthMode(nextMode);
    authTabs.find(item => item.dataset.authMode === nextMode).focus();
  });
});

document.querySelectorAll("[data-password-target]").forEach(button => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.passwordTarget);
    const showing = input.type === "password";
    input.type = showing ? "text" : "password";
    button.textContent = showing ? "Hide" : "Show";
    button.setAttribute("aria-label", `${showing ? "Hide" : "Show"} ${input.id === "confirmPassword" ? "confirm password" : "password"}`);
    button.setAttribute("aria-pressed", String(showing));
  });
});

confirmPassword.addEventListener("input", () => {
  confirmPassword.setCustomValidity(
    confirmPassword.value && confirmPassword.value !== password.value
      ? "Passwords do not match."
      : "",
  );
});
password.addEventListener("input", () => {
  confirmPassword.dispatchEvent(new Event("input"));
});

document.getElementById("forgotPassword").addEventListener("click", async () => {
  if (!supabaseConfigured || !supabase) {
    setMessage("Authentication is not configured. Follow the README setup instructions to connect Supabase.", "error");
    return;
  }
  if (!email.reportValidity()) return;
  const button = document.getElementById("forgotPassword");
  button.disabled = true;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value.trim(), {
      redirectTo: authPageUrl({ mode: "reset" }),
    });
    if (error) throw error;
    setMessage("If an account exists for this email, a password reset link has been sent.", "success");
  } catch (error) {
    setMessage(error.message || "Could not request a password reset. Please try again.", "error");
  } finally {
    button.disabled = false;
  }
});

authForm.addEventListener("submit", async event => {
  event.preventDefault();
  confirmPassword.setCustomValidity("");
  if (!authForm.reportValidity()) return;
  if (!supabaseConfigured || !supabase) {
    setMessage("Authentication is not configured. Follow the README setup instructions to connect Supabase.", "error");
    return;
  }

  const address = email.value.trim();
  const secret = password.value;
  setBusy(true, authMode === "register" ? "Creating account…" : authMode === "reset" ? "Updating password…" : "Signing in…");
  setMessage(authMode === "register" ? "Creating your account…" : authMode === "reset" ? "Updating your password…" : "Signing you in…");

  try {
    if (authMode === "register") {
      if (secret !== confirmPassword.value) {
        confirmPassword.setCustomValidity("Passwords do not match.");
        confirmPassword.reportValidity();
        return;
      }
      if (!acceptTerms.checked) {
        acceptTerms.reportValidity();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: address,
        password: secret,
        options: {
          data: { full_name: fullName.value.trim() },
          emailRedirectTo: authPageUrl({ mode: "login" }),
        },
      });
      if (error) throw error;
      if (data.session) {
        window.location.replace(safeReturnPath());
      } else {
        authForm.reset();
        setMessage("Your account was created. Check your email to confirm your address, then sign in.", "success");
      }
    } else if (authMode === "reset") {
      const { error } = await supabase.auth.updateUser({ password: secret });
      if (error) throw error;
      setAuthMode("login");
      setMessage("Your password was updated. Sign in with your new password.", "success");
    } else {
      setRememberSession(document.querySelector('input[name="remember"]').checked);
      const { error } = await supabase.auth.signInWithPassword({
        email: address,
        password: secret,
      });
      if (error) throw error;
      window.location.replace(safeReturnPath());
    }
  } catch (error) {
    setMessage(error.message || "Authentication failed. Please try again.", "error");
  } finally {
    setBusy(false);
  }
});

if (!supabaseConfigured) {
  setMessage("Supabase is not configured. Copy .env.example to .env.local, add your project URL and public key, then restart the dev server.", "error");
} else {
  const parameters = new URLSearchParams(window.location.search);
  const requestedMode = parameters.get("mode");
  const isPasswordRecovery = requestedMode === "reset";
  if (requestedMode === "register") setAuthMode("register");
  if (isPasswordRecovery) setAuthMode("reset");

  const reason = parameters.get("reason");
  if (reason === "config") {
    setMessage("Supabase is not configured. Add the required settings to .env.local and restart the dev server.", "error");
  } else if (reason === "session") {
    setMessage("We couldn’t verify your session. Please sign in again.", "error");
  }

  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      setMessage("We couldn’t check your session. Please try again.", "error");
    } else if (data.session && !isPasswordRecovery) {
      window.location.replace(safeReturnPath());
    }
  }).catch(error => {
    setMessage(error.message || "We couldn’t check your session. Please try again.", "error");
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      setAuthMode("reset");
      setMessage("Choose a new password for your account.", "info");
    } else if (event === "SIGNED_IN" && session && authMode !== "reset") {
      window.location.replace(safeReturnPath());
    }
  });
}
