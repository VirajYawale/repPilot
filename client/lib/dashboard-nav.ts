import { Home, MessageSquare, Settings, Library, type LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const dashboardNavGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        title: "Overview",
        href: "/dashboard",
        icon: Home,
        exact: true,
      },
      {
        title: "Repositories",
        href: "/dashboard/repositories",
        icon: Library,
      },
      {
        title: "Chat",
        href: "/chat",
        icon: MessageSquare,
      },
    ],
  },
  {
    label: "Preferences",
    items: [
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

export function isDashboardNavActive(pathname: string, href: string, exact?: boolean) {
  if (exact) {
    return pathname === href;
  }
  return pathname.startsWith(href);
}
