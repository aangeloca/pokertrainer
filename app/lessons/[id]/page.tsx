"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { QuestionCard } from "@/components/QuestionCard";

type Question = {
  id: string;
  prompt: string;
  answers: Array<{ id: string; answer_text: string }>;
};

export default function LessonPage() {
  const params = useParams<{ id: string }>();
  const lessonId = params.id;
  const [title, setTitle] = useState("Lesson");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("pt_token") : null), []);

  useEffect(() => {
    fetch(`/api/lessons/${lessonId}`)
      .then((response) => response.json())
      .then((payload) => {
        setTitle(payload.lesson.title);
        setQuestions(payload.questions ?? []);
      });
  }, [lessonId]);

  const question = questions[index];

  async function submitAnswer() {
    if (!question || !selectedAnswerId || !token) return;

    const response = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": token
      },
      body: JSON.stringify({ questionId: question.id, answerId: selectedAnswerId })
    });

    const payload = await response.json();
    const isCorrect = Boolean(payload.isCorrect);

    if (isCorrect) {
      setCorrectCount((current) => current + 1);
      setFeedback(`Correct! +${payload.xpGained} XP`);
    } else {
      setFeedback("Not quite. Keep training!");
    }

    setTimeout(async () => {
      setSelectedAnswerId(null);
      setFeedback(null);

      if (index + 1 >= questions.length) {
        const score = Math.round(((correctCount + Number(isCorrect)) / questions.length) * 100);
        await fetch("/api/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": token
          },
          body: JSON.stringify({ lessonId, score })
        });

        setFinished(true);
      } else {
        setIndex((current) => current + 1);
      }
    }, 800);
  }

  if (!question && !finished) {
    return <main className="mx-auto max-w-3xl p-6">Loading lesson...</main>;
  }

  if (finished) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-6">
        <section className="card space-y-3 text-center">
          <h1 className="text-3xl font-black text-emerald-400">Lesson Complete!</h1>
          <p>
            You got <span className="font-semibold">{correctCount}</span> / {questions.length} questions right.
          </p>
          <Link className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950" href="/">
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <header className="card">
        <p className="text-xs uppercase tracking-widest text-emerald-400">{title}</p>
        <h1 className="text-2xl font-bold">
          Question {index + 1} / {questions.length}
        </h1>
      </header>

      <QuestionCard
        answers={question.answers}
        onSelect={setSelectedAnswerId}
        prompt={question.prompt}
        selectedAnswerId={selectedAnswerId}
      />

      {feedback ? <p className="text-sm text-emerald-300">{feedback}</p> : null}

      <button
        className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50"
        disabled={!selectedAnswerId}
        onClick={submitAnswer}
        type="button"
      >
        Confirm answer
      </button>
    </main>
  );
}
