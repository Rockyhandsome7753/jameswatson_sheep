import type { ReactNode } from "react";
import { NavLink } from "../../app/router";
import { IconGrid, IconLayers, IconUsers } from "../ui/Icon";
import "./TabBar.css";

interface Tab {
  to: string;
  label: string;
  icon: ReactNode;
}

const TABS: Tab[] = [
  { to: "/", label: "Home", icon: <IconGrid size={21} /> },
  { to: "/details", label: "Details", icon: <IconLayers size={21} /> },
  { to: "/support", label: "Support", icon: <IconUsers size={21} /> },
];

export function TabBar() {
  return (
    <nav className="app-tabbar" aria-label="Primary">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === "/"}
          className="app-tabbar__tab"
          activeClassName="is-active"
        >
          <span className="app-tabbar__icon">{tab.icon}</span>
          <span className="app-tabbar__label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
