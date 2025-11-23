import {
    Dribbble,
    Github,
    Linkedin,
    Twitter,
} from "@/assets/icons";

export const FOOTER_SECTIONS = [
    {
        title: "Company",
        links: [
            { label: "Pricing", href: "/pricing" },
            { label: "Contact", href: "/contact" },
            { label: "Careers", href: "/careers" },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms & Conditions", href: "/terms" },
        ],
    },
];

export const SOCIAL_LINKS = [
    { label: "Github", href: "https://github.com", icon: Github },
    { label: "Twitter", href: "https://x.com", icon: Twitter },
    { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
    { label: "Dribbble", href: "https://dribbble.com", icon: Dribbble },
];
