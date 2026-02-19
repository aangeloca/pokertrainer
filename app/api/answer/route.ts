import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest, levelFromXp } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const XP_PER_CORRECT_ANSWER = 20;

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { questionId, answerId } = await req.json();

  const { data: answer, error: answerError } = await supabase
    .from("answers")
    .select("id, question_id, is_correct")
    .eq("id", answerId)
    .eq("question_id", questionId)
    .single();

  if (answerError || !answer) {
    return NextResponse.json({ error: "Answer not found." }, { status: 404 });
  }

  const isCorrect = answer.is_correct;
  const xpGained = isCorrect ? XP_PER_CORRECT_ANSWER : 0;

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("xp, streak")
    .eq("id", userId)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const nextXp = user.xp + xpGained;
  const nextLevel = levelFromXp(nextXp);
  const nextStreak = isCorrect ? user.streak + 1 : 0;

  await supabase
    .from("users")
    .update({ xp: nextXp, level: nextLevel, streak: nextStreak })
    .eq("id", userId);

  return NextResponse.json({
    isCorrect,
    xpGained,
    user: {
      xp: nextXp,
      level: nextLevel,
      streak: nextStreak
    }
  });
}
