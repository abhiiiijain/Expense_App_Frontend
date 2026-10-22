import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { APP_TAGLINE } from "../constants/app";

const LAYOUT = {
  default: {
    page: "p-6",
    wrap: "max-w-md",
    brand: "mb-8",
    panel: "p-8",
    header: "mb-6",
    title: "text-2xl",
    subtitle: "text-sm",
  },
  compact: {
    page: "p-4",
    wrap: "max-w-sm",
    brand: "mb-4",
    panel: "px-5 py-5",
    header: "mb-4 text-center",
    title: "text-xl",
    subtitle: "text-xs",
  },
};

function AuthLayout({
  title,
  subtitle,
  children,
  footerPrompt,
  footerLinkTo,
  footerLinkLabel,
  compact = false,
}) {
  const layout = compact ? LAYOUT.compact : LAYOUT.default;

  return (
    <div className={`sw-page flex items-center justify-center ${layout.page}`}>
      <div className={`relative z-10 w-full animate-fade-up ${layout.wrap}`}>
        <div className={`text-center ${layout.brand}`}>
          {compact ? (
            <BrandLogo variant="lock" />
          ) : (
            <>
              <BrandLogo variant="vertical" className="rounded-2xl shadow-panel" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
                {APP_TAGLINE}
              </p>
            </>
          )}
        </div>

        <div className={`sw-panel ${layout.panel}`}>
          <div className={layout.header}>
            <h1 className={`font-display font-semibold tracking-tight text-ink ${layout.title}`}>
              {title}
            </h1>
            <p className={`text-ink-muted mt-1 ${layout.subtitle}`}>{subtitle}</p>
          </div>

          {children}

          {footerLinkTo ? (
            <p className="text-center text-sm text-ink-muted mt-6">
              {footerPrompt}{" "}
              <Link to={footerLinkTo} className="text-sage-700 font-semibold hover:underline">
                {footerLinkLabel}
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
