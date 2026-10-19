import { AppShell } from "@/components/shell/AppShell";
import { requireMe } from "@/lib/people/me";

// Everything signed in sits inside the shell: sidebar on a desktop, tab bar on a phone.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { me } = await requireMe();
  return (
    <AppShell role={me.role} name={me.name}>
      {children}
    </AppShell>
  );
}
