import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getProfile } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") redirect("/account");

  return <AdminShell>{children}</AdminShell>;
}
