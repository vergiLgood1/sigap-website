import { createClient } from "@supabase/supabase-js";

export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SERVICE_ROLE_SECRET!
  );
