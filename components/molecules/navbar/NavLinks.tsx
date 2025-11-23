import Link from "../../atoms/link";

export const NAV_LINKS = [
    { name: "Home", href: "/" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
];

export const NavLinks = () => {
    return (
        <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
                <Link
                    key={link.name}
                    href={link.href}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition"
                >
                    {link.name}
                </Link>
            ))}
        </div>
    );
};
