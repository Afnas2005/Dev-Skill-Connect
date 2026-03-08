import CircularProgress from "@mui/material/CircularProgress";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: number;
}

export function Spinner({ className, size = 24, ...props }: SpinnerProps) {
    return (
        <div className={cn("inline-flex items-center justify-center", className)} {...props}>
            <CircularProgress size={size} thickness={4.5} />
        </div>
    );
}
