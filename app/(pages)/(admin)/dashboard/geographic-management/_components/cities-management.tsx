"use client";

import { useState } from "react";
import { useGetCities, useCreateCity, useUpdateCity, useDeleteCity } from "../_queries/queries";
import { DataTable } from "@/app/_components/data-table";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/_components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/app/_components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, MoreHorizontal, Building } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/_components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";

export default function CitiesManagement() {
    const { data: cities = [], isLoading } = useGetCities();
    const createCityMutation = useCreateCity();
    const updateCityMutation = useUpdateCity();
    const deleteCityMutation = useDeleteCity();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editCity, setEditCity] = useState<any>(null);
    const [deleteCity, setDeleteCity] = useState<any>(null);
    const [searchText, setSearchText] = useState("");
    const [selectedCity, setSelectedCity] = useState<any>(null);
    const [isDetailsView, setIsDetailsView] = useState(false);

    // Form state for creating/editing
    const [form, setForm] = useState({
        id: "",
        name: "",
    });

    // Filter cities based on search
    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(searchText.toLowerCase()) ||
        city.id.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }: any) => <div className="font-mono text-xs">{row.getValue("id")}</div>
        },
        {
            accessorKey: "name",
            header: "City Name",
            cell: ({ row }: any) => <div className="font-medium">{row.getValue("name")}</div>
        },
        {
            id: "districts",
            header: "Districts",
            cell: ({ row }: any) => {
                const districtsCount = row.original.districts?.length || 0;
                return <div className="text-muted-foreground">{districtsCount} districts</div>
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
                                setSelectedCity(row.original);
                                setIsDetailsView(true);
                            }}
                        >
                            <Building className="w-4 h-4 mr-2" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                setEditCity(row.original);
                                setForm({
                                    id: row.original.id,
                                    name: row.original.name,
                                });
                                setIsDialogOpen(true);
                            }}
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                setDeleteCity(row.original);
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

    const handleCreateCity = () => {
        setEditCity(null);
        setForm({ id: "", name: "" });
        setIsDialogOpen(true);
    };

    const handleBackToList = () => {
        setIsDetailsView(false);
        setSelectedCity(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editCity) {
                await updateCityMutation.mutateAsync({
                    id: editCity.id,
                    data: { name: form.name }
                });
                toast.success(`City "${form.name}" updated successfully`);
            } else {
                await createCityMutation.mutateAsync(form);
                toast.success(`City "${form.name}" created successfully`);
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        }
    };

    const handleDelete = async () => {
        if (!deleteCity) return;

        try {
            await deleteCityMutation.mutateAsync(deleteCity.id);
            toast.success(`City "${deleteCity.name}" deleted successfully`);
            setIsDeleteDialogOpen(false);
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        }
    };

    if (isDetailsView && selectedCity) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        {selectedCity.name}
                    </h2>
                    <Button variant="outline" onClick={handleBackToList}>
                        Back to Cities
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">City Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">City ID</p>
                                <p className="font-mono">{selectedCity.id}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Created</p>
                                <p>{selectedCity.created_at ? new Date(selectedCity.created_at).toLocaleDateString() : "Unknown"}</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <h3 className="text-sm font-semibold mb-2">Districts</h3>
                            {selectedCity.districts && selectedCity.districts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {selectedCity.districts.map((district: any) => (
                                        <Badge key={district.id} variant="outline" className="py-1 px-2 justify-start">
                                            {district.name}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No districts in this city</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Cities</h2>
                <div className="flex items-center space-x-4">
                    <div className="w-64">
                        <Input
                            placeholder="Search cities..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleCreateCity}>
                        <Plus className="w-4 h-4 mr-2" /> Add City
                    </Button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredCities}
                loading={isLoading}
                pageSize={10}
            />

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editCity ? "Edit City" : "Add City"}</DialogTitle>
                        <DialogDescription>
                            {editCity
                                ? "Update the city information"
                                : "Add a new city to the system"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!editCity && (
                            <div className="space-y-2">
                                <Label htmlFor="id">City ID</Label>
                                <Input
                                    id="id"
                                    placeholder="City ID (e.g., 3509)"
                                    value={form.id}
                                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                                    required
                                    disabled={!!editCity}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="City Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createCityMutation.isPending || updateCityMutation.isPending}>
                                {createCityMutation.isPending || updateCityMutation.isPending ? (
                                    "Saving..."
                                ) : (
                                    editCity ? "Save Changes" : "Create City"
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
                        <AlertDialogTitle>Delete City</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the city "{deleteCity?.name}"?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteCityMutation.isPending}
                        >
                            {deleteCityMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
