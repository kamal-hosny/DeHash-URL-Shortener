import Link from "../../ui/Link";
import { NAV_LINKS } from "./constants";
import { Menu, X } from "@/assets/icons";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  isAuth: boolean;
}

export const MobileMenuToggle = ({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onToggle}
    className="md:hidden rounded-xl hover:bg-muted/70 cursor-pointer"
    aria-label="Toggle navigation menu"
  >
    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
  </Button>
);

export const MobileMenuDropdown = ({
  isOpen,
  onClose,
  isAuth,
}: Omit<MobileMenuProps, "onToggle">) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden py-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
      <ul className="space-y-1">
        {NAV_LINKS.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className="block px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/50 rounded-xl transition"
              onClick={onClose}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>

      {!isAuth && (
        <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
          <Link
            href="/signin"
            className="block px-4 py-2.5 text-sm font-medium text-center border border-border/70 text-foreground rounded-xl hover:bg-accent/50 transition"
            onClick={onClose}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="block px-4 py-2.5 text-sm font-medium text-center bg-primary text-primary-foreground rounded-xl hover:opacity-95 transition shadow-xs"
            onClick={onClose}
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};
