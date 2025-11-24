"use client";
import React, { useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  SIDEBAR_ITEMS,
  BOTTOM_ITEMS,
} from "../molecules/sidebar/sidebar-constants";
import { X } from "@/assets/icons";
import { NavbarLogo } from "../molecules/navbar/NavbarLogo";
import Link from "../atoms/Link";
import UserProfile from "../molecules/sidebar/UserProfile";
import { signOut } from "next-auth/react";
import { useAuthDispatch } from "@/store/authStore";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const dispatch = useAuthDispatch();
  const handleSignOut = useCallback(async () => {
    try {
      await signOut({ callbackUrl: "/signin" });
    } catch (error) {
      console.error("Failed to sign out", error);
    } finally {
      dispatch({ type: "SIGN_OUT" });
    }
  }, [dispatch]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-background border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border">
            <NavbarLogo />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                    }
                  `}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Footer Navigation */}
          <div className="p-3 border-t border-border space-y-1">
            {BOTTOM_ITEMS.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                onClick={item.variant === "danger" ? handleSignOut : undefined}
                className={`
                  w-full justify-start gap-3
                  ${
                    item.variant === "danger"
                      ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
                      : ""
                  }
                `}
              >
                <item.icon size={18} />
                {item.label}
              </Button>
            ))}
          </div>

          {/* User Profile Snippet */}

          <UserProfile />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
