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
            className={cn("h-10 w-10 text-sm font-semibold shadow-[6px_6px_12px_#121722,-6px_-6px_12px_#2a3448]", className)}
            sx={{
                bgcolor: src ? undefined : "#20293a",
                color: src ? undefined : "#d9e4f8",
            }}
        >
            {getInitials(name)}
        </MuiAvatar>
    );
}
