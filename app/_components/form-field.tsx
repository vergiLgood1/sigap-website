"use client"

import React, { type ComponentPropsWithoutRef, ReactElement, type ReactNode, isValidElement } from "react"
import { Info } from "lucide-react"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { cn } from "../_lib/utils"

interface FormFieldProps extends ComponentPropsWithoutRef<"div"> {
  label: string
  link?: boolean
  linkText?: string
  onClick?: () => void
  input: ReactElement<any>
  error?: string
  description?: string
  required?: boolean
  size?: "sm" | "md" | "lg"
  labelClassName?: string
  inputWrapperClassName?: string
  hideLabel?: boolean
  id?: string
}

export function FormField({
  label,
  link,
  linkText,
  onClick,
  input,
  error,
  description,
  required = false,
  size = "md",
  labelClassName,
  inputWrapperClassName,
  hideLabel = false,
  id,
  className,
  ...props
}: FormFieldProps) {
  // Generate an ID for connecting label with input if not provided
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-")

  // Size-based spacing
  const sizeClasses = {
    sm: "space-y-1",
    md: "space-y-2",
    lg: "space-y-3",
  }

  // Safely clone the input element if it's a valid React element
  const inputElement = isValidElement(input)
    ? React.cloneElement(input as ReactElement<any>, {
      id: fieldId,
      "aria-invalid": error ? "true" : "false",
      "aria-describedby": error ? `${fieldId}-error` : description ? `${fieldId}-description` : undefined,
    })
    : input

  return (
    <div className={cn("w-full", sizeClasses[size], className)} {...props}>
      <div className="flex items-center justify-between">
        {!hideLabel && (
          <Label
            htmlFor={fieldId}
            className={cn(
              "text-sm font-medium text-gray-300",
              required && "after:content-['*'] after:ml-0.5 after:text-destructive",
              labelClassName,
            )}
          >
            {label}
          </Label>
        )}

        {link && (
          <Button
            size="sm"
            variant="link"
            className="text-xs text-gray-400 hover:text-gray-200 p-0 h-auto"
            onClick={onClick}
            type="button"
          >
            {linkText}
          </Button>
        )}
      </div>

      <div className={cn("relative", inputWrapperClassName)}>{inputElement}</div>

      {description && !error && (
        <p id={`${fieldId}-description`} className="text-xs text-gray-400 mt-1">
          {description}
        </p>
      )}

      {error && (
        <div id={`${fieldId}-error`} className="flex items-start gap-1.5 text-destructive text-xs mt-1" role="alert">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

