"use server";

import { getInjection } from "@/di/container";
import db from "@/prisma/db";
import { AuthenticationError } from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";
import { ICrime, ICrimeIncident, IIncidentLog } from "@/app/_utils/types/crimes";

import { createClient } from "@supabase/supabase-js";
import { crime_rates, crime_status } from "@prisma/client";
import { generateIdWithDbCounter } from "@/app/_utils/common";
import { CRegex } from "@/app/_utils/const/regex";

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

export async function getDistricts() {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Get Districts",
        { recordResponse: true },
        async () => {
            try {
                const districts = await db.districts.findMany({
                    select: {
                        id: true,
                        name: true,
                        geographics: {
                            select: {
                                latitude: true,
                                longitude: true,
                            },
                        },
                    },
                });

                return districts;
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

export async function getAvailableSourceTypes() {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Get Available Source Types",
        { recordResponse: true },
        async () => {
            try {
                const sourceTypes = await db.crimes.findMany({
                    select: {
                        source_type: true,
                    },
                    distinct: ['source_type'],
                    where: {
                        source_type: {
                            not: null
                        }
                    }
                });

                return sourceTypes.map(item => item.source_type);
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

// Helper to create location using Supabase for PostGIS point
async function createLocationWithSupabase({
    address,
    district_id,
    latitude,
    longitude,
    event_id,
}: {
    address: string;
    district_id: string;
    latitude: number;
    longitude: number;
    event_id: string;
}) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Insert location with PostGIS point
    const { data, error } = await supabase
        .from("locations")
        .insert([
            {
                address,
                district_id,
                latitude,
                longitude,
                event_id,
                location: `POINT(${longitude} ${latitude})`,
            },
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// CREATE INCIDENT LOG
export async function createIncidentLog(data: {
    source: string;
    category: string;
    date: Date;
    time: Date;
    description: string;
    location: string;
    district: string;
    latitude?: string;
    longitude?: string;
    evidence?: any[];
    reporter?: string;
    reporterContact?: string;
}) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Create Incident Log",
        { recordResponse: true },
        async () => {
            try {
                let location = await db.locations.findFirst({
                    where: {
                        address: data.location,
                        district_id: data.district,
                    },
                });
                if (!location) {
                    const event = await db.events.findFirst({});
                    const lat = data.latitude ? parseFloat(data.latitude) : 0;
                    const lng = data.longitude ? parseFloat(data.longitude) : 0;
                    // Use Supabase to insert location with PostGIS point
                    if (!event) {
                        throw new Error("No event found to associate with the location.");
                    }
                    const supaLoc = await createLocationWithSupabase({
                        address: data.location,
                        district_id: data.district,
                        latitude: lat,
                        longitude: lng,
                        event_id: event.id,
                    });
                    // Fetch the location from Prisma after insert to get the correct relation
                    location = await db.locations.findUnique({ where: { id: supaLoc.id } });
                }

                const user = await db.users.findFirst();

                if (!user) {
                    throw new AuthenticationError(
                        "User not authenticated. Please log in to create an incident log.",
                    );
                }

                if (!location) {
                    throw new InputParseError(
                        "Location not found. Please check the address and district.",
                    );
                }

                const incidentLog = await db.incident_logs.create({
                    data: {
                        user_id: user?.id ?? "",
                        location_id: location.id,
                        category_id: data.category,
                        description: data.description,
                        source: data.source,
                        time: data.time,
                        // evidence and witnesses handled separately if needed
                    },
                });

                if (data.evidence && Array.isArray(data.evidence)) {
                    for (const ev of data.evidence) {
                        const newEvidenceId = await generateIdWithDbCounter(
                            "evidence",
                            {
                                prefix: "EV",
                                segments: {
                                    sequentialDigits: 4,
                                },
                                format: "{prefix}-{sequence}",
                                separator: "-",
                                uniquenessStrategy: "counter",
                                useUuid: true,
                                uuidFormat: "prefix-short",
                            },
                            CRegex.FORMAT_ID_SEQUENCE
                        );
                        await db.evidence.create({
                            data: {
                                id: newEvidenceId,
                                incident_id: incidentLog.id,
                                type: ev.type,
                                url: ev.url,
                                caption: ev.caption,
                                description: ev.description,
                                metadata: ev.metadata ?? {},
                            },
                        });
                    }
                }

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
        }
    );
}

// CREATE CRIME INCIDENT
export async function createCrimeIncident(data: {
    category: string;
    timestamp: Date;
    description: string;
    location: string;
    district: string;
    status: string;
    victimCount: string;
}) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Create Crime Incident",
        { recordResponse: true },
        async () => {
            try {
                let location = await db.locations.findFirst({
                    where: {
                        address: data.location,
                        district_id: data.district,
                    },
                });
                if (!location) {
                    const event = await db.events.findFirst({});
                    if (!event) {
                        throw new Error("No event found to associate with the location.");
                    }
                    // Use Supabase to insert location with PostGIS point
                    const supaLoc = await createLocationWithSupabase({
                        address: data.location,
                        district_id: data.district,
                        latitude: 0,
                        longitude: 0,
                        event_id: event.id,
                    });
                    // Defensive: make sure supaLoc is not null
                    if (!supaLoc || !supaLoc.id) {
                        throw new InputParseError("Failed to create location in Supabase.");
                    }
                    location = await db.locations.findUnique({ where: { id: supaLoc.id } });
                }

                if (!location) {
                    throw new InputParseError(
                        "Location not found. Please check the address and district.",
                    );
                }

                // Find city for district
                const districtObj = await db.districts.findUnique({
                    where: { id: data.district },
                    select: { city_id: true }
                });
                if (!districtObj || !districtObj.city_id) {
                    throw new InputParseError("District or city_id not found.");
                }
                const city = await db.cities.findUnique({
                    where: { id: districtObj.city_id }
                });
                if (!city) {
                    throw new InputParseError("City not found for the district.");
                }

                const now = new Date(data.timestamp);
                const year = now.getFullYear();

                // Generate crimeId
                // Try to get the last crime ID for this district/year for a more organized sequence
                const lastCrime = await db.crimes.findFirst({
                    where: {
                        district_id: data.district,
                        year: year
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                });

                // Generate new crime ID
                const crimeId = await generateIdWithDbCounter(
                    "crimes",
                    {
                        prefix: "CR",
                        segments: {
                            codes: [city.id],
                            sequentialDigits: 4,
                            year,
                            includeTime: true,
                        },
                        format: "{prefix}-{codes}-{sequence}-{year}-{includeTime}",
                        separator: "-",
                        uniquenessStrategy: "counter",
                        useUuid: true,
                        uuidFormat: "prefix-short"
                    },
                    CRegex.FORMAT_ID_YEAR_SEQUENCE,
                );

                // Log for debugging
                console.log(`Created new crime ID: ${crimeId}, found previous crime: ${lastCrime?.id}`);

                // Find or create crime for this district/month/year
                const month = now.getMonth() + 1;
                let crime = await db.crimes.findFirst({
                    where: {
                        district_id: data.district,
                        year,
                        month,
                    },
                });
                if (!crime) {
                    crime = await db.crimes.create({
                        data: {
                            id: crimeId,
                            district_id: data.district,
                            year,
                            month,
                            number_of_crime: 0,
                            level: "low",
                            score: 0,
                            method: "manual",
                            crime_cleared: 0,
                            avg_crime: 0,
                        },
                    });
                }

                // find last crime incident for this crime
                const lastCrimeIncident = await db.crime_incidents.findFirst({
                    where: {
                        crime_id: crime.id,
                    },
                    orderBy: {
                        created_at: 'desc',
                    },
                });


                // Generate incidentId
                const incidentId = await generateIdWithDbCounter(
                    'crime_incidents',
                    {
                        prefix: 'CI',
                        segments: {
                            codes: [districtObj.city_id],
                            sequentialDigits: 4,
                            year,
                            includeTime: true,
                        },
                        format: '{prefix}-{codes}-{sequence}-{year}-{includeTime}',
                        separator: '-',
                        uniquenessStrategy: 'counter',
                        useUuid: true,
                        uuidFormat: 'prefix-short',
                    },
                    CRegex.FORMAT_ID_YEAR_SEQUENCE
                );

                // Create the crime incident
                console.log(`Created new crime ID: ${incidentId}, found previous crime: ${lastCrimeIncident?.id}`);


                const incident = await db.crime_incidents.create({
                    data: {
                        id: incidentId,
                        crime_id: crime.id,
                        crime_category_id: data.category,
                        location_id: location.id,
                        description: data.description,
                        victim_count: parseInt(data.victimCount, 10) || 0,
                        status: data.status as crime_status,
                        timestamp: data.timestamp,
                    },
                });

                return incident;
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

                if (err && typeof err === "object") {
                    crashReporterService.report(err);
                } else {
                    crashReporterService.report({
                        message: "Non-object error captured",
                        value: err,
                    });
                }

                crashReporterService.report(err);
                console.error("Error creating crime incident:", err);
                throw new Error(
                    "An error happened. The developers have been notified. Please try again later.",
                );
            }
        }
    );
}

// CREATE CRIME SUMMARY
export async function createCrimeSummary(data: {
    district: string;
    month: string;
    year: string;
    crimeCount: string;
    crimesCleared: string;
    level: string;
    sourceType: string;
    method: string;
}) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Create Crime Summary",
        { recordResponse: true },
        async () => {
            try {
                const districtObj = await db.districts.findUnique({
                    where: { id: data.district },
                    select: { city_id: true }
                });
                const city = await db.cities.findUnique({
                    where: { id: districtObj?.city_id ?? "" }
                });
                const year = parseInt(data.year, 10);

                const crimeId = await generateIdWithDbCounter(
                    "crimes",
                    {
                        prefix: "CR",
                        segments: {
                            codes: [city?.id ?? ""],
                            sequentialDigits: 4,
                            year,
                        },
                        format: "{prefix}-{codes}-{sequence}-{year}",
                        separator: "-",
                        uniquenessStrategy: "counter",
                        useUuid: true,
                        uuidFormat: "prefix-short",
                    },
                    CRegex.FORMAT_ID_YEAR_SEQUENCE,
                );

                const crime = await db.crimes.create({
                    data: {
                        id: crimeId,
                        district_id: data.district,
                        year,
                        month: parseInt(data.month, 10),
                        number_of_crime: parseInt(data.crimeCount, 10) || 0,
                        crime_cleared: parseInt(data.crimesCleared, 10) || 0,
                        level: data.level as crime_rates,
                        method: data.method,
                        source_type: data.sourceType,
                        score: 0,
                        avg_crime: 0,
                    },
                });
                return crime;
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
        }
    );
}

// UPDATE CRIME INCIDENT
export async function updateCrimeIncident(id: string, data: {
    category?: string;
    description?: string;
    victim_count?: number;
    status?: string;
}) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Update Crime Incident",
        { recordResponse: true },
        async () => {
            try {
                const updateData: any = {
                    updated_at: new Date(),
                };

                if (data.category) updateData.crime_category_id = data.category;
                if (data.description) updateData.description = data.description;
                if (data.victim_count !== undefined) updateData.victim_count = data.victim_count;
                if (data.status) updateData.status = data.status;

                const updated = await db.crime_incidents.update({
                    where: { id },
                    data: updateData,
                    include: {
                        crime_categories: true,
                        locations: true,
                        crimes: true,
                    },
                });

                // If status changed to resolved, update crime_cleared
                if (data.status === "resolved") {
                    await db.crimes.update({
                        where: { id: updated.crime_id },
                        data: {
                            crime_cleared: { increment: 1 },
                        },
                    });
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

// DELETE CRIME INCIDENT
export async function deleteCrimeIncident(id: string) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Delete Crime Incident",
        { recordResponse: true },
        async () => {
            try {
                // Get the crime incident first to update related crime
                const crimeIncident = await db.crime_incidents.findUnique({
                    where: { id },
                    select: { crime_id: true, status: true },
                });

                if (!crimeIncident) {
                    throw new InputParseError("Crime incident not found");
                }

                // Delete the crime incident
                const deleted = await db.crime_incidents.delete({
                    where: { id },
                });

                // Update the related crime
                await db.crimes.update({
                    where: { id: crimeIncident.crime_id },
                    data: {
                        number_of_crime: { decrement: 1 },
                        crime_cleared: crimeIncident.status === "resolved"
                            ? { decrement: 1 }
                            : undefined,
                        updated_at: new Date(),
                    },
                });

                return deleted;
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

// UPDATE INCIDENT LOG
export async function updateIncidentLog(id: string, data: {
    description?: string;
    source?: string;
    category_id?: string;
    verified?: boolean;
}) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Update Incident Log",
        { recordResponse: true },
        async () => {
            try {
                const updateData: any = {
                    updated_at: new Date(),
                };

                if (data.description) updateData.description = data.description;
                if (data.source) updateData.source = data.source;
                if (data.category_id) updateData.category_id = data.category_id;
                if (data.verified !== undefined) updateData.verified = data.verified;

                const updated = await db.incident_logs.update({
                    where: { id },
                    data: updateData,
                    include: {
                        crime_categories: true,
                        locations: true,
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

// DELETE INCIDENT LOG
export async function deleteIncidentLog(id: string) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Delete Incident Log",
        { recordResponse: true },
        async () => {
            try {
                // Check if the incident log exists and is verified
                const incidentLog = await db.incident_logs.findUnique({
                    where: { id },
                    select: { verified: true },
                });

                if (!incidentLog) {
                    throw new InputParseError("Incident log not found");
                }

                // Delete associated evidence first
                await db.evidence.deleteMany({
                    where: { incident_id: id },
                });

                // Delete associated witnesses
                await db.witnesses.deleteMany({
                    where: { incident_id: id },
                });

                // Delete panic button logs
                await db.panic_button_logs.deleteMany({
                    where: { incident_id: id },
                });

                // Delete the incident log
                const deleted = await db.incident_logs.delete({
                    where: { id },
                });

                return deleted;
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

// UPDATE CRIME SUMMARY
export async function updateCrimeSummary(id: string, data: {
    number_of_crime?: number;
    crime_cleared?: number;
    level?: string;
    method?: string;
    source_type?: string;
    score?: number;
    avg_crime?: number;
}) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Update Crime Summary",
        { recordResponse: true },
        async () => {
            try {
                const updateData: any = {
                    updated_at: new Date(),
                };

                if (data.number_of_crime !== undefined) updateData.number_of_crime = data.number_of_crime;
                if (data.crime_cleared !== undefined) updateData.crime_cleared = data.crime_cleared;
                if (data.level) updateData.level = data.level as crime_rates;
                if (data.method) updateData.method = data.method;
                if (data.source_type) updateData.source_type = data.source_type;
                if (data.score !== undefined) updateData.score = data.score;
                if (data.avg_crime !== undefined) updateData.avg_crime = data.avg_crime;

                const updated = await db.crimes.update({
                    where: { id },
                    data: updateData,
                    include: {
                        districts: {
                            select: {
                                name: true,
                                geographics: {
                                    select: {
                                        latitude: true,
                                        longitude: true,
                                    },
                                },
                            },
                        },
                    },
                });

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

// DELETE CRIME SUMMARY
export async function deleteCrimeSummary(id: string) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Delete Crime Summary",
        { recordResponse: true },
        async () => {
            try {
                // Check if there are related crime incidents
                const relatedIncidents = await db.crime_incidents.count({
                    where: { crime_id: id },
                });

                if (relatedIncidents > 0) {
                    throw new InputParseError(
                        "Cannot delete crime summary with existing crime incidents. Please delete incidents first."
                    );
                }

                // Delete the crime summary
                const deleted = await db.crimes.delete({
                    where: { id },
                });

                return deleted;
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

// GET CRIME CATEGORIES
export async function getCrimeCategories() {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Get Crime Categories",
        { recordResponse: true },
        async () => {
            try {
                const categories = await db.crime_categories.findMany({
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        description: true,
                    },
                    orderBy: {
                        name: 'asc',
                    },
                });

                return categories;
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

// BULK DELETE OPERATIONS
export async function bulkDeleteCrimeIncidents(ids: string[]) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Bulk Delete Crime Incidents",
        { recordResponse: true },
        async () => {
            try {
                // Get all crime incidents to update related crimes
                const crimeIncidents = await db.crime_incidents.findMany({
                    where: { id: { in: ids } },
                    select: { id: true, crime_id: true, status: true },
                });

                // Group by crime_id to batch update
                const crimeUpdates = crimeIncidents.reduce((acc, incident) => {
                    if (!acc[incident.crime_id]) {
                        acc[incident.crime_id] = { total: 0, resolved: 0 };
                    }
                    acc[incident.crime_id].total += 1;
                    if (incident.status === "resolved") {
                        acc[incident.crime_id].resolved += 1;
                    }
                    return acc;
                }, {} as Record<string, { total: number; resolved: number }>);

                // Delete crime incidents
                const deleted = await db.crime_incidents.deleteMany({
                    where: { id: { in: ids } },
                });

                // Update related crimes
                for (const [crimeId, counts] of Object.entries(crimeUpdates)) {
                    await db.crimes.update({
                        where: { id: crimeId },
                        data: {
                            number_of_crime: { decrement: counts.total },
                            crime_cleared: { decrement: counts.resolved },
                            updated_at: new Date(),
                        },
                    });
                }

                return deleted;
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

export async function bulkDeleteIncidentLogs(ids: string[]) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Bulk Delete Incident Logs",
        { recordResponse: true },
        async () => {
            try {
                // Delete associated data first
                await db.evidence.deleteMany({
                    where: { incident_id: { in: ids } },
                });

                await db.witnesses.deleteMany({
                    where: { incident_id: { in: ids } },
                });

                await db.panic_button_logs.deleteMany({
                    where: { incident_id: { in: ids } },
                });

                // Delete incident logs
                const deleted = await db.incident_logs.deleteMany({
                    where: { id: { in: ids } },
                });

                return deleted;
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
        }
    );
}