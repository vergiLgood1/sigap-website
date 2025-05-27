import { useCheckPermissionsQuery } from "../_queries/queries"

export const useCheckPermissionsHandler = (email: string) => {

    const { data: isAllowedToCreate } = useCheckPermissionsQuery(email, "create", "users")
    const { data: isAllowedToUpdate } = useCheckPermissionsQuery(email, "update", "users")
    const { data: isAllowedToDelete } = useCheckPermissionsQuery(email, "delete", "users")

    const { data: isAllowedToBan } = useCheckPermissionsQuery(email, "ban", "users")
    const { data: isAllowedToSendPasswordRecovery } = useCheckPermissionsQuery(email, "send_password_recovery", "users",)
    const { data: isAllowedToSendMagicLink } = useCheckPermissionsQuery(email, "send_magic_link", "users")

    return {
        isAllowedToCreate,
        isAllowedToUpdate,
        isAllowedToDelete,
        isAllowedToBan,
        isAllowedToSendPasswordRecovery,
        isAllowedToSendMagicLink,
        isAllowedToSendEmail: isAllowedToSendPasswordRecovery || isAllowedToSendMagicLink,
    }
}