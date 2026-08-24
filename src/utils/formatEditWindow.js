export const DEFAULT_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Human-readable label for the edit/delete window (e.g. "24 hours"). */
export function formatEditWindowLabel(editWindowMs) {
  const hours = editWindowMs / (60 * 60 * 1000);
  if (Number.isInteger(hours) && hours >= 1) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }

  const days = editWindowMs / (24 * 60 * 60 * 1000);
  if (Number.isInteger(days) && days >= 1) {
    return days === 1 ? "1 day" : `${days} days`;
  }

  return `${Math.round(editWindowMs / (60 * 60 * 1000))} hours`;
}

export function editWindowToastMessage(editWindowMs, action = "edited") {
  return `${action === "deleted" ? "Deletes" : "Edits"} are only allowed within ${formatEditWindowLabel(editWindowMs)} of adding`;
}
