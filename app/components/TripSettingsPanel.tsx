"use client";

import { TripMember } from "../types";

export default function TripSettingsPanel({
  name,
  setName,
  destination,
  setDestination,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  imageUrl,
  setImageUrl,
  onSave,
  canDelete,
  onDelete,
  deleteError,
  members,
  onClose,
}: {
  name: string;
  setName: (v: string) => void;
  destination: string;
  setDestination: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  imageUrl: string;
  setImageUrl: (v: string) => void;
  onSave: (e: React.SubmitEvent<HTMLFormElement>) => void;
  canDelete: boolean;
  onDelete: (e: React.SubmitEvent<HTMLFormElement>) => void;
  deleteError: string;
  members: TripMember[];
  onClose: () => void;
}) {
  const inputStyles =
    "border border-gray-300 rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-400";
  const labelStyles = "text-xs font-medium text-gray-500 mt-2";

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-200 z-50 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Trip Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSave} className="flex flex-col gap-1 mb-6">
          <label className={labelStyles}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} required />

          <label className={labelStyles}>Destination</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className={inputStyles}
            required
          />

          <label className={labelStyles}>Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputStyles}
            required
          />

          <label className={labelStyles}>End date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputStyles} required />

          <label className={labelStyles}>Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={inputStyles}
            placeholder="https://..."
          />

          <button
            type="submit"
            className="bg-gray-900 text-white text-sm font-medium px-4 py-1.5 rounded hover:bg-gray-700 mt-3"
          >
            Save Changes
          </button>
        </form>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 pb-2 border-b border-gray-200">Members</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            {members.map((member) => (
              <li key={member.id}>
                {member.user.name} ({member.user.email}) — {member.role}
              </li>
            ))}
          </ul>
        </div>

        {canDelete && (
          <form onSubmit={onDelete}>
            <button
              type="submit"
              className="text-sm text-red-600 border border-red-300 rounded px-3 py-1.5 hover:bg-red-50 w-full"
            >
              Delete Trip
            </button>
          </form>
        )}
        {deleteError && <p className="text-sm text-red-600 mt-2">{deleteError}</p>}
      </div>
    </>
  );
}
