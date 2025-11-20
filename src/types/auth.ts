export const USER_ROLES = ["admin", "user"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type SessionUser = {
	id: string;
	email: string;
	name: string;
	role: UserRole;
};
