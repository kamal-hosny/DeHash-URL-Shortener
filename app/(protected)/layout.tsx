"use client"
import React, { useState } from 'react';
import Sidebar from '@/components/organisms/Sidebar';
import { Menu } from '@/assets/icons';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out lg:ml-0">
                {/* Mobile Header */}
                <div className="lg:hidden h-16 bg-card border-b border-border flex items-center px-4 sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md">
                        <Menu size={20} />
                    </button>
                    <span className="ml-3 font-semibold text-foreground">Dashboard</span>
                </div>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
