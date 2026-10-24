import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: [
        "index.html",
        "auth.html",
        "dashboard.html",
        "roadmap.html",
        "skills.html",
        "resources.html",
        "quiz.html",
      ],
    },
  },
});
