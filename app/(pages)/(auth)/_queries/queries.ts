import { useQuery } from "@tanstack/react-query"
import { checkPermissions } from "../action"

export const useCheckPermissionsQuery = (email: string, action: string, resource: string) => {
    return useQuery({
        queryKey: ["check-permissions", email, action, resource],
        queryFn: async () => await checkPermissions(email, action, resource),
    })
}
