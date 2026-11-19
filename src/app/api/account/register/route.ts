import { NextResponse, type NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { registrationSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  const limit = rateLimit(`register:${requestIp(request)}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429 });
  const parsed = registrationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the form and enter valid account details.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  try {
    const email = parsed.data.email.toLowerCase();
    const phone = parsed.data.phone.replace(/[\s()-]/g, "");
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] }, select: { id: true } });
    if (existing) return NextResponse.json({ error: "An account with those details already exists." }, { status: 409 });
    const passwordHash = await hash(parsed.data.password, 12);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({ data: { name: parsed.data.name, email, phone, passwordHash } });
      await tx.cart.create({ data: { userId: created.id } });
      await tx.wishlist.create({ data: { userId: created.id } });
      return created;
    });
    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "We could not create your account. Please try again." }, { status: 503 });
  }
}
