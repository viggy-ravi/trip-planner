"use client";

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-sm mx-auto mt-16 px-4 text-center">
      <div className="border border-gray-200 rounded-lg p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-600 mb-4">
          An unexpected error occurred. Try again, or come back later.
        </p>
        <button
          onClick={() => retry()}
          className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded hover:bg-gray-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
