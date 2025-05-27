import { redirect } from "next/navigation";
// import { checkSession } from "./_actions/session";
import { createClient } from "@/app/_utils/supabase/client";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const supabase = createClient();

  // const {
  //   data: { session },
  // } = await supabase.auth.getSession();

  // if (!session) {
  //   return redirect("/sign-in");
  // }

  return <div className="max-w-full gap-12 items-start">{children}</div>;
}
