"use client"

import { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";
import { DatePicker } from "@/app/_components/ui/date-picker";
import { TimePicker } from "@/app/_components/ui/time-picker";
import { FileUploader } from "@/app/_components/ui/file-uploader";


interface ItemFormProps {
    initialData?: any;
    onCancel: () => void;
    onSubmit: (data: any) => void;
}

export function TimelineEventForm({ initialData, onCancel, onSubmit }: ItemFormProps) {
    const [formData, setFormData] = useState(initialData || {
        title: "",
        date: new Date(),
        time: new Date(),
        description: "",
        user: "",
        role: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Date</Label>
                    <DatePicker
                        date={formData.date}
                        onSelect={(date) => setFormData((prev: typeof formData) => ({ ...prev, date: date || new Date() }))}
                    />S
                </div>
                <div>
                    <Label>Time</Label>
                    <TimePicker
                        value={formData.time}
                        onChange={(time: Date) => setFormData((prev: typeof formData) => ({ ...prev, time }))}
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="user">Added By</Label>
                    <Input
                        id="user"
                        name="user"
                        value={formData.user}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save</Button>
            </div>
        </form>
    );
}

export function EvidenceForm({ initialData, onCancel, onSubmit }: ItemFormProps) {
    const [formData, setFormData] = useState(initialData || {
        type: "image",
        caption: "",
        description: "",
        files: [],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (files: File[]) => {
        setFormData((prev: typeof formData) => ({ ...prev, files }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="type">Evidence Type</Label>
                <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2"
                    required
                >
                    <option value="image">Image</option>
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="physical">Physical Evidence</option>
                </select>
            </div>

            <div>
                <Label htmlFor="caption">Caption</Label>
                <Input
                    id="caption"
                    name="caption"
                    value={formData.caption}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                />
            </div>

            <div>
                <Label>Upload Files</Label>
                <FileUploader
                    accept={formData.type === 'image' ? "image/*" : "*/*"}
                    maxFiles={5}
                    onFilesSelected={handleFileChange}
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Evidence</Button>
            </div>
        </form>
    );
}

export function DocumentForm({ initialData, onCancel, onSubmit }: ItemFormProps) {
    const [formData, setFormData] = useState(initialData || {
        title: "",
        description: "",
        type: "report",
        file: null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (files: File[]) => {
        setFormData((prev: typeof formData) => ({ ...prev, file: files[0] || null }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="title">Document Title</Label>
                <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <Label htmlFor="type">Document Type</Label>
                <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2"
                >
                    <option value="report">Report</option>
                    <option value="statement">Statement</option>
                    <option value="forensic">Forensic Analysis</option>
                    <option value="legal">Legal Document</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                />
            </div>

            <div>
                <Label>Upload Document</Label>
                <FileUploader
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    maxFiles={1}
                    onFilesSelected={handleFileChange}
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Document</Button>
            </div>
        </form>
    );
}

export function NoteForm({ initialData, onCancel, onSubmit }: ItemFormProps) {
    const [formData, setFormData] = useState(initialData || {
        title: "",
        content: "",
        tags: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="title">Note Title</Label>
                <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={6}
                    required
                />
            </div>

            <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="investigation, followup, important"
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Note</Button>
            </div>
        </form>
    );
}
