import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { TabBar } from "./TabBar";

export interface AppLayoutProps {
  back?: boolean;
  title?: string;
  headerAction?: ReactNode;
  /** Hide the bottom tab bar (e.g. on a focused flow screen). */
  hideTabs?: boolean;
  children: ReactNode;
}

/**
 * The phone frame: fixed header, scrollable content, fixed tab bar.
 * Content is inset for safe areas so nothing hides behind the notch or
 * the home indicator.
 */
export function AppLayout({
  back,
  title,
  headerAction,
  hideTabs = false,
  children,
}: AppLayoutProps) {
  return (
    <div className="app-shell">
      <AppHeader back={back} title={title} action={headerAction} />
      <div className="app-scroll">{children}</div>
      {!hideTabs && <TabBar />}
    </div>
  );
}
