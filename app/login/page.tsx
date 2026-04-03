"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch {
      setError("Unexpected login error. Please try again.");
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

        {error && (
          <div className="mt-4 rounded border border-red-500 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="mt-6 w-full rounded bg-slate-900 px-4 py-2 text-white dark:bg-slate-100 dark:text-slate-900 disabled:opacity-70"
        >
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>
      </div>
    </main>
  );
}

