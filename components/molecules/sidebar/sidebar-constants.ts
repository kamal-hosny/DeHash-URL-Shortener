import { LayoutDashboard, Link2, BarChart3, Settings, CreditCard, LogOut } from 'lucide-react';

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
        label: 'Billing',
        icon: CreditCard,
        href: '/dashboard/billing',
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
