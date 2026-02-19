import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const lessonId = params.id;

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, title, description, level, sort_order")
    .eq("id", lessonId)
    .single();

  if (lessonError || !lesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  const { data: questions, error: questionError } = await supabase
    .from("questions")
    .select("id, prompt, sort_order")
    .eq("lesson_id", lessonId)
    .order("sort_order");

  if (questionError) {
    return NextResponse.json({ error: questionError.message }, { status: 500 });
  }

  const questionIds = questions?.map((question) => question.id) ?? [];
  const { data: answers } = await supabase
    .from("answers")
    .select("id, question_id, answer_text")
    .in("question_id", questionIds);

  const questionsWithAnswers = (questions ?? []).map((question) => ({
    ...question,
    answers: (answers ?? []).filter((answer) => answer.question_id === question.id)
  }));

  return NextResponse.json({
    lesson,
    questions: questionsWithAnswers
  });
}
