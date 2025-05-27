import { useEffect, useState } from "react";
import { IUserSchema } from "@/src/entities/models/users/users.model";
import { formatDistance } from "date-fns";
import { Loader2, RefreshCw, UserCheck, Mail, Lock, LogIn, LogOut, Plus, Edit, Trash, FileText } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import { Badge } from "@/app/_components/ui/badge";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { Skeleton } from "@/app/_components/ui/skeleton";

// Extended interface for selectedUser logs with more types
interface UserLog {
    id: string;
    type: 'login' | 'logout' | 'password_reset' | 'email_change' | 'profile_update' | 'account_creation' |
    'token_request' | 'insert' | 'update' | 'delete' | 'view';
    timestamp: Date;
    status_code?: string;
    ip_address?: string;
    user_agent?: string;
    details?: string;
    resource?: string; // For database actions: which resource was modified
    endpoint?: string; // For API requests: which endpoint was called
}

interface UserLogsTabProps {
    selectedUser: IUserSchema;
}

export function UserLogsTab({ selectedUser }: UserLogsTabProps) {
    const [logs, setLogs] = useState<UserLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [showErrorOnly, setShowErrorOnly] = useState(false);

    // Mock function to fetch selectedUser logs - replace with actual implementation
    const fetchUserLogs = async () => {
        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock authentication logs data similar to the screenshot
            const mockAuthLogs: UserLog[] = [
                {
                    id: '1',
                    type: 'token_request',
                    timestamp: new Date(2025, 3, 2, 13, 48, 51), // Apr 2, 2025, 13:48:51
                    status_code: '200',
                    details: 'request completed',
                    endpoint: '/token'
                },
                {
                    id: '2',
                    type: 'login',
                    timestamp: new Date(2025, 3, 2, 13, 48, 51), // Apr 2, 2025, 13:48:51
                    status_code: '-',
                    details: 'Login successful',
                    endpoint: undefined
                },
                {
                    id: '3',
                    type: 'logout',
                    timestamp: new Date(2025, 3, 2, 13, 30, 0),
                    status_code: '200',
                    details: 'SelectedUser logged out',
                    ip_address: '192.168.1.5'
                },
                {
                    id: '4',
                    type: 'login',
                    timestamp: new Date(2025, 3, 2, 13, 25, 10),
                    status_code: '401',
                    details: 'Failed login attempt - incorrect password',
                    ip_address: '192.168.1.5'
                }
            ];

            // Mock database action logs
            const mockActionLogs: UserLog[] = [
                {
                    id: '5',
                    type: 'insert',
                    timestamp: new Date(2025, 3, 2, 14, 15, 23),
                    status_code: '201',
                    resource: 'products',
                    details: 'Created new product "Smartphone X1"',
                    ip_address: '192.168.1.5'
                },
                {
                    id: '6',
                    type: 'insert',
                    timestamp: new Date(2025, 3, 2, 14, 15, 23),
                    status_code: '201',
                    resource: 'products',
                    details: 'Created new product "Smartphone X1"',
                    ip_address: '192.168.1.5'
                },
                {
                    id: '7',
                    type: 'insert',
                    timestamp: new Date(2025, 3, 2, 14, 15, 23),
                    status_code: '201',
                    resource: 'products',
                    details: 'Created new product "Smartphone X1"',
                    ip_address: '192.168.1.5'
                },
                {
                    id: '8',
                    type: 'insert',
                    timestamp: new Date(2025, 3, 2, 14, 15, 23),
                    status_code: '201',
                    resource: 'products',
                    details: 'Created new product "Smartphone X1"',
                    ip_address: '192.168.1.5'
                },
                {
                    id: '9',
                    type: 'insert',
                    timestamp: new Date(2025, 3, 2, 14, 15, 23),
                    status_code: '201',
                    resource: 'products',
                    details: 'Created new product "Smartphone X1"',
                    ip_address: '192.168.1.5'
                },
                {
                    id: '10',
                    type: 'insert',
                    timestamp: new Date(2025, 3, 2, 14, 15, 23),
                    status_code: '201',
                    resource: 'products',
                    details: 'Created new product "Smartphone X1"',
                    ip_address: '192.168.1.5'
                },
                {
                    id: '11',
                    type: 'insert',
                    timestamp: new Date(2025, 3, 2, 14, 15, 23),
                    status_code: '201',
                    resource: 'products',
                    details: 'Created new product "Smartphone X1"',
                    ip_address: '192.168.1.5'
                },
                {
                    id: '12',
                    type: 'insert',
                    timestamp: new Date(2025, 3, 2, 14, 15, 23),
                    status_code: '201',
                    resource: 'products',
                    details: 'Created new product "Smartphone X1"',
                    ip_address: '192.168.1.5'
                },
                {
                    id: '13',
                    type: 'insert',
                    timestamp: new Date(2025, 3, 2, 14, 15, 23),
                    status_code: '201',
                    resource: 'products',
                    details: 'Created new product "Smartphone X1"',
                    ip_address: '192.168.1.5'
                },

            ];

            // Combine all logs and sort by timestamp (newest first)
            const allLogs = [...mockAuthLogs, ...mockActionLogs].sort((a, b) =>
                b.timestamp.getTime() - a.timestamp.getTime()
            );

            setLogs(allLogs);
        } catch (error) {
            console.error("Failed to fetch selectedUser logs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserLogs();
    }, [selectedUser.id]);

    const getLogIcon = (type: UserLog['type']) => {
        switch (type) {
            case 'login':
                return <LogIn className="h-4 w-4 text-green-500" />;
            case 'logout':
                return <LogOut className="h-4 w-4 text-yellow-500" />;
            case 'password_reset':
                return <Lock className="h-4 w-4 text-blue-500" />;
            case 'email_change':
                return <Mail className="h-4 w-4 text-purple-500" />;
            case 'profile_update':
                return <UserCheck className="h-4 w-4 text-indigo-500" />;
            case 'account_creation':
                return <UserCheck className="h-4 w-4 text-green-500" />;
            case 'token_request':
                return <FileText className="h-4 w-4 text-blue-500" />;
            case 'insert':
                return <Plus className="h-4 w-4 text-green-500" />;
            case 'update':
                return <Edit className="h-4 w-4 text-amber-500" />;
            case 'delete':
                return <Trash className="h-4 w-4 text-red-500" />;
            case 'view':
                return <FileText className="h-4 w-4 text-gray-500" />;
            default:
                return null;
        }
    };

    const getLogTitle = (type: UserLog['type']) => {
        switch (type) {
            case 'login':
                return 'Login';
            case 'logout':
                return 'Logout';
            case 'password_reset':
                return 'Password reset';
            case 'email_change':
                return 'Email changed';
            case 'profile_update':
                return 'Profile updated';
            case 'account_creation':
                return 'Account created';
            case 'token_request':
                return 'Token request';
            case 'insert':
                return 'Create record';
            case 'update':
                return 'Update record';
            case 'delete':
                return 'Delete record';
            case 'view':
                return 'View record';
            default:
                return 'Unknown action';
        }
    };

    const getStatusClass = (statusCode: string | undefined) => {
        if (!statusCode || statusCode === '-') return "bg-gray-100 text-gray-800";

        const code = parseInt(statusCode);
        if (code >= 200 && code < 300) return "bg-green-100 text-green-800";
        if (code >= 400) return "bg-red-100 text-red-800";
        return "bg-yellow-100 text-yellow-800";
    };

    const isAuthLog = (type: UserLog['type']) => {
        return ['login', 'logout', 'password_reset', 'account_creation', 'token_request'].includes(type);
    };

    const isActionLog = (type: UserLog['type']) => {
        return ['insert', 'update', 'delete', 'view'].includes(type);
    };

    const filteredLogs = logs.filter(log => {
        if (showErrorOnly) {
            const code = parseInt(log.status_code || '0');
            if (code < 400) return false;
        }

        if (activeTab === 'all') return true;
        if (activeTab === 'auth') return isAuthLog(log.type);
        if (activeTab === 'action') return isActionLog(log.type);
        return true;
    });

    const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${day} ${month} ${hours}:${minutes}:${seconds}`;
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold">SelectedUser Activity Logs</h3>
                    <p className="text-sm text-muted-foreground">Latest logs from activity for this selectedUser in the past hour</p>
                </div>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <div className="flex justify-between items-center">
                    <TabsList className="mb-2 space-x-1 bg-transparent m-0">
                        <TabsTrigger value="all" className="text-xs data-[state=active]:bg-white data-[state=active]:text-background">Show all</TabsTrigger>
                        <TabsTrigger value="auth" className="text-xs data-[state=active]:bg-white data-[state=active]:text-background">Authentication logs</TabsTrigger>
                        <TabsTrigger value="action" className="text-xs data-[state=active]:bg-white data-[state=active]:text-background">Action logs</TabsTrigger>
                    </TabsList>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="xs"
                            className="px-2 py-1 text-xs"
                            onClick={fetchUserLogs}
                            disabled={isLoading}
                        >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Refresh
                        </Button>
                    </div>
                </div>
            </Tabs>

            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 1 }).map((_, index) => (
                        <div key={index} className="flex flex-col space-y-4">
                            <Skeleton className="h-6 w-full bg-muted" />
                            <Skeleton className="h-6 w-4/6 bg-muted" />
                            <Skeleton className="h-6 w-2/5 bg-muted" />
                        </div>
                    ))}
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                    No logs found with the current filters.
                </div>
            ) : (
                <div className="  border rounded-md">
                    <table className="w-full">
                        {/* <thead className="bg-muted/50 sticky top-0">
                            <tr className="border-b">
                                <th className="text-left p-2 text-xs font-medium text-muted-foreground">Timestamp</th>
                                <th className="text-left p-2 text-xs font-medium text-muted-foreground">Status</th>
                                <th className="text-left p-2 text-xs font-medium text-muted-foreground w-full">Details</th>
                            </tr>
                        </thead> */}
                        <tbody>
                            {filteredLogs.slice(0, 10).map((log) => (
                                <tr key={log.id} className="border-b hover:bg-muted/20 text-muted-foreground">
                                    <td className="p-2 text-xs whitespace-nowrap">
                                        {formatDate(log.timestamp)}
                                    </td>
                                    <td className="p-2">
                                        <Badge variant="outline" className={`bg-none border-none   text-sm font-mono text-muted-foreground`}>
                                            {log.status_code || '-'}
                                        </Badge>
                                    </td>
                                    <td className="p-2">
                                        <div className="flex items-center gap-1.5">
                                            {getLogIcon(log.type)}
                                            <span className="text-sm font-medium">
                                                {log.endpoint && (
                                                    <span className="font-mono text-muted-foreground">{log.endpoint}</span>
                                                )}
                                                {log.endpoint && log.details && ' | '}
                                                {log.details}
                                            </span>
                                        </div>
                                        {/* {log.resource && (
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                Resource: {log.resource}
                                            </div>
                                        )} */}
                                        {/* {log.ip_address && (
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                IP: {log.ip_address}
                                            </div>
                                        )}
                                        {log.user_agent && (
                                            <div className="mt-1 text-xs text-muted-foreground truncate max-w-md">
                                                {log.user_agent}
                                            </div>
                                        )} */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* {filteredLogs.length > 5 && ( */}
                    <div className="text-center p-2 border-t">
                        <Button variant="ghost" size="sm" className="flex w-full text-xs text-muted-foreground">
                            See more logs
                        </Button>
                    </div>
                    {/* )} */}
                </div>
            )}
        </div>
    );
}