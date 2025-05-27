"use server";

import { getInjection } from "@/di/container";
import db from "@/prisma/db";
import { AuthenticationError } from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";
import { ICrime, ICrimeIncident, IIncidentLog } from "@/app/_utils/types/crimes";

// CRIMES ACTIONS
export async function getCrimesList() {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Get Crimes List",
        { recordResponse: true },
        async () => {
            try {
                const crimes = await db.crimes.findMany({
                    include: {
                        districts: {
                            select: {
                                name: true,
                                geographics: {
                                    select: {
                                        latitude: true,
                                        longitude: true,
                                    },
                                }
                            },
                        },
                    },
                    orderBy: {
                        created_at: 'desc',
                    },
                });

                return crimes;
            } catch (err) {
                if (err instanceof InputParseError) {
                    throw new InputParseError(err.message);
                }

                if (err instanceof AuthenticationError) {
                    throw new AuthenticationError(
                        "There was an error with the credentials. Please try again or contact support.",
                    );
                }

                const crashReporterService = getInjection("ICrashReporterService");
                crashReporterService.report(err);
                throw new Error(
                    "An error happened. The developers have been notified. Please try again later.",
                );
            }
        },
    );
}

// CRIME INCIDENTS ACTIONS
export async function getCrimeIncidentsList() {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Get Crime Incidents List",
        { recordResponse: true },
        async () => {
            try {
                const crimeIncidents = await db.crime_incidents.findMany({
                    include: {
                        crime_categories: {
                            select: {
                                name: true,
                                type: true,
                            },
                        },
                        locations: {
                            select: {
                                address: true,
                                latitude: true,
                                longitude: true,
                                districts: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                        crimes: {
                            select: {
                                id: true,
                                district_id: true,
                            },
                        },
                    },
                    orderBy: {
                        timestamp: 'desc',
                    },
                });

                return crimeIncidents;
            } catch (err) {
                if (err instanceof InputParseError) {
                    throw new InputParseError(err.message);
                }

                if (err instanceof AuthenticationError) {
                    throw new AuthenticationError(
                        "There was an error with the credentials. Please try again or contact support.",
                    );
                }

                const crashReporterService = getInjection("ICrashReporterService");
                crashReporterService.report(err);
                throw new Error(
                    "An error happened. The developers have been notified. Please try again later.",
                );
            }
        },
    );
}

export async function getCrimeIncidentById(id: string) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Get Crime Incident By ID",
        { recordResponse: true },
        async () => {
            try {
                const crimeIncident = await db.crime_incidents.findUnique({
                    where: {
                        id,
                    },
                    include: {
                        crime_categories: {
                            select: {
                                name: true,
                                type: true,
                            },
                        },
                        locations: {
                            select: {
                                address: true,
                                latitude: true,
                                longitude: true,
                                districts: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                        crimes: {
                            select: {
                                id: true,
                                district_id: true,
                                level: true,
                            },
                        },
                        incident_logs: {
                            include: {
                                evidence: true,
                                witnesses: true,
                            }
                        }
                    },
                });

                return crimeIncident;
            } catch (err) {
                if (err instanceof InputParseError) {
                    throw new InputParseError(err.message);
                }

                if (err instanceof AuthenticationError) {
                    throw new AuthenticationError(
                        "There was an error with the credentials. Please try again or contact support.",
                    );
                }

                const crashReporterService = getInjection("ICrashReporterService");
                crashReporterService.report(err);
                throw new Error(
                    "An error happened. The developers have been notified. Please try again later.",
                );
            }
        },
    );
}

// INCIDENT LOGS ACTIONS
export async function getIncidentLogsList() {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Get Incident Logs List",
        { recordResponse: true },
        async () => {
            try {
                const incidentLogs = await db.incident_logs.findMany({
                    include: {
                        crime_categories: {
                            select: {
                                name: true,
                                type: true,
                            },
                        },
                        locations: {
                            select: {
                                address: true,
                                latitude: true,
                                longitude: true,
                                districts: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                        user: {
                            select: {
                                email: true,
                                phone: true,
                                profile: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        time: 'desc',
                    },
                });

                return incidentLogs;
            } catch (err) {
                if (err instanceof InputParseError) {
                    throw new InputParseError(err.message);
                }

                if (err instanceof AuthenticationError) {
                    throw new AuthenticationError(
                        "There was an error with the credentials. Please try again or contact support.",
                    );
                }

                const crashReporterService = getInjection("ICrashReporterService");
                crashReporterService.report(err);
                throw new Error(
                    "An error happened. The developers have been notified. Please try again later.",
                );
            }
        },
    );
}

export async function getIncidentLogById(id: string) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Get Incident Log By ID",
        { recordResponse: true },
        async () => {
            try {
                const incidentLog = await db.incident_logs.findUnique({
                    where: {
                        id,
                    },
                    include: {
                        crime_categories: {
                            select: {
                                name: true,
                                type: true,
                            },
                        },
                        locations: {
                            select: {
                                address: true,
                                latitude: true,
                                longitude: true,
                                districts: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                        user: {
                            select: {
                                email: true,
                                phone: true,
                                profile: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                        evidence: true,
                    },
                });

                return incidentLog;
            } catch (err) {
                if (err instanceof InputParseError) {
                    throw new InputParseError(err.message);
                }

                if (err instanceof AuthenticationError) {
                    throw new AuthenticationError(
                        "There was an error with the credentials. Please try again or contact support.",
                    );
                }

                const crashReporterService = getInjection("ICrashReporterService");
                crashReporterService.report(err);
                throw new Error(
                    "An error happened. The developers have been notified. Please try again later.",
                );
            }
        },
    );
}

export async function verifyIncidentLog(id: string) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Verify Incident Log",
        { recordResponse: true },
        async () => {
            try {
                const incidentLog = await db.incident_logs.update({
                    where: {
                        id,
                    },
                    data: {
                        verified: true,
                        updated_at: new Date(),
                    },
                    include: {
                        crime_categories: true,
                        locations: true,
                    },
                });

                // After verification, create a crime incident from the incident log
                // We need to find the corresponding crime entry or create a new one
                const district = await db.locations.findUnique({
                    where: { id: incidentLog.location_id },
                    select: { district_id: true }
                });

                if (!district) throw new Error("Location district not found");

                // Create crime ID based on district
                const crimeId = `CR-${district.district_id}-${new Date().getFullYear()}`;

                // Check if crime exists
                let crime = await db.crimes.findFirst({
                    where: {
                        district_id: district.district_id,
                        year: new Date().getFullYear(),
                        month: new Date().getMonth() + 1, // JavaScript months are 0-indexed
                    },
                });

                // If no crime exists for this district/year/month, create one
                if (!crime) {
                    crime = await db.crimes.create({
                        data: {
                            id: crimeId,
                            district_id: district.district_id,
                            year: new Date().getFullYear(),
                            month: new Date().getMonth() + 1,
                            number_of_crime: 1,
                            level: "low",
                            score: 0,
                            method: "manual",
                            crime_cleared: 0,
                            avg_crime: 0,
                        },
                    });
                } else {
                    // Increment number of crime
                    await db.crimes.update({
                        where: {
                            id: crime.id,
                        },
                        data: {
                            number_of_crime: {
                                increment: 1,
                            },
                            updated_at: new Date(),
                        },
                    });
                }

                // Create crime incident from the verified incident log
                const crimeIncident = await db.crime_incidents.create({
                    data: {
                        id: `CI-${district.district_id}-${Math.floor(Math.random() * 10000)}-${new Date().getFullYear()}`,
                        crime_id: crime.id,
                        crime_category_id: incidentLog.category_id,
                        location_id: incidentLog.location_id,
                        description: incidentLog.description || "",
                        victim_count: 0, // Default value
                        status: "open",
                        timestamp: incidentLog.time,
                    },
                });

                return { updated: incidentLog, created: crimeIncident };
            } catch (err) {
                if (err instanceof InputParseError) {
                    throw new InputParseError(err.message);
                }

                if (err instanceof AuthenticationError) {
                    throw new AuthenticationError(
                        "There was an error with the credentials. Please try again or contact support.",
                    );
                }

                const crashReporterService = getInjection("ICrashReporterService");
                crashReporterService.report(err);
                throw new Error(
                    "An error happened. The developers have been notified. Please try again later.",
                );
            }
        },
    );
}

export async function updateCrimeIncidentStatus(id: string, status: string) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Update Crime Incident Status",
        { recordResponse: true },
        async () => {
            try {
                const updated = await db.crime_incidents.update({
                    where: {
                        id,
                    },
                    data: {
                        status: status as any, // We're assuming the status is valid according to the enum
                        updated_at: new Date(),
                    },
                });

                // If status is 'resolved', update crime_cleared in the crimes table
                if (status === "resolved") {
                    const crimeIncident = await db.crime_incidents.findUnique({
                        where: { id },
                        select: { crime_id: true }
                    });

                    if (crimeIncident) {
                        await db.crimes.update({
                            where: {
                                id: crimeIncident.crime_id,
                            },
                            data: {
                                crime_cleared: {
                                    increment: 1,
                                },
                            },
                        });
                    }
                }

                return updated;
            } catch (err) {
                if (err instanceof InputParseError) {
                    throw new InputParseError(err.message);
                }

                if (err instanceof AuthenticationError) {
                    throw new AuthenticationError(
                        "There was an error with the credentials. Please try again or contact support.",
                    );
                }

                const crashReporterService = getInjection("ICrashReporterService");
                crashReporterService.report(err);
                throw new Error(
                    "An error happened. The developers have been notified. Please try again later.",
                );
            }
        },
    );
}