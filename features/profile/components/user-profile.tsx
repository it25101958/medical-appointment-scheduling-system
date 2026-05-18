"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  IdCard,
  Mail,
  Phone,
  RefreshCcw,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Badge, Button, PageHeader } from "@/components/ui";
import { apiRequest } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/utils";

interface UserProfileResponse {
  userId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  nic?: string;
  NIC?: string;
  address?: string;
  roleType?: number;
  roleName?: string;
  role?: string;
  status?: string;
  active?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function formatValue(value?: string | number | boolean | null) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Active" : "Inactive";
  return String(value);
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export function UserProfile() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile() {
    setLoading(true);
    try {
      const data = await apiRequest<UserProfileResponse>("/users/me", {
        method: "GET",
        cache: "no-store",
      });
      setProfile(data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load user profile"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const fullName = useMemo(() => {
    const name = [profile?.firstName, profile?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name || "My Profile";
  }, [profile]);

  const status = profile?.isActive ?? profile?.active;
  const role = profile?.roleName || profile?.role || profile?.roleType;

  return (
    <div className="col-start-1 col-end-14 space-y-6">
      <PageHeader
        title="My Profile"
        description="Review the account details connected to your signed-in user."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={loadProfile}
            disabled={loading}
            aria-label="Refresh profile"
            title="Refresh"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        }
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border/60 bg-muted/30 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  {loading ? "Loading profile..." : fullName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  User #{formatValue(profile?.userId)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {formatValue(role)}
              </Badge>
              {status !== undefined && (
                <Badge
                  variant="outline"
                  className={
                    status
                      ? "rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700"
                      : "rounded-full border-destructive/20 bg-destructive/10 px-3 py-1 text-destructive"
                  }
                >
                  {formatValue(status)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Loading your profile...
          </div>
        ) : profile ? (
          <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
            <ProfileInfo
              icon={<Mail className="size-4" />}
              label="Email"
              value={formatValue(profile.email)}
            />
            <ProfileInfo
              icon={<Phone className="size-4" />}
              label="Phone"
              value={formatValue(profile.phone)}
            />
            <ProfileInfo
              icon={<IdCard className="size-4" />}
              label="NIC"
              value={formatValue(profile.nic || profile.NIC)}
            />
            <ProfileInfo
              icon={<ShieldCheck className="size-4" />}
              label="Role"
              value={formatValue(role)}
            />
            <ProfileInfo
              icon={<CalendarDays className="size-4" />}
              label="Created"
              value={formatDate(profile.createdAt)}
            />
            <ProfileInfo
              icon={<CalendarDays className="size-4" />}
              label="Updated"
              value={formatDate(profile.updatedAt)}
            />
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4 md:col-span-2 xl:col-span-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Address
              </p>
              <p className="mt-2 text-sm font-medium">
                {formatValue(profile.address)}
              </p>
            </div>
          </div>
        ) : (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Profile details are not available.
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
