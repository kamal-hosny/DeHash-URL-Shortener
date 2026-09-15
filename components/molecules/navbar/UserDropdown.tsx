import { useState, useCallback, useRef, useEffect } from "react";
import Link from "../../ui/Link";
import { ChevronDown } from "@/assets/icons";
import { USER_MENU } from "./constants";
import { useAuthDispatch } from "@/store/authStore";
import { signOut } from "next-auth/react";
import { getInitials } from "@/utils/getInitials";
import type { User } from "@/types";

interface UserDropdownProps {
  user: User;
}

export const UserDropdown = ({ user }: UserDropdownProps) => {
  const [userOpen, setUserOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAuthDispatch();

  const userName = user?.name ?? "Guest User";
  const userEmail = user?.email ?? "user@example.com";
  const initials = getInitials(userName).slice(0, 2).toUpperCase();

  const closeUserMenu = useCallback(() => setUserOpen(false), []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut({ callbackUrl: "/signin" });
    } catch (error) {
      console.error("Failed to sign out", error);
    } finally {
      dispatch({ type: "SIGN_OUT" });
      setUserOpen(false);
    }
  }, [dispatch]);

  // Handle click outside and Escape key to close menu
  useEffect(() => {
    if (!userOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUserOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setUserOpen((prev) => !prev)}
        aria-expanded={userOpen}
        aria-haspopup="true"
        className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-full border border-border/70 hover:border-border bg-card/40 hover:bg-accent/40 backdrop-blur-sm transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 shadow-xs cursor-pointer"
      >
        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 text-primary flex items-center justify-center font-bold text-xs tracking-wider shadow-inner group-hover:scale-105 transition-transform duration-200">
          {initials}
        </span>
        <span className="hidden sm:inline-block text-xs font-semibold text-foreground/90 max-w-[110px] truncate">
          {userName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground/70 group-hover:text-foreground transition-transform duration-200 ${
            userOpen ? "rotate-180 text-foreground" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {userOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150 z-50">
          {/* User Profile Header */}
          <div className="p-3.5 bg-muted/40 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 via-primary/15 to-accent/20 border border-primary/25 text-primary font-bold text-sm flex items-center justify-center uppercase shadow-inner shrink-0">
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {userName}
                </p>
                <p className="text-xs text-muted-foreground/80 truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1.5 space-y-0.5">
            {USER_MENU.map((item) => {
              if ("href" in item) {
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/60 rounded-xl transition-all duration-150 group"
                    onClick={closeUserMenu}
                  >
                    <div className="p-1.5 rounded-lg bg-muted/70 text-muted-foreground group-hover:text-foreground group-hover:bg-background transition-colors">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span>{item.name}</span>
                  </Link>
                );
              }

              return (
                <div key={item.name}>
                  <div className="h-px bg-border/50 my-1 mx-1.5" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-destructive/90 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-150 group cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-destructive/10 text-destructive group-hover:bg-destructive/20 transition-colors">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span>{item.name}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
