import { useCallback, useEffect, useRef, useState } from "react";
import { PIN_LENGTH } from "../constants/app";
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

function PinPad({ onComplete, disabled = false, error = "", onEdit }) {
  const [digits, setDigits] = useState("");
  const onCompleteRef = useRef(onComplete);
  const onEditRef = useRef(onEdit);
  const submittedRef = useRef("");
  onCompleteRef.current = onComplete;
  onEditRef.current = onEdit;

  const appendDigit = useCallback((key) => {
    if (disabled || !key) return;
    onEditRef.current?.();
    setDigits((current) => {
      if (current.length >= PIN_LENGTH) return current;
      const next = current + key;
      if (next.length === PIN_LENGTH && submittedRef.current !== next) {
        submittedRef.current = next;
        queueMicrotask(() => onCompleteRef.current(next));
      }
      return next;
    });
  }, [disabled]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (disabled) return;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return;
      }
      if (/^\d$/.test(event.key)) {
        event.preventDefault();
        appendDigit(event.key);
      } else if (event.key === "Backspace") {
        event.preventDefault();
        setDigits((current) => current.slice(0, -1));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [appendDigit, disabled]);

  const press = (key) => {
    if (disabled) return;
    if (key === "del") {
      onEditRef.current?.();
      setDigits((current) => current.slice(0, -1));
      return;
    }
    appendDigit(key);
  };

  return (
    <div>
      <div className="mb-2 flex justify-center gap-3" aria-hidden="true">
        {Array.from({ length: PIN_LENGTH }, (_, index) => (
          <span
            key={index}
            className={`h-3.5 w-3.5 rounded-full transition ${
              index < digits.length ? "bg-sage-600" : "bg-slate-300 dark:bg-slate-600"
            }`}
          />
        ))}
      </div>
      <p className="sr-only" role="status">
        {digits.length} of {PIN_LENGTH} digits entered
      </p>
      {error ? (
        <p className="mb-5 min-h-5 text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : (
        <div className="mb-5 min-h-5" />
      )}
      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((key) =>
          key === "" ? (
            <span key="spacer" />
          ) : (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => press(key)}
              className="flex h-14 items-center justify-center rounded-2xl text-xl font-semibold text-ink transition active:scale-95 disabled:opacity-50"
              style={{ background: "var(--sw-muted-bg)" }}
              aria-label={key === "del" ? "Delete digit" : key}
            >
              {key === "del" ? "⌫" : key}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default PinPad;
