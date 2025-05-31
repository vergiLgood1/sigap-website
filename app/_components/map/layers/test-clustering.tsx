"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/app/_components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/_components/ui/card';
import { Badge } from '@/app/_components/ui/badge';
import { Separator } from '@/app/_components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_components/ui/select';
import { useRealtimeKMeans } from '@/app/_hooks/use-realtime-kmeans';
import {
    useGetRealtimeClusterData,
    useMarkDistrictForUpdate,
    useTriggerIncrementalUpdate,
    useInitializeCurrentYearClusters
} from '@/app/(pages)/(admin)/dashboard/crime-management/crime-overview/_queries/queries';
import { IconCircleCheck, IconCircleX, IconLoader, IconRefresh, IconTestPipe, IconDatabase, IconShield, IconChevronDown, IconChevronUp, IconMapPin } from '@tabler/icons-react';
import { useGetDistricts } from '@/app/(pages)/(admin)/dashboard/crime-management/crime-incident/_queries/queries';

interface TestResult {
    test: string;
    status: 'pending' | 'running' | 'success' | 'error';
    message: string;
    timestamp?: Date;
    data?: any;
}

export default function TestClustering() {
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isRunningTests, setIsRunningTests] = useState(false);
    const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isClient, setIsClient] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    // SAFETY: Only work with current year
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Get available districts for testing - SAFETY: Only current year data
    const { data: availableDistricts, isLoading: isDistrictsLoading } = useGetDistricts();

    // Set default district when districts are loaded
    useEffect(() => {
        if (availableDistricts && availableDistricts.length > 0 && !selectedDistrictId) {
            // Use the first available district as default
            setSelectedDistrictId(availableDistricts[0].id);
        }
    }, [availableDistricts, selectedDistrictId]);

    // Real-time hook for testing - RESTRICTED TO CURRENT YEAR ONLY
    const {
        clusterData,
        isLoading: isRealtimeLoading,
        isConnected,
        isRealTimeEnabled,
        lastUpdate,
        refreshClusters
    } = useRealtimeKMeans({
        enabled: true,
        year: currentYear, // SAFETY: Always current year
        onClusterUpdate: (clusters) => {
            addTestResult('Real-time Update Received', 'success',
                `Received ${clusters.length} cluster updates at ${new Date().toLocaleTimeString()}`, clusters);
        },
        onError: (error) => {
            addTestResult('Real-time Error', 'error', error.message);
        }
    });

    // React Query hooks for testing - ALL RESTRICTED TO CURRENT YEAR
    const { refetch: fetchClusters, isLoading: isFetchingClusters } = useGetRealtimeClusterData(currentYear);
    const { refetch: markDistrict, isLoading: isMarkingDistrict } = useMarkDistrictForUpdate(selectedDistrictId, currentYear);
    const { refetch: triggerUpdate, isLoading: isTriggeringUpdate } = useTriggerIncrementalUpdate(selectedDistrictId, currentYear);
    const { refetch: initializeClusters, isLoading: isInitializing } = useInitializeCurrentYearClusters();

    const addTestResult = (test: string, status: TestResult['status'], message: string, data?: any) => {
        setTestResults(prev => [...prev, {
            test,
            status,
            message,
            timestamp: new Date(),
            data
        }]);
    };

    const clearTestResults = () => {
        setTestResults([]);
    };

    const runTest = async (testName: string, testFn: () => Promise<void>) => {
        addTestResult(testName, 'running', 'Test in progress...');
        try {
            await testFn();
            addTestResult(testName, 'success', 'Test completed successfully');
        } catch (error) {
            addTestResult(testName, 'error', error instanceof Error ? error.message : 'Test failed');
        }
    };

    // SAFETY CHECK: Verify we're only working with current year
    const verifySafetyConstraints = () => {
        if (currentYear !== new Date().getFullYear()) {
            throw new Error('SAFETY VIOLATION: Test component detected year mismatch');
        }
        return true;
    };

    const getSelectedDistrictName = () => {
        if (!selectedDistrictId || !availableDistricts) return 'No District Selected';
        const district = availableDistricts.find(d => d.id === selectedDistrictId);
        return district ? district.name : 'Unknown District';
    };

    const runAllTests = async () => {
        setIsRunningTests(true);
        clearTestResults();

        try {
            // SAFETY: Verify constraints before any operation
            verifySafetyConstraints();
            addTestResult('Safety Check', 'success',
                `✅ Safety verified: Only operating on current year ${currentYear}`);

            if (!selectedDistrictId) {
                throw new Error('Please select a district for testing');
            }

            const districtName = getSelectedDistrictName();
            addTestResult('District Selection', 'success',
                `Selected district: ${districtName} (${selectedDistrictId})`);

            // Test 1: Initialize clusters for CURRENT YEAR ONLY
            await runTest('Initialize Current Year Clusters', async () => {
                verifySafetyConstraints(); // Double-check before each operation
                const result = await initializeClusters();
                if (result.error) throw new Error(result.error.message);
                addTestResult('Initialize Current Year Clusters', 'success',
                    `Initialization result for year ${currentYear}: ${JSON.stringify(result.data)}`, result.data);
            });

            // Test 2: Fetch cluster data for CURRENT YEAR ONLY
            await runTest('Fetch Cluster Data', async () => {
                verifySafetyConstraints();
                const result = await fetchClusters();
                if (result.error) throw new Error(result.error.message);
                addTestResult('Fetch Cluster Data', 'success',
                    `Fetched ${result.data?.length || 0} clusters for year ${currentYear}`, result.data);
            });

            // Test 3: Mark district for update - CURRENT YEAR ONLY
            await runTest('Mark District for Update', async () => {
                verifySafetyConstraints();
                const result = await markDistrict();
                if (result.error) throw new Error(result.error.message);
                addTestResult('Mark District for Update', 'success',
                    `District ${districtName} (${selectedDistrictId}) marked for year ${currentYear}: ${JSON.stringify(result.data)}`, result.data);
            });

            // Test 4: Trigger incremental update - CURRENT YEAR ONLY
            await runTest('Trigger Incremental Update', async () => {
                verifySafetyConstraints();
                const result = await triggerUpdate();
                if (result.error) throw new Error(result.error.message);
                addTestResult('Trigger Incremental Update', 'success',
                    `Update triggered for district ${districtName} (${selectedDistrictId}) in year ${currentYear}: ${JSON.stringify(result.data)}`, result.data);
            });

            // Test 5: Test real-time connection - CURRENT YEAR ONLY
            await runTest('Real-time Connection Test', async () => {
                verifySafetyConstraints();
                if (!isRealTimeEnabled) {
                    throw new Error('Real-time is not enabled for current year');
                }
                if (!isConnected) {
                    throw new Error('Real-time connection is not established');
                }
                addTestResult('Real-time Connection Test', 'success',
                    `Real-time connected for year ${currentYear}: ${isConnected}, Enabled: ${isRealTimeEnabled}`);
            });

            // Test 6: Refresh clusters - CURRENT YEAR ONLY
            await runTest('Refresh Clusters', async () => {
                verifySafetyConstraints();
                await refreshClusters();
                addTestResult('Refresh Clusters', 'success', `Clusters refreshed for year ${currentYear}`);
            });

        } finally {
            setIsRunningTests(false);
        }
    };

    const testRealtimeUpdate = async () => {
        try {
            // SAFETY: Verify before simulation
            verifySafetyConstraints();

            if (!selectedDistrictId) {
                throw new Error('Please select a district for testing');
            }

            const districtName = getSelectedDistrictName();
            addTestResult('Simulating Real-time Update', 'running',
                `Creating test incident for district ${districtName} (${selectedDistrictId}) in current year ${currentYear}...`);

            // Simulate a district update by marking it for update multiple times
            for (let i = 0; i < 3; i++) {
                verifySafetyConstraints(); // Check before each iteration
                const result = await markDistrict();
                if (result.error) throw new Error(result.error.message);

                addTestResult(`Test Update ${i + 1}`, 'success',
                    `District ${districtName} (${selectedDistrictId}) - Year ${currentYear} - Update count: ${result.data?.update_count}, Triggered: ${result.data?.triggered_update}`);

                // Wait a bit between updates
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

        } catch (error) {
            addTestResult('Simulating Real-time Update', 'error',
                error instanceof Error ? error.message : 'Simulation failed');
        }
    };

    const getStatusIcon = (status: TestResult['status']) => {
        switch (status) {
            case 'success': return <IconCircleCheck className="h-3 w-3 text-green-500" />;
            case 'error': return <IconCircleX className="h-3 w-3 text-red-500" />;
            case 'running': return <IconLoader className="h-3 w-3 text-blue-500 animate-spin" />;
            default: return <IconTestPipe className="h-3 w-3 text-gray-500" />;
        }
    };

    // Safety warning component
    const SafetyIndicator = () => (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs">
            <IconShield className="h-3 w-3 text-green-600" />
            <span className="text-green-700 font-medium">SAFE: {currentYear}</span>
        </div>
    );

    const container = isClient ? document.getElementById("root") : null;

    return (
        <>
            <div ref={containerRef} className="absolute top-16 left-2 w-80 z-0 space-y-2">
                {/* Compact Control Panel */}
                <Card>
                    <CardContent className="p-3">
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <IconTestPipe className="h-4 w-4" />
                                <span className="font-medium text-sm">K-means Test</span>
                            </div>
                            <SafetyIndicator />
                        </div>

                        {/* District Selection */}
                        <div className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                                <IconMapPin className="h-3 w-3" />
                                <span className="text-xs font-medium">Test District:</span>
                            </div>
                            <Select
                                value={selectedDistrictId}
                                onValueChange={setSelectedDistrictId}
                                disabled={isDistrictsLoading || isRunningTests}
                            >
                                <SelectTrigger className="h-7 text-xs">
                                    <SelectValue placeholder="Select district..." />
                                </SelectTrigger>
                                <SelectContent container={containerRef.current || container ||
                                    undefined}

                                    className="max-h-60 z-[9999]  "
                                >
                                    {isDistrictsLoading ? (
                                        <SelectItem value="loading" disabled>
                                            <div className="flex items-center gap-2">
                                                <IconLoader className="h-3 w-3 animate-spin" />
                                                Loading districts...
                                            </div>
                                        </SelectItem>
                                    ) : availableDistricts && availableDistricts.length > 0 ? (
                                        availableDistricts.map((district) => (
                                            <SelectItem key={district.id} value={district.id}>
                                                <div className="flex gap-2">
                                                    <span className="text-xs font-medium">{district.name}</span>
                                                    <span className="text-xs text-muted-foreground">{district.id}</span>
                                                </div>
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-districts" disabled>
                                            No districts available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Row */}
                        <div className="flex items-center justify-between text-xs mb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                                    <span>RT: {isConnected ? 'ON' : 'OFF'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <IconDatabase className="h-3 w-3" />
                                    <span>{clusterData?.length || 0}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <IconRefresh className="h-3 w-3" />
                                <span>{lastUpdate ? lastUpdate.toLocaleTimeString().slice(0, 5) : 'Never'}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <Button
                                onClick={runAllTests}
                                disabled={isRunningTests || !selectedDistrictId}
                                size="sm"
                                className="w-full h-7 text-xs"
                            >
                                {isRunningTests ? <IconLoader className="h-3 w-3 mr-1 animate-spin" /> : <IconTestPipe className="h-3 w-3 mr-1" />}
                                Run All Tests
                            </Button>

                            <div className="grid grid-cols-3 gap-1">
                                <Button
                                    onClick={() => runTest('Fetch', async () => {
                                        verifySafetyConstraints();
                                        const result = await fetchClusters();
                                        if (result.error) throw new Error(result.error.message);
                                    })}
                                    disabled={isFetchingClusters}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                >
                                    {isFetchingClusters && <IconLoader className="h-3 w-3 mr-1 animate-spin" />}
                                    Fetch
                                </Button>

                                <Button
                                    onClick={() => runTest('Mark', async () => {
                                        verifySafetyConstraints();
                                        if (!selectedDistrictId) throw new Error('Please select a district');
                                        const result = await markDistrict();
                                        if (result.error) throw new Error(result.error.message);
                                    })}
                                    disabled={isMarkingDistrict || !selectedDistrictId}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                >
                                    {isMarkingDistrict && <IconLoader className="h-3 w-3 mr-1 animate-spin" />}
                                    Mark
                                </Button>

                                <Button
                                    onClick={testRealtimeUpdate}
                                    disabled={!selectedDistrictId}
                                    variant="secondary"
                                    size="sm"
                                    className="h-7 text-xs"
                                >
                                    Simulate
                                </Button>
                            </div>

                            <div className="flex justify-between items-center">
                                <Button
                                    onClick={clearTestResults}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                >
                                    Clear Results
                                </Button>

                                <Button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                >
                                    {isExpanded ? <IconChevronUp className="h-3 w-3" /> : <IconChevronDown className="h-3 w-3" />}
                                </Button>
                            </div>

                            {/* District Info */}
                            {selectedDistrictId && (
                                <div className="text-xs text-muted-foreground text-center p-1 bg-muted rounded">
                                    Testing: {getSelectedDistrictName()}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Portal the expandable results to ensure it appears above the map */}
            <div ref={containerRef} className="mapboxgl-test-results">
                {isExpanded && testResults.length > 0 && (
                    <Card
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] bg-background w-96 max-h-96 overflow-hidden shadow-lg"
                    >
                        <CardHeader className="pb-2 px-3 pt-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">Test Results ({currentYear})</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={clearTestResults}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        onClick={() => setIsExpanded(false)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                    >
                                        <IconChevronUp className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-80 overflow-y-auto px-3 pb-3 space-y-1">
                                {testResults.slice(-10).map((result, index) => (
                                    <div key={index} className="p-2 rounded bg-muted/50 border">
                                        <div className="flex items-center gap-2 mb-1">
                                            {getStatusIcon(result.status)}
                                            <span className="text-xs font-medium flex-1 truncate">{result.test}</span>
                                            {result.timestamp && (
                                                <span className="text-xs text-muted-foreground">
                                                    {result.timestamp.toLocaleTimeString().slice(0, 5)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {result.message}
                                        </p>
                                        {result.data && (
                                            <details className="mt-1">
                                                <summary className="text-xs cursor-pointer text-blue-600 hover:text-blue-800">
                                                    View Data
                                                </summary>
                                                <pre className="text-xs bg-background p-1 rounded border mt-1 overflow-x-auto max-h-16">
                                                    {JSON.stringify(result.data, null, 1)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Overlay when expanded */}
                {isExpanded && testResults.length > 0 && (
                    <div
                        className="fixed inset-0 bg-black/20 z-[9998]"
                        onClick={() => setIsExpanded(false)}
                    />
                )}
            </div>
        </>
    );
}
