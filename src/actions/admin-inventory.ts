"use server";

import { revalidatePath } from "next/cache";
import { InventoryReason } from "@prisma/client";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function adjustInventory(formData: FormData) {
  const admin = await requireAdmin("inventory.manage");
  const variantId = String(formData.get("variantId") ?? "");
  const target = Number(formData.get("stockQuantity"));
  const reason = String(formData.get("reason") ?? "ADJUSTMENT");
  const note = String(formData.get("note") ?? "").trim().slice(0, 300);
  if (!variantId || !Number.isInteger(target) || target < 0 || target > 1_000_000 || !Object.values(InventoryReason).includes(reason as InventoryReason)) throw new Error("Invalid inventory adjustment.");
  await prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({ where: { id: variantId }, include: { product: { select: { nameEn: true } } } });
    if (!variant) throw new Error("Product variation not found.");
    const delta = target - variant.stockQuantity;
    if (!delta) return;
    await tx.productVariant.update({ where: { id: variantId }, data: { stockQuantity: target } });
    await tx.inventoryTransaction.create({ data: { variantId, quantity: delta, reason: reason as InventoryReason, note: note || `Stock adjusted for ${variant.product.nameEn}`, actorId: admin.id } });
    await tx.auditLog.create({ data: { actorId: admin.id, action: "INVENTORY_ADJUSTED", entityType: "ProductVariant", entityId: variantId, before: { stockQuantity: variant.stockQuantity }, after: { stockQuantity: target, reason, note: note || null } } });
  });
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
}
