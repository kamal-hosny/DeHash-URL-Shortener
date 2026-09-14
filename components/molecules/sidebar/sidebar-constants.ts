import { LayoutDashboard, Link2, BarChart3, Activity, Settings, CreditCard, Sparkles, LogOut } from 'lucide-react';

export const SIDEBAR_ITEMS = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
    },
    {
        label: 'My Links',
        icon: Link2,
        href: '/dashboard/links',
    },
    {
        label: 'Analytics',
        icon: BarChart3,
        href: '/dashboard/analytics',
    },
    {
        label: 'Activity Logs',
        icon: Activity,
        href: '/dashboard/analytics/logs',
    },
    {
        label: 'Billing',
        icon: CreditCard,
        href: '/dashboard/billing',
    },
    {
        label: 'Discount Codes',
        icon: Sparkles,
        href: '/dashboard/billing/coupons',
        adminOnly: true,
    },
    {
        label: 'Settings',
        icon: Settings,
        href: '/dashboard/settings',
    },
];

export const BOTTOM_ITEMS = [
    {
        label: 'Log Out',
        icon: LogOut,
        href: '#', // Handle logout logic
        variant: 'danger',
    },
];
