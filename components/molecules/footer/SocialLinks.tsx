import Link from "@/components/ui/Link";
import { SOCIAL_LINKS } from "./constants";

export const SocialLinks = () => {
  return (
    <div className="flex items-center gap-4">
      {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
        <Link
          key={label}
          href={href as any}
          aria-label={label}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border 
          hover:border-primary hover:text-primary 
          transition-all hover:shadow-sm"
        >
          <Icon className="h-4 w-4" />
        </Link>
      ))}
    </div>
  );
};
