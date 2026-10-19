import { AppShell } from "@/components/shell/AppShell";
import { DemoBar } from "@/components/shell/DemoBar";
import { requireMe } from "@/lib/people/me";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Everything signed in sits inside the shell: sidebar on a desktop, tab bar on a phone. A demo family also gets the
// bar to switch between Maya, Sam and Dr Lee.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { me } = await requireMe();
  const { data } = await supabaseAdmin().from("profiles").select("demo_family").eq("id", me.id).single();
  return (
    <AppShell role={me.role} name={me.name} banner={data?.demo_family ? <DemoBar role={me.role} /> : null}>
      {children}
    </AppShell>
  );
}
