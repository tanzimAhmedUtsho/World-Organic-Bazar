"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRight } from "lucide-react";
import { loginSchema, registrationSchema } from "@/lib/validations/auth";

type LoginValues = { email: string; password: string };
type RegisterValues = { name: string; email: string; phone: string; password: string };

export function LoginForm({ callbackUrl = "/account" }: { callbackUrl?: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  async function submit(values: LoginValues) {
    setServerError("");
    const response = await signIn("credentials", { email: values.email, password: values.password, redirect: false, redirectTo: callbackUrl });
    if (response?.error) { setServerError("ইমেইল বা পাসওয়ার্ড সঠিক নয়।"); return; }
    await fetch("/api/cart/merge", { method: "POST" }).catch(() => undefined);
    router.push(callbackUrl); router.refresh();
  }
  return <form className="auth-form" onSubmit={form.handleSubmit(submit)} noValidate><label className="checkout-field"><span>ইমেইল ঠিকানা</span><input className="checkout-input" type="email" autoComplete="email" {...form.register("email")} />{form.formState.errors.email && <small>{form.formState.errors.email.message}</small>}</label><label className="checkout-field"><span>পাসওয়ার্ড</span><input className="checkout-input" type="password" autoComplete="current-password" {...form.register("password")} />{form.formState.errors.password && <small>{form.formState.errors.password.message}</small>}</label>{serverError && <p className="checkout-error" role="alert">{serverError}</p>}<button className="button button-green" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "প্রবেশ হচ্ছে…" : "প্রবেশ করুন"} <ArrowRight size={15} /></button><div className="auth-links"><Link href="/account/register">নতুন অ্যাকাউন্ট খুলুন</Link></div></form>;
}

export function RegistrationForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const form = useForm<RegisterValues>({ resolver: zodResolver(registrationSchema), defaultValues: { name: "", email: "", phone: "", password: "" } });
  async function submit(values: RegisterValues) {
    setServerError("");
    try {
      const response = await fetch("/api/account/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok) throw new Error("অ্যাকাউন্ট তৈরি করা যায়নি। তথ্যগুলো যাচাই করে আবার চেষ্টা করুন।");
      const signInResult = await signIn("credentials", { email: values.email, password: values.password, redirect: false });
      if (signInResult?.error) { router.push("/account/login?registered=1"); return; }
      await fetch("/api/cart/merge", { method: "POST" }).catch(() => undefined);
      router.push("/account"); router.refresh();
    } catch (cause) { setServerError(cause instanceof Error ? cause.message : "অ্যাকাউন্ট তৈরি করা যায়নি। আবার চেষ্টা করুন।"); }
  }
  return <form className="auth-form" onSubmit={form.handleSubmit(submit)} noValidate><label className="checkout-field"><span>আপনার নাম</span><input className="checkout-input" autoComplete="name" {...form.register("name")} />{form.formState.errors.name && <small>{form.formState.errors.name.message}</small>}</label><label className="checkout-field"><span>ইমেইল ঠিকানা</span><input className="checkout-input" type="email" autoComplete="email" {...form.register("email")} />{form.formState.errors.email && <small>{form.formState.errors.email.message}</small>}</label><label className="checkout-field"><span>মোবাইল নম্বর</span><input className="checkout-input" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" {...form.register("phone")} />{form.formState.errors.phone && <small>{form.formState.errors.phone.message}</small>}</label><label className="checkout-field"><span>পাসওয়ার্ড <em>১০ অক্ষর বা বেশি</em></span><input className="checkout-input" type="password" autoComplete="new-password" {...form.register("password")} />{form.formState.errors.password && <small>{form.formState.errors.password.message}</small>}</label>{serverError && <p className="checkout-error" role="alert">{serverError}</p>}<button className="button button-green" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "অ্যাকাউন্ট তৈরি হচ্ছে…" : "অ্যাকাউন্ট তৈরি করুন"} <ArrowRight size={15} /></button><div className="auth-links"><Link href="/account/login">আগে থেকে অ্যাকাউন্ট আছে? প্রবেশ করুন</Link></div></form>;
}
