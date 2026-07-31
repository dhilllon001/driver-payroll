import { useLayoutEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Renders compact filters beside the header search (for pages with 1–2 filters). */
export function HeaderFilters({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const find = () => document.getElementById('topbar-inline-filters');
    setSlot(find());
    if (find()) return;

    const id = window.setInterval(() => {
      const el = find();
      if (el) {
        setSlot(el);
        window.clearInterval(id);
      }
    }, 16);
    return () => window.clearInterval(id);
  }, []);

  if (!slot) return null;
  return createPortal(children, slot);
}
