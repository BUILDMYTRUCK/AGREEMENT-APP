import { NextResponse } from "next/server";
import { startSession, verifyStaffPassword } from "@/lib/session";

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const password = body.password ?? "";
  if (!verifyStaffPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  await startSession();
  return NextResponse.json({ ok: true });
}
