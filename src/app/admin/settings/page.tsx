import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSettingsForm from "./AdminSettingsForm";

export const metadata = { title: "Platform Settings — Admin" };

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;

  const settings = await prisma.platformSettings.findFirst();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Platform Settings</h1>
      <AdminSettingsForm settings={settings} />
    </div>
  );
}
