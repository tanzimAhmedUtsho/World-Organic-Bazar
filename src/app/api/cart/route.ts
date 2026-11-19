import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { catalogInclude, mapStoreProduct } from "@/lib/products";
import { cartItemsInclude, getCurrentCart } from "@/lib/cart";
import { cartLineSchema } from "@/lib/validations/commerce";

function serializeLines(items: Array<{ id: string; quantity: number; variant: { id: string; label: string; sku: string; price: unknown; stockQuantity: number; product: Parameters<typeof mapStoreProduct>[0] } }>) {
  return items.map(({ id, quantity, variant }) => ({
    id,
    quantity,
    variant: { id: variant.id, label: variant.label, sku: variant.sku, price: Number(variant.price), stockQuantity: variant.stockQuantity },
    product: mapStoreProduct(variant.product),
  }));
}

export async function GET() {
  try {
    const cart = await getCurrentCart();
    const current = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: cartItemsInclude, orderBy: { createdAt: "asc" } } },
    });
    return NextResponse.json({ items: serializeLines(current?.items ?? []) });
  } catch {
    return NextResponse.json({ error: "Your basket could not be loaded. Please try again." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const parsed = cartLineSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid product quantity." }, { status: 400 });
  try {
    const cart = await getCurrentCart();
    const result = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findFirst({
        where: { id: parsed.data.variantId, active: true, product: { status: "ACTIVE" } },
        select: { id: true, stockQuantity: true },
      });
      if (!variant) throw new Error("PRODUCT_UNAVAILABLE");
      const current = await tx.cartItem.findUnique({ where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } } });
      const quantity = (current?.quantity ?? 0) + parsed.data.quantity;
      if (quantity > variant.stockQuantity) throw new Error("INSUFFICIENT_STOCK");
      return tx.cartItem.upsert({
        where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
        create: { cartId: cart.id, variantId: variant.id, quantity },
        update: { quantity },
      });
    });
    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message === "INSUFFICIENT_STOCK" ? "There is not enough stock for that quantity." : "That product is currently unavailable.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

export async function PATCH(request: NextRequest) {
  const parsed = cartLineSchema.extend({ itemId: cartLineSchema.shape.variantId }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid product quantity." }, { status: 400 });
  try {
    const cart = await getCurrentCart();
    const variant = await prisma.productVariant.findFirst({ where: { id: parsed.data.variantId, active: true, product: { status: "ACTIVE" } }, select: { stockQuantity: true } });
    if (!variant || parsed.data.quantity > variant.stockQuantity) return NextResponse.json({ error: "That quantity is not currently available." }, { status: 409 });
    const changed = await prisma.cartItem.updateMany({ where: { id: parsed.data.itemId, cartId: cart.id }, data: { quantity: parsed.data.quantity } });
    if (!changed.count) return NextResponse.json({ error: "That basket item could not be found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Your basket could not be updated." }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest) {
  const itemId = request.nextUrl.searchParams.get("itemId");
  if (!itemId || itemId.length > 64) return NextResponse.json({ error: "Choose a basket item." }, { status: 400 });
  try {
    const cart = await getCurrentCart();
    await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Your basket item could not be removed." }, { status: 503 });
  }
}
