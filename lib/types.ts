export type User = {
  id: string;
  email: string;
  password_hash: string;
  xp: number;
  level: number;
  streak: number;
  created_at: string;
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  level: number;
  sort_order: number;
};

export type Question = {
  id: string;
  lesson_id: string;
  prompt: string;
  sort_order: number;
};

export type Answer = {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
};

export type Progress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
  score: number;
};
