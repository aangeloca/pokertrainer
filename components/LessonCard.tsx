import Link from "next/link";

type LessonCardProps = {
  id: string;
  title: string;
  description: string;
  level: number;
};

export function LessonCard({ id, title, description, level }: LessonCardProps) {
  return (
    <article className="card flex items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase text-emerald-400">Level {level}</p>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-slate-300">{description}</p>
      </div>
      <Link className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950" href={`/lessons/${id}`}>
        Start
      </Link>
    </article>
  );
}
