"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { AlertCircle, CheckCircle, RefreshCw, Trash2 } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select";
import { useToast } from "@/app/_hooks/use-toast";
import { useGetAvailableYears } from "../crime-overview/_queries/queries";
import { runCleanup, runClusterMigration } from "./_actions";
import { AlertDialog, AlertDialogDescription, AlertDialogTitle } from "@/app/_components/ui/alert-dialog";


export default function ClusterMigrationPage() {
    const { toast } = useToast();
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<string>("all");
    const [isLoading, setIsLoading] = useState(false);
    const [migrationResult, setMigrationResult] = useState<any>(null);

    const { data: availableYears, isLoading: isLoadingYears } = useGetAvailableYears();

    const months = [
        { value: "1", label: "January" },
        { value: "2", label: "February" },
        { value: "3", label: "March" },
        { value: "4", label: "April" },
        { value: "5", label: "May" },
        { value: "6", label: "June" },
        { value: "7", label: "July" },
        { value: "8", label: "August" },
        { value: "9", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
        { value: "all", label: "Entire Year" },
    ];

    // Run migration
    const handleRunMigration = async () => {
        setIsLoading(true);
        try {
            const result = await runClusterMigration(year, month === "all" ? undefined : parseInt(month));
            setMigrationResult(result);
            toast({
                title: "Migration Complete",
                description: `Migrated ${result.migrated} clusters, generated ${result.incidents} incidents`,
            });
        } catch (error) {
            toast({

                title: "Migration Failed",
                description: (error as Error).message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Run cleanup
    const handleRunCleanup = async () => {
        setIsLoading(true);
        try {
            const result = await runCleanup();
            setMigrationResult(result);
            toast({
                title: "Cleanup Complete",
                description: `Deleted ${result.deletedClusters} clusters and ${result.deletedUpdates} updates`,
            });
        } catch (error) {
            toast({

                title: "Cleanup Failed",
                description: (error as Error).message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container py-6">
            <h1 className="text-2xl font-bold mb-6">Cluster Data Migration</h1>

            <div className="grid gap-6">
                <AlertDialog>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDialogTitle>About Cluster Migration</AlertDialogTitle>
                    <AlertDialogDescription>
                        This tool allows you to migrate finalized cluster data to the historical crimes database.
                        Clusters that haven't been updated for a certain period are considered finalized and ready for migration.
                    </AlertDialogDescription>
                </AlertDialog>

                <Tabs defaultValue="migrate">
                    <TabsList className="mb-4">
                        <TabsTrigger value="migrate">Migrate Clusters</TabsTrigger>
                        <TabsTrigger value="cleanup">Cleanup Old Data</TabsTrigger>
                    </TabsList>

                    <TabsContent value="migrate">
                        <Card>
                            <CardHeader>
                                <CardTitle>Migrate Cluster Data</CardTitle>
                                <CardDescription>
                                    Convert finalized cluster data to crimes and incidents for historical storage
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="year">Year</Label>
                                            <Select
                                                value={year.toString()}
                                                onValueChange={(value) => setYear(parseInt(value))}
                                                disabled={isLoading}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableYears?.map((y) => y !== null && (
                                                        <SelectItem key={y} value={y.toString()}>
                                                            {y}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="month">Month</Label>
                                            <Select
                                                value={month}
                                                onValueChange={setMonth}
                                                disabled={isLoading}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Month" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {months.map((m) => (
                                                        <SelectItem key={m.value} value={m.value}>
                                                            {m.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {migrationResult && (
                                        <AlertDialog >
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <AlertDialogTitle>Migration Result</AlertDialogTitle>
                                            <AlertDialogDescription className="space-y-1">
                                                <p>Migrated {migrationResult.migrated} clusters to crimes table</p>
                                                <p>Generated {migrationResult.incidents} crime incidents</p>
                                            </AlertDialogDescription>
                                        </AlertDialog>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    onClick={handleRunMigration}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Migrating...
                                        </>
                                    ) : (
                                        "Run Migration"
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="cleanup">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cleanup Old Cluster Data</CardTitle>
                                <CardDescription>
                                    Remove old cluster data that has already been migrated to historical tables
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-amber-600">
                                        This action will remove old cluster data that has already been migrated to the crimes table.
                                        Only data older than the retention period will be removed.
                                    </p>

                                    {migrationResult && (
                                        <AlertCircle className="bg-green-50 border-green-200">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <AlertDialogTitle>Cleanup Result</AlertDialogTitle>
                                            <AlertDialogDescription className="space-y-1">
                                                <p>Deleted {migrationResult.deletedClusters} old clusters</p>
                                                <p>Deleted {migrationResult.deletedUpdates} old update logs</p>
                                            </AlertDialogDescription>
                                        </AlertCircle>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    variant="destructive"
                                    onClick={handleRunCleanup}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Cleaning up...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Run Cleanup
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
