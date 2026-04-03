import MuiAvatar from "@mui/material/Avatar";
import { cn } from "@/lib/utils";

type AvatarProps = {
    name?: string;
    src?: string;
    className?: string;
};

const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
};

export function Avatar({ name, src, className }: AvatarProps) {
    return (
        <MuiAvatar
            src={src}
            alt={name || "Profile image"}
            className={cn(
                "h-10 w-10 border border-white/90 text-sm font-semibold shadow-[0_10px_24px_rgba(15,23,42,0.12)]",
                className
            )}
            sx={{
                bgcolor: src ? undefined : "#dbeafe",
                color: src ? undefined : "#1d4ed8",
            }}
        >
            {getInitials(name)}
        </MuiAvatar>
    );
}
