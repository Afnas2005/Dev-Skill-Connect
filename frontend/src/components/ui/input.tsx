import * as React from "react"
import OutlinedInput from "@mui/material/OutlinedInput"
import { cn } from "@/lib/utils"

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <OutlinedInput
                type={type}
                inputRef={ref}
                size="small"
                fullWidth
                className={cn(
                    "neu-inset h-10 rounded-xl border-0 text-sm text-slate-100",
                    className
                )}
                sx={{
                    "& .MuiOutlinedInput-input": {
                        py: "9px",
                        color: "#e4ebf7",
                    },
                }}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
