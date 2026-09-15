import Image from "next/image";
import Link from "@/components/ui/Link";
import { logoFull } from "@/assets";

export const FooterLogo = () => {
  return (
    <div className="space-y-5">
      <Link
        href="/"
        className="inline-flex items-center group select-none transition-opacity hover:opacity-90"
        aria-label="DeHash Home"
      >
        <Image
          src={logoFull}
          alt="DeHash"
          width={170}
          height={40}
          className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          priority
        />
        <span className="sr-only">DeHash</span>
      </Link>

      <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
        DeHash turns long, messy URLs into elegant short links backed by
        realtime analytics, smart monitoring and enterprise-grade security.
      </p>
    </div>
  );
};
