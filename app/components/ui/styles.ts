// Card usages across the app differ too much in tag, padding, and layout to
// share one polymorphic component — this constant de-duplicates just the
// visual base (border + rounded corners) that every one of them repeats.
export const cardBase = "border border-gray-200 rounded-lg";
