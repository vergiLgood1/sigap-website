"use client"

import { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";
import { FileUploader } from "@/app/_components/ui/file-uploader";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/_components/ui/select";
import { TimePicker } from "@/app/_components/ui/time-picker";
import { DatePicker } from "@/app/_components/ui/date-picker";
import { cn } from "@/app/_lib/utils";
import { useGetCrimeCategories } from "../../../crime-overview/_queries/queries";
import { useGetDistricts, useGetSourceTypes } from "../../_queries/queries";
import { useCreateIncidentLog, useCreateCrimeIncident, useCreateCrimeSummary } from "../../_queries/queries";

interface CreateFormProps {
    onCancel: () => void;
    onSubmit: (data: any) => void;
}

export function CreateIncidentLogForm({ onCancel }: CreateFormProps) {
    // Fetch categories, districts, and source types from Tanstack query hooks
    const { data: categories = [], isLoading: isCategoriesLoading } = useGetCrimeCategories();
    const { data: districts = [], isLoading: isDistrictsLoading } = useGetDistricts();
    const { data: sourceTypes = [], isLoading: isSourceTypesLoading } = useGetSourceTypes();

    const [formData, setFormData] = useState({
        source: "mobile_app",
        category: "",
        date: new Date(),
        time: new Date(),
        description: "",
        location: "",
        district: "",
        latitude: "",
        longitude: "",
        evidence: [] as File[],
        reporter: "",
        reporterContact: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (files: File[]) => {
        setFormData((prev: typeof formData) => ({ ...prev, evidence: files }));
    };

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setFormData((prev: typeof formData) => ({ ...prev, date }));
        }
    };

    const handleTimeChange = (time: Date) => {
        setFormData((prev: typeof formData) => ({ ...prev, time }));
    };

    const createIncidentLogMutation = useCreateIncidentLog();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createIncidentLogMutation.mutateAsync(formData);
            onCancel();
        } catch (err) {
            // Optionally handle error (show toast, etc)
        }
    };

    return (
        <div className="flex items-center justify-center w-full min-h-[400px]">
            <form
                onSubmit={handleSubmit}
                className="space-y-6 w-full max-w-2xl mx-auto bg-background rounded-lg shadow-lg p-6"
                style={{ maxHeight: 600, overflowY: "auto" }}
            >
                {/* Incident Source and Category section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="source">Source</Label>
                        <Select
                            value={formData.source}
                            disabled={isSourceTypesLoading}
                            onValueChange={(value) => handleSelectChange("source", value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={isSourceTypesLoading ? "Loading..." : "Select source type"} />
                            </SelectTrigger>
                            <SelectContent>
                                {sourceTypes.map((type: any) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Crime Category</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => handleSelectChange("category", value)}
                            disabled={isCategoriesLoading}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={isCategoriesLoading ? "Loading..." : "Select category"} />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat: any) => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Date and Time section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Incident Date</Label>
                        <DatePicker
                            date={formData.date}
                            onSelect={handleDateChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Incident Time</Label>
                        <TimePicker
                            value={formData.time}
                            onChange={handleTimeChange}
                        />
                    </div>
                </div>

                {/* Description section */}
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Describe what happened in detail..."
                        required
                        className="resize-none"
                    />
                </div>

                {/* Location section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium">Location Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">Address</Label>
                            <Input
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Full address of incident"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="district">District</Label>
                            <Select
                                value={formData.district}
                                onValueChange={(value) => handleSelectChange("district", value)}
                                disabled={isDistrictsLoading}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={isDistrictsLoading ? "Loading..." : "Select district"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {districts.map((d: any) => (
                                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="latitude">Latitude</Label>
                            <Input
                                id="latitude"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleChange}
                                type="number"
                                step="0.0000001"
                                placeholder="e.g. 40.7128"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="longitude">Longitude</Label>
                            <Input
                                id="longitude"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                type="number"
                                step="0.0000001"
                                placeholder="e.g. -74.0060"
                            />
                        </div>
                    </div>
                </div>

                {/* Reporter information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium">Reporter Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="reporter">Reporter Name</Label>
                            <Input
                                id="reporter"
                                name="reporter"
                                value={formData.reporter}
                                onChange={handleChange}
                                placeholder="Full name of reporter"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reporterContact">Contact Information</Label>
                            <Input
                                id="reporterContact"
                                name="reporterContact"
                                value={formData.reporterContact}
                                onChange={handleChange}
                                placeholder="Phone or email"
                            />
                        </div>
                    </div>
                </div>

                {/* Evidence section */}
                <div className="space-y-2">
                    <Label>Upload Evidence</Label>
                    <FileUploader
                        accept="image/*,video/*,application/pdf"
                        maxFiles={5}
                        onFilesSelected={handleFileChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Accepted formats: Images, videos, PDFs. Max 5 files.
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="px-6"
                    >
                        Create Incident Log
                    </Button>
                </div>
            </form>
        </div>
    );
}

export function CreateCrimeIncidentForm({ onCancel }: CreateFormProps) {
    const { data: categories = [], isLoading: isCategoriesLoading } = useGetCrimeCategories();
    const { data: districts = [], isLoading: isDistrictsLoading } = useGetDistricts();

    const [formData, setFormData] = useState({
        category: "",
        timestamp: new Date(),
        description: "",
        location: "",
        district: "",
        status: "open",
        victimCount: "0",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTimeChange = (timestamp: Date) => {
        setFormData(prev => ({ ...prev, timestamp }));
    };

    const createCrimeIncidentMutation = useCreateCrimeIncident();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCrimeIncidentMutation.mutateAsync(formData);
            onCancel();
        } catch (err) {
            // Optionally handle error (show toast, etc)
        }
    };

    return (
        <div className="flex items-center justify-center w-full min-h-[400px]">
            <form
                onSubmit={handleSubmit}
                className="space-y-4 w-full max-w-2xl mx-auto bg-background rounded-lg shadow-lg p-6"
                style={{ maxHeight: 600, overflowY: "auto" }}
            >
                <div>
                    <Label htmlFor="category">Crime Category</Label>
                    <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange("category", value)}
                        disabled={isCategoriesLoading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={isCategoriesLoading ? "Loading..." : "Select category"} />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat: any) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label>Incident Time</Label>
                    <TimePicker
                        value={formData.timestamp}
                        onChange={handleTimeChange}
                    />
                </div>

                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="location">Address</Label>
                        <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="district">District</Label>
                        <Select
                            value={formData.district}
                            onValueChange={(value) => handleSelectChange("district", value)}
                            disabled={isDistrictsLoading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={isDistrictsLoading ? "Loading..." : "Select district"} />
                            </SelectTrigger>
                            <SelectContent>
                                {districts.map((d: any) => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => handleSelectChange("status", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="victimCount">Victim Count</Label>
                        <Input
                            id="victimCount"
                            name="victimCount"
                            value={formData.victimCount}
                            onChange={handleChange}
                            type="number"
                            min="0"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Create Crime Incident</Button>
                </div>
            </form>
        </div>
    );
}

export function CreateCrimeSummaryForm({ onCancel }: CreateFormProps) {
    const { data: districts = [], isLoading: isDistrictsLoading } = useGetDistricts();
    const { data: sourceTypes = [], isLoading: isSourceTypesLoading } = useGetSourceTypes();

    const [formData, setFormData] = useState({
        district: "",
        month: "",
        year: new Date().getFullYear().toString(),
        crimeCount: "0",
        crimesCleared: "0",
        level: "low",
        sourceType: "cbu",
        method: "manual",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const createCrimeSummaryMutation = useCreateCrimeSummary();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCrimeSummaryMutation.mutateAsync(formData);
            onCancel();
        } catch (err) {
            // Optionally handle error (show toast, etc)
        }
    };

    return (
        <div className="flex items-center justify-center w-full min-h-[400px]">
            <form
                onSubmit={handleSubmit}
                className="space-y-4 w-full max-w-2xl mx-auto bg-background rounded-lg shadow-lg p-6"
                style={{ maxHeight: 600, overflowY: "auto" }}
            >
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="district">District</Label>
                        <Select
                            value={formData.district}
                            onValueChange={(value) => handleSelectChange("district", value)}
                            disabled={isDistrictsLoading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={isDistrictsLoading ? "Loading..." : "Select district"} />
                            </SelectTrigger>
                            <SelectContent>
                                {districts.map((d: any) => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="sourceType">Source Type</Label>
                        <Select
                            value={formData.sourceType}
                            onValueChange={(value) => handleSelectChange("sourceType", value)}
                            disabled={isSourceTypesLoading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={isSourceTypesLoading ? "Loading..." : "Select source type"} />
                            </SelectTrigger>
                            <SelectContent>
                                {sourceTypes.map((type: any) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="month">Month</Label>
                        <Select
                            value={formData.month}
                            onValueChange={(value) => handleSelectChange("month", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">January</SelectItem>
                                <SelectItem value="2">February</SelectItem>
                                <SelectItem value="3">March</SelectItem>
                                <SelectItem value="4">April</SelectItem>
                                <SelectItem value="5">May</SelectItem>
                                <SelectItem value="6">June</SelectItem>
                                <SelectItem value="7">July</SelectItem>
                                <SelectItem value="8">August</SelectItem>
                                <SelectItem value="9">September</SelectItem>
                                <SelectItem value="10">October</SelectItem>
                                <SelectItem value="11">November</SelectItem>
                                <SelectItem value="12">December</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="year">Year</Label>
                        <Input
                            id="year"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            type="number"
                            min="2000"
                            max="2100"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="crimeCount">Number of Crimes</Label>
                        <Input
                            id="crimeCount"
                            name="crimeCount"
                            value={formData.crimeCount}
                            onChange={handleChange}
                            type="number"
                            min="0"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="crimesCleared">Crimes Cleared</Label>
                        <Input
                            id="crimesCleared"
                            name="crimesCleared"
                            value={formData.crimesCleared}
                            onChange={handleChange}
                            type="number"
                            min="0"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="level">Crime Level</Label>
                        <Select
                            value={formData.level}
                            onValueChange={(value) => handleSelectChange("level", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="method">Data Collection Method</Label>
                        <Select
                            value={formData.method}
                            onValueChange={(value) => handleSelectChange("method", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="manual">Manual</SelectItem>
                                <SelectItem value="automated">Automated</SelectItem>
                                <SelectItem value="import">Data Import</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Create Crime Summary</Button>
                </div>
            </form>
        </div>
    );
}
