import Image from "next/image";
import Link from "@/components/ui/Link";
import { logoFull } from "@/assets";

export const NavbarLogo = () => {
  return (
    <Link
      href="/"
      className="flex items-center group select-none py-1"
      aria-label="DeHash Home"
    >
      <Image
        src={logoFull}
        alt="DeHash"
        width={136}
        height={32}
        className="h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02] group-hover:opacity-90"
        priority
        suppressHydrationWarning
      />
      <span className="sr-only">DeHash</span>
    </Link>
  );
};
