"use client";

type ProgressHeaderProps = {
  xp: number;
  level: number;
  streak: number;
};

export function ProgressHeader({ xp, level, streak }: ProgressHeaderProps) {
  const xpForCurrentLevel = xp % 100;

  return (
    <section className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Your Progress</h2>
        <span className="rounded-full bg-pokerGreen px-3 py-1 text-sm font-semibold">🔥 {streak} streak</span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs uppercase text-slate-400">XP</p>
          <p className="text-2xl font-bold text-xpYellow">{xp}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-400">Level</p>
          <p className="text-2xl font-bold text-emerald-400">{level}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-400">Next Level</p>
          <p className="text-2xl font-bold">{100 - xpForCurrentLevel} XP</p>
        </div>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs text-slate-300">
          <span>Level {level}</span>
          <span>{xpForCurrentLevel}/100 XP</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-lime-300" style={{ width: `${xpForCurrentLevel}%` }} />
        </div>
      </div>
    </section>
  );
}
