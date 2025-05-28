"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { Card } from "@/app/_components/ui/card";
import DistrictsManagement from './_components/districts-management';

import { MapPinned, Building, Map, Database, PieChart } from "lucide-react";
import CitiesManagement from "./_components/cities-management";

export default function GeographicManagementPage() {
    return (
        <div className="container py-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Geographic Management</h1>
                <p className="text-muted-foreground">Manage cities, districts, and related data</p>
            </div>

            <Tabs defaultValue="districts" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="districts" className="flex gap-2 items-center">
                        <MapPinned className="h-4 w-4" />
                        Districts
                    </TabsTrigger>
                    <TabsTrigger value="cities" className="flex gap-2 items-center">
                        <Building className="h-4 w-4" />
                        Cities
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="districts" className="space-y-4">
                    <Card className="p-4">
                        <DistrictsManagement />
                    </Card>
                </TabsContent>

                <TabsContent value="cities" className="space-y-4">
                    <Card className="p-4">
                        <CitiesManagement />
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
