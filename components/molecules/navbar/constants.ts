import {
    DollarSign,
    LayoutDashboard,
    LogOut,
    Settings,
    type LucideIcon,
} from "lucide-react";

export const NAV_LINKS = [
    { name: "Home", href: "/" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
];

export type UserMenuItem =
    | { name: string; href: string; icon: LucideIcon }
    | { name: string; action: "signout"; icon: LucideIcon };

export const USER_MENU: UserMenuItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Earnings", href: "/earnings", icon: DollarSign },
    { name: "Sign out", action: "signout", icon: LogOut },
];
