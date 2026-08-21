import { Link } from "react-router-dom";
import { APP_NAME } from "../constants/app";

function AuthLayout({
  title,
  subtitle,
  children,
  footerPrompt,
  footerLinkTo,
  footerLinkLabel,
}) {
  return (
    <div className="sw-page flex items-center justify-center p-6">
      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <p className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-sage-600">
            {APP_NAME}
          </p>
          <p className="mt-2 text-sm text-ink-muted">Know where every rupee goes</p>
        </div>

        <div className="sw-panel p-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
              {title}
            </h1>
            <p className="text-sm text-ink-muted mt-1">{subtitle}</p>
          </div>

          {children}

          <p className="text-center text-sm text-ink-muted mt-6">
            {footerPrompt}{" "}
            <Link to={footerLinkTo} className="text-sage-700 font-semibold hover:underline">
              {footerLinkLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
