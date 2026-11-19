import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-sky-500 text-white shadow-lg shadow-sky-500/25 hover:bg-sky-400 active:bg-sky-600 active:scale-[0.98]",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]",
        outline:
          "border border-slate-700 bg-slate-900/50 text-slate-100 hover:bg-slate-800/80 active:scale-[0.98]",
        secondary:
          "bg-slate-800 text-slate-100 hover:bg-slate-700 active:scale-[0.98]",
        ghost:
          "hover:bg-slate-800/60 text-slate-200 active:scale-[0.98]",
        kiosk:
          "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-xl shadow-sky-500/30 hover:from-sky-400 hover:to-indigo-500 text-xl font-semibold tracking-wide border border-white/20 active:scale-95 transition-transform",
      },
      size: {
        default: "h-11 px-5 py-2.5 text-base",
        sm: "h-9 rounded-lg px-3 text-sm",
        lg: "h-14 rounded-2xl px-8 text-lg",
        touch: "h-16 px-8 rounded-2xl text-xl",
        icon: "h-11 w-11",
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
