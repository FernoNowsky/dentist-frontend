import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg" | "xl";
}

export const Spinner = ({ className, size = "md", ...props }: SpinnerProps) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16",
    };

    return (
        <div
            className={cn("flex justify-center items-center", className)}
            {...props}
        >
            <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        </div>
    );
};
