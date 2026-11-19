import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ productId: z.string().min(1).max(64) });

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ productIds: [] });
  try {
    const wishlist = await prisma.wishlist.findUnique({ where: { userId: session.user.id }, include: { items: { select: { productId: true } } } });
    return NextResponse.json({ productIds: wishlist?.items.map((item) => item.productId) ?? [] });
  } catch {
    return NextResponse.json({ error: "Your wishlist could not be loaded." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to save products to your wishlist." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid product." }, { status: 400 });
  try {
    const product = await prisma.product.findFirst({ where: { id: parsed.data.productId, status: "ACTIVE" }, select: { id: true } });
    if (!product) return NextResponse.json({ error: "That product is not available." }, { status: 404 });
    const wishlist = await prisma.wishlist.upsert({ where: { userId: session.user.id }, create: { userId: session.user.id }, update: {} });
    const existing = await prisma.wishlistItem.findUnique({ where: { wishlistId_productId: { wishlistId: wishlist.id, productId: product.id } } });
    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ saved: false });
    }
    await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId: product.id } });
    return NextResponse.json({ saved: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Your wishlist could not be updated." }, { status: 503 });
  }
}
