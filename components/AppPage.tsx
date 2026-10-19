import { ViewTransition } from "react";

// A page inside the app shell: a wide, calm column that fades and rises in like every screen.
export function AppPage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <ViewTransition enter="page-in" exit="page-out">
      <main className={`settle mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-8 md:px-10 md:py-12 ${className}`}>{children}</main>
    </ViewTransition>
  );
}
