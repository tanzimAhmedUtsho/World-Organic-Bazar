import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export class AuthorizationError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new AuthorizationError("Please sign in to continue.");
  const user = await prisma.user.findUnique({ where: { id: session.user.id, active: true } });
  if (!user) throw new AuthorizationError("Your account is unavailable.");
  return user;
}

export async function requireAdmin(permission?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new AuthorizationError("Please sign in to access the dashboard.");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id, active: true },
    include: { adminRoles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
  });
  if (!user || user.adminRoles.length === 0) throw new AuthorizationError("Administrator access is required.");
  const roles = user.adminRoles.map(({ role }) => role);
  if (roles.some((role) => role.name === "SUPER_ADMIN")) return user;
  if (permission && !roles.some((role) => role.permissions.some(({ permission: item }) => item.key === permission))) {
    throw new AuthorizationError();
  }
  return user;
}
