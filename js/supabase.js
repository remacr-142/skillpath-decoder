import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let rememberSession = true;
const authStorage = {
  getItem(key) {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  },
  setItem(key, value) {
    const targetStorage = rememberSession ? localStorage : sessionStorage;
    const otherStorage = rememberSession ? sessionStorage : localStorage;
    otherStorage.removeItem(key);
    targetStorage.setItem(key, value);
  },
  removeItem(key) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        storage: authStorage,
      },
    })
  : null;

export function setRememberSession(remember) {
  rememberSession = remember;
}

export function authPageUrl(parameters = {}) {
  const url = new URL("auth.html", window.location.href);
  Object.entries(parameters).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.href;
}
