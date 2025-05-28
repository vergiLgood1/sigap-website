"use client";

import { useState, useEffect } from "react";
import { useGetDistrictById, useCreateGeographic, useDeleteGeographic, useCreateDemographic, useUpdateDemographic, useDeleteDemographic } from "../_queries/queries";
import { Button } from "@/app/_components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/_components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/app/_components/ui/alert-dialog";
import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";
import { MapPin, Plus, Trash2, PieChart, Map, BarChart3, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/app/_components/ui/badge";
import { Separator } from "@/app/_components/ui/separator";

// Simple map component to show geographic coordinates
function SimpleMapDisplay({ lat, lng }: { lat: number; lng: number }) {
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="bg-muted h-36 w-full rounded-md flex items-center justify-center mb-2 relative">
                <div className="text-center text-muted-foreground text-sm">
                    <MapPin className="h-10 w-10 mx-auto mb-1 text-primary" />
                    <p>Map Preview</p>
                    <p className="mt-1 text-xs">Latitude: {lat.toFixed(6)}</p>
                    <p className="text-xs">Longitude: {lng.toFixed(6)}</p>
                </div>
            </div>
        </div>
    );
}

export default function DistrictDetails({ districtId, onClose }: { districtId: string; onClose: () => void }) {
    const { data: district, isLoading } = useGetDistrictById(districtId);
    const createGeographicMutation = useCreateGeographic();
    const deleteGeographicMutation = useDeleteGeographic();
    const createDemographicMutation = useCreateDemographic();
    const updateDemographicMutation = useUpdateDemographic();
    const deleteDemographicMutation = useDeleteDemographic();

    const [isGeoDialogOpen, setIsGeoDialogOpen] = useState(false);
    const [isDemoDialogOpen, setIsDemoDialogOpen] = useState(false);
    const [isDeleteGeoDialogOpen, setIsDeleteGeoDialogOpen] = useState(false);
    const [isDeleteDemoDialogOpen, setIsDeleteDemoDialogOpen] = useState(false);
    const [editDemographic, setEditDemographic] = useState<any>(null);
    const [selectedGeographic, setSelectedGeographic] = useState<any>(null);
    const [selectedDemographic, setSelectedDemographic] = useState<any>(null);

    // Form states
    const [geoForm, setGeoForm] = useState({
        district_id: districtId,
        address: "",
        latitude: 0,
        longitude: 0,
        land_area: 0,
        description: "",
        type: "district location",
        year: new Date().getFullYear(),
    });

    const [demoForm, setDemoForm] = useState({
        district_id: districtId,
        population: 0,
        number_of_unemployed: 0,
        population_density: 0,
        year: new Date().getFullYear(),
    });

    // Reset forms when district changes
    useEffect(() => {
        setGeoForm((prev) => ({ ...prev, district_id: districtId }));
        setDemoForm((prev) => ({ ...prev, district_id: districtId }));
    }, [districtId]);

    if (isLoading) {
        return <div className="py-8 text-center">Loading district data...</div>;
    }

    if (!district) {
        return <div className="py-8 text-center">District not found</div>;
    }

    const handleCreateGeographic = () => {
        setIsGeoDialogOpen(true);
    };

    const handleCreateDemographic = () => {
        setEditDemographic(null);
        setDemoForm({
            district_id: districtId,
            population: 0,
            number_of_unemployed: 0,
            population_density: 0,
            year: new Date().getFullYear(),
        });
        setIsDemoDialogOpen(true);
    };

    const handleEditDemographic = (demographic: any) => {
        setEditDemographic(demographic);
        setDemoForm({
            district_id: districtId,
            population: demographic.population,
            number_of_unemployed: demographic.number_of_unemployed,
            population_density: demographic.population_density,
            year: demographic.year,
        });
        setIsDemoDialogOpen(true);
    };

    const handleDeleteGeographic = (geo: any) => {
        setSelectedGeographic(geo);
        setIsDeleteGeoDialogOpen(true);
    };

    const handleDeleteDemographic = (demo: any) => {
        setSelectedDemographic(demo);
        setIsDeleteDemoDialogOpen(true);
    };

    const handleGeoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createGeographicMutation.mutateAsync({
                district_id: districtId,
                address: geoForm.address,
                longitude: parseFloat(geoForm.longitude.toString()),
                latitude: parseFloat(geoForm.latitude.toString()),
                land_area: parseFloat(geoForm.land_area.toString()),
                description: geoForm.description,
                type: geoForm.type,
                year: parseInt(geoForm.year.toString()),
            });

            toast.success("Geographic data created successfully");
            setIsGeoDialogOpen(false);
            setGeoForm({
                district_id: districtId,
                address: "",
                latitude: 0,
                longitude: 0,
                land_area: 0,
                description: "",
                type: "district location",
                year: new Date().getFullYear(),
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to create geographic data");
        }
    };

    const handleDemoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editDemographic) {
                await updateDemographicMutation.mutateAsync({
                    id: editDemographic.id,
                    data: {
                        population: parseInt(demoForm.population.toString()),
                        number_of_unemployed: parseInt(demoForm.number_of_unemployed.toString()),
                        population_density: parseFloat(demoForm.population_density.toString()),
                    },
                    districtId,
                });

                toast.success("Demographic data updated successfully");
            } else {
                await createDemographicMutation.mutateAsync({
                    district_id: districtId,
                    population: parseInt(demoForm.population.toString()),
                    number_of_unemployed: parseInt(demoForm.number_of_unemployed.toString()),
                    population_density: parseFloat(demoForm.population_density.toString()),
                    year: parseInt(demoForm.year.toString()),
                });

                toast.success("Demographic data created successfully");
            }

            setIsDemoDialogOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to save demographic data");
        }
    };

    const handleConfirmDeleteGeo = async () => {
        if (!selectedGeographic) return;

        try {
            await deleteGeographicMutation.mutateAsync(selectedGeographic.id);
            toast.success("Geographic data deleted successfully");
            setIsDeleteGeoDialogOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete geographic data");
        }
    };

    const handleConfirmDeleteDemo = async () => {
        if (!selectedDemographic) return;

        try {
            await deleteDemographicMutation.mutateAsync({
                id: selectedDemographic.id,
                districtId,
            });

            toast.success("Demographic data deleted successfully");
            setIsDeleteDemoDialogOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete demographic data");
        }
    };

    // Calculate demographic statistics
    const latestDemographic = district.demographics?.length > 0
        ? [...district.demographics].sort((a, b) => b.year - a.year)[0]
        : null;

    const yearsWithData = Array.from(new Set(district.demographics?.map(d => d.year) || [])).sort((a, b) => b - a);

    return (
        <div className="space-y-6 py-4">
            <div>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold">{district.name}</h3>
                        <p className="text-muted-foreground">ID: {district.id}</p>
                        <div className="mt-1">
                            <Badge variant="outline">City: {district.cities?.name}</Badge>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            <Tabs defaultValue="geographic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="geographic" className="flex gap-1 items-center">
                        <MapPin className="w-4 h-4" /> Geographic
                    </TabsTrigger>
                    <TabsTrigger value="demographic" className="flex gap-1 items-center">
                        <BarChart3 className="w-4 h-4" /> Demographic
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="geographic" className="space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm">Geographic Data</h4>
                        <Button size="sm" onClick={handleCreateGeographic}>
                            <Plus className="h-4 w-4 mr-1" /> Add Location
                        </Button>
                    </div>

                    {district.geographics?.length === 0 ? (
                        <div className="text-center p-4 border rounded-md bg-muted/30">
                            <Map className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">No geographic data available for this district.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {district.geographics?.map((geo: any) => (
                                <Card key={geo.id} className="overflow-hidden">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-sm font-medium">{geo.type || "Location"}</CardTitle>
                                                <CardDescription className="text-xs truncate max-w-[250px]">
                                                    {geo.address || "Address not specified"}
                                                </CardDescription>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleDeleteGeographic(geo)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <SimpleMapDisplay lat={geo.latitude} lng={geo.longitude} />
                                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                                            <div>Land Area: {geo.land_area ? `${geo.land_area} km²` : "Not specified"}</div>
                                            <div>Year: {geo.year || "Not specified"}</div>
                                        </div>
                                    </CardContent>
                                    {geo.description && (
                                        <CardFooter className="pt-0 pb-3 px-4 text-xs">
                                            <p className="text-muted-foreground">{geo.description}</p>
                                        </CardFooter>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="demographic" className="space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm">Demographic Data</h4>
                        <Button size="sm" onClick={handleCreateDemographic}>
                            <Plus className="h-4 w-4 mr-1" /> Add Demographics
                        </Button>
                    </div>

                    {latestDemographic && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">
                                    Latest Demographics ({latestDemographic.year})
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Most recent population data for this district
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold">{latestDemographic.population.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">Total Population</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold">{latestDemographic.number_of_unemployed.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">Unemployed</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold">{latestDemographic.population_density.toFixed(1)}</p>
                                        <p className="text-xs text-muted-foreground">People per km²</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {district.demographics?.length === 0 ? (
                        <div className="text-center p-4 border rounded-md bg-muted/30">
                            <PieChart className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">No demographic data available for this district.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {yearsWithData.map(year => (
                                <Card key={year}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-sm font-medium">
                                                {year} Demographics
                                            </CardTitle>
                                            <div className="flex gap-2">
                                                {district.demographics
                                                    .filter(d => d.year === year)
                                                    .map(demo => (
                                                        <div key={demo.id} className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() => handleEditDemographic(demo)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() => handleDeleteDemographic(demo)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        {district.demographics
                                            .filter(d => d.year === year)
                                            .map(demo => (
                                                <div key={demo.id} className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Population</p>
                                                        <p>{demo.population.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Unemployed</p>
                                                        <p>{demo.number_of_unemployed.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Density (per km²)</p>
                                                        <p>{demo.population_density.toFixed(1)}</p>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Geographic Form Dialog */}
            <Dialog open={isGeoDialogOpen} onOpenChange={setIsGeoDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Geographic Data</DialogTitle>
                        <DialogDescription>
                            Add location details for this district
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleGeoSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                placeholder="Full address"
                                value={geoForm.address}
                                onChange={(e) => setGeoForm({ ...geoForm, address: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input
                                    id="latitude"
                                    type="number"
                                    step="any"
                                    placeholder="Latitude"
                                    value={geoForm.latitude}
                                    onChange={(e) => setGeoForm({ ...geoForm, latitude: parseFloat(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input
                                    id="longitude"
                                    type="number"
                                    step="any"
                                    placeholder="Longitude"
                                    value={geoForm.longitude}
                                    onChange={(e) => setGeoForm({ ...geoForm, longitude: parseFloat(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="land_area">Land Area (km²)</Label>
                                <Input
                                    id="land_area"
                                    type="number"
                                    step="any"
                                    placeholder="Land Area"
                                    value={geoForm.land_area}
                                    onChange={(e) => setGeoForm({ ...geoForm, land_area: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year">Year</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    placeholder="Year"
                                    value={geoForm.year}
                                    onChange={(e) => setGeoForm({ ...geoForm, year: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Input
                                id="type"
                                placeholder="Type (e.g., district location, boundary)"
                                value={geoForm.type}
                                onChange={(e) => setGeoForm({ ...geoForm, type: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Description"
                                value={geoForm.description}
                                onChange={(e) => setGeoForm({ ...geoForm, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsGeoDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createGeographicMutation.isPending}>
                                {createGeographicMutation.isPending ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Demographic Form Dialog */}
            <Dialog open={isDemoDialogOpen} onOpenChange={setIsDemoDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editDemographic ? "Edit Demographic Data" : "Add Demographic Data"}</DialogTitle>
                        <DialogDescription>
                            {editDemographic ? "Update demographic information" : "Add population details for this district"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleDemoSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="population">Population</Label>
                            <Input
                                id="population"
                                type="number"
                                placeholder="Total population"
                                value={demoForm.population}
                                onChange={(e) => setDemoForm({ ...demoForm, population: parseInt(e.target.value) })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unemployed">Number of Unemployed</Label>
                            <Input
                                id="unemployed"
                                type="number"
                                placeholder="Number of unemployed people"
                                value={demoForm.number_of_unemployed}
                                onChange={(e) => setDemoForm({ ...demoForm, number_of_unemployed: parseInt(e.target.value) })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="density">Population Density (per km²)</Label>
                            <Input
                                id="density"
                                type="number"
                                step="any"
                                placeholder="Population per square kilometer"
                                value={demoForm.population_density}
                                onChange={(e) => setDemoForm({ ...demoForm, population_density: parseFloat(e.target.value) })}
                                required
                            />
                        </div>

                        {!editDemographic && (
                            <div className="space-y-2">
                                <Label htmlFor="demo-year">Year</Label>
                                <Input
                                    id="demo-year"
                                    type="number"
                                    placeholder="Year"
                                    value={demoForm.year}
                                    onChange={(e) => setDemoForm({ ...demoForm, year: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDemoDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createDemographicMutation.isPending || updateDemographicMutation.isPending}
                            >
                                {createDemographicMutation.isPending || updateDemographicMutation.isPending
                                    ? "Saving..."
                                    : "Save"
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Geographic Dialog */}
            <AlertDialog open={isDeleteGeoDialogOpen} onOpenChange={setIsDeleteGeoDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Geographic Data</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this geographic data? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDeleteGeo}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteGeographicMutation.isPending}
                        >
                            {deleteGeographicMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Demographic Dialog */}
            <AlertDialog open={isDeleteDemoDialogOpen} onOpenChange={setIsDeleteDemoDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Demographic Data</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete demographic data for {selectedDemographic?.year}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDeleteDemo}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteDemographicMutation.isPending}
                        >
                            {deleteDemographicMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
