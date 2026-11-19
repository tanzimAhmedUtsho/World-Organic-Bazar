import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestIp } from "@/lib/rate-limit";

const schema = z.object({
  orderNumber: z.string().trim().toUpperCase().regex(/^WOB-\d{8}-[A-F0-9]{6}$/),
  phone: z.string().trim().regex(/^\+?[0-9\s()-]{8,20}$/),
});
const digits = (value: string) => value.replace(/\D/g, "");

export async function POST(request: NextRequest) {
  const limit = rateLimit(`track:${requestIp(request)}`, 6, 15 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many tracking attempts. Please wait and try again." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid order number and phone number." }, { status: 400 });
  try {
    const order = await prisma.order.findUnique({ where: { orderNumber: parsed.data.orderNumber }, include: { statusHistory: { orderBy: { createdAt: "asc" } } } });
    if (!order || digits(order.customerPhone) !== digits(parsed.data.phone)) return NextResponse.json({ error: "We could not find an order with those details." }, { status: 404 });
    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      timeline: order.statusHistory.map(({ status, note, createdAt }) => ({ status, note, createdAt })),
    });
  } catch {
    return NextResponse.json({ error: "Order tracking is unavailable right now." }, { status: 503 });
  }
}
