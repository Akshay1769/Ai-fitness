// /lib/auth.ts
import { supabase } from "./supabaseClient";

function usernameToEmail(username: string) {
  return `${username}@local.dev`; // Fake email for Supabase
}

export async function signup(username: string, password: string) {
  const email = usernameToEmail(username);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (error) throw error;
  return data;
}

export async function login(username: string, password: string) {
  const email = usernameToEmail(username);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function logout() {
  await supabase.auth.signOut();
}
