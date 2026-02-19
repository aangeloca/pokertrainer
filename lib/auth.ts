import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getUserIdFromRequest(req: NextRequest): string | null {
  const userId = req.headers.get("x-user-id");
  return userId || null;
}

export function levelFromXp(xp: number): number {
  return Math.floor(xp / 100) + 1;
}
