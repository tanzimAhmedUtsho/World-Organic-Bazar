"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";

export function NewsletterForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(""); setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email") }) });
      if (!response.ok) throw new Error("ইমেইলটি যোগ করা যায়নি। আবার চেষ্টা করুন।");
      setMessage("ধন্যবাদ! নতুন খবর আপনার ইমেইলে পাঠানো হবে।"); formElement.reset();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "আবার চেষ্টা করুন।"); }
    finally { setPending(false); }
  }
  return <><form className="newsletter-form" onSubmit={subscribe}><label className="sr-only" htmlFor="newsletter-email">আপনার ইমেইল ঠিকানা</label><input id="newsletter-email" name="email" type="email" placeholder="আপনার ইমেইল ঠিকানা" required maxLength={254} /><button disabled={pending}>{pending ? "যোগ হচ্ছে…" : "খবর পেতে যুক্ত হোন"} {message ? <Check size={15} /> : <ArrowRight size={15} />}</button></form>{message && <p className="newsletter-message" role="status">{message}</p>}{error && <p className="newsletter-message error" role="alert">{error}</p>}</>;
}
