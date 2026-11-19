"use client";

export default function StoreError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="store-error"><span className="eyebrow">THE MARKET IS TAKING A MOMENT</span><h1>We’ll be right<br /><em>back.</em></h1><p>The market could not load right now. Please try again in a moment.</p><button className="button button-green" onClick={() => reset()}>Try again</button></main>;
}
