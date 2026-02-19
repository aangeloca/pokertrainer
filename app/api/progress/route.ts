import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const [userResult, progressResult] = await Promise.all([
    supabase.from("users").select("id, email, xp, level, streak").eq("id", userId).single(),
    supabase.from("progress").select("lesson_id, completed_at, score").eq("user_id", userId)
  ]);

  if (userResult.error || !userResult.data) {
    return NextResponse.json({ error: "Could not load user." }, { status: 500 });
  }

  if (progressResult.error) {
    return NextResponse.json({ error: progressResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    user: userResult.data,
    completedLessons: progressResult.data ?? []
  });
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { lessonId, score } = await req.json();
  if (!lessonId) {
    return NextResponse.json({ error: "lessonId is required." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("progress")
    .select("id")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ message: "Lesson already completed." });
  }

  const { error } = await supabase.from("progress").insert({
    user_id: userId,
    lesson_id: lessonId,
    score: score ?? 0
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Progress saved." }, { status: 201 });
}
