"use client";

import { FormEvent, useState } from "react";

type AuthFormProps = {
  onAuthSuccess: (user: { id: string; email: string; xp: number; level: number; streak: number }) => void;
};

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Authentication failed.");
      return;
    }

    const user = payload.user;
    const token = payload.token ?? payload.user.id;
    localStorage.setItem("pt_token", token);
    onAuthSuccess(user);
  }

  return (
    <section className="card mx-auto max-w-md">
      <h1 className="mb-2 text-3xl font-black text-emerald-400">PokerTrainer</h1>
      <p className="mb-6 text-slate-300">Train poker fundamentals with bite-sized lessons.</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
          placeholder="••••••••"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950" type="submit">
          {mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>

      <button
        className="mt-4 text-sm text-slate-300 underline"
        onClick={() => setMode((current) => (current === "login" ? "signup" : "login"))}
        type="button"
      >
        {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
      </button>
    </section>
  );
}
