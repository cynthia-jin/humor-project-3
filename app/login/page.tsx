"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        alert(error.message);
      }
    } catch {
      alert("Unexpected login error. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Login
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Continue with Google to manage humor prompt chains.
        </p>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="mt-6 w-full rounded bg-black px-4 py-2 text-white disabled:opacity-70"
        >
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>
      </div>
    </main>
  );
}

