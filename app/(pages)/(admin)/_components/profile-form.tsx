"use client";

import type React from "react";

import { useState, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IUserSchema } from "@/src/entities/models/users/users.model";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { ImageIcon, Loader2 } from "lucide-react";
import { createClient } from "@/app/_utils/supabase/client";
import { getFullName, getInitials } from "@/app/_utils/common";
import { useProfileFormHandlers } from "../dashboard/user-management/_handlers/use-profile-form";
import { CTexts } from "@/app/_utils/const/texts";

// Profile update form schema
const profileFormSchema = z.object({
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  user: IUserSchema | null;
  onSuccess?: () => void;
}

export function ProfileForm({ user, onSuccess }: ProfileFormProps) {

  const firstName = user?.profile?.first_name || "";
  const lastName = user?.profile?.last_name || "";
  const email = user?.email || "";
  const username = user?.profile?.username || "";

  const {
    isPending,
    avatarPreview,
    fileInputRef,
    form,
    handleFileChange,
    handleAvatarClick,
    onSubmit,
  } = useProfileFormHandlers()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar upload section at the top */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div
            className="relative cursor-pointer group"
            onClick={handleAvatarClick}
          >
            <Avatar className="h-24 w-24 border-2 border-border">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt={username} />
              ) : (
                <AvatarFallback className="text-2xl">
                  {getInitials(firstName, lastName, email)}
                </AvatarFallback>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {isPending ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-white" />
                )}
              </div>
            </Avatar>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=""
            className="hidden"
            onChange={handleFileChange}
            disabled={isPending}
          />
          <Label
            htmlFor="avatar-upload"
            className="text-sm text-muted-foreground"
          >
            Click avatar to upload a new image
          </Label>
        </div>

        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your first name"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your last name"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Brief description for your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isPending || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </form>
    </Form>
  );
}
