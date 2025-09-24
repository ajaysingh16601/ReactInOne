import {
  HiChartPie,
  HiViewBoards,
  HiInbox,
  HiUserCircle,
  HiShoppingBag,
  HiArrowSmRight,
  HiTable,
} from "react-icons/hi";

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
  { label: "Kanban", href: "/kanban", icon: HiViewBoards, badge: "Pro" },
  { label: "Inbox", href: "/inbox", icon: HiInbox, badge: "3" },
  { label: "Users", href: "/users", icon: HiUserCircle },
  { label: "Sign In", href: "/signin", icon: HiArrowSmRight },
  { label: "Sign Up", href: "/signup", icon: HiTable },
  {
    label: "Settings",
    icon: HiChartPie,
    children: [
      { label: "Profile", href: "/settings/profile" },
      { label: "Preferences", href: "/settings/preferences" },
    ],
  },
];
