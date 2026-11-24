
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Step 1: Authenticate admin
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError || !data.user) {
        console.error("LOGIN ERROR:", loginError);

        setError(loginError?.message || "Login failed.");
        setLoading(false);
        return;
      }

      console.log("LOGIN USER ID:", data.user.id);
      console.log("LOGIN EMAIL:", data.user.email);

      // Step 2: Verify admin authorization
      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      console.log("ADMIN RECORD:", admin);
      console.log("ADMIN ERROR:", adminError);

      if (adminError) {
        console.error("ADMIN QUERY FAILED:", adminError);

        await supabase.auth.signOut();

        setError(
          `Admin verification failed: ${adminError.message}`
        );

        setLoading(false);
        return;
      }

      if (!admin) {
        console.error("USER IS NOT IN ADMIN TABLE");

        await supabase.auth.signOut();

        setError(
          "Your account is authenticated, but its admin authorization record was not found."
        );

        setLoading(false);
        return;
      }

      // Step 3: Admin verified
      console.log("ADMIN AUTHORIZATION SUCCESSFUL");

      router.replace("/admin");
    } catch (err) {
      console.error("UNEXPECTED LOGIN ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred."
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">

        {/* Branding */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-[0.2em]">
            VANTROX
          </h1>

          <p className="text-gray-500 text-xs tracking-[0.3em] mt-3">
            ADMINISTRATION PORTAL
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl">

          <div className="mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5">
              <LockKeyhole size={22} />
            </div>

            <h2 className="text-2xl font-bold">
              Welcome back
            </h2>

            <p className="text-gray-500 text-sm mt-2">
              Sign in to manage your store.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-sm text-gray-300 block mb-2">
                Email address
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />

                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-black border border-white/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-white/40 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-300 block mb-2">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-black border border-white/10 rounded-xl py-3.5 pl-12 pr-12 outline-none focus:border-white/40 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex gap-3 items-start text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-3 rounded-lg">
                <AlertCircle
                  size={18}
                  className="shrink-0 mt-0.5"
                />

                <p>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold rounded-xl py-4 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
            >
              {loading
                ? "Verifying account..."
                : "Sign in to Dashboard"}
            </button>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-8">
          VANTROX © 2026 · Authorized Access Only
        </p>

      </div>
    </main>
  );
}
