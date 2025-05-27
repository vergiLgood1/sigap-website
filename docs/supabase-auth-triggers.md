# Conditional Triggering System with Supabase Auth

This document describes how our custom authentication triggers work with Supabase Auth to handle different user types.

## Overview

The system conditionally routes new user registrations to either:

1. Standard users - stored in `users` and `profiles` tables
2. Officer users - stored in the `officers` table

## How It Works

### User Registration

When a user signs up via Supabase Auth:

1. The `handle_new_user` trigger function checks the user metadata for an `is_officer` flag
2. Standard users are created in the `users` and `profiles` tables
3. Officer users are created in the `officers` table with their specialized data

### User Updates

When a user is updated in Supabase Auth:

1. The `handle_user_update` function determines if the user is an officer
2. Updates are applied to the appropriate table based on user type
3. Officer-specific data is extracted from the `officer_data` metadata field

### User Deletion

When a user is deleted from Supabase Auth:

1. The `handle_user_delete` function determines if the user is an officer
2. Removes the user from the appropriate tables based on user type

### User Type Changes

When a user's type changes (e.g., from standard user to officer):

1. The `handle_user_type_change` function handles the transition
2. Data is moved from one set of tables to another as appropriate

## Metadata Structure

For officer registrations, the following metadata structure is expected:

```json
{
  "is_officer": true,
  "officer_data": {
    "unit_id": "required_unit_id",
    "nrp": "officer_nrp",
    "rank": "officer_rank",
    "position": "officer_position",
    "phone": "optional_phone"
  }
}
```

## Implementation

These triggers are implemented in the database and automatically run when Supabase Auth events occur.
