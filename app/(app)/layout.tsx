import { AppShell } from "@/components/shell/AppShell";
import { DemoBar } from "@/components/shell/DemoBar";
import { requireMe } from "@/lib/people/me";
import { demoMother } from "@/lib/demo/create";

// Everything signed in sits inside the shell: sidebar on a desktop, tab bar on a phone. A demo family also gets the
// bar to switch between Maya, Sam and Dr Lee.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { me } = await requireMe();
  const demo = await demoMother(me.demo_family);
  return (
    <AppShell role={me.role} name={me.name} banner={demo ? <DemoBar role={me.role} born={demo.born} /> : null}>
      {children}
    </AppShell>
  );
}
