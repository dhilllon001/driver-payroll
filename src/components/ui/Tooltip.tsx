import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Side = 'top' | 'bottom' | 'left' | 'right';

export function Tooltip({
  label,
  children,
  side = 'top',
  delay = 280,
}: {
  label: string;
  children: ReactNode;
  side?: Side;
  delay?: number;
}) {
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const timer = useRef<number | null>(null);

  const clear = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };

  const show = () => {
    clear();
    timer.current = window.setTimeout(() => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const gap = 8;
      let top = r.top;
      let left = r.left + r.width / 2;
      if (side === 'top') top = r.top - gap;
      if (side === 'bottom') top = r.bottom + gap;
      if (side === 'left') {
        top = r.top + r.height / 2;
        left = r.left - gap;
      }
      if (side === 'right') {
        top = r.top + r.height / 2;
        left = r.right + gap;
      }
      setPos({ top, left });
      setOpen(true);
    }, delay);
  };

  const hide = () => {
    clear();
    setOpen(false);
  };

  useEffect(() => () => clear(), []);

  return (
    <span
      ref={wrapRef}
      className="ui-tooltip-wrap"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {open &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            className={`ui-tooltip ui-tooltip-${side}`}
            style={{ top: pos.top, left: pos.left }}
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  );
}
