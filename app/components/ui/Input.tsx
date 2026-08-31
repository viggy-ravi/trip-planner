import { InputHTMLAttributes } from "react";

// Exported so the one raw <textarea> in the app (InvitePopover's multi-email
// field) can share the same visual base without needing a whole Textarea
// component for a single usage.
export const inputBaseStyles =
  "border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400";

export default function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputBaseStyles} ${className}`} {...props} />;
}
