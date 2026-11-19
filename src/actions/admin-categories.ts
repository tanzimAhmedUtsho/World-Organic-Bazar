"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { categoryInputSchema } from "@/lib/validations/admin";

type Result = { ok: true; id: string } | { ok: false; message: string };

export async function saveCategory(input: unknown, categoryId?: string): Promise<Result> {
  const admin = await requireAdmin("categories.manage");
  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Check the category details and try again." };
  const data = { ...parsed.data, imageUrl: parsed.data.imageUrl || null, description: parsed.data.description || null, seoTitle: parsed.data.seoTitle || null, seoDescription: parsed.data.seoDescription || null };
  try {
    const category = await prisma.$transaction(async (tx) => {
      const before = categoryId ? await tx.category.findUnique({ where: { id: categoryId } }) : null;
      if (categoryId && !before) throw new Error("CATEGORY_NOT_FOUND");
      const saved = categoryId
        ? await tx.category.update({ where: { id: categoryId }, data })
        : await tx.category.create({ data });
      await tx.auditLog.create({ data: { actorId: admin.id, action: categoryId ? "CATEGORY_UPDATED" : "CATEGORY_CREATED", entityType: "Category", entityId: saved.id, before: before ? { nameEn: before.nameEn, nameBn: before.nameBn, slug: before.slug, active: before.active } : undefined, after: { nameEn: saved.nameEn, nameBn: saved.nameBn, slug: saved.slug, active: saved.active } } });
      return saved;
    });
    revalidatePath("/"); revalidatePath("/shop"); revalidatePath("/category/[slug]"); revalidatePath("/admin/categories");
    return { ok: true, id: category.id };
  } catch (error) {
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") return { ok: false, message: "This category no longer exists." };
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { ok: false, message: "That category slug is already in use." };
    console.error("Category save failed", error);
    return { ok: false, message: "The category could not be saved." };
  }
}

export async function setCategoryActive(categoryId: string, active: boolean): Promise<Result> {
  const admin = await requireAdmin("categories.manage");
  try {
    const before = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true, active: true, nameEn: true } });
    if (!before) return { ok: false, message: "This category no longer exists." };
    const category = await prisma.category.update({ where: { id: categoryId }, data: { active } });
    await prisma.auditLog.create({ data: { actorId: admin.id, action: active ? "CATEGORY_ACTIVATED" : "CATEGORY_DEACTIVATED", entityType: "Category", entityId: category.id, before: { active: before.active }, after: { active } } });
    revalidatePath("/"); revalidatePath("/shop"); revalidatePath("/admin/categories");
    return { ok: true, id: category.id };
  } catch {
    return { ok: false, message: "The category status could not be changed." };
  }
}
