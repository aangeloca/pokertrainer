import { NextResponse } from "next/server";
import { hashPassword, levelFromXp } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingUser) {
    return NextResponse.json({ error: "User already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const xp = 0;

  const { data, error } = await supabase
    .from("users")
    .insert({
      email,
      password_hash: passwordHash,
      xp,
      level: levelFromXp(xp),
      streak: 0
    })
    .select("id, email, xp, level, streak")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: data }, { status: 201 });
}
