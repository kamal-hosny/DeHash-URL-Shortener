export const Copyright = () => {
    return (
        <div className="space-y-0.5">
            <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} DeHash — All rights reserved.
            </span>
            <span className="text-sm text-muted-foreground/90 italic flex items-center gap-2">
                by Kamal Hosny
            </span>
        </div>
    );
};
