import Link from "next/link";
import { Plus, Video as VideoIcon } from "lucide-react";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { VideoPublishButton } from "@/components/admin/video-publish-button";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  await requireAdmin("content.manage");
  const videos = await prisma.video.findMany({ orderBy: [{ published: "desc" }, { featured: "desc" }, { displayOrder: "asc" }, { updatedAt: "desc" }], include: { category: true } });
  return <div className="admin-page"><div className="admin-page-heading"><div><span className="admin-eyebrow">কনটেন্ট / ভিডিও গল্প</span><h1>ভিডিও গল্প</h1><p>বাস্তব ভিডিও যোগ করুন; প্রকাশিত ভিডিও দোকানের খাদ্যগল্প ও হোমপেজে দেখাবে।</p></div><Link href="/admin/videos/new" className="admin-primary-button"><Plus size={14}/> ভিডিও যোগ করুন</Link></div><section className="admin-panel admin-list-panel"><div className="admin-list-toolbar"><span className="admin-result-count">মোট {videos.length.toLocaleString("bn-BD")}টি ভিডিও</span><span className="admin-result-count">প্রকাশিত {videos.filter((video) => video.published).length.toLocaleString("bn-BD")}টি</span></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>ভিডিও</th><th>বিভাগ</th><th>লিংক</th><th>স্ট্যাটাস</th><th>আপডেট</th><th></th></tr></thead><tbody>{videos.map((video) => <tr key={video.id}><td><div className="admin-product-name"><strong>{video.title}</strong><small>/{video.slug}{video.featured ? " · বিশেষ" : ""}</small></div></td><td>{video.category?.name || "—"}</td><td><a href={video.videoUrl} target="_blank" rel="noreferrer" className="admin-video-url">ভিডিও দেখুন ↗</a></td><td><span className={`admin-status ${video.published ? "admin-status-active" : "admin-status-draft"}`}>{video.published ? "প্রকাশিত" : "খসড়া"}</span></td><td>{new Intl.DateTimeFormat("bn-BD", { dateStyle: "medium" }).format(video.updatedAt)}</td><td><div className="admin-row-actions"><Link className="admin-secondary-button compact" href={`/admin/videos/${video.id}/edit`}>সম্পাদনা</Link><VideoPublishButton id={video.id} published={video.published}/></div></td></tr>)}{videos.length === 0 && <tr><td colSpan={6}><div className="admin-empty"><VideoIcon size={20}/><p>এখনো কোনো ভিডিও যোগ করা হয়নি।</p><Link href="/admin/videos/new">প্রথম ভিডিওটি যোগ করুন</Link></div></td></tr>}</tbody></table></div><p className="admin-form-help">ডেমো ভিডিওটি খসড়া অবস্থায় রাখা আছে। প্রকৃত ভিডিও ও অনুমোদিত thumbnail যোগ করে তবেই প্রকাশ করুন।</p></section></div>;
}
