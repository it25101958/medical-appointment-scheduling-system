# Feature Folder Organization Guide

## Standardized Feature Structure

Each feature in the `features/` folder should follow this consistent structure:

```
features/[feature]/
├── types/                  # TypeScript type definitions
│   └── [feature].types.ts
├── schemas/                # Validation schemas (if needed)
│   └── [feature].schema.ts
├── api/                    # API calls and requests
│   └── [feature].api.ts
├── hooks/                  # Custom React hooks
│   ├── use-[feature].ts
│   └── use-[features].ts
├── utils/                  # Utility functions
│   ├── [feature]-formatters.ts
│   ├── [feature]-permissions.ts
│   └── [feature]-helpers.ts
├── components/             # React components
│   ├── [component-name].tsx
│   └── [another-component].tsx
└── index.ts               # Barrel export (main entry point)
```

## Import Patterns

### ❌ Old Way (Direct Imports)

```tsx
import { roomScheduleApi } from "@/features/room-schedule/api/room-schedule.api";
import { RoomScheduleResponse } from "@/features/room-schedule/types/room-schedule.types";
import { AppointmentTable } from "@/features/appointments/components/appointment-table";
```

### ✅ New Way (Using Barrel Exports)

```tsx
import {
  roomScheduleApi,
  type RoomScheduleResponse,
} from "@/features/room-schedule";
import { AppointmentTable } from "@/features/appointments";
```

## Current Feature Organization

### ✅ Well-Organized Features

**appointments/**

- ✓ api/
- ✓ types/
- ✓ schemas/
- ✓ hooks/
- ✓ utils/
- ✓ components/
- ✓ index.ts

**room-schedule/**

- ✓ api/
- ✓ types/
- ✓ index.ts

### 📦 Component-Only Features

These features contain primarily components and are simpler:

- **admin/** - Components only (user-list, user-details, prescriptions, etc.)
- **auth/** - Components only (login-form, register-form)
- **dashboard/** - Components only (dashboard-shell - shared component)
- **doctor/** - Components only (dashboard)
- **patient/** - Components only (dashboard)
- **public/** - Components only (hero, services, about, reviews, contact)
- **staff/** - Components only (dashboard)

All have barrel exports (`index.ts`) for consistent imports.

## Benefits of This Organization

1. **Cleaner Imports** - Use `from "@/features/admin"` instead of deep paths
2. **Encapsulation** - Each feature is self-contained with clear boundaries
3. **Discoverability** - Related code is grouped together
4. **Maintainability** - Easy to find and update feature code
5. **Reusability** - Clear API/types for sharing between features
6. **Scalability** - Easy to add new features following the same pattern

## Adding New Features

When creating a new feature `features/new-feature/`:

1. Create the folder structure (only include folders you need)
2. Create the `index.ts` barrel export at the root
3. Export all public APIs, types, and components in `index.ts`
4. Use `from "@/features/new-feature"` in imports

Example `index.ts`:

```tsx
// Types
export type { MyType } from "./types/my-type.types";

// API
export { myApi } from "./api/my.api";

// Components
export { MyComponent } from "./components/my-component";
```

## File Naming Conventions

All files follow **kebab-case** naming:

✅ Good:

- `appointment-table.tsx`
- `user-details-dialog.tsx`
- `room-schedule.api.ts`
- `appointment-formatters.ts`

❌ Avoid:

- `AppointmentTable.tsx`
- `UserDetailsDialog.tsx`
- `roomSchedule.api.ts`

## Barrel Export Rules

1. **Only export public APIs** - Don't export internal implementation details
2. **Group by category** - Types first, then API, then hooks, then components
3. **Use TypeScript `type` imports** - `export type { MyType } from "..."`
4. **Keep exports organized** - Follow logical grouping

Example:

```tsx
// Types
export type { AppointmentStatus, Appointment } from "./types/...";

// API
export { appointmentApi } from "./api/...";

// Hooks
export { useAppointment } from "./hooks/...";

// Components
export { AppointmentTable } from "./components/...";
```

## Updated Files

All key importing files have been updated to use barrel exports:

- ✅ `app/(public)/page.tsx`
- ✅ `app/admin/dashboard/page.tsx`
- ✅ `app/doctor/dashboard/page.tsx`
- ✅ `app/patient/dashboard/page.tsx`
- ✅ `app/staff/dashboard/page.tsx`
- ✅ `app/admin/manage-users/page.tsx`
- ✅ `app/admin/prescriptions/page.tsx`
- ✅ `app/admin/room-schedule/page.tsx`
- ✅ `app/doctor/room-schedule/page.tsx`
