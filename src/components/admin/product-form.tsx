"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { saveProduct } from "@/actions/admin-products";
import { productInputSchema } from "@/lib/validations/admin";
import { slugify } from "@/lib/utils";
import { z } from "zod";

type ProductValues = z.input<typeof productInputSchema>;
type CategoryOption = { id: string; nameEn: string; nameBn: string };
type InitialProduct = Omit<ProductValues, "variants" | "imageUrls"> & { imageUrls: string[]; variants: (ProductValues["variants"][number] & { id?: string })[] };

const emptyProduct: ProductValues = {
  nameEn: "", nameBn: "", slug: "", description: "", shortDescription: "", status: "DRAFT", featured: false, bestSeller: false,
  origin: "", seoTitle: "", seoDescription: "", categoryIds: [], imageUrls: [],
  variants: [{ sku: "", label: "500 g", weightGrams: 500, price: 1, compareAtPrice: undefined, stockQuantity: 0, lowStockThreshold: 5 }],
};

export function ProductForm({ categories, initial, productId }: { categories: CategoryOption[]; initial?: InitialProduct; productId?: string }) {
  const router = useRouter();
  const [images, setImages] = useState(initial?.imageUrls ?? []);
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const form = useForm<ProductValues>({ resolver: zodResolver(productInputSchema), defaultValues: initial ?? emptyProduct });
  const variants = useFieldArray({ control: form.control, name: "variants" });
  const currentName = form.watch("nameEn");

  async function submit(values: ProductValues) {
    setError(""); setMessage("");
    const result = await saveProduct({ ...values, imageUrls: images }, productId);
    if (!result.ok) { setError(result.message); return; }
    setMessage("Product saved.");
    router.push("/admin/products");
    router.refresh();
  }

  function addImage() {
    const url = imageUrl.trim();
    if (!url) return;
    setImages((current) => [...current, url]);
    setImageUrl("");
  }

  return <form className="admin-form" onSubmit={form.handleSubmit(submit)} noValidate>
    <div className="admin-form-heading"><Link href="/admin/products"><ArrowLeft size={15} /> Products</Link><div><button className="admin-secondary-button" type="button" onClick={() => router.push("/admin/products")}>Cancel</button><button className="admin-primary-button" type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving…" : "Save product"}</button></div></div>
    {(error || message) && <p className={error ? "admin-form-alert error" : "admin-form-alert success"} role={error ? "alert" : "status"}>{error || message}</p>}
    <div className="admin-product-form-grid"><div className="admin-form-main">
      <section className="admin-form-card"><div className="admin-form-card-title"><div><span className="admin-eyebrow">PRODUCT DETAILS</span><h2>Tell the market about it.</h2></div><label className="admin-inline-select"><span>Status</span><select {...form.register("status")}><option value="DRAFT">Draft</option><option value="ACTIVE">Published</option><option value="ARCHIVED">Archived</option></select></label></div><div className="admin-form-grid"><label className="admin-field"><span>Product name · English</span><input {...form.register("nameEn", { onChange: (event) => { if (!form.getFieldState("slug").isDirty) form.setValue("slug", slugify(event.target.value)); } })} placeholder="Date palm patali jaggery" />{form.formState.errors.nameEn && <small>{form.formState.errors.nameEn.message}</small>}</label><label className="admin-field"><span>Product name · বাংলা</span><input lang="bn" {...form.register("nameBn")} placeholder="খেজুরের পাটালি গুড়" />{form.formState.errors.nameBn && <small>{form.formState.errors.nameBn.message}</small>}</label><label className="admin-field field-span"><span>URL slug</span><input {...form.register("slug")} placeholder="date-palm-patali-gur" />{form.formState.errors.slug && <small>{form.formState.errors.slug.message}</small>}</label><label className="admin-field field-span"><span>Short description</span><input {...form.register("shortDescription")} maxLength={500} placeholder="A concise product introduction" /></label><label className="admin-field field-span"><span>Full description</span><textarea rows={5} {...form.register("description")} placeholder="Ingredients, preparation, storage, and verified product information…" />{form.formState.errors.description && <small>{form.formState.errors.description.message}</small>}</label><label className="admin-field field-span"><span>Origin <em>only use confirmed information</em></span><input {...form.register("origin")} placeholder="e.g. District or producer location" /></label></div></section>

      <section className="admin-form-card"><div className="admin-form-card-title"><div><span className="admin-eyebrow">PRODUCT VARIATIONS</span><h2>Weight, price, and stock.</h2></div><button type="button" className="admin-secondary-button" onClick={() => variants.append({ sku: `${slugify(currentName || "product").toUpperCase()}-${variants.fields.length + 1}`, label: "1 kg", weightGrams: 1000, price: 1, compareAtPrice: undefined, stockQuantity: 0, lowStockThreshold: 5 })}><Plus size={13} /> Add variation</button></div>{variants.fields.map((field, index) => <div className="variant-editor" key={field.id}><div className="variant-editor-heading"><strong>Variation {index + 1}</strong><button type="button" className="admin-icon-danger" aria-label={`Remove variation ${index + 1}`} disabled={variants.fields.length === 1} onClick={() => variants.remove(index)}><Trash2 size={14} /></button></div><div className="variant-field-grid"><label className="admin-field"><span>SKU</span><input {...form.register(`variants.${index}.sku`)} placeholder="SKU-500" />{form.formState.errors.variants?.[index]?.sku && <small>{form.formState.errors.variants[index]?.sku?.message}</small>}</label><label className="admin-field"><span>Weight / size label</span><input {...form.register(`variants.${index}.label`)} placeholder="500 g" /></label><label className="admin-field"><span>Weight in grams</span><input type="number" min="1" {...form.register(`variants.${index}.weightGrams`, { setValueAs: (value) => value === "" ? undefined : Number(value) })} /></label><label className="admin-field"><span>Price · BDT</span><input type="number" min="0.01" step="0.01" {...form.register(`variants.${index}.price`, { valueAsNumber: true })} />{form.formState.errors.variants?.[index]?.price && <small>{form.formState.errors.variants[index]?.price?.message}</small>}</label><label className="admin-field"><span>Previous price · optional</span><input type="number" min="0.01" step="0.01" {...form.register(`variants.${index}.compareAtPrice`, { setValueAs: (value) => value === "" ? undefined : Number(value) })} /></label><label className="admin-field"><span>Stock quantity</span><input type="number" min="0" {...form.register(`variants.${index}.stockQuantity`, { valueAsNumber: true })} /></label><label className="admin-field"><span>Low-stock alert</span><input type="number" min="0" {...form.register(`variants.${index}.lowStockThreshold`, { valueAsNumber: true })} /></label></div></div>)}</section>

      <section className="admin-form-card"><div className="admin-form-card-title"><div><span className="admin-eyebrow">PRODUCT IMAGES</span><h2>Show it at its best.</h2></div></div><div className="admin-image-add"><input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://… image URL" aria-label="Product image URL" /><button type="button" className="admin-secondary-button" onClick={addImage}><Plus size={13} /> Add image</button></div><p className="admin-form-help">Add secure image URLs. Cloudinary upload credentials are configured separately; local upload is not enabled yet.</p>{images.map((url, index) => <div className="admin-image-row" key={`${url}-${index}`}><span>{index === 0 ? "FEATURED" : `IMAGE ${index + 1}`}</span><a href={url} target="_blank" rel="noreferrer">{url}</a><button type="button" className="admin-icon-danger" aria-label="Remove image" onClick={() => setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))}><Trash2 size={14} /></button></div>)}{!images.length && <div className="admin-empty">Add at least one product image before saving.</div>}</section>
    </div><aside className="admin-form-aside"><section className="admin-form-card"><span className="admin-eyebrow">MARKET PLACEMENT</span><h2>Where does it belong?</h2><div className="admin-checkbox-list">{categories.map((category) => <label key={category.id}><input type="checkbox" value={category.id} {...form.register("categoryIds")} /><span>{category.nameEn}<small lang="bn">{category.nameBn}</small></span></label>)}</div>{form.formState.errors.categoryIds && <small>{form.formState.errors.categoryIds.message}</small>}</section><section className="admin-form-card"><span className="admin-eyebrow">HIGHLIGHTS</span><h2>Help it stand out.</h2><label className="admin-switch-row"><span><strong>Featured product</strong><small>Include in homepage selections.</small></span><input type="checkbox" {...form.register("featured")} /></label><label className="admin-switch-row"><span><strong>Best seller</strong><small>Mark as a top-selling item.</small></span><input type="checkbox" {...form.register("bestSeller")} /></label></section><section className="admin-form-card"><span className="admin-eyebrow">SEARCH PREVIEW</span><h2>SEO details.</h2><label className="admin-field"><span>SEO title</span><input {...form.register("seoTitle")} maxLength={180} /></label><label className="admin-field"><span>SEO description</span><textarea rows={4} {...form.register("seoDescription")} maxLength={320} /></label></section></aside></div>
    <div className="admin-form-bottom"><span>Prices and stock are rechecked by the server during checkout.</span><button className="admin-primary-button" type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving…" : "Save product"}</button></div>
  </form>;
}
