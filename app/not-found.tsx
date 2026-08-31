import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-sm mx-auto mt-16 px-4 text-center">
      <div className="border border-gray-200 rounded-lg p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Not found</h1>
        <p className="text-sm text-gray-600 mb-4">
          That page, or trip, doesn&apos;t exist — or you don&apos;t have access to it.
        </p>
        <Link
          href="/"
          className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded hover:bg-gray-700 inline-block"
        >
          Back to Trips
        </Link>
      </div>
    </div>
  );
}
