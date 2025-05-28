"use client"

import { useCallback, useState } from "react";
import CaseHeader from "../case-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { Calendar, FileText, MessageSquare, Paperclip, Shield, User, ArrowLeft, MoreHorizontal, Circle, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/_components/ui/dropdown-menu";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useGetCrimeIncidentDetail } from "../../_queries/queries";
import CaseAssignees from "../case-assignees";
import CaseTimeline from "../case-timeline";

// Placeholder components for empty state
function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <span className="text-2xl mb-2">🗂️</span>
            <div className="font-medium mb-1">No {label} available</div>
            <div className="text-sm">No {label.toLowerCase()} found for this case.</div>
        </div>
    );
}

// Type definitions for CRUD operations
type CrudOperation = "create" | "update" | "delete" | null;
type ActiveTab = "timeline" | "evidence" | "witnesses" | "documents" | "notes";

export function CrimeIncidentDetail({ id }: { id: string }) {
    const { data: incident, isLoading, error, refetch } = useGetCrimeIncidentDetail(id);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<ActiveTab>("timeline");
    const [crudOperation, setCrudOperation] = useState<CrudOperation>(null);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    // Evidence, Witnesses, Documents from incident logs
    const incidentLogs = Array.isArray(incident?.incident_logs)
        ? incident?.incident_logs[0]
        : incident?.incident_logs;

    const evidence = incidentLogs?.evidence ?? [];
    const witnesses = incidentLogs?.witnesses ?? [];
    // Documents are evidence items with type 'document'
    const documents = evidence.filter((item: any) => item.type === "document");

    // Timeline always starts with case opened
    const timeline = [
        {
            date: "Apr 15, 2023",
            time: "23:10",
            title: "Case Opened",
            description: "Officers responded to 911 call. Victim found deceased at the scene.",
            user: "James Rodriguez",
            role: "Patrol Officer",
        },
        // ...add more timeline events if available in incident?...
    ];

    // CRUD operation handlers
    const handleCreate = useCallback(() => {
        setCrudOperation("create");
        setSelectedItemId(null);
    }, []);

    const handleUpdate = useCallback((itemId: string) => {
        setCrudOperation("update");
        setSelectedItemId(itemId);
    }, []);

    const handleDelete = useCallback((itemId: string) => {
        if (confirm("Are you sure you want to delete this item?")) {
            setCrudOperation("delete");
            // Here you would call the appropriate delete action based on the active tab
            // For example: deleteEvidenceItem(itemId), deleteWitness(itemId), etc.
            // After deletion is complete:
            refetch();
        }
    }, [refetch]);

    const handleCancel = useCallback(() => {
        setCrudOperation(null);
        setSelectedItemId(null);
    }, []);

    const handleSubmit = useCallback(() => {
        // Here you would submit the form data to the appropriate action
        // For example: createEvidence(formData), updateWitness(selectedItemId, formData), etc.
        // After submission is complete:
        setCrudOperation(null);
        setSelectedItemId(null);
        refetch();
    }, [selectedItemId, refetch]);

    // Rendering helpers for CRUD UI
    const renderCrudHeader = (title: string) => (
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Button
                onClick={handleCreate}
                variant="outline"
                size="sm"
                className="text-sm flex items-center gap-1"
            >
                <Plus size={14} /> Add
            </Button>
        </div>
    );

    const renderItemActions = (itemId: string) => (
        <div className="flex gap-1">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                    e.stopPropagation();
                    handleUpdate(itemId);
                }}
            >
                <Pencil size={14} />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(itemId);
                }}
            >
                <Trash2 size={14} />
            </Button>
        </div>
    );

    return (
        <div className="space-y-6 p-6">
            {/* Back and Actions */}
            <div className="flex items-center justify-between gap-2 mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/dashboard/crime-management/crime-incident?")}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Back to Crime Incident?s
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/crime-management/crime-incident?/${id}?type=crime-incident?&action=update`)}>
                            Update
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert(`Delete Crime Incident?: ${id}`)} className="text-destructive">
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <CaseHeader
                caseId={incident?.id || ""}
                title={`${incident?.crime_categories?.name || "Unknown"} - ${incident?.locations?.districts?.name || "Unknown Location"}`}
                status={incident?.status || "unknown"}
                priority={incident?.crimes?.level || "medium"}
                dateOpened={incident?.created_at ? new Date(incident?.created_at).toLocaleDateString() : 'N/A'}
                lastUpdated={incident?.updated_at ? new Date(incident?.updated_at).toLocaleDateString() : 'N/A'}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Tabs
                        defaultValue="timeline"
                        className="w-full"
                        onValueChange={(value) => setActiveTab(value as ActiveTab)}
                    >
                        <TabsList className="grid grid-cols-5 mb-4">
                            <TabsTrigger value="timeline">
                                <Calendar className="h-4 w-4 mr-2" />
                                Timeline
                            </TabsTrigger>
                            <TabsTrigger value="evidence">
                                <Paperclip className="h-4 w-4 mr-2" />
                                Evidence
                            </TabsTrigger>
                            <TabsTrigger value="witnesses">
                                <User className="h-4 w-4 mr-2" />
                                Witnesses
                            </TabsTrigger>
                            <TabsTrigger value="documents">
                                <FileText className="h-4 w-4 mr-2" />
                                Documents
                            </TabsTrigger>
                            <TabsTrigger value="notes">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Notes
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="timeline" className="border rounded-lg p-4">
                            <div className="space-y-6">
                                {renderCrudHeader("Case Timeline")}

                                {/* Display timeline or form based on CRUD operation */}
                                {crudOperation ? (
                                    <div className="border p-4 rounded-md">
                                        <h4 className="font-medium mb-4">
                                            {crudOperation === "create" ? "Add New Event" : "Edit Event"}
                                        </h4>
                                        {/* Timeline event form would go here */}
                                        <div className="flex justify-end gap-2 mt-4">
                                            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                                            <Button onClick={handleSubmit}>Save</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {timeline.map((event, index) => (
                                            <div key={index} className="mb-8 relative pl-6">
                                                {/* Timeline connector */}
                                                {index < timeline.length - 1 && (
                                                    <div className="absolute left-[0.4375rem] top-3 bottom-0 w-0.5 bg-muted" />
                                                )}

                                                {/* Timeline dot */}
                                                <div className="absolute left-0 top-1">
                                                    <Circle className="h-3.5 w-3.5 fill-primary text-primary" />
                                                </div>

                                                <div className="flex items-start justify-between">
                                                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 flex-1">
                                                        <div className="min-w-[140px] text-sm text-muted-foreground">
                                                            <div>{event.date}</div>
                                                            <div>{event.time}</div>
                                                        </div>

                                                        <div className="bg-muted/50 rounded-lg p-3 flex-1">
                                                            <h4 className="font-medium">{event.title}</h4>
                                                            <p className="text-sm mt-1">{event.description}</p>
                                                            <div className="text-xs text-muted-foreground mt-2">
                                                                Added by {event.user} ({event.role})
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {renderItemActions(`timeline-${index}`)}
                                                </div>
                                            </div>
                                        ))}
                                        </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="evidence" className="border rounded-lg p-4">
                            {renderCrudHeader("Evidence Items")}

                            {crudOperation ? (
                                <div className="border p-4 rounded-md">
                                    <h4 className="font-medium mb-4">
                                        {crudOperation === "create" ? "Add New Evidence" : "Edit Evidence"}
                                    </h4>
                                    {/* Evidence form would go here */}
                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                                        <Button onClick={handleSubmit}>Save</Button>
                                    </div>
                                </div>
                            ) : evidence.length === 0 ? (
                                <EmptyState label="Evidence" />
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {evidence.map((item: any) => (
                                        <div key={item.id} className="group cursor-pointer relative">
                                            <div className="absolute top-2 right-2 z-10 bg-black/50 rounded p-1">
                                                {renderItemActions(item.id)}
                                            </div>
                                            <div className="aspect-square rounded-md overflow-hidden bg-muted flex items-center justify-center border">
                                                {item.type === 'image' ? (
                                                    <img
                                                        src={item.url}
                                                        alt={item.caption || "Evidence"}
                                                        className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center p-4">
                                                        <FileText size={32} className="text-muted-foreground mb-2" />
                                                        <span className="text-xs text-center">{item.type}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {item.caption && (
                                                <div className="mt-2">
                                                    <span className="text-xs truncate block">{item.caption}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="witnesses" className="border rounded-lg p-4">
                            {renderCrudHeader("Witnesses")}

                            {crudOperation ? (
                                <div className="border p-4 rounded-md">
                                    <h4 className="font-medium mb-4">
                                        {crudOperation === "create" ? "Add New Witness" : "Edit Witness"}
                                    </h4>
                                    {/* Witness form would go here */}
                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                                        <Button onClick={handleSubmit}>Save</Button>
                                    </div>
                                </div>
                            ) : witnesses.length === 0 ? (
                                <EmptyState label="Witnesses" />
                            ) : (
                                <div className="space-y-2">
                                    {witnesses.map((w: any, idx: number) => (
                                        <div key={w.id || idx} className="border rounded p-2">
                                            <div className="flex justify-between">
                                                <div>
                                                    <div className="font-medium">{w.name || "Unknown Witness"}</div>
                                                    <div className="text-xs text-muted-foreground">{w.statement || "No statement provided."}</div>
                                                </div>
                                                {renderItemActions(w.id || `witness-${idx}`)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="documents" className="border rounded-lg p-4">
                            {renderCrudHeader("Documents")}

                            {crudOperation ? (
                                <div className="border p-4 rounded-md">
                                    <h4 className="font-medium mb-4">
                                        {crudOperation === "create" ? "Add New Document" : "Edit Document"}
                                    </h4>
                                    {/* Document form would go here */}
                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                                        <Button onClick={handleSubmit}>Save</Button>
                                    </div>
                                </div>
                            ) : documents.length === 0 ? (
                                <EmptyState label="Documents" />
                            ) : (
                                <div className="space-y-2">
                                    {documents.map((doc: any, idx: number) => (
                                        <div key={doc.id || idx} className="border rounded p-2 flex items-center">
                                            <div className="flex items-center gap-2 flex-1">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">{doc.title || "Document"}</div>
                                                    <div className="text-xs text-muted-foreground">{doc.description || "No description."}</div>
                                                </div>
                                            </div>
                                            {renderItemActions(doc.id || `document-${idx}`)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="notes" className="border rounded-lg p-4">
                            {renderCrudHeader("Case Notes")}

                            {crudOperation ? (
                                <div className="border p-4 rounded-md">
                                    <h4 className="font-medium mb-4">
                                        {crudOperation === "create" ? "Add New Note" : "Edit Note"}
                                    </h4>
                                    {/* Note form would go here */}
                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                                        <Button onClick={handleSubmit}>Save</Button>
                                    </div>
                                </div>
                            ) : (
                                <EmptyState label="Notes" />
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Incident Details and Assigned Personnel */}
                <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4">Incident? Details</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Category:</span>
                                <span className="col-span-2">{incident?.crime_categories?.name}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Location:</span>
                                <span className="col-span-2">{incident?.locations?.address}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">District:</span>
                                <span className="col-span-2">{incident?.locations?.districts?.name}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Timestamp:</span>
                                <span className="col-span-2">{incident?.timestamp ? new Date(incident.timestamp).toLocaleString() : 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Victims:</span>
                                <span className="col-span-2">{incident?.victim_count}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Description:</span>
                                <span className="col-span-2">{incident?.description}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Shield className="h-5 w-5 mr-2" />
                            Assigned Personnel
                        </h3>
                        <CaseAssignees />
                    </div>
                </div>
            </div>
        </div>
    );
}
