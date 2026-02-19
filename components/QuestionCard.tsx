"use client";

type Answer = {
  id: string;
  answer_text: string;
};

type QuestionCardProps = {
  prompt: string;
  answers: Answer[];
  selectedAnswerId: string | null;
  onSelect: (answerId: string) => void;
};

export function QuestionCard({ prompt, answers, selectedAnswerId, onSelect }: QuestionCardProps) {
  return (
    <section className="card space-y-4">
      <h2 className="text-xl font-semibold">{prompt}</h2>
      <div className="space-y-2">
        {answers.map((answer) => (
          <button
            key={answer.id}
            className={`w-full rounded-xl border px-4 py-3 text-left transition ${
              selectedAnswerId === answer.id
                ? "border-emerald-400 bg-emerald-500/20"
                : "border-slate-700 bg-slate-950 hover:border-slate-500"
            }`}
            onClick={() => onSelect(answer.id)}
            type="button"
          >
            {answer.answer_text}
          </button>
        ))}
      </div>
    </section>
  );
}
