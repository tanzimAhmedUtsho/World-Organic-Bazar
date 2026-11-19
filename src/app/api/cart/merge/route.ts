import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { GUEST_CART_COOKIE } from "@/lib/cart";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in before merging the basket." }, { status: 401 });
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(GUEST_CART_COOKIE)?.value;
  if (!sessionId) return NextResponse.json({ merged: 0 });
  try {
    const merged = await prisma.$transaction(async (tx) => {
      const guest = await tx.cart.findUnique({ where: { sessionId }, include: { items: true } });
      if (!guest || !guest.items.length) return 0;
      const userCart = await tx.cart.upsert({ where: { userId: session.user.id }, create: { userId: session.user.id }, update: {} });
      let count = 0;
      for (const item of guest.items) {
        const variant = await tx.productVariant.findFirst({ where: { id: item.variantId, active: true, product: { status: "ACTIVE" } }, select: { stockQuantity: true } });
        if (!variant?.stockQuantity) continue;
        const current = await tx.cartItem.findUnique({ where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } } });
        const quantity = Math.min(variant.stockQuantity, (current?.quantity ?? 0) + item.quantity);
        await tx.cartItem.upsert({
          where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
          create: { cartId: userCart.id, variantId: item.variantId, quantity },
          update: { quantity },
        });
        count += 1;
      }
      await tx.cart.delete({ where: { id: guest.id } });
      return count;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    cookieStore.delete(GUEST_CART_COOKIE);
    return NextResponse.json({ merged });
  } catch {
    return NextResponse.json({ error: "Your guest basket could not be merged." }, { status: 503 });
  }
}
