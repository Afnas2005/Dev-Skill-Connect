import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
    size?: number;
}

export function Spinner({ className, size = 24, ...props }: SpinnerProps) {
    return (
        <Loader2
            size={size}
            className={cn("animate-spin text-zinc-500", className)}
            {...props}
        />
    );
}
