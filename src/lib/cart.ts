import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { catalogInclude } from "@/lib/products";

export const GUEST_CART_COOKIE = "wob-cart-session";

export async function getCurrentCart() {
  const session = await auth();
  if (session?.user?.id) {
    return prisma.cart.upsert({ where: { userId: session.user.id }, create: { userId: session.user.id }, update: {} });
  }
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(GUEST_CART_COOKIE)?.value;
  if (!sessionId) {
    sessionId = randomUUID();
    cookieStore.set(GUEST_CART_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return prisma.cart.upsert({ where: { sessionId }, create: { sessionId }, update: {} });
}

export const cartItemsInclude = {
  variant: { include: { product: { include: catalogInclude } } },
} as const;
