"use server";

import { getInjection } from "@/di/container";
import db from "@/prisma/db";
import { AuthenticationError } from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";

// GET ALL OFFICERS
export async function getOfficersList() {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Get Officers List",
        { recordResponse: true },
        async () => {
            try {
                const officers = await db.officers.findMany({
                    include: {
                        units: {
                            select: {
                                name: true,
                                code_unit: true
                            }
                        },
                        roles: {
                            select: {
                                name: true
                            }
                        },
                        patrol_units: {
                            select: {
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        name: "asc"
                    },
                });

                return officers;
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

// GET OFFICER BY ID
export async function getOfficerById(id: string) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Get Officer By ID",
        { recordResponse: true },
        async () => {
            try {
                const officer = await db.officers.findUnique({
                    where: { id },
                    include: {
                        units: {
                            select: {
                                name: true,
                                code_unit: true
                            }
                        },
                        roles: {
                            select: {
                                name: true
                            }
                        },
                        patrol_units: {
                            select: {
                                name: true
                            }
                        }
                    },
                });

                return officer;
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

// CREATE OFFICER
export async function createOfficer(data: {
    name: string;
    nrp?: string;
    rank?: string;
    position?: string;
    phone?: string;
    email?: string;
    unit_id?: string;
    role_id?: string;
    patrol_unit_id?: string;
    avatar?: string;
    place_of_birth?: string;
    date_of_birth?: string;
}) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Create Officer",
        { recordResponse: true },
        async () => {
            try {
                // Get default role if not provided
                let roleId = data.role_id;
                if (!roleId) {
                    const defaultRole = await db.roles.findFirst({
                        where: { name: "officer" }
                    });
                    if (!defaultRole) {
                        throw new InputParseError("Default officer role not found");
                    }
                    roleId = defaultRole.id;
                }

                // Format date if provided
                let dateOfBirth = null;
                if (data.date_of_birth) {
                    dateOfBirth = new Date(data.date_of_birth);
                }

                const officer = await db.officers.create({
                    data: {
                        name: data.name,
                        nrp: data.nrp,
                        rank: data.rank,
                        position: data.position,
                        phone: data.phone,
                        email: data.email,
                        unit_id: data.unit_id,
                        role_id: roleId,
                        patrol_unit_id: data.patrol_unit_id,
                        avatar: data.avatar,
                        place_of_birth: data.place_of_birth,
                        date_of_birth: dateOfBirth,
                    },
                });

                return officer;
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

// UPDATE OFFICER
export async function updateOfficer(id: string, data: {
    name?: string;
    nrp?: string;
    rank?: string;
    position?: string;
    phone?: string;
    email?: string;
    unit_id?: string;
    patrol_unit_id?: string;
    avatar?: string;
    place_of_birth?: string;
    date_of_birth?: string;
}) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Update Officer",
        { recordResponse: true },
        async () => {
            try {
                const updateData: any = {
                    updated_at: new Date(),
                };

                if (data.name) updateData.name = data.name;
                if (data.nrp) updateData.nrp = data.nrp;
                if (data.rank) updateData.rank = data.rank;
                if (data.position) updateData.position = data.position;
                if (data.phone) updateData.phone = data.phone;
                if (data.email) updateData.email = data.email;
                if (data.unit_id) updateData.unit_id = data.unit_id;
                if (data.patrol_unit_id) updateData.patrol_unit_id = data.patrol_unit_id;
                if (data.avatar) updateData.avatar = data.avatar;
                if (data.place_of_birth) updateData.place_of_birth = data.place_of_birth;

                // Format date if provided
                if (data.date_of_birth) {
                    updateData.date_of_birth = new Date(data.date_of_birth);
                }

                const officer = await db.officers.update({
                    where: { id },
                    data: updateData,
                });

                return officer;
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

// DELETE OFFICER
export async function deleteOfficer(id: string) {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Delete Officer",
        { recordResponse: true },
        async () => {
            try {
                // Check if officer has any panic button logs
                const panicLogs = await db.panic_button_logs.count({
                    where: { officer_id: id }
                });

                if (panicLogs > 0) {
                    throw new InputParseError(
                        "Cannot delete officer with existing panic button logs. Please reassign or delete logs first."
                    );
                }

                const officer = await db.officers.delete({
                    where: { id },
                });

                return officer;
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

// GET UNITS FOR DROPDOWN
export async function getUnits() {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Get Units",
        { recordResponse: true },
        async () => {
            try {
                const units = await db.units.findMany({
                    select: {
                        code_unit: true,
                        name: true,
                        type: true,
                    },
                    orderBy: {
                        name: 'asc',
                    },
                });

                return units;
            } catch (err) {
                const crashReporterService = getInjection("ICrashReporterService");
                crashReporterService.report(err);
                throw new Error(
                    "An error happened. The developers have been notified. Please try again later.",
                );
            }
        },
    );
}

// GET ROLES FOR DROPDOWN
export async function getRoles() {
    const instrumentationService = getInjection("IInstrumentationService");
    return await instrumentationService.instrumentServerAction(
        "Get Roles",
        { recordResponse: true },
        async () => {
            try {
                const roles = await db.roles.findMany({
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                    orderBy: {
                        name: 'asc',
                    },
                });

                return roles;
            } catch (err) {
                const crashReporterService = getInjection("ICrashReporterService");
                crashReporterService.report(err);
                throw new Error(
                    "An error happened. The developers have been notified. Please try again later.",
                );
            }
        },
    );
}
