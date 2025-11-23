import { useState, useMemo, useCallback } from "react";
import Link from "../../atoms/link";
import { ChevronDown } from "lucide-react";
import { USER_MENU } from "./constants";
import { useAuthDispatch } from "@/store/authStore";
import { signOut } from "next-auth/react";

interface UserDropdownProps {
    user: any; 
}

export const UserDropdown = ({ user }: UserDropdownProps) => {
    const [userOpen, setUserOpen] = useState(false);
    const dispatch = useAuthDispatch();

    const userInitial = useMemo(() => {
        if (!user) return "U";
        return user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U";
    }, [user]);

    const userName = user?.name ?? "Guest User";
    const userEmail = user?.email ?? "user@example.com";

    const closeUserMenu = useCallback(() => setUserOpen(false), []);

    const handleSignOut = useCallback(async () => {
        try {
            await signOut({ callbackUrl: "/signin" });
        } catch (error) {
            console.error("Failed to sign out", error);
        } finally {
            dispatch({ type: "SIGN_OUT" });
            setUserOpen(false);
        }
    }, [dispatch]);

    return (
        <div className="relative">
            <button
                onClick={() => setUserOpen((prev) => !prev)}
                className="flex items-center gap-2 hover:opacity-80 transition"
            >
                <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold ring-2 ring-border">
                    {userInitial}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${userOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {userOpen && (
                <div className="absolute top-14 right-0 w-56 bg-background border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-muted border-b border-border">
                        <p className="font-semibold text-foreground">{userName}</p>
                        <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
                    </div>

                    <ul className="p-2">
                        {USER_MENU.map((item) => (
                            <li key={item.name}>
                                {"href" in item ? (
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-accent rounded-lg transition"
                                        onClick={closeUserMenu}
                                    >
                                        <item.icon className="w-4 h-4 text-muted-foreground" />
                                        {item.name}
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-foreground hover:bg-destructive/10 rounded-lg transition"
                                    >
                                        <item.icon className="w-4 h-4 text-muted-foreground" />
                                        {item.name}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
