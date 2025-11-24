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

      <nav className="bg-background backdrop-blur-lg border-b border-border fixed top-0 left-0 right-0 z-60 shadow-sm">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <NavbarLogo />

            <div className="flex items-center gap-3">
              <NavLinks />

              <span className="max-md:hidden">|</span>

              {isAuth ? (
                <UserDropdown user={user!} />
              ) : isAuthLoading ? (
                <div className="hidden md:flex items-center gap-3">
                  <div className="h-10 w-20 rounded-lg bg-muted animate-pulse" />
                  <div className="h-10 w-32 rounded-lg bg-primary/30 animate-pulse" />
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
