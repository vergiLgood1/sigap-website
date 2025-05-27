import { Input, InputProps } from "@/app/_components/ui/input"
import { LucideIcon } from "lucide-react"
import { FieldError, UseFormRegisterReturn } from "react-hook-form"

interface FormFieldProps extends Omit<InputProps, 'error'> {
    id?: string
    label: string
    icon?: LucideIcon
    error?: FieldError
    registration: UseFormRegisterReturn
}

export function ReactHookFormField({
    id,
    label,
    icon: Icon,
    error,
    registration,
    className,
    ...props
}: FormFieldProps) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-sm text-zinc-400">
                {label}
            </label>
            <div className="relative space-y-2">
                {Icon && <Icon className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />}
                <Input
                    id={id}
                    className={`${Icon ? 'pl-10' : ''} placeholder:text-zinc-500 ${className || ''}`}
                    error={!!error}
                    {...registration}
                    {...props}
                />
                {error && <p className="text-sm text-destructive">{error.message}</p>}
            </div>
        </div>
    )
}