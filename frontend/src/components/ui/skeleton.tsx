import MuiSkeleton from "@mui/material/Skeleton";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
    return (
        <MuiSkeleton
            animation="wave"
            variant="rounded"
            className={cn("rounded-md", className)}
        />
    );
}
