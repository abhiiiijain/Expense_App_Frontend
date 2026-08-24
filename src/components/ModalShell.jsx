import { createPortal } from "react-dom";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useEscapeKey } from "../hooks/useEscapeKey";

const MAX_WIDTH = {
  sm: "max-w-sm",
  md: "max-w-md",
};

function ModalShell({
  open,
  onClose,
  labelledBy,
  children,
  zIndex = 70,
  variant = "center",
  maxWidth = "sm",
  panelClassName = "",
  closeOnBackdrop = true,
  closeOnEscape = true,
  portal = true,
}) {
  useBodyScrollLock(open);
  useEscapeKey(open && closeOnEscape, onClose);

  if (!open) return null;

  const alignClass =
    variant === "sheet"
      ? "items-end sm:items-center p-0 sm:p-4"
      : "items-center p-4";

  const radiusClass =
    variant === "sheet" ? "rounded-t-2xl sm:rounded-2xl" : "rounded-2xl";

  const content = (
    <div
      className={`fixed inset-0 flex justify-center bg-ink/40 backdrop-blur-sm animate-fade-in ${alignClass}`}
      style={{ zIndex }}
      onClick={() => {
        if (closeOnBackdrop) onClose?.();
      }}
    >
      <div
        className={`bg-white overflow-hidden shadow-panel w-full ${MAX_WIDTH[maxWidth]} ring-1 ring-ink/5 animate-fade-up ${radiusClass} ${panelClassName}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return portal ? createPortal(content, document.body) : content;
}

export default ModalShell;
