"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { loginSchema } from "@/lib/validations/auth";

type LoginValues = { email: string; password: string };

export function AdminLoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  async function submit(values: LoginValues) {
    setServerError("");
    const result = await signIn("credentials", { email: values.email, password: values.password, redirect: false });
    if (result?.error) { setServerError("Those sign-in details were not recognized."); return; }
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    const session = await response.json();
    if (!Array.isArray(session?.user?.roles) || session.user.roles.length === 0) {
      await signOut({ redirect: false });
      setServerError("This account does not have administrator access.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }
  return <form className="admin-login-form" onSubmit={form.handleSubmit(submit)} noValidate><label><span>Email address</span><input type="email" autoComplete="username" {...form.register("email")} />{form.formState.errors.email && <small>{form.formState.errors.email.message}</small>}</label><label><span>Password</span><input type="password" autoComplete="current-password" {...form.register("password")} />{form.formState.errors.password && <small>{form.formState.errors.password.message}</small>}</label>{serverError && <p role="alert">{serverError}</p>}<button disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Checking access…" : "Enter dashboard"} <ArrowRight size={15} /></button><span className="admin-login-secure"><LockKeyhole size={13} /> Protected administrator sign-in</span></form>;
}
