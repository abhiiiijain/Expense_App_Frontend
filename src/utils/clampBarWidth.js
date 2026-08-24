export function clampBarWidth(percent) {
  return Math.min(100, Math.max(percent > 0 ? 2 : 0, percent));
}
