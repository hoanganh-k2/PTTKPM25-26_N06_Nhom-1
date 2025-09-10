import { forwardRef } from "react";
import { cn } from "../../utils";

const Button = forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-primary hover:bg-primary-600 text-white",
      outline: "border border-primary text-primary hover:bg-primary-50",
      ghost: "hover:bg-primary-50 text-primary",
      secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
      danger: "bg-red-500 hover:bg-red-600 text-white",
    };

    const sizes = {
      default: "py-2 px-4",
      sm: "py-1 px-3 text-sm",
      lg: "py-3 px-6 text-lg",
    };

    return (
      <button
        className={cn(
          "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
