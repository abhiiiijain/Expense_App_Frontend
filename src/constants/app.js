export const PIN_LENGTH = 4;
export const PIN_PATTERN = new RegExp(`^\\d{${PIN_LENGTH}}$`);

export const APP_NAME = "SpendWise";
export const APP_TAGLINE = "TRACK • PLAN • SAVE • GROW";

/** Public asset paths (Vite serves from /public). */
export const LOGO = {
  /** Navbar / compact brand lockup */
  horizontal: "/logo-horizontal.png",
  /** Auth / splash — full vertical brand */
  vertical: "/logo-vertical.png",
  /** Favicon, loading, PWA icon mark */
  mark: "/logo-mark.png",
};
