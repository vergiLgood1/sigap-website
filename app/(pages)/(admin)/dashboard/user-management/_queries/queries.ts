import { IUserSchema } from "@/src/entities/models/users/users.model";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, getUserByEmail, getUserById, getUserByUsername, getUsers } from "../action";

export const useGetUsersQuery = () => {
    return useQuery<IUserSchema[]>({
        queryKey: ["users"],
        queryFn: () => getUsers()
    });
}

export const useGetUserByEmailQuery = (email: string) => {
    return useQuery<IUserSchema>({
        queryKey: ["user", "email", email],
        queryFn: () => getUserByEmail({ email }),
    })
}

export const useGetUserByIdQuery = (id: string) => {
    return useQuery<IUserSchema>({
        queryKey: ["user", "id", id],
        queryFn: () => getUserById({ id }),
    })
}

export const useGetUserByUsernameQuery = (username: string) => {
    return useQuery<IUserSchema>({
        queryKey: ["user", "username", username],
        queryFn: () => getUserByUsername({ username }),
    })
}

export const useGetCurrentUserQuery = () => {
    return useQuery<IUserSchema>({
        queryKey: ["user", "current"],
        queryFn: () => getCurrentUser(),
    })
}