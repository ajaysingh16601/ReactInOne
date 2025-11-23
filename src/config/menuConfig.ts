import {
  HiChartPie,
  HiViewBoards,
  HiUserCircle,
  HiShoppingBag,
  HiTable,
} from "react-icons/hi";
import { FiMessageCircle } from "react-icons/fi";

export interface MenuItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  badge?: string;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  { label: "Dashboard", href: "/", icon: HiChartPie },
  { label: "About", href: "/about", icon: HiShoppingBag },
  { label: "Inbox", href: "/chat", icon: FiMessageCircle },
  { label: "Kanban", href: "/kanban", icon: HiViewBoards, badge: "Pro" },
  { label: "Users", href: "/users", icon: HiUserCircle },
  { label: "Settings", href: "/settings", icon: HiTable },
  {
    label: "Settings",
    icon: HiChartPie,
    children: [
      { label: "Profile", href: "/settings/profile" },
      { label: "Preferences", href: "/settings/preferences" },
    ],
  },
];
