import Image from "next/image";
import Link from "../../atoms/link";
import { logo } from "@/assets";

export const NavbarLogo = () => {
    return (
        <Link href="/" className="flex items-center gap-1 group">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center group-hover:opacity-80 transition">
                <Image
                    src={logo}
                    width={20}
                    height={20}
                    alt="Logo"
                    className="dark:invert"
                />
            </div>
            <span className="text-xl font-bold text-foreground">DeHash</span>
        </Link>
    );
};
