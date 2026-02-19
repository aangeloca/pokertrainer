"use client";

import { useEffect, useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { LessonCard } from "@/components/LessonCard";
import { ProgressHeader } from "@/components/ProgressHeader";

type User = {
  id: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
};

type Lesson = {
  id: string;
  title: string;
  description: string;
  level: number;
};

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("pt_token");
    if (!token) {
      return;
    }

    fetch("/api/progress", { headers: { "x-user-id": token } })
      .then((response) => response.json())
      .then((payload) => {
        if (payload.user) {
          setUser(payload.user);
        }
      });
  }, []);

  useEffect(() => {
    if (!user) return;

    const params = new URLSearchParams({ userId: user.id, review: String(reviewMode) });
    fetch(`/api/lessons?${params.toString()}`)
      .then((response) => response.json())
      .then((payload) => setLessons(payload.lessons ?? []));
  }, [user, reviewMode]);

  if (!user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-10">
        <AuthForm onAuthSuccess={setUser} />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 px-4 py-10">
      <ProgressHeader xp={user.xp} level={user.level} streak={user.streak} />

      <section className="card flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Lessons</h2>
          <p className="text-sm text-slate-300">{reviewMode ? "Review completed lessons enabled." : "Only unfinished lessons are shown."}</p>
        </div>
        <button
          className="rounded-xl border border-slate-600 px-4 py-2 text-sm"
          onClick={() => setReviewMode((current) => !current)}
          type="button"
        >
          {reviewMode ? "Hide reviewed" : "Review mode"}
        </button>
      </section>

      <section className="space-y-4">
        {lessons.length === 0 ? (
          <p className="card text-slate-300">No lessons available. Toggle review mode to revisit completed lessons.</p>
        ) : (
          lessons.map((lesson) => <LessonCard key={lesson.id} {...lesson} />)
        )}
      </section>
    </main>
  );
}
