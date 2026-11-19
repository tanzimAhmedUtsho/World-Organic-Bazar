import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export function BrandFilm() {
  return (
    <section className="brand-film" aria-labelledby="brand-film-title">
      <div className="brand-film-copy">
        <span className="brand-film-eyebrow"><span /> WORLD অর্গানিক বাজার · আমাদের পরিচয়</span>
        <h2 id="brand-film-title">খাঁটি স্বাদ,<br /><em>শিকড়ের গল্প।</em></h2>
        <p>বাংলার মাটি, যত্নে বাছাই করা খাবার আর আমাদের বিশ্বাস—একটি ছোট্ট পরিচয়ে আপনাকে স্বাগতম।</p>
        <Link href="/our-story" className="brand-film-link">আমাদের গল্প জানুন <ArrowRight size={16} /></Link>
        <div className="brand-film-note"><span>দেখুন</span><span className="brand-film-note-rule" /><span>আমাদের গল্প, আমাদের স্বাদ</span></div>
      </div>

      <div className="brand-film-media">
        <div className="brand-film-frame">
          <video controls playsInline preload="metadata" aria-label="World অর্গানিক বাজারের পরিচিতিমূলক ভিডিও">
            <source src="/video/world-organic-bazar-9x16.mp4" type="video/mp4" />
            আপনার ব্রাউজার ভিডিওটি চালাতে পারছে না।
          </video>
          <span className="brand-film-play-mark" aria-hidden="true"><Play size={14} fill="currentColor" /></span>
        </div>
        <div className="brand-film-media-caption"><span>WORLD</span><span>অর্গানিক বাজার</span></div>
      </div>
    </section>
  );
}
