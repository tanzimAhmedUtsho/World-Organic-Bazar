"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { videoInputSchema } from "@/lib/validations/admin";

export type VideoFormState = { error?: string };

export async function saveVideo(_state: VideoFormState, formData: FormData): Promise<VideoFormState> {
  const admin = await requireAdmin("content.manage");
  const videoId = String(formData.get("videoId") ?? "");
  const parsed = videoInputSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    videoUrl: formData.get("videoUrl"),
    thumbnailUrl: formData.get("thumbnailUrl") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    displayOrder: Number(formData.get("displayOrder") ?? 0),
  });
  if (!parsed.success) return { error: "তথ্যগুলো যাচাই করে আবার চেষ্টা করুন। ভিডিও লিংক অবশ্যই https হতে হবে।" };
  const data = { ...parsed.data, thumbnailUrl: parsed.data.thumbnailUrl || null, categoryId: parsed.data.categoryId || null };
  try {
    const saved = await prisma.$transaction(async (tx) => {
      const before = videoId ? await tx.video.findUnique({ where: { id: videoId } }) : null;
      if (videoId && !before) throw new Error("VIDEO_NOT_FOUND");
      const video = videoId
        ? await tx.video.update({ where: { id: videoId }, data })
        : await tx.video.create({ data });
      await tx.auditLog.create({ data: { actorId: admin.id, action: videoId ? "VIDEO_UPDATED" : "VIDEO_CREATED", entityType: "Video", entityId: video.id, before: before ? { title: before.title, published: before.published } : undefined, after: { title: video.title, published: video.published, slug: video.slug } } });
      return video;
    });
    revalidatePath("/");
    revalidatePath("/food-stories");
    revalidatePath(`/food-stories/${saved.slug}`);
    revalidatePath("/admin/videos");
  } catch (error) {
    if (error instanceof Error && error.message === "VIDEO_NOT_FOUND") return { error: "ভিডিওটি আর পাওয়া যাচ্ছে না।" };
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { error: "এই URL slug-টি আগে ব্যবহার করা হয়েছে।" };
    console.error("Video save failed", error);
    return { error: "ভিডিওটি সংরক্ষণ করা যায়নি।" };
  }
  redirect("/admin/videos");
}

export async function setVideoPublished(videoId: string, published: boolean) {
  const admin = await requireAdmin("content.manage");
  const before = await prisma.video.findUnique({ where: { id: videoId }, select: { id: true, title: true, published: true } });
  if (!before) return;
  await prisma.$transaction([
    prisma.video.update({ where: { id: videoId }, data: { published } }),
    prisma.auditLog.create({ data: { actorId: admin.id, action: published ? "VIDEO_PUBLISHED" : "VIDEO_UNPUBLISHED", entityType: "Video", entityId: videoId, before: { published: before.published }, after: { published } } }),
  ]);
  revalidatePath("/");
  revalidatePath("/food-stories");
  revalidatePath("/admin/videos");
}
