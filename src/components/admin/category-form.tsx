"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { z } from "zod";
import { saveCategory } from "@/actions/admin-categories";
import { categoryInputSchema } from "@/lib/validations/admin";
import { slugify } from "@/lib/utils";

type CategoryValues = z.input<typeof categoryInputSchema>;
type InitialCategory = z.infer<typeof categoryInputSchema>;

export function CategoryForm({ initial, categoryId }: { initial?: InitialCategory; categoryId?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<CategoryValues>({ resolver: zodResolver(categoryInputSchema), defaultValues: initial ?? { nameEn: "", nameBn: "", slug: "", description: "", imageUrl: "", displayOrder: 0, active: true, seoTitle: "", seoDescription: "" } });
  async function submit(values: CategoryValues) {
    setError("");
    const result = await saveCategory(values, categoryId);
    if (!result.ok) { setError(result.message); return; }
    router.push("/admin/categories");
    router.refresh();
  }
  return <form className="admin-form" onSubmit={form.handleSubmit(submit)} noValidate><div className="admin-form-heading"><Link href="/admin/categories"><ArrowLeft size={15} /> Categories</Link><div><button className="admin-secondary-button" type="button" onClick={() => router.push("/admin/categories")}>Cancel</button><button className="admin-primary-button" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving…" : "Save category"} <ArrowRight size={14} /></button></div></div>{error && <p className="admin-form-alert error" role="alert">{error}</p>}<div className="admin-product-form-grid"><div className="admin-form-main"><section className="admin-form-card"><span className="admin-eyebrow">CATEGORY DETAILS</span><h2>Give it a clear place in the Bazar.</h2><div className="admin-form-grid"><label className="admin-field"><span>Name · English</span><input {...form.register("nameEn", { onChange: (event) => { if (!form.getFieldState("slug").isDirty) form.setValue("slug", slugify(event.target.value)); } })} />{form.formState.errors.nameEn && <small>{form.formState.errors.nameEn.message}</small>}</label><label className="admin-field"><span>Name · বাংলা</span><input lang="bn" {...form.register("nameBn")} />{form.formState.errors.nameBn && <small>{form.formState.errors.nameBn.message}</small>}</label><label className="admin-field field-span"><span>Slug</span><input {...form.register("slug")} />{form.formState.errors.slug && <small>{form.formState.errors.slug.message}</small>}</label><label className="admin-field field-span"><span>Description</span><textarea rows={4} maxLength={1000} {...form.register("description")} /></label><label className="admin-field field-span"><span>Image URL</span><input type="url" {...form.register("imageUrl")} placeholder="https://…" /></label></div></section><section className="admin-form-card"><span className="admin-eyebrow">SEARCH & DISPLAY</span><div className="admin-form-grid"><label className="admin-field"><span>Display order</span><input type="number" min="0" {...form.register("displayOrder", { valueAsNumber: true })} /></label><label className="admin-field"><span>Status</span><select {...form.register("active", { setValueAs: (value) => value === "true" })}><option value="true">Active</option><option value="false">Inactive</option></select></label><label className="admin-field field-span"><span>SEO title</span><input {...form.register("seoTitle")} maxLength={180} /></label><label className="admin-field field-span"><span>SEO description</span><textarea rows={3} {...form.register("seoDescription")} maxLength={320} /></label></div></section></div><aside className="admin-form-aside"><section className="admin-form-card"><span className="admin-eyebrow">PREVIEW NOTES</span><h2>Product claims matter.</h2><p className="admin-form-help">Use accurate category descriptions and images. Confirm product origin, ingredients, and certification statements before publishing.</p></section></aside></div></form>;
}
