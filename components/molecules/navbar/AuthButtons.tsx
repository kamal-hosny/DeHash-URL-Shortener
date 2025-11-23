import Link from "../../atoms/link";

export const AuthButtons = () => {
    return (
        <div className="hidden md:flex items-center gap-3">
            <Link
                href="/signin"
                className="px-5 py-2 text-muted-foreground hover:text-foreground transition"
            >
                Login
            </Link>

            <Link
                href="/signup"
                className="px-5 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition shadow-sm"
            >
                Get Started
            </Link>
        </div>
    );
};
