"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { saveVideo, type VideoFormState } from "@/actions/admin-videos";

type InitialVideo = { id: string; title: string; slug: string; description: string; videoUrl: string; thumbnailUrl: string | null; featured: boolean; published: boolean; displayOrder: number; categoryId: string | null };
type Category = { id: string; name: string };

export function VideoForm({ categories, video }: { categories: Category[]; video?: InitialVideo }) {
  const [state, action, pending] = useActionState<VideoFormState, FormData>(saveVideo, {});
  return <form action={action} className="admin-form admin-video-form">
    {video && <input type="hidden" name="videoId" value={video.id} />}
    <div className="admin-form-heading"><Link href="/admin/videos"><ArrowLeft size={15}/> ভিডিও তালিকায় ফিরুন</Link><div><Link className="admin-secondary-button" href="/admin/videos">বাতিল</Link><button className="admin-primary-button" disabled={pending}>{pending ? "সংরক্ষণ হচ্ছে…" : "ভিডিও সংরক্ষণ করুন"}<ArrowRight size={14}/></button></div></div>
    {state.error && <p className="admin-form-alert error" role="alert">{state.error}</p>}
    <section className="admin-form-card"><span className="admin-eyebrow">ভিডিওর তথ্য</span><h2>একটি বাস্তব খাবারের গল্প যোগ করুন।</h2><div className="admin-form-grid">
      <label className="admin-field"><span>ভিডিওর শিরোনাম</span><input name="title" required minLength={3} maxLength={180} defaultValue={video?.title} /></label>
      <label className="admin-field"><span>URL slug (ইংরেজি অক্ষর ও হাইফেন)</span><input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={video?.slug} placeholder="producer-story" /></label>
      <label className="admin-field admin-field-full"><span>বর্ণনা</span><textarea name="description" rows={4} required minLength={10} maxLength={5000} defaultValue={video?.description} /></label>
      <label className="admin-field admin-field-full"><span>YouTube, Vimeo অথবা HTTPS MP4 লিংক</span><input type="url" name="videoUrl" required defaultValue={video?.videoUrl} placeholder="https://www.youtube.com/watch?v=..." /></label>
      <label className="admin-field admin-field-full"><span>Thumbnail image URL (ঐচ্ছিক)</span><input type="url" name="thumbnailUrl" defaultValue={video?.thumbnailUrl ?? ""} placeholder="https://..." /></label>
      <label className="admin-field"><span>বিভাগ</span><select name="categoryId" defaultValue={video?.categoryId ?? ""}><option value="">বিভাগ ছাড়া</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label className="admin-field"><span>প্রদর্শনের ক্রম</span><input type="number" name="displayOrder" min={0} max={10000} defaultValue={video?.displayOrder ?? 0} /></label>
    </div></section>
    <section className="admin-form-card"><span className="admin-eyebrow">প্রকাশনার সেটিংস</span><label className="admin-switch-row"><span><strong>বিশেষভাবে দেখান</strong><small>হোমপেজে অন্য ভিডিওর আগে দেখান।</small></span><input type="checkbox" name="featured" defaultChecked={video?.featured} /></label><label className="admin-switch-row"><span><strong>প্রকাশ করুন</strong><small>প্রকাশিত ভিডিও হোমপেজ ও খাদ্যগল্প পাতায় দেখা যাবে।</small></span><input type="checkbox" name="published" defaultChecked={video?.published} /></label></section>
    <p className="admin-form-help">শুধু আপনার প্রকাশের অনুমতি আছে এমন ভিডিও ও image URL ব্যবহার করুন। ডেমো video স্বয়ংক্রিয়ভাবে প্রকাশ করা হয় না।</p>
  </form>;
}
