import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TabBar from "@/components/TabBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div style={{ minHeight: "100vh", background: "#111110", position: "relative" }}>
      <div style={{ paddingBottom: 90 }}>
        {children}
      </div>
      <TabBar />
    </div>
  );
}
