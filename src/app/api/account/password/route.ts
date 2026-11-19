import { NextResponse, type NextRequest } from "next/server";
import { compare, hash } from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { changePasswordSchema } from "@/lib/validations/auth";

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to change your password." }, { status: 401 });
  const limit = rateLimit(`password:${session.user.id}:${requestIp(request)}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many password attempts. Please try again later." }, { status: 429 });
  const parsed = changePasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter your current password and a new password of at least 10 characters." }, { status: 400 });
  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true } });
    if (!user?.passwordHash || !(await compare(parsed.data.currentPassword, user.passwordHash))) return NextResponse.json({ error: "Your current password does not match." }, { status: 400 });
    await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: await hash(parsed.data.newPassword, 12) } });
    return NextResponse.json({ message: "Your password has been updated." });
  } catch {
    return NextResponse.json({ error: "Your password could not be updated." }, { status: 503 });
  }
}
