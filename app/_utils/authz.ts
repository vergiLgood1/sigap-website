import { IUserSchema } from "@/src/entities/models/users/users.model"

type Role = "viewer" | "staff" | "admin";

const PERMISSIONS: Record<Role, string[]> = {
    viewer: ["view:post"],
    staff: ["view:post", "edit:post"],
    admin: ["view:post", "create:post", "edit:post", "delete:post"],
};
export const CheckPermission = (user: IUserSchema, action: string, resource: string) => {
    const permissions = PERMISSIONS[user.role as Role]

    if (!permissions) return false

    return permissions.includes(`${action}:${resource}`)
}


export default CheckPermission