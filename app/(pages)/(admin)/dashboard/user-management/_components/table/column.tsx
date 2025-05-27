// import type { ColumnDef } from "@tanstack/react-table";
// import { Badge } from "@/app/_components/ui/badge";
// import { Checkbox } from "@/app/_components/ui/checkbox";
// import { MoreHorizontal } from "lucide-react";
// import { Button } from "@/app/_components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/app/_components/ui/dropdown-menu";
// import { formatDate } from "date-fns";

// export type User = {
//   id: string;
//   email: string;
//   first_name: string | null;
//   last_name: string | null;
//   role: string;
//   created_at: string;
//   last_sign_in_at: string | null;
//   email_confirmed_at: string | null;
//   is_anonymous: boolean;
//   banned_until: string | null;
// };

// export const columns: ColumnDef<User>[] = [
//   {
//     id: "select",
//     header: ({ table }) => (
//       <Checkbox
//         checked={
//           table.getIsAllPageRowsSelected() ||
//           (table.getIsSomePageRowsSelected() && "indeterminate")
//         }
//         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//         aria-label="Select all"
//       />
//     ),
//     cell: ({ row }) => (
//       <Checkbox
//         checked={row.getIsSelected()}
//         onCheckedChange={(value) => row.toggleSelected(!!value)}
//         aria-label="Select row"
//         onClick={(e) => e.stopPropagation()}
//       />
//     ),
//     enableSorting: false,
//     enableHiding: false,
//   },
//   {
//     accessorKey: "email",
//     header: "Email",
//     cell: ({ row }) => (
//       <div className="font-medium">{row.getValue("email")}</div>
//     ),
//   },
//   {
//     accessorKey: "first_name",
//     header: "First Name",
//     cell: ({ row }) => <div>{row.getValue("first_name") || "-"}</div>,
//   },
//   {
//     accessorKey: "last_name",
//     header: "Last Name",
//     cell: ({ row }) => <div>{row.getValue("last_name") || "-"}</div>,
//   },
//   {
//     accessorKey: "role",
//     header: "Role",
//     cell: ({ row }) => (
//       <Badge variant="outline" className="capitalize">
//         {row.getValue("role")}
//       </Badge>
//     ),
//   },
//   {
//     accessorKey: "created_at",
//     header: "Created At",
//     cell: ({ row }) => (
//       <div>
//         {formatDate(new Date(row.getValue("created_at")), "yyyy-MM-dd")}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "email_confirmed_at",
//     header: "Email Verified",
//     cell: ({ row }) => {
//       const verified = row.getValue("email_confirmed_at") !== null;
//       return (
//         <Badge variant={verified ? "default" : "destructive"}>
//           {verified ? "Verified" : "Unverified"}
//         </Badge>
//       );
//     },
//   },
//   {
//     id: "actions",
//     cell: ({ row }) => {
//       const user = row.original;

//       return (
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
//             <Button variant="ghost" className="h-8 w-8 p-0">
//               <span className="sr-only">Open menu</span>
//               <MoreHorizontal className="h-4 w-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             <DropdownMenuLabel>Actions</DropdownMenuLabel>
//             <DropdownMenuItem>Edit user</DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem>Reset password</DropdownMenuItem>
//             <DropdownMenuItem>Send magic link</DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem className="text-destructive">
//               Delete user
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       );
//     },
//   },
// ];
