"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  UserDetailsDialog,
  UserTable,
  PaginationControls,
  AdminUserRegistrationDialog,
  type User,
} from "@/features/admin";
import { apiRequest } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { SearchBar } from "@/components/ui/search-bar";
import { PageHeader } from "@/components/ui/page-header";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  RefreshCcw,
  Plus,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getRoleBadgeClass } from "@/lib/theme";

const SYSTEM_ADMIN_ID = 1;

const ROLE_OPTIONS = [
  { value: 1, label: "ADMIN" },
  { value: 2, label: "STAFF" },
  { value: 3, label: "DOCTOR" },
  { value: 4, label: "PATIENT" },
];

const ROLE_MAP: Record<number, string> = {
  1: "ADMIN",
  2: "STAFF",
  3: "DOCTOR",
  4: "PATIENT",
};

function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

interface PageableResponse {
  content: User[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export default function ManageUsersPage() {
  const [currentUser, setCurrentUser] = useState<{
    userId: number;
    roleType: number;
    accessLevel?: string;
  } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredUsers = useMemo(() => {
    const query = normalize(deferredSearchQuery);
    if (!query) return users;
    return users.filter((user) => {
      const haystack = [
        user.userId?.toString(),
        user.firstName,
        user.lastName,
        user.email,
        user.roleName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [deferredSearchQuery, users]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [viewUserId, setViewUserId] = useState<number | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [pendingDeactivateUser, setPendingDeactivateUser] =
    useState<User | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  useEffect(() => {
    let mounted = true;
    async function loadCurrent() {
      try {
        const data = await apiRequest<{
          userId: number;
          roleType: number;
          accessLevel?: string;
        }>("/users/me", { method: "GET", cache: "no-store" });
        if (mounted) setCurrentUser(data);
      } catch (error) {
        // ignore — page will show restricted controls if no user
      }
    }
    loadCurrent();
    return () => {
      mounted = false;
    };
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data: PageableResponse = await apiRequest(
        `/users?page=${currentPage}&size=${pageSize}&sort=userId,asc`,
      );

      const mappedUsers = data.content.map((user) => ({
        ...user,
        roleName: ROLE_MAP[user.roleType] || "UNKNOWN",
      }));

      setUsers(mappedUsers);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const handleViewUserDetails = (userId: number) => {
    setViewUserId(userId);
    setViewOpen(true);
  };

  async function toggleActive(userId: number, active: boolean) {
    if (userId === SYSTEM_ADMIN_ID) {
      toast.error("System Admin cannot be deactivated or modified");
      return;
    }

    try {
      await apiRequest(
        `/users/${active ? "activate" : "deactivate"}/${userId}`,
        {
          method: "PATCH",
        },
      );
      await fetchUsers();
      toast.success(
        `User ${active ? "activated" : "deactivated"} successfully`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  function handleToggleActiveRequest(userId: number, active: boolean) {
    if (active) {
      toggleActive(userId, true);
      return;
    }

    const user = users.find((item) => item.userId === userId);
    if (!user) {
      toast.error("User not found");
      return;
    }

    setPendingDeactivateUser(user);
    setDeactivateDialogOpen(true);
  }

  function closeDeactivateDialog() {
    setDeactivateDialogOpen(false);
    setPendingDeactivateUser(null);
  }

  async function confirmDeactivateUser() {
    if (!pendingDeactivateUser) return;

    setDeactivating(true);
    await toggleActive(pendingDeactivateUser.userId, false);
    setDeactivating(false);
    closeDeactivateDialog();
  }

  function openRoleDialog(user: User) {
    if (user.userId === SYSTEM_ADMIN_ID) {
      toast.error("System Admin role cannot be changed");
      return;
    }
    setSelectedUser(user);
    setNewRole(null);
    setOpen(true);
  }

  async function handleChangeRole() {
    if (!selectedUser || newRole === null) {
      toast.error("Please select a new role");
      return;
    }

    if (selectedUser.userId === SYSTEM_ADMIN_ID) {
      toast.error("System Admin role cannot be changed");
      return;
    }

    try {
      await apiRequest(
        `/users/role/${selectedUser.userId}?newRoleType=${newRole}`,
        {
          method: "PATCH",
        },
      );
      await fetchUsers();
      setOpen(false);
      setSelectedUser(null);
      setNewRole(null);
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  if (loading) {
    return (
      <div className="col-start-1 col-end-14 p-4 text-muted-foreground">
        Loading users...
      </div>
    );
  }

  return (
    <div className="col-start-1 col-end-14 ">
      <PageHeader
        title="Manage Users"
        description="View users, activate or deactivate accounts, and update user roles."
        actions={
          <>
            <Button onClick={fetchUsers} size="sm" variant="outline">
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setRegisterDialogOpen(true)}
              size="sm"
              className="bg-primary hover:bg-primary/90"
              disabled={currentUser?.roleType !== 1}
              title={
                currentUser?.roleType !== 1
                  ? "Only administrators can add users"
                  : undefined
              }
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </>
        }
      />

      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by ID, name, email, or role"
          resultCount={filteredUsers.length}
        />
      </div>

      <div className="overflow-hidden w-auto rounded-lg border border-border bg-card mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage} // triggers animation when page changes
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <UserTable
              users={filteredUsers}
              searchQuery={deferredSearchQuery}
              onToggleActive={handleToggleActiveRequest}
              onEditRole={openRoleDialog}
              onViewUserDetails={handleViewUserDetails}
            />
            <UserDetailsDialog
              userId={viewUserId}
              open={viewOpen}
              onOpenChange={setViewOpen}
            />
          </motion.div>
        </AnimatePresence>
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 20, 50]}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(0);
          }}
        />
      </div>

      {/* Change Role Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-5 border-border/60 bg-card p-0 shadow-xl sm:max-w-[460px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    Change User Role
                  </DialogTitle>
                  <DialogDescription>
                    Update access permissions for the selected account.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 px-6">
            {selectedUser && (
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      User ID {selectedUser.userId}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      Current role
                    </span>

                    <span className={getRoleBadgeClass()}>
                      {selectedUser.roleName}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Field>
              <FieldLabel>New Role</FieldLabel>
              <Select
                value={newRole?.toString() || ""}
                onValueChange={(value) => setNewRole(Number(value))}
              >
                <SelectTrigger className="h-10 w-full bg-background">
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.filter(
                    (role) => role.label !== selectedUser?.roleName,
                  ).map((role) => (
                    <SelectItem key={role.value} value={role.value.toString()}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSelectedUser(null);
                setNewRole(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleChangeRole} disabled={newRole === null}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin User Registration Dialog */}
      <AdminUserRegistrationDialog
        open={registerDialogOpen}
        onOpenChange={setRegisterDialogOpen}
        onSuccess={fetchUsers}
        currentUser={currentUser}
      />

      {/* Deactivate User Confirmation Dialog */}
      <Dialog
        open={deactivateDialogOpen}
        onOpenChange={(dialogOpen) => {
          if (!dialogOpen) closeDeactivateDialog();
        }}
      >
        <DialogContent className="gap-5 border-border/60 bg-card p-0 shadow-xl sm:max-w-[460px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    Deactivate User
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to deactivate this account?
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {pendingDeactivateUser && (
            <div className="px-6">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="text-sm font-medium">
                  {pendingDeactivateUser.firstName}{" "}
                  {pendingDeactivateUser.lastName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  User ID #{pendingDeactivateUser.userId} ·{" "}
                  {pendingDeactivateUser.email}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              variant="outline"
              onClick={closeDeactivateDialog}
              disabled={deactivating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeactivateUser}
              disabled={deactivating}
            >
              {deactivating ? "Deactivating..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
