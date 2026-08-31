// Small hand-written line icons (no icon library dependency) sized via the
// `className` prop, matching plain `currentColor` so they inherit text color.

export function PencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        d="M13.5 3.5l3 3L7 16H4v-3L13.5 3.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        d="M4.5 6h11M8 6V4.5h4V6M6 6l.5 10h7L14 6M8.5 9v4M11.5 9v4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M10 4v12M4 10h12" strokeLinecap="round" />
    </svg>
  );
}

export function IconButton({
  onClick,
  label,
  className,
  children,
}: {
  onClick?: (e: React.MouseEvent) => void;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-sm border border-gray-200 ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
