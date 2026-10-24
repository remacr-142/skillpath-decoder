# SkillPath Decoder

SkillPath Decoder is a static multi-page learning roadmap app. Supabase Auth provides account registration, email/password login, password recovery, and persistent browser sessions. Profile names are stored in the Supabase `profiles` table; roadmap progress and custom career data remain in this browser's local storage.

## Requirements

- Node.js 20.19+ or 22.12+
- A Supabase project

## Supabase setup

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. In **Project Settings → API**, copy the **Project URL** and the **publishable key** (or legacy `anon` key). Never use a `service_role` or secret key in this frontend.
3. In the Supabase SQL Editor, run the complete contents of [`supabase/schema.sql`](./supabase/schema.sql). This creates the `profiles` table, owner-only row-level security policies, and a trigger that creates a profile from the signup name. Passwords are never written to this table; Supabase Auth stores and hashes them.
4. In **Authentication → URL Configuration**, set the local development URL as the Site URL (Vite defaults to `http://localhost:5173`). Add these Redirect URLs:
   - `http://localhost:5173/auth.html`
   - `http://localhost:5173/auth.html?mode=login`
   - `http://localhost:5173/auth.html?mode=reset`
   For deployment, also add your deployed origin and the same `auth.html` paths.
5. In **Authentication → Providers → Email**, choose whether email confirmation is enabled. With confirmation enabled, users must verify their address before signing in.

## Configure and run locally

From the project directory in PowerShell:

```powershell
npm install
Copy-Item .env.example .env.local
```

Edit `.env.local` and replace the placeholders:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-or-anon-key
```

These are public client settings, not secrets. Vite embeds `VITE_` values in the browser bundle; never put a service-role key or other secret in a `VITE_` variable. `.env.local` is ignored by Git. Restart Vite after changing environment values.

Start the development server:

```powershell
npm run dev
```

Open the URL Vite prints (normally `http://localhost:5173`). Do not open the HTML files directly with `file://`; environment variables, ES modules, and Supabase redirects require the Vite server.

## Build and preview

```powershell
npm run build
npm run preview
```

Deploy the generated `dist/` directory to a static host. Set the two `VITE_SUPABASE_*` variables in the host's build environment and add the deployed URL to Supabase's allowed redirect URLs.

## Authentication behavior

- Registration validates name, email, an eight-character minimum password, password confirmation, and terms acceptance before contacting Supabase.
- A database trigger creates the profile row using the Auth user ID. Row-level security allows authenticated users to read or update only their own profile.
- Sign-in and sign-out are handled by Supabase Auth. Its browser client persists sessions and refreshes tokens.
- Dashboard, roadmap, skills, resources, and quizzes redirect to sign-in if no valid authenticated user is available. Static route checks are a navigation guard, not a substitute for server-side authorization; protect any future user data with database RLS.
- Password recovery emails link back to the app to set a new password.

## Manual auth smoke test

After configuring a real Supabase project and applying the SQL:

1. Run the app with `npm run dev`, open `/auth.html`, and register with a test email, a valid name, matching password of at least eight characters, and accepted terms.
2. If email confirmation is on, confirm the email using the link and then sign in. If it is off, registration should sign in immediately.
3. Verify the user in **Authentication → Users** and verify the matching name and ID in **Table Editor → profiles**.
4. Reload a private page to verify the session persists. Log out and confirm private pages redirect back to sign-in.
5. Sign in with the test account, request a password reset, open the email link, and set a new password.

Live registration and login must be smoke-tested against the configured Supabase project; a local build alone does not verify the backend.
