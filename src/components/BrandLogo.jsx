import { APP_NAME, LOGO } from "../constants/app";

const VARIANTS = {
  horizontal: {
    src: LOGO.horizontal,
    className:
      "h-11 sm:h-14 md:h-16 w-auto max-w-full object-contain object-left",
  },
  vertical: {
    src: LOGO.vertical,
    className: "h-36 sm:h-44 w-auto max-w-full object-contain mx-auto",
  },
  mark: {
    src: LOGO.mark,
    className: "h-14 w-14 sm:h-16 sm:w-16 object-contain",
  },
};

function BrandLogo({ variant = "horizontal", className = "", alt = APP_NAME }) {
  const config = VARIANTS[variant] || VARIANTS.horizontal;

  return (
    <img
      src={config.src}
      alt={alt}
      className={`${config.className} ${className}`.trim()}
      draggable={false}
    />
  );
}

export default BrandLogo;
