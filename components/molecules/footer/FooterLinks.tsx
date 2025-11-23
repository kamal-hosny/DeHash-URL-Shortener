import Link from "next/link";
import { FOOTER_SECTIONS } from "./constants";

export const FooterLinks = () => {
    return (
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_SECTIONS.map((section) => (
                <div key={section.title}>
                    <h2 className="mb-4 text-xs font-semibold text-foreground tracking-wider uppercase">
                        {section.title}
                    </h2>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                        {section.links.map((link) => (
                            <li key={link.label}>
                                <Link
                                    href={link.href as any}
                                    className="hover:text-foreground transition-colors"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};
