import { authPageUrl, supabase, supabaseConfigured } from "./supabase.js";

const privatePages = new Set([
  "dashboard.html",
  "roadmap.html",
  "skills.html",
  "resources.html",
  "quiz.html",
]);

function redirectToLogin(reason) {
  const returnTo = `${window.location.pathname.split("/").pop()}${window.location.search}${window.location.hash}`;
  window.location.replace(authPageUrl({ reason, returnTo }));
}

if (!supabaseConfigured || !supabase) {
  redirectToLogin("config");
} else {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      redirectToLogin(error ? "session" : "login");
    } else {
      const currentPage = window.location.pathname.split("/").pop();
      if (!privatePages.has(currentPage)) {
        window.location.replace(authPageUrl());
      } else {
        const topBarRight = document.querySelector(".top-bar-right");
        if (topBarRight) {
          const accountActions = document.createElement("div");
          accountActions.className = "auth-account-actions";

          const email = document.createElement("span");
          email.className = "auth-account-email";
          email.textContent = data.user.email || "Account";
          email.title = data.user.email || "Account";

          const logoutButton = document.createElement("button");
          logoutButton.className = "btn btn-ghost btn-sm";
          logoutButton.type = "button";
          logoutButton.textContent = "Log out";
          logoutButton.addEventListener("click", async () => {
            logoutButton.disabled = true;
            logoutButton.textContent = "Logging out…";
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) {
              logoutButton.disabled = false;
              logoutButton.textContent = "Log out";
              window.alert(`Unable to log out: ${signOutError.message}`);
              return;
            }
            window.location.replace(authPageUrl());
          });

          accountActions.append(email, logoutButton);
          topBarRight.append(accountActions);
        }

        supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_OUT" || !session) {
            redirectToLogin("login");
          }
        });
        document.body.classList.remove("auth-pending");
      }
    }
  } catch {
    redirectToLogin("session");
  }
}
