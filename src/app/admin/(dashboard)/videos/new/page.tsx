import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { VideoForm } from "@/components/admin/video-form";

export const dynamic = "force-dynamic";

export default async function NewAdminVideoPage() {
  await requireAdmin("content.manage");
  const categories = await prisma.videoCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return <div className="admin-page"><div className="admin-page-heading"><div><span className="admin-eyebrow">কনটেন্ট / ভিডিও গল্প</span><h1>নতুন ভিডিও</h1><p>ভিডিও URL যোগ করুন, যাচাই করে প্রকাশ করুন।</p></div></div><VideoForm categories={categories}/></div>;
}
