"use client";

import { useEffect, useState } from "react";
import { UserDetailsDialog } from "@/features/admin/components/user-details-dialog";
import { apiRequest } from "@/lib/api-client";
import { UserTable, User } from "@/features/admin/components/user-list";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
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
import { PaginationControls } from "@/features/admin/components/pagination-controls";

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

interface PageableResponse {
  content: User[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(0); // 0-based
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [viewUserId, setViewUserId] = useState<number | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

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
      <h1 className="text-2xl font-medium mb-2">Manage Users</h1>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          View users, activate or deactivate accounts, and update user roles.
        </p>

        <Button onClick={fetchUsers} size="sm" variant="outline">
          <RefreshCcw />
        </Button>
      </div>

      <div className="overflow-hidden w-auto rounded-lg border border-border bg-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage} // triggers animation when page changes
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <UserTable
              users={users}
              onToggleActive={toggleActive}
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
        <DialogContent className="sm:max-w-[430px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">
              Change User Role
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="mt-2 rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Selected user</p>
              <p className="text-sm mt-1">
                <span className="text-muted-foreground">User ID:</span> #
                {selectedUser.userId}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Name:</span>{" "}
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Current role:</span>{" "}
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {selectedUser.roleName}
                </span>
              </p>
            </div>
          )}

          <div className="mt-4">
            <label className="form-label">New Role</label>
            <Select
              value={newRole?.toString() || ""}
              onValueChange={(value) => setNewRole(Number(value))}
            >
              <SelectTrigger className="w-full">
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
          </div>

          <DialogFooter className="mt-5 gap-2">
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
    </div>
  );
}
