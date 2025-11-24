import Image from "next/image";
import Link from "@/components/atoms/Link";
import { logo } from "@/assets";

export const FooterLogo = () => {
  return (
    <div className="space-y-5">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src={logo}
          width={40}
          height={40}
          alt="Logo"
          className="dark:invert"
          priority
        />
        <span className="text-3xl font-bold tracking-tight text-foreground">
          DeHash
        </span>
      </Link>

      <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
        DeHash turns long, messy URLs into elegant short links backed by
        realtime analytics, smart monitoring and enterprise-grade security.
      </p>
    </div>
  );
};
