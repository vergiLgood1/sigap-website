import Hero from "@/app/_components/hero";
import ConnectSupabaseSteps from "@/app/_components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/app/_components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/app/_utils/supabase/check-env-vars";

export default async function Home() {
  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col gap-6 px-4">
        <h2 className="font-medium text-xl mb-4">Next steps</h2>
        {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
      </main>
    </>
  );
}
