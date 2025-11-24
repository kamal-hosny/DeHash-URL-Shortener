import Link from "../../atoms/Link";
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
  <Button variant="ghost" size="icon" onClick={onToggle} className="md:hidden">
    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
  </Button>
);

export const MobileMenuDropdown = ({
  isOpen,
  onClose,
  isAuth,
}: Omit<MobileMenuProps, "onToggle">) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden py-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
      <ul className="space-y-1">
        {NAV_LINKS.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className="block px-4 py-2 text-foreground hover:bg-accent rounded-lg transition"
              onClick={onClose}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>

      {!isAuth && (
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <Link
            href="/signin"
            className="block px-4 py-2 text-center border border-border text-foreground rounded-lg hover:bg-accent transition"
            onClick={onClose}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="block px-4 py-2 text-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            onClick={onClose}
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};
