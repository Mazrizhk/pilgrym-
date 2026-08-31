import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#0891b2] text-white hover:bg-[#0e7490] focus-visible:ring-[#0891b2]",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-[#0891b2] text-[#0891b2] hover:bg-[#0891b2] hover:text-white",
        secondary: "bg-[#F8FAFC] text-[#0F172A] hover:bg-gray-200 border border-gray-200",
        ghost: "hover:bg-gray-100 text-[#0F172A]",
        link: "text-[#0891b2] underline-offset-4 hover:underline",
        gold: "bg-[#D4A017] text-white hover:bg-[#b8891a]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
