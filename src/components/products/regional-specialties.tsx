"use client";

import { useEffect, useState } from "react";
import { ArrowDown, MapPin } from "lucide-react";

const divisions = [
  { name: "ঢাকা", english: "Dhaka", foods: ["কাচ্চি বিরিয়ানি", "বাকরখানি"] },
  { name: "চট্টগ্রাম", english: "Chattogram", foods: ["মেজবানি গরুর মাংস", "শুঁটকি"] },
  { name: "খুলনা", english: "Khulna", foods: ["চুইঝাল", "সুন্দরবনের মধু", "চিংড়ি"] },
  { name: "রাজশাহী", english: "Rajshahi", foods: ["আম", "লিচু", "কাঁচা আমের মুরগি"] },
  { name: "বরিশাল", english: "Barishal", foods: ["ইলিশ পাতুরি", "পেয়ারা"] },
  { name: "সিলেট", english: "Sylhet", foods: ["চা", "সাতকরা"] },
  { name: "রংপুর", english: "Rangpur", foods: ["হাড়িভাঙ্গা আম", "ভুনা খিচুড়ি"] },
  { name: "ময়মনসিংহ", english: "Mymensingh", foods: ["মুক্তাগাছার মণ্ডা", "দই-ঝাল বোয়াল"] },
];

export function RegionalSpecialties() {
  const [selected, setSelected] = useState<(typeof divisions)[number] | null>(null);

  useEffect(() => {
    if (!selected) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    document.getElementById("division-food-list")?.scrollIntoView({ behavior, block: "nearest" });
  }, [selected]);

  return <>
    <div className="regional-specialties-grid">
      {divisions.map((division, index) => {
        const active = selected?.english === division.english;
        return <button
          className={`regional-specialty-card regional-specialty-button${active ? " selected" : ""}`}
          type="button"
          key={division.english}
          aria-expanded={active}
          aria-controls="division-food-list"
          onClick={() => setSelected(active ? null : division)}
        >
          <span className="regional-specialty-index">০{index + 1}</span>
          <span className="regional-specialty-name"><strong>{division.name}</strong><small>{division.english}</small></span>
          <span className="regional-specialty-action">{active ? "তালিকা বন্ধ করুন" : "খাবারগুলো দেখুন"}<ArrowDown size={14} aria-hidden="true" /></span>
        </button>;
      })}
    </div>
    <section className="regional-food-panel" id="division-food-list" hidden={!selected} aria-live="polite" aria-labelledby="division-food-title">
      {selected && <><div className="regional-food-heading"><span className="regional-food-mark"><MapPin size={17} aria-hidden="true" /></span><div><span className="eyebrow">{selected.english} · আঞ্চলিক স্বাদ</span><h3 id="division-food-title">{selected.name} বিভাগের পরিচিত খাবার</h3></div></div>
      <ul className="regional-food-list">{selected.foods.map((food) => <li key={food}>{food}</li>)}</ul>
      <p>এগুলো {selected.name} বিভাগের পরিচিত কিছু খাবার ও পণ্যের উদাহরণ।</p></>}
    </section>
  </>;
}
