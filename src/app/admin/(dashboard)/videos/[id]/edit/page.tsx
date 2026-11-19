import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { VideoForm } from "@/components/admin/video-form";

export const dynamic = "force-dynamic";

export default async function EditAdminVideoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("content.manage");
  const { id } = await params;
  const [video, categories] = await Promise.all([
    prisma.video.findUnique({ where: { id } }),
    prisma.videoCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!video) notFound();
  return <div className="admin-page"><div className="admin-page-heading"><div><span className="admin-eyebrow">কনটেন্ট / ভিডিও গল্প</span><h1>ভিডিও সম্পাদনা</h1><p>{video.title}</p></div></div><VideoForm categories={categories} video={video}/></div>;
}
