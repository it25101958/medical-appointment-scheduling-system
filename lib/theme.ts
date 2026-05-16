// Theme utilities and styling constants for consistent UI

export const tableStyles = {
  container: "bg-card rounded-lg border border-border overflow-x-auto",
  header: "bg-muted/30",
  headerCell:
    "px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground",
  row: "hover:bg-muted/20 transition-colors",
  cell: "px-4 py-2",
  emptyState: "text-center text-sm py-6 text-muted-foreground",
};

export const dialogStyles = {
  default: "max-w-md",
  large: "max-w-lg",
  xlarge: "max-w-xl",
};

export const badgeStyles = {
  status: {
    active:
      "rounded-md bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400",
    inactive:
      "rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive",
    pending:
      "rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400",
  },
  role: "rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary",
  type: "rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400",
};

export const animationStyles = {
  fadeIn: "animate-in fade-in duration-300",
  slideUp: "animate-in slide-in-from-bottom-2 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-300",
};

// Utility function to get status badge styling
export function getStatusBadgeClass(
  status: string | boolean | undefined,
): string {
  if (typeof status === "boolean") {
    return status ? badgeStyles.status.active : badgeStyles.status.inactive;
  }

  const statusLower = String(status).toLowerCase();
  if (statusLower === "active" || statusLower === "true") {
    return badgeStyles.status.active;
  }
  if (statusLower === "inactive" || statusLower === "false") {
    return badgeStyles.status.inactive;
  }
  if (statusLower === "pending") {
    return badgeStyles.status.pending;
  }

  return badgeStyles.status.inactive;
}

// Utility function to get role badge styling
export function getRoleBadgeClass(): string {
  return badgeStyles.role;
}

// Utility function to format badge text
export function formatBadgeText(text: string | boolean): string {
  if (typeof text === "boolean") {
    return text ? "Active" : "Inactive";
  }
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
