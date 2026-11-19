import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getCurrentCart, cartItemsInclude } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validations/commerce";

function originAllowed(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || new URL(origin).host === request.headers.get("host");
}

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  const limit = rateLimit(`checkout:${requestIp(request)}`, 8, 15 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many checkout attempts. Please wait and try again." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the delivery details and try again.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });

  try {
    const session = await auth();
    const cart = await getCurrentCart();
    const shippingZone = await prisma.shippingZone.findFirst({ where: { district: { equals: parsed.data.district, mode: "insensitive" }, active: true } });
    if (!shippingZone) return NextResponse.json({ error: "Delivery is not set up for that district yet. Contact the market for help." }, { status: 422 });

    const orderNumber = `WOB-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`;
    const order = await prisma.$transaction(async (tx) => {
      const currentCart = await tx.cart.findUnique({ where: { id: cart.id }, include: { items: { include: cartItemsInclude } } });
      if (!currentCart?.items.length) throw new Error("CART_EMPTY");
      let subtotal = new Prisma.Decimal(0);
      const validatedItems = currentCart.items.map((item) => {
        if (!item.variant.active || item.variant.product.status !== "ACTIVE") throw new Error("PRODUCT_UNAVAILABLE");
        if (item.quantity > item.variant.stockQuantity) throw new Error("INSUFFICIENT_STOCK");
        const unitPrice = item.variant.price;
        const lineTotal = unitPrice.mul(item.quantity);
        subtotal = subtotal.plus(lineTotal);
        return { item, unitPrice, lineTotal };
      });

      let discountAmount = new Prisma.Decimal(0);
      let couponId: string | null = null;
      if (parsed.data.couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: parsed.data.couponCode.toUpperCase() } });
        const now = new Date();
        if (!coupon || !coupon.active || (coupon.expiresAt && coupon.expiresAt <= now) || (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit)) throw new Error("COUPON_INVALID");
        if (coupon.minimumOrderAmount && subtotal.lessThan(coupon.minimumOrderAmount)) throw new Error("COUPON_MINIMUM");
        discountAmount = coupon.discountType === "PERCENTAGE"
          ? subtotal.mul(coupon.value).div(100).toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN)
          : Prisma.Decimal.min(subtotal, coupon.value);
        if (coupon.maximumDiscount) discountAmount = Prisma.Decimal.min(discountAmount, coupon.maximumDiscount);
        couponId = coupon.id;
      }

      const fee = shippingZone.freeThreshold && subtotal.greaterThanOrEqualTo(shippingZone.freeThreshold)
        ? new Prisma.Decimal(0)
        : shippingZone.deliveryFee;
      const total = subtotal.minus(discountAmount).plus(fee);

      for (const { item } of validatedItems) {
        const changed = await tx.productVariant.updateMany({ where: { id: item.variantId, active: true, stockQuantity: { gte: item.quantity } }, data: { stockQuantity: { decrement: item.quantity } } });
        if (!changed.count) throw new Error("INSUFFICIENT_STOCK");
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id || null,
          customerName: parsed.data.customerName,
          customerPhone: parsed.data.customerPhone,
          customerEmail: parsed.data.customerEmail || null,
          district: shippingZone.district,
          upazila: parsed.data.upazila,
          addressLine: parsed.data.addressLine,
          deliveryInstructions: parsed.data.deliveryInstructions || null,
          subtotal,
          deliveryFee: fee,
          discountAmount,
          total,
          paymentMethod: "COD",
          paymentStatus: "UNPAID",
          status: "PENDING",
          couponId,
          items: { create: validatedItems.map(({ item, unitPrice, lineTotal }) => ({
            productId: item.variant.productId,
            variantId: item.variantId,
            productName: item.variant.product.nameEn,
            variantLabel: item.variant.label,
            sku: item.variant.sku,
            unitPrice,
            quantity: item.quantity,
            lineTotal,
          })) },
          statusHistory: { create: { status: "PENDING", note: "Order placed with Cash on Delivery." } },
          payments: { create: { provider: "COD", status: "UNPAID", amount: total, currency: "BDT" } },
        },
      });

      for (const { item } of validatedItems) {
        await tx.inventoryTransaction.create({ data: { variantId: item.variantId, quantity: -item.quantity, reason: "SALE", reference: created.orderNumber } });
      }
      if (couponId) {
        await tx.couponUsage.create({ data: { couponId, orderId: created.id, userId: session?.user?.id || null } });
        await tx.coupon.update({ where: { id: couponId }, data: { usageCount: { increment: 1 } } });
      }
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({ orderNumber: order.orderNumber, status: order.status }, { status: 201 });
  } catch (error) {
    const knownMessages: Record<string, string> = {
      CART_EMPTY: "Your basket is empty.",
      PRODUCT_UNAVAILABLE: "A product in your basket is no longer available.",
      INSUFFICIENT_STOCK: "Stock changed while you were checking out. Review your basket and try again.",
      COUPON_INVALID: "That coupon is invalid, expired, or has reached its usage limit.",
      COUPON_MINIMUM: "Your basket does not meet this coupon’s minimum order amount.",
    };
    if (error instanceof Error && knownMessages[error.message]) return NextResponse.json({ error: knownMessages[error.message] }, { status: 409 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return NextResponse.json({ error: "Stock or coupon availability changed. Please review your basket and try once more." }, { status: 409 });
    console.error("Checkout failed", error);
    return NextResponse.json({ error: "We could not place the order right now. Please try again shortly." }, { status: 503 });
  }
}
