import { useState, useCallback } from "react";

export const useNavbarLogic = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = useCallback(() => setMenuOpen(false), []);
    const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);

    return {
        menuOpen,
        closeMenu,
        toggleMenu,
        setMenuOpen,
    };
};
