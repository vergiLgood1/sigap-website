import { IUserRoles } from "@/src/entities/models/roles/roles.model";

export const USER_ROLES = {

    TYPES: {
        ADMIN: 'admin',
        STAFF: 'staff',
        VIEWER: 'viewer',
    },

    ALLOWED_ROLES_TO_ACTIONS: [
        "admin",
        "staff"
    ]

};
