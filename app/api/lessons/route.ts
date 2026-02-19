import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const includeCompleted = req.nextUrl.searchParams.get("review") === "true";

  let completedLessonIds: string[] = [];
  if (userId && !includeCompleted) {
    const { data: progressRows } = await supabase
      .from("progress")
      .select("lesson_id")
      .eq("user_id", userId);

    completedLessonIds = progressRows?.map((row) => row.lesson_id) ?? [];
  }

  let query = supabase.from("lessons").select("id, title, description, level, sort_order").order("level").order("sort_order");

  if (completedLessonIds.length > 0 && !includeCompleted) {
    query = query.not("id", "in", `(${completedLessonIds.join(",")})`);
  }

  const { data: lessons, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lessons });
}
