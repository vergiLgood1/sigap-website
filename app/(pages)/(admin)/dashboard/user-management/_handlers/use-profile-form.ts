"use client"

import type React from "react"

import { createClient } from "@/app/_utils/supabase/client"
import type { IUserSchema } from "@/src/entities/models/users/users.model"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useUnbanUserMutation, useUpdateUserMutation, useUploadAvatarMutation } from "../_queries/mutations"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CNumbers } from "@/app/_utils/const/numbers"
import { CTexts } from "@/app/_utils/const/texts"
import { useUserActionsHandler } from "./actions/use-user-actions"
import { useGetCurrentUserQuery } from "../_queries/queries"

// Profile update form schema
const profileFormSchema = z.object({
    username: z.string().nullable().optional(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    avatar: z.string().nullable().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export const useProfileFormHandlers = () => {
    const { invalidateUsers, invalidateCurrentUser, invalidateUser } = useUserActionsHandler()

    const { data: user } = useGetCurrentUserQuery()

    const {
        mutateAsync: updateUser,
        isPending,
        error
    } = useUpdateUserMutation()

    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.profile?.avatar || null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Setup form with react-hook-form and zod validation
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            first_name: user?.profile?.first_name || "",
            last_name: user?.profile?.last_name || "",
            bio: user?.profile?.bio || "",
            avatar: user?.profile?.avatar || "",
        },
    })

    const resetAvatarValue = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    // Handle avatar file upload
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if (!file || !user?.id) {

            toast.error("No file selected")

            resetAvatarValue()
            return
        }

        // Validate file size
        if (file.size > CNumbers.MAX_FILE_AVATAR_SIZE) {
            toast.error(`File size must be less than ${CNumbers.MAX_FILE_AVATAR_SIZE / 1024 / 1024} MB`)

            // Reset the file input
            resetAvatarValue()
            return
        }

        // Validate file type
        if (!CTexts.ALLOWED_FILE_TYPES.includes(file.type)) {
            toast.error("Invalid file type. Only PNG and JPG are allowed")

            // Reset the file input
            resetAvatarValue()
            return
        }

        try {

            // Create a preview of the selected image
            const objectUrl = URL.createObjectURL(file)
            setAvatarPreview(objectUrl)

            // Upload to Supabase Storage
            const fileExt = file.name.split(".").pop()
            const fileName = `AVR-${user.email?.split("@")[0]}`
            const filePath = `${user.id}/${fileName}`

            const supabase = createClient()

            const { error: uploadError, data } = await supabase.storage.from("avatars").upload(filePath, file, {
                upsert: true,
                contentType: file.type,
            })

            if (uploadError) {

                toast.error("Error uploading avatar. Please try again.")

                throw uploadError
            }

            // Get the public URL
            const {
                data: { publicUrl },
            } = supabase.storage.from("avatars").getPublicUrl(filePath)

            const uniquePublicUrl = `${publicUrl}?t=${Date.now()}`

            await updateUser({ id: user.id, data: { profile: { avatar: uniquePublicUrl } } })

            form.setValue("avatar", uniquePublicUrl)
            resetAvatarValue()

            invalidateUsers()
            invalidateCurrentUser()
            toast.success("Avatar uploaded successfully")
        } catch (error) {
            console.error("Error uploading avatar:", error)

            // Show error toast
            toast.error("Error uploading avatar. Please try again.")

            // Revert to previous avatar if upload fails
            setAvatarPreview(user?.profile?.avatar || null)

            // Reset the file input
            resetAvatarValue()
        }
    }

    // Trigger file input click
    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    // Handle form submission
    async function onSubmit(data: ProfileFormValues) {
        try {
            if (!user?.id) return

            const supabase = createClient()

            // Update profile in database
            const { error } = await supabase
                .from("profiles")
                .update({
                    first_name: data.first_name,
                    last_name: data.last_name,
                    bio: data.bio,
                    avatar: data.avatar,
                })
                .eq("user_id", user.id)

            if (error) throw error

            toast.success("Profile updated successfully")

            // Invalidate the user query to refresh data
            invalidateUser(user.id)

            // Call success callback
            // onSuccess?.()
        } catch (error) {
            console.error("Error updating profile:", error)
            toast.error("Error updating profile")
        }
    }

    return {
        form,
        handleFileChange,
        handleAvatarClick,
        onSubmit,
        isPending,
        avatarPreview,
        fileInputRef,
        user,
    }
}

