create table if not exists public.location_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade on update no action,
    latitude double precision not null,
    longitude double precision not null,
    location gis.geography(Point,4326) NOT NULL,
    timestamp timestamptz not null,
    description varchar(255),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_location_logs_user_id on public.location_logs(user_id);
create index if not exists idx_location_logs_timestamp on public.location_logs(timestamp);