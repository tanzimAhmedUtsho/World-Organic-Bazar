"use client";

import { useState, type FormEvent } from "react";
import { signOut } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRight, Trash2 } from "lucide-react";
import { z } from "zod";
import { profileSchema, changePasswordSchema } from "@/lib/validations/auth";
import { addressSchema } from "@/lib/validations/address";

type ProfileValues = { name: string; phone: string };
type PasswordValues = { currentPassword: string; newPassword: string };
type AddressValues = z.infer<typeof addressSchema>;
type AddressInput = z.input<typeof addressSchema>;
type Address = AddressValues & { id: string; createdAt: string };

export function ProfileEditor({ name, phone }: ProfileValues) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const form = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { name, phone } });
  async function submit(values: ProfileValues) {
    setError(""); setMessage("");
    const response = await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const result = await response.json();
    if (!response.ok) { setError(result.error || "Could not update your profile."); return; }
    setMessage("Your profile is up to date.");
  }
  return <form className="account-form" onSubmit={form.handleSubmit(submit)}><label className="checkout-field"><span>Name</span><input className="checkout-input" autoComplete="name" {...form.register("name")} />{form.formState.errors.name && <small>{form.formState.errors.name.message}</small>}</label><label className="checkout-field"><span>Phone number</span><input className="checkout-input" autoComplete="tel" {...form.register("phone")} />{form.formState.errors.phone && <small>{form.formState.errors.phone.message}</small>}</label>{error && <p className="checkout-error" role="alert">{error}</p>}{message && <p className="checkout-success" role="status">{message}</p>}<button className="button button-green" disabled={form.formState.isSubmitting}>Save profile <ArrowRight size={15} /></button></form>;
}

export function PasswordEditor() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const form = useForm<PasswordValues>({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: "", newPassword: "" } });
  async function submit(values: PasswordValues) {
    setError(""); setMessage("");
    const response = await fetch("/api/account/password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const result = await response.json();
    if (!response.ok) { setError(result.error || "Could not update password."); return; }
    setMessage(result.message);
    form.reset();
  }
  return <form className="account-form" onSubmit={form.handleSubmit(submit)}><label className="checkout-field"><span>Current password</span><input className="checkout-input" type="password" autoComplete="current-password" {...form.register("currentPassword")} /></label><label className="checkout-field"><span>New password</span><input className="checkout-input" type="password" autoComplete="new-password" {...form.register("newPassword")} /></label>{error && <p className="checkout-error" role="alert">{error}</p>}{message && <p className="checkout-success" role="status">{message}</p>}<button className="button button-green" disabled={form.formState.isSubmitting}>Update password <ArrowRight size={15} /></button></form>;
}

export function AddressBook({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const form = useForm<AddressInput, unknown, AddressValues>({ resolver: zodResolver(addressSchema), defaultValues: { label: "", recipient: "", phone: "", district: "", upazila: "", addressLine: "", instructions: "", isDefault: addresses.length === 0 } });
  async function submit(values: AddressValues) {
    setPending(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/account/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save address.");
      const reload = await fetch("/api/account/addresses", { cache: "no-store" });
      const body = await reload.json();
      setAddresses(body.addresses as Address[]);
      setMessage("Delivery address saved.");
      form.reset({ label: "", recipient: "", phone: "", district: "", upazila: "", addressLine: "", instructions: "", isDefault: false });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save address."); }
    finally { setPending(false); }
  }
  async function remove(id: string) {
    setError("");
    const response = await fetch(`/api/account/addresses/${encodeURIComponent(id)}`, { method: "DELETE" });
    const body = await response.json();
    if (!response.ok) { setError(body.error || "Could not remove address."); return; }
    setAddresses((current) => current.filter((address) => address.id !== id));
  }
  return <div className="address-book"><div className="address-list">{addresses.map((address) => <article className="address-card" key={address.id}><div><strong>{address.label || "Delivery address"}</strong>{address.isDefault && <span className="default-tag">DEFAULT</span>}</div><p>{address.recipient} · {address.phone}<br />{address.addressLine}<br />{address.upazila}, {address.district}</p><button className="remove-item" onClick={() => void remove(address.id)}><Trash2 size={13} /> Remove</button></article>)}</div><form className="account-form address-form" onSubmit={form.handleSubmit(submit)}><h3>Add an address</h3><div className="checkout-field-grid"><label className="checkout-field"><span>Label</span><input className="checkout-input" placeholder="Home, work…" {...form.register("label")} /></label><label className="checkout-field"><span>Recipient</span><input className="checkout-input" {...form.register("recipient")} /></label><label className="checkout-field"><span>Phone</span><input className="checkout-input" {...form.register("phone")} /></label><label className="checkout-field"><span>District</span><input className="checkout-input" {...form.register("district")} /></label><label className="checkout-field"><span>Upazila / area</span><input className="checkout-input" {...form.register("upazila")} /></label><label className="checkout-field field-full"><span>Full address</span><textarea className="checkout-input" rows={3} {...form.register("addressLine")} /></label><label className="checkout-field field-full"><span>Delivery instructions</span><input className="checkout-input" {...form.register("instructions")} /></label><label className="default-checkbox"><input type="checkbox" {...form.register("isDefault")} /> Save as default address</label></div>{error && <p className="checkout-error" role="alert">{error}</p>}{message && <p className="checkout-success" role="status">{message}</p>}<button className="button button-green" disabled={pending}>{pending ? "Saving…" : "Save address"} <ArrowRight size={15} /></button></form></div>;
}

export function SignOutButton() {
  return <button className="sign-out-button" onClick={() => void signOut({ redirectTo: "/" })}>Sign out</button>;
}
