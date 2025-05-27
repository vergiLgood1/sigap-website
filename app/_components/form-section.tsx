import { FormDescription } from "./ui/form";

// Section component to reduce repetition
export function FormSection({
    title,
    description,
    children,
}: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-8 border-b-2 pb-8">
            <div>
                <h3 className="text-lg font-medium">{title}</h3>
                {description && <FormDescription>{description}</FormDescription>}
            </div>
            {children}
        </div>
    )
}