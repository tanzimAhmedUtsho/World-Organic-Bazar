"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Activity, BookOpen, Boxes, ChartNoAxesCombined, ChevronDown, ChevronLeft, FolderOpen, Gauge, Image as ImageIcon, LayoutDashboard, LogOut, Menu, Package, Settings, ShieldCheck, ShoppingBag, Tags, Truck, Users, Video, X } from "lucide-react";
import { getInitials } from "@/lib/utils";

type AdminUser = { name: string | null; email: string | null; roles: string[]; permissions: string[] };
const nav = [
  { label: "OVERVIEW", items: [{ href: "/admin", label: "Dashboard", permission: "dashboard.read", icon: LayoutDashboard }] },
  { label: "COMMERCE", items: [
    { href: "/admin/products", label: "Products", permission: "products.read", icon: Package },
    { href: "/admin/categories", label: "Categories", permission: "categories.read", icon: FolderOpen },
    { href: "/admin/orders", label: "Orders", permission: "orders.read", icon: ShoppingBag },
    { href: "/admin/inventory", label: "Inventory", permission: "inventory.read", icon: Boxes },
    { href: "/admin/customers", label: "Customers", permission: "customers.read", icon: Users },
  ] },
  { label: "STORIES & CONTENT", items: [
    { href: "/admin/videos", label: "Food stories", permission: "content.manage", icon: Video },
    { href: "/admin/blog", label: "Blog & recipes", permission: "content.manage", icon: BookOpen },
    { href: "/admin/homepage", label: "Homepage", permission: "homepage.manage", icon: ImageIcon },
    { href: "/admin/reviews", label: "Reviews", permission: "reviews.manage", icon: ShieldCheck },
  ] },
  { label: "MARKET TOOLS", items: [
    { href: "/admin/coupons", label: "Coupons", permission: "coupons.manage", icon: Tags },
    { href: "/admin/shipping", label: "Delivery", permission: "shipping.manage", icon: Truck },
    { href: "/admin/reports", label: "Reports", permission: "reports.read", icon: ChartNoAxesCombined },
    { href: "/admin/settings", label: "Settings", permission: "settings.manage", icon: Settings },
    { href: "/admin/users", label: "Admin users", permission: "users.manage", icon: Activity },
  ] },
];

export function AdminShell({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const visible = nav.map((group) => ({ ...group, items: group.items.filter((item) => user.roles.includes("SUPER_ADMIN") || user.permissions.includes(item.permission)) })).filter((group) => group.items.length);
  const activeLabel = nav.flatMap((group) => group.items).find((item) => item.href === pathname)?.label || "Dashboard";
  return <div className="admin-shell"><aside className={`admin-sidebar ${open ? "sidebar-open" : ""}`}><Link href="/admin" className="admin-brand"><BrandLogo variant="admin" /></Link><button className="admin-close-sidebar" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button><div className="admin-side-label">WORKSPACE</div><nav className="admin-nav">{visible.map((group) => <div className="admin-nav-group" key={group.label}><span className="admin-nav-heading">{group.label}</span>{group.items.map(({ href, label, icon: Icon }) => <Link className={pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)) ? "admin-nav-link active" : "admin-nav-link"} href={href} onClick={() => setOpen(false)} key={href}><Icon size={16} /><span>{label}</span>{pathname === href && <span className="nav-active-dot" />}</Link>)}</div>)}</nav><div className="admin-sidebar-bottom"><span className="admin-live-dot" /> MARKET MANAGEMENT</div></aside><button className={`admin-sidebar-backdrop ${open ? "visible" : ""}`} aria-label="Close menu" onClick={() => setOpen(false)} /><div className="admin-main"><header className="admin-topbar"><button className="admin-menu-toggle" aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></button><div className="admin-page-breadcrumb"><Gauge size={14} /><span>Admin</span><ChevronLeft size={12} className="crumb-chevron" /><strong>{activeLabel}</strong></div><div className="admin-topbar-actions"><Link href="/" target="_blank">View store <ChevronDown size={13} /></Link><div className="admin-user-chip"><span className="admin-user-avatar">{getInitials(user.name)}</span><span><strong>{user.name || "Administrator"}</strong><small>{user.roles.includes("SUPER_ADMIN") ? "Super Admin" : user.roles.map((role) => role.replaceAll("_", " ")).join(", ")}</small></span></div><button className="admin-sign-out" aria-label="Sign out" onClick={() => void signOut({ redirectTo: "/admin/login" })}><LogOut size={16} /></button></div></header><main className="admin-content">{children}</main></div></div>;
}
