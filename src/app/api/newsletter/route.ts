import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const subscriptionSchema = z.object({ email: z.string().trim().email().max(254) });

export async function POST(request: NextRequest) {
  const parsed = subscriptionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email.toLowerCase() },
      create: { email: parsed.data.email.toLowerCase() },
      update: { active: true },
    });
    return NextResponse.json({ message: "You are on the list. Thank you." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "We could not save your subscription. Please try again shortly." }, { status: 503 });
  }
}
