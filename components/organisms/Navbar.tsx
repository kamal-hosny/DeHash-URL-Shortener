"use client";

import { useAuthUser } from "@/store/authStore";
import { NavbarLogo } from "../molecules/navbar/NavbarLogo";
import { NavLinks } from "../molecules/navbar/NavLinks";
import { AuthButtons } from "../molecules/navbar/AuthButtons";
import { UserDropdown } from "../molecules/navbar/UserDropdown";
import {
  MobileMenuToggle,
  MobileMenuDropdown,
} from "../molecules/navbar/MobileMenu";
import { useAuthSync } from "@/hooks/useAuthSync";
import { useNavbarLogic } from "@/hooks/useNavbarLogic";

const Navbar = () => {
  const { menuOpen, toggleMenu, closeMenu } = useNavbarLogic();
  const { sessionStatus } = useAuthSync();
  const user = useAuthUser();
  const isAuth = Boolean(user);
  const isAuthLoading = sessionStatus === "loading";

  return (
    <>
      {menuOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-45 md:hidden"
        />
      )}

      <nav className="bg-background/85 backdrop-blur-xl border-b border-border/50 fixed top-0 left-0 right-0 z-50 transition-all duration-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <NavbarLogo />

            <div className="flex items-center gap-3">
              <NavLinks />

              <div
                className="hidden md:block h-5 w-px bg-border/70 mx-1"
                aria-hidden="true"
              />

              {isAuth ? (
                <UserDropdown user={user!} />
              ) : isAuthLoading ? (
                <div className="hidden md:flex items-center gap-3">
                  <div className="h-9 w-16 rounded-full bg-muted animate-pulse" />
                  <div className="h-9 w-28 rounded-full bg-primary/20 animate-pulse" />
                </div>
              ) : (
                <AuthButtons />
              )}

              <MobileMenuToggle isOpen={menuOpen} onToggle={toggleMenu} />
            </div>
          </div>

          <MobileMenuDropdown
            isOpen={menuOpen}
            onClose={closeMenu}
            isAuth={isAuth}
          />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
