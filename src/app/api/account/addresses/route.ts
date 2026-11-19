import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "@/lib/validations/address";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to view your addresses." }, { status: 401 });
  try {
    const addresses = await prisma.address.findMany({ where: { userId: session.user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
    return NextResponse.json({ addresses });
  } catch {
    return NextResponse.json({ error: "Your addresses could not be loaded." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to save an address." }, { status: 401 });
  const parsed = addressSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the address details and try again.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  try {
    const address = await prisma.$transaction(async (tx) => {
      if (parsed.data.isDefault) await tx.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
      return tx.address.create({ data: { ...parsed.data, userId: session.user.id } });
    });
    return NextResponse.json({ address }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Your address could not be saved." }, { status: 503 });
  }
}
