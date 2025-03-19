
import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "outline" | "blue" | "green" | "red" | "gray";
  size?: "sm" | "default" | "lg";
}

const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "default",
  size = "default",
  ...props
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-full",
        {
          "px-2.5 py-0.5 text-xs": size === "sm",
          "px-3 py-1 text-sm": size === "default",
          "px-4 py-1.5 text-base": size === "lg",
          "bg-teacher-blue text-white": variant === "blue",
          "bg-teacher-teal text-white": variant === "green",
          "bg-destructive text-white": variant === "red",
          "bg-teacher-gray text-teacher-darkGray": variant === "gray",
          "bg-primary/10 text-primary": variant === "default",
          "border border-border": variant === "outline",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Badge;
