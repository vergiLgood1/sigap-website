"use client"

import * as React from "react"
import { Upload, X, FileCheck, File } from "lucide-react"
import { cn } from "@/app/_lib/utils"
import { Button } from "@/app/_components/ui/button"

interface FileUploaderProps {
    onFilesSelected: (files: File[]) => void
    accept?: string
    maxFiles?: number
    maxSize?: number // in bytes
    className?: string
}

export function FileUploader({
    onFilesSelected,
    accept,
    maxFiles = 1,
    maxSize = 10 * 1024 * 1024, // 10MB default
    className,
}: FileUploaderProps) {
    const [files, setFiles] = React.useState<File[]>([])
    const [error, setError] = React.useState<string | null>(null)
    const [isDragging, setIsDragging] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || [])
        processFiles(selectedFiles)
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        setIsDragging(false)
        const droppedFiles = Array.from(event.dataTransfer.files)
        processFiles(droppedFiles)
    }

    const processFiles = (selectedFiles: File[]) => {
        setError(null)

        // Check if too many files are selected
        if (selectedFiles.length + files.length > maxFiles) {
            setError(`You can only upload up to ${maxFiles} file(s)`)
            return
        }

        // Check file sizes
        const oversizedFiles = selectedFiles.filter(file => file.size > maxSize)
        if (oversizedFiles.length > 0) {
            setError(`Some files exceed the maximum size of ${(maxSize / (1024 * 1024)).toFixed(1)}MB`)
            return
        }

        // Update files and notify parent
        const newFiles = [...files, ...selectedFiles].slice(0, maxFiles)
        setFiles(newFiles)
        onFilesSelected(newFiles)
    }

    const removeFile = (index: number) => {
        const newFiles = [...files]
        newFiles.splice(index, 1)
        setFiles(newFiles)
        onFilesSelected(newFiles)
        setError(null)
    }

    const openFileDialog = () => {
        fileInputRef.current?.click()
    }

    // Function to get human-readable file size
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' bytes'
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        else return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div
                className={cn(
                    "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
                    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFileDialog}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={maxFiles > 1}
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-center font-medium">
                    Drag & drop files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {accept ? `Accepted formats: ${accept}` : 'All file types supported'}
                    {maxFiles > 1 ? ` • Up to ${maxFiles} files` : ''}
                </p>
            </div>

            {error && (
                <div className="text-destructive text-sm flex items-center">
                    <X className="w-4 h-4 mr-1" /> {error}
                </div>
            )}

            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Selected Files:</p>
                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                                <div className="flex items-center gap-2">
                                    <File className="h-4 w-4" />
                                    <div className="text-sm truncate max-w-[200px]">{file.name}</div>
                                    <div className="text-xs text-muted-foreground">({formatFileSize(file.size)})</div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
