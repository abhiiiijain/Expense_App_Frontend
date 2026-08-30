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
      className={`fixed inset-0 flex justify-center bg-black/40 backdrop-blur-sm animate-fade-in ${alignClass}`}
      style={{ zIndex }}
      onClick={() => {
        if (closeOnBackdrop) onClose?.();
      }}
    >
      <div
        className={`overflow-hidden w-full ${MAX_WIDTH[maxWidth]} animate-fade-up ${radiusClass} ${panelClassName}`}
        style={{
          background: "var(--sw-elevated)",
          border: "1px solid var(--sw-border)",
          boxShadow: "0 20px 50px -20px rgba(0,0,0,0.45)",
          color: "var(--sw-ink)",
        }}
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
