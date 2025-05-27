import { PrismaClient } from "@prisma/client";

export class PermissionSeeder {
  constructor(private prisma: PrismaClient) {}

  async run(): Promise<void> {
    console.log('Seeding permissions...');

    // Delete existing permissions to avoid duplicates
    await this.prisma.permissions.deleteMany({});

    try {
      // Fetch all resources and roles
      const allResources = await this.prisma.resources.findMany();

      const adminRole = await this.prisma.roles.findUnique({
        where: { name: 'admin' },
      });

      const officerRole = await this.prisma.roles.findUnique({
        where: { name: 'officer' },
      })

      const viewerRole = await this.prisma.roles.findUnique({
        where: { name: 'viewer' },
      });

      const staffRole = await this.prisma.roles.findUnique({
        where: { name: 'staff' },
      });

      if (!adminRole || !viewerRole || !staffRole || !officerRole) {
        console.error('One or more roles not found. Please seed roles first.');
        return;
      }

      // Admin permissions - full access to all resources
      for (const resource of allResources) {
        await this.createPermissions(adminRole.id, resource.id, [
          'create',
          'read',
          'update',
          'delete',
        ]);
      }

      // Viewer permissions - read-only access to all resources
      for (const resource of allResources) {
        await this.createPermissions(viewerRole.id, resource.id, ['read']);
      }

      // Staff permissions - mixed permissions based on resource
      for (const resource of allResources) {
        if (
          ['roles', 'permissions', 'resources', 'users'].includes(resource.name)
        ) {
          // Staff can only read roles, permissions, resources, and users
          await this.createPermissions(staffRole.id, resource.id, ['read']);
        } else {
          // Staff can create, read, update but not delete other resources
          await this.createPermissions(staffRole.id, resource.id, [
            'create',
            'read',
            'update',
          ]);
        }
      }

      // Officer permissions - operational access focused on their domain
      for (const resource of allResources) {
        // Define which resources officers can fully manage
        const officerFullAccessResources = [
          'incident_logs',
          'evidence',
          'locations',
          'location_logs',
          'patrol_units'
        ];

        // Define resources officers can view and update but not create/delete
        const officerLimitedAccessResources = [
          'crime_incidents',
          'officers'
        ];

        // Define resources officers can only read
        const officerReadOnlyResources = [
          'crimes',
          'crime_categories',
          'units',
          'districts',
          'cities'
        ];

        if (officerFullAccessResources.includes(resource.name)) {
          // Officers can fully manage operational resources
          await this.createPermissions(officerRole.id, resource.id, [
            'create',
            'read',
            'update',
            'delete',
          ]);
        } else if (officerLimitedAccessResources.includes(resource.name)) {
          // Officers can read and update but not create/delete certain resources
          await this.createPermissions(officerRole.id, resource.id, [
            'read',
            'update',
          ]);
        } else if (officerReadOnlyResources.includes(resource.name)) {
          // Officers can only read reference data
          await this.createPermissions(officerRole.id, resource.id, ['read']);
        } else if (['events', 'sessions'].includes(resource.name)) {
          // Officers can create and manage events/sessions
          await this.createPermissions(officerRole.id, resource.id, [
            'create',
            'read',
            'update',
          ]);
        } else {
          // For all other resources, officers get read-only access
          await this.createPermissions(officerRole.id, resource.id, ['read']);
        }
      }

      console.log('Permissions seeded successfully!');
    } catch (error) {
      console.error('Error seeding permissions:', error);
    }
  }

  private async createPermissions(
    roleId: string,
    resourceId: string,
    actions: string[]
  ) {
    try {
      // Prepare all permissions at once
      const permissionsData = actions.map((action) => ({
        action: action,
        resource_id: resourceId,
        role_id: roleId,
      }));

      // Create permissions in smaller batches to avoid potential issues
      const batchSize = 50;
      for (let i = 0; i < permissionsData.length; i += batchSize) {
        const batch = permissionsData.slice(i, i + batchSize);
        
        // Create batch of permissions
        const result = await this.prisma.permissions.createMany({
          data: batch,
          skipDuplicates: true, // Skip if the permission already exists
        });

        console.log(
          `Created ${result.count} permissions for role ${roleId} on resource ${resourceId}`
        );
      }

      console.log(
        `Completed creating permissions for role ${roleId} on resource ${resourceId}: ${actions.join(', ')}`
      );
    } catch (error) {
      console.error(
        `Error creating permissions for role ${roleId} on resource ${resourceId}:`,
        error
      );
    }
  }
}