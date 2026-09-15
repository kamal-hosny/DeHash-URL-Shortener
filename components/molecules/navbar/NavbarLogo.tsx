import Image from "next/image";
import Link from "../../ui/Link";
import { logo } from "@/assets";

export const NavbarLogo = () => {
  return (
    <Link href="/" className="flex items-center gap-2.5 group select-none">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 flex items-center justify-center group-hover:scale-105 group-hover:border-primary/40 transition-all duration-200 shadow-xs">
        <Image
          src={logo}
          width={20}
          height={20}
          alt="Logo"
          className="dark:invert group-hover:rotate-6 transition-transform duration-200"
          priority
          suppressHydrationWarning
        />
      </div>
      <span className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
        DeHash
      </span>
    </Link>
  );
};
