import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations/auth";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to update your profile." }, { status: 401 });
  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid name and phone number." }, { status: 400 });
  try {
    const phone = parsed.data.phone.replace(/[\s()-]/g, "");
    const conflict = await prisma.user.findFirst({ where: { phone, NOT: { id: session.user.id } }, select: { id: true } });
    if (conflict) return NextResponse.json({ error: "That phone number is already linked to another account." }, { status: 409 });
    const user = await prisma.user.update({ where: { id: session.user.id }, data: { name: parsed.data.name, phone } });
    return NextResponse.json({ name: user.name, phone: user.phone });
  } catch {
    return NextResponse.json({ error: "Your profile could not be updated." }, { status: 503 });
  }
}
