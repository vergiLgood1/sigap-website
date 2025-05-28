"use client";

import { useState } from "react";
import { useGetDistricts, useCreateDistrict, useUpdateDistrict, useDeleteDistrict } from "../_queries/queries";
import { DataTable } from "@/app/_components/data-table";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/_components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/app/_components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, MoreHorizontal, MapPin, MapPinned, Users, Map } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/app/_components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/_components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select";
import { useGetCities } from "../_queries/queries";
import DistrictDetails from "./district-details";


export default function DistrictsManagement() {
    const { data: districts = [], isLoading } = useGetDistricts();
    const { data: cities = [] } = useGetCities();
    const createDistrictMutation = useCreateDistrict();
    const updateDistrictMutation = useUpdateDistrict();
    const deleteDistrictMutation = useDeleteDistrict();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
    const [editDistrict, setEditDistrict] = useState<any>(null);
    const [deleteDistrict, setDeleteDistrict] = useState<any>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [searchText, setSearchText] = useState("");

    // Form state for creating/editing
    const [form, setForm] = useState({
        id: "",
        name: "",
        city_id: "",
    });

    // Filter districts based on search
    const filteredDistricts = districts.filter(district =>
        district.name.toLowerCase().includes(searchText.toLowerCase()) ||
        district.id.toLowerCase().includes(searchText.toLowerCase()) ||
        district.cities?.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }: any) => <div className="font-mono text-xs">{row.getValue("id")}</div>
        },
        {
            accessorKey: "name",
            header: "District Name",
            cell: ({ row }: any) => <div className="font-medium">{row.getValue("name")}</div>
        },
        {
            accessorKey: "cities.name",
            header: "City",
            cell: ({ row }: any) => <div>{row.original.cities?.name || "-"}</div>
        },
        {
            id: "geo",
            header: "Geographic Data",
            cell: ({ row }: any) => {
                const geoCount = row.original.geographics?.length || 0;
                return <div className="text-muted-foreground">{geoCount} records</div>
            }
        },
        {
            id: "demo",
            header: "Demographics",
            cell: ({ row }: any) => {
                const demoCount = row.original.demographics?.length || 0;
                return <div className="text-muted-foreground">{demoCount} records</div>
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }: any) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => {
                                setSelectedDistrict(row.original.id);
                                setIsDetailsSheetOpen(true);
                            }}
                        >
                            <MapPin className="w-4 h-4 mr-2" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                setEditDistrict(row.original);
                                setForm({
                                    id: row.original.id,
                                    name: row.original.name,
                                    city_id: row.original.city_id,
                                });
                                setIsDialogOpen(true);
                            }}
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                setDeleteDistrict(row.original);
                                setIsDeleteDialogOpen(true);
                            }}
                            className="text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const handleCreateDistrict = () => {
        setEditDistrict(null);
        setForm({ id: "", name: "", city_id: "" });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editDistrict) {
                await updateDistrictMutation.mutateAsync({
                    id: editDistrict.id,
                    data: { name: form.name, city_id: form.city_id }
                });
                toast.success(`District "${form.name}" updated successfully`);
            } else {
                await createDistrictMutation.mutateAsync(form);
                toast.success(`District "${form.name}" created successfully`);
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        }
    };

    const handleDelete = async () => {
        if (!deleteDistrict) return;

        try {
            await deleteDistrictMutation.mutateAsync(deleteDistrict.id);
            toast.success(`District "${deleteDistrict.name}" deleted successfully`);
            setIsDeleteDialogOpen(false);
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Districts</h2>
                <div className="flex items-center space-x-4">
                    <div className="w-64">
                        <Input
                            placeholder="Search districts..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleCreateDistrict}>
                        <Plus className="w-4 h-4 mr-2" /> Add District
                    </Button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredDistricts}
                loading={isLoading}
                pageSize={10}
            />

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editDistrict ? "Edit District" : "Add District"}</DialogTitle>
                        <DialogDescription>
                            {editDistrict
                                ? "Update the district information"
                                : "Add a new district to the system"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!editDistrict && (
                            <div className="space-y-2">
                                <Label htmlFor="id">District ID</Label>
                                <Input
                                    id="id"
                                    placeholder="District ID (e.g., 350901)"
                                    value={form.id}
                                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                                    required
                                    disabled={!!editDistrict}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="District Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Select
                                value={form.city_id}
                                onValueChange={(value) => setForm({ ...form, city_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a city" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cities.map((city) => (
                                        <SelectItem key={city.id} value={city.id}>
                                            {city.name} ({city.id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createDistrictMutation.isPending || updateDistrictMutation.isPending}>
                                {createDistrictMutation.isPending || updateDistrictMutation.isPending ? (
                                    "Saving..."
                                ) : (
                                    editDistrict ? "Save Changes" : "Create District"
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete District</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the district "{deleteDistrict?.name}"?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteDistrictMutation.isPending}
                        >
                            {deleteDistrictMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* District Details Sheet */}
            <Sheet open={isDetailsSheetOpen} onOpenChange={setIsDetailsSheetOpen}>
                <SheetContent className="sm:max-w-xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="flex items-center">
                            <MapPinned className="w-5 h-5 mr-2" />
                            District Details
                        </SheetTitle>
                        <SheetDescription>
                            View and manage district geographic and demographic data
                        </SheetDescription>
                    </SheetHeader>

                    {selectedDistrict && (
                        <DistrictDetails
                            districtId={selectedDistrict}
                            onClose={() => setIsDetailsSheetOpen(false)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
