export enum UserRole {
  ADMIN = 1,
  STAFF = 2,
  DOCTOR = 3,
  PATIENT = 4,
}

export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  roleType: UserRole;
  isActive: boolean;
}

export const ROLE_ROUTES = {
  [UserRole.ADMIN]: "/admin",
  [UserRole.STAFF]: "/staff",
  [UserRole.DOCTOR]: "/doctor",
  [UserRole.PATIENT]: "/patient",
};
