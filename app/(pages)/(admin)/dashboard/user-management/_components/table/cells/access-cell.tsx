// "use client"

// import React from "react"
// import { Badge } from "@/app/_components/ui/badge"
// import { IUserSchema } from "@/src/entities/models/users/users.model"

// interface AccessCellProps {
//     user: IUserSchema
// }

// const ACCESS = [
//     "Admin",
//     "Super Admin",
//     "Data Export",
//     "Data Import",
//     "Insert",
//     "Update",
//     "Delete",
// ]

// export const AccessCell: React.FC<AccessCellProps> = ({ user }) => {
//     const userAccess = ACCESS.filter(access => user.access?.includes(access))

//     return (
//         <div className="flex flex-wrap gap-2">
//             {userAccess.map(access => (
//                 <Badge key={access} variant="default">
//                     {access}
//                 </Badge>
//             ))}
//             {user.banned_until && <Badge variant="destructive">Banned</Badge>}
//             {!user.email_confirmed_at && <Badge variant="outline">Unconfirmed</Badge>}
//         </div>
//     )
// }