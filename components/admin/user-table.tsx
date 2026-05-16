"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { UserDetailsDialog } from "./UserDetailsDialog";

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  roleType: number;
  roleName: string;
  isActive: boolean;
}

interface UserTableProps {
  users: User[];
  onToggleActive: (userId: number, active: boolean) => void;
  onEditRole?: (user: User) => void;
  onViewUserDetails?: (userId: number) => void;
}

const SYSTEM_ADMIN_ID = 1;

export function UserTable({
  users,
  onToggleActive,
  onEditRole,
  onViewUserDetails,
}: UserTableProps) {
  return (
    <ScrollArea className="bg-card rounded-lg border border-border overflow-x-auto">
      <Table className="min-w-[1000px]">
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[80px] px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">
              ID
            </TableHead>
            <TableHead className="w-[180px] px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">
              Name
            </TableHead>
            <TableHead className="w-[220px] px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">
              Email
            </TableHead>
            <TableHead className="w-[140px] px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">
              Role
            </TableHead>
            <TableHead className="w-[100px] px-4 py-2 text-center text-xs font-medium tracking-wide text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="w-[50px] px-4 py-2 text-center text-xs font-medium tracking-wide text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-sm py-6 text-muted-foreground"
              >
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const isSystemAdmin = user.userId === SYSTEM_ADMIN_ID;
              return (
                <TableRow key={user.userId} className="hover:bg-muted/20">
                  <TableCell className="px-4 py-2 font-medium text-muted-foreground">
                    {user.userId}
                  </TableCell>

                  <TableCell className="px-4 py-2">
                    <span
                      className="text-sm font-medium text-foreground"
                      onClick={() => onViewUserDetails(user.userId)}
                    >
                      {user.firstName} {user.lastName}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-2 text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>

                  <TableCell className="px-4 py-2">
                    <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {user.roleName}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-2 text-center">
                    <span
                      className={
                        user.isActive
                          ? "rounded-md bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400"
                          : "rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
                      }
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>

                  <TableCell className="ml-40 text-left">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isSystemAdmin}
                        onClick={() =>
                          onToggleActive(user.userId, !user.isActive)
                        }
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </Button>

                      {onEditRole && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={isSystemAdmin}
                          onClick={() => onEditRole(user)}
                        >
                          Change Role
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
