import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "destructive";
type Size = "sm" | "md" | "lg";

const base = "text-sm font-medium rounded";

const variants: Record<Variant, string> = {
  primary: "bg-gray-900 text-white hover:bg-gray-700",
  secondary: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  destructive: "bg-red-600 text-white hover:bg-red-700",
};

// Sizes mirror the paddings already in use across the app (compact popovers
// and inline forms vs. full-page login/signup/error buttons) — kept as
// distinct sizes rather than one default so extracting this component
// doesn't change how anything currently looks.
const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5",
  md: "px-4 py-1.5",
  lg: "px-4 py-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
