"use client";

import { useState, useMemo, useEffect } from "react";

import { DataTable } from "../../../../../_components/data-table";
import { UserInformationSheet } from "./sheets/user-information-sheet";
import { useGetCurrentUserQuery, useGetUsersQuery } from "../_queries/queries";
import { filterUsers, useUserManagementHandlers } from "../_handlers/use-user-management";

import { useAddUserDialogHandler } from "../_handlers/use-add-user-dialog";
import { useInviteUserHandler } from "../_handlers/use-invite-user";
import { AddUserDialog } from "./dialogs/add-user-dialog";
import { InviteUserDialog } from "./dialogs/invite-user-dialog";

import { createUserColumns } from "./table/columns";
import { UserManagementToolbar } from "./toolbars/user-management-toolbar";
import { UpdateUserSheet } from "./sheets/update-user-sheet";


export default function UserManagement() {

  // Use React Query to fetch users
  const {
    data: users = [],
    isPending,
    refetch,
  } = useGetUsersQuery();

  const { data: currentUser } = useGetCurrentUserQuery()

  // User management handler
  const {
    searchQuery,
    setSearchQuery,
    isDetailUser,
    isUpdateUser,
    isSheetOpen,
    setIsSheetOpen,
    isUpdateOpen,
    setIsUpdateOpen,
    filters,
    setFilters,
    handleUserClick,
    handleUserUpdate,
    clearFilters,
    getActiveFilterCount,
  } = useUserManagementHandlers()

  // User management handler
  const {
    isAddUserDialogOpen,
    setIsAddUserDialogOpen,
  } = useAddUserDialogHandler({
    onOpenChange: (open) => setIsAddUserDialogOpen(open),
  })

  const {
    isInviteUserDialogOpen,
    setIsInviteUserDialogOpen,
  } = useInviteUserHandler({
    onOpenChange: (open) => setIsInviteUserDialogOpen(open),
  })

  // Apply filters to users
  const filteredUsers = useMemo(() => {
    return filterUsers(users, searchQuery, filters)
  }, [users, searchQuery, filters])

  // Get active filter count
  const activeFilterCount = getActiveFilterCount()

  // Create table columns
  const columns = createUserColumns(
    filters,
    setFilters,
    handleUserUpdate,
    currentUser
  )

  // State untuk jumlah data di halaman saat ini
  const [currentPageDataCount, setCurrentPageDataCount] = useState(0);

  return (
    <div className="space-y-4">
      <UserManagementToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsAddUserDialogOpen={setIsAddUserDialogOpen}
        setIsInviteUserDialogOpen={setIsInviteUserDialogOpen}
        activeFilterCount={activeFilterCount}
        clearFilters={clearFilters}
        currentPageDataCount={currentPageDataCount}
      />

      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={isPending}
        onRowClick={(user) => handleUserClick(user)}
        onCurrentPageDataCountChange={setCurrentPageDataCount}
      />

      {isDetailUser && (
        <UserInformationSheet
          selectedUser={isDetailUser}
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
        />
      )}

      {isUpdateUser && (
        <UpdateUserSheet
          open={isUpdateOpen}
          onOpenChange={setIsUpdateOpen}
          userData={isUpdateUser}
        />
      )}

      <AddUserDialog
        open={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
      />

      <InviteUserDialog
        open={isInviteUserDialogOpen}
        onOpenChange={setIsInviteUserDialogOpen}
      />
    </div>
  );
}
