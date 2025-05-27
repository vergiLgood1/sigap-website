export const resourcesData = [
    {
        name: 'cities',
        description: 'City data management',
        attributes: {
            fields: ['id', 'name', 'code', 'geographic_id', 'created_at', 'updated_at']
        }
    },
    {
        name: 'contact_messages',
        description: 'Contact message management',
        attributes: {
            fields: ['id', 'name', 'email', 'phone', 'message_type', 'message_type_label', 'message', 'status', 'created_at', 'updated_at']
        }
    },
    {
        name: 'crime_incidents',
        description: 'Crime case management',
        attributes: {
            fields: ['id', 'crime_id', 'crime_category_id', 'date', 'time', 'location', 'latitude', 'longitude', 'description', 'victim_count', 'status', 'created_at', 'updated_at']
        }
    },
    {
        name: 'crime_categories',
        description: 'Crime category management',
        attributes: {
            fields: ['id', 'name', 'description', 'created_at', 'updated_at']
        }
    },
    {
        name: 'crimes',
        description: 'Crime data management',
        attributes: {
            fields: ['id', 'district_id', 'city_id', 'year', 'number_of_crime', 'rate', 'heat_map', 'created_at', 'updated_at']
        }
    },
    {
        name: 'demographics',
        description: 'Demographic data management',
        attributes: {
            fields: ['id', 'district_id', 'city_id', 'province_id', 'year', 'population', 'population_density', 'poverty_rate', 'created_at', 'updated_at']
        }
    },
    {
        name: 'districts',
        description: 'District data management',
        attributes: {
            fields: ['id', 'city_id', 'name', 'code', 'created_at', 'updated_at']
        }
    },
    {
        name: 'geographics',
        description: 'Geographic data management',
        attributes: {
            fields: ['id', 'district_id', 'latitude', 'longitude', 'land_area', 'polygon', 'created_at', 'updated_at']
        }
    },
    {
        name: 'profiles',
        description: 'User profile management',
        attributes: {
            fields: ['id', 'user_id', 'avatar', 'username', 'first_name', 'last_name', 'bio', 'address', 'birth_date']
        }
    },
    {
        name: 'users',
        description: 'User account management',
        attributes: {
            fields: ['id', 'roles_id', 'email', 'phone', 'encrypted_password', 'invited_at', 'confirmed_at', 'email_confirmed_at', 'recovery_sent_at', 'last_sign_in_at', 'app_metadata', 'user_metadata', 'created_at', 'updated_at', 'banned_until', 'is_anonymous']
        }
    },
    {
        name: 'roles',
        description: 'Role management',
        attributes: {
            fields: ['id', 'name', 'description', 'created_at', 'updated_at']
        }
    },
    {
        name: 'resources',
        description: 'Resource management',
        attributes: {
            fields: ['id', 'name', 'description', 'instance_role', 'relations', 'attributes', 'created_at', 'updated_at']
        }
    },
    {
        name: 'permissions',
        description: 'Permission management',
        attributes: {
            fields: ['id', 'action', 'resource_id', 'role_id', 'created_at', 'updated_at']
        }
    },
    {
        name: 'units',
        description: 'Police unit management',
        attributes: {
            fields: ['code_unit', 'district_id', 'name', 'description', 'type', 'created_at', 'updated_at', 'address', 'land_area', 'latitude', 'longitude', 'location', 'city_id', 'phone']
        }
    },
    {
        name: 'patrol_units',
        description: 'Patrol unit management',
        attributes: {
            fields: ['id', 'unit_id', 'location_id', 'name', 'type', 'status', 'radius', 'created_at']
        }
    },
    {
        name: 'officers',
        description: 'Police officer management',
        attributes: {
            fields: ['id', 'unit_id', 'role_id', 'nrp', 'name', 'rank', 'position', 'phone', 'email', 'valid_until', 'created_at', 'updated_at', 'avatar', 'qr_code', 'patrol_unitsId']
        }
    },
    {
        name: 'unit_statistics',
        description: 'Unit statistics management',
        attributes: {
            fields: ['id', 'unit_id', 'year', 'month', 'crime_solved', 'crime_total', 'performance_index', 'created_at', 'updated_at']
        }
    },
    {
        name: 'incident_logs',
        description: 'Incident logs management',
        attributes: {
            fields: ['id', 'user_id', 'location_id', 'category_id', 'description', 'source', 'time', 'verified', 'created_at', 'updated_at']
        }
    },
    {
        name: 'evidence',
        description: 'Incident evidence management',
        attributes: {
            fields: ['id', 'incident_id', 'type', 'url', 'description', 'caption', 'metadata', 'uploaded_at']
        }
    },
    {
        name: 'events',
        description: 'Events management',
        attributes: {
            fields: ['id', 'name', 'description', 'code', 'created_at', 'user_id']
        }
    },
    {
        name: 'sessions',
        description: 'User session management',
        attributes: {
            fields: ['id', 'user_id', 'event_id', 'status', 'created_at']
        }
    },
    {
        name: 'locations',
        description: 'Location data management',
        attributes: {
            fields: ['id', 'district_id', 'event_id', 'address', 'type', 'latitude', 'longitude', 'land_area', 'polygon', 'geometry', 'created_at', 'updated_at', 'location', 'distance_to_unit']
        }
    },
    {
        name: 'location_logs',
        description: 'Location logs management',
        attributes: {
            fields: ['id', 'user_id', 'latitude', 'longitude', 'accuracy', 'heading', 'speed', 'altitude', 'created_at']
        }
    },
    {
        name: 'logs',
        description: 'System logs management',
        attributes: {
            fields: ['id', 'action', 'entity', 'entity_id', 'details', 'ip_address', 'user_agent', 'created_at']
        }
    }
];
