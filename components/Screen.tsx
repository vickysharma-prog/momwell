import { ViewTransition } from "react";

// Every screen: one column for one hand, and a soft fade-and-rise when you arrive (styles in globals.css).
export function Screen({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <ViewTransition enter="page-in" exit="page-out">
      <main className={`mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 py-8 ${className}`}>{children}</main>
    </ViewTransition>
  );
}
