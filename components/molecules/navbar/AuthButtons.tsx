import Link from "../../ui/Link";

export const AuthButtons = () => {
  return (
    <div className="hidden md:flex items-center gap-2">
      <Link
        href="/signin"
        className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/40 rounded-full transition-colors"
      >
        Login
      </Link>

      <Link
        href="/signup"
        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:opacity-95 hover:shadow-md hover:shadow-primary/20 transition-all active:scale-95 shadow-xs"
      >
        Get Started
      </Link>
    </div>
  );
};
