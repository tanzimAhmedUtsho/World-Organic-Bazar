"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function updateOrder(formData: FormData) {
  const admin = await requireAdmin("orders.manage");
  const orderId = String(formData.get("orderId") ?? "");
  const statusValue = String(formData.get("status") ?? "");
  const paymentValue = String(formData.get("paymentStatus") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);
  if (!orderId || !Object.values(OrderStatus).includes(statusValue as OrderStatus) || !Object.values(PaymentStatus).includes(paymentValue as PaymentStatus)) throw new Error("Invalid order update.");

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new Error("Order not found.");
    const status = statusValue as OrderStatus;
    const paymentStatus = paymentValue as PaymentStatus;
    if (order.status === "CANCELLED" && status !== "CANCELLED") throw new Error("Cancelled orders cannot be reopened from this screen.");
    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      for (const item of order.items) {
        if (!item.variantId) continue;
        await tx.productVariant.update({ where: { id: item.variantId }, data: { stockQuantity: { increment: item.quantity } } });
        await tx.inventoryTransaction.create({ data: { variantId: item.variantId, quantity: item.quantity, reason: "RETURN", note: `Restored from cancelled order ${order.orderNumber}`, reference: order.orderNumber, actorId: admin.id } });
      }
    }
    await tx.order.update({ where: { id: orderId }, data: { status, paymentStatus, internalNotes: note || order.internalNotes } });
    if (status !== order.status || note) await tx.orderStatusHistory.create({ data: { orderId, status, actorId: admin.id, note: note || (status !== order.status ? `Status changed from ${order.status} to ${status}.` : null) } });
    if (paymentStatus !== order.paymentStatus) {
      const payment = await tx.payment.findFirst({ where: { orderId }, orderBy: { createdAt: "desc" } });
      if (payment) await tx.payment.update({ where: { id: payment.id }, data: { status: paymentStatus, ...(paymentStatus === "PAID" ? { verifiedAt: new Date() } : {}) } });
    }
    await tx.auditLog.create({ data: { actorId: admin.id, action: "ORDER_UPDATED", entityType: "Order", entityId: orderId, before: { status: order.status, paymentStatus: order.paymentStatus }, after: { status, paymentStatus, note: note || null } } });
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/inventory");
}
