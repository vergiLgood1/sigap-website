import UserManagement from "@/app/(pages)/(admin)/dashboard/user-management/_components/user-management";
import { UserStats } from "@/app/(pages)/(admin)/dashboard/user-management/_components/user-stats";

export default function UsersPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between px-4 mb-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-8">
        <div>
          <h1 className="text-lg font-semibold">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <UserStats />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-background border md:min-h-min p-4">
          <UserManagement />
        </div>
      </div>
    </>
  );
}
