-- AlterTable
ALTER TABLE "units" ADD COLUMN     "phone" TEXT;

grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role, prisma;
grant all privileges on all functions in schema public to postgres, anon, authenticated, service_role, prisma;
grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role, prisma;

alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role, prisma;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role, prisma;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role, prisma;

grant usage on schema "public" to anon;
grant usage on schema "public" to authenticated;
grant usage on schema "public" to prisma;