import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AuthorizationError, requireAdmin } from "@/lib/authz";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" } };

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  try {
    const user = await requireAdmin();
    const roles = user.adminRoles.map(({ role }) => role.name);
    const permissions = [...new Set(user.adminRoles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.key)))];
    return <AdminShell user={{ name: user.name, email: user.email, roles, permissions }}>{children}</AdminShell>;
  } catch (error) {
    if (error instanceof AuthorizationError) redirect("/admin/login");
    throw error;
  }
}
