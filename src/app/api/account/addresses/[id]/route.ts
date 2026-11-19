import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to manage your addresses." }, { status: 401 });
  const { id } = await params;
  if (!id || id.length > 64) return NextResponse.json({ error: "Choose a valid address." }, { status: 400 });
  try {
    const result = await prisma.address.deleteMany({ where: { id, userId: session.user.id } });
    if (!result.count) return NextResponse.json({ error: "That address could not be found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Your address could not be removed." }, { status: 503 });
  }
}
