export const ROLES = ["ADMIN", "RESPONSIBLE", "EMPLOYEE"] as const;
export const CONDITIONS = ["NEW", "GOOD", "FAIR", "BROKEN", "WRITTEN_OFF"] as const;
export const USAGE_STATUSES = ["IN_USE", "IN_STORAGE", "IN_REPAIR", "WRITTEN_OFF"] as const;

export type Role = (typeof ROLES)[number];
