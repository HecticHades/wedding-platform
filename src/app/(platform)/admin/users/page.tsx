import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { Users, Shield, Heart } from "lucide-react";
import { MetricCard, UsersTable } from "@/components/admin";
import { updateUserRole, deleteUser } from "./actions";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  // Fetch all users with their wedding info
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tenant: {
        select: { subdomain: true },
      },
    },
  });

  // Calculate stats
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const coupleCount = users.filter((u) => u.role === "couple").length;

  // Transform users for the table
  const usersForTable = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    weddingSubdomain: user.tenant?.subdomain || null,
    createdAt: user.createdAt,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 mt-1">Manage platform users and roles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          iconColor="blue"
        />
        <MetricCard
          title="Admins"
          value={adminCount}
          icon={Shield}
          iconColor="purple"
        />
        <MetricCard
          title="Couples"
          value={coupleCount}
          icon={Heart}
          iconColor="red"
        />
      </div>

      {/* Users Table */}
      <UsersTable
        users={usersForTable}
        onUpdateRole={updateUserRole}
        onDeleteUser={deleteUser}
      />
    </div>
  );
}
