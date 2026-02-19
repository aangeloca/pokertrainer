create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  xp integer not null default 0,
  level integer not null default 1,
  streak integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  level integer not null,
  sort_order integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  prompt text not null,
  sort_order integer not null default 1
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  answer_text text not null,
  is_correct boolean not null default false
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  score integer not null default 0,
  completed_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create index if not exists idx_lessons_level_sort on public.lessons(level, sort_order);
create index if not exists idx_questions_lesson on public.questions(lesson_id, sort_order);
create index if not exists idx_answers_question on public.answers(question_id);
create index if not exists idx_progress_user on public.progress(user_id);
