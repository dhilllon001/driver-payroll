import { MoreVertical, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface RowActionItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  danger?: boolean;
}

export function RowActionMenu({ items, onAction }: { items: RowActionItem[]; onAction: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const width = 190;
    const estimatedHeight = items.length * 36 + 12;
    const top = rect.bottom + estimatedHeight > window.innerHeight ? rect.top - estimatedHeight - 4 : rect.bottom + 4;
    setPosition({ top: Math.max(8, top), left: Math.max(8, Math.min(window.innerWidth - width - 8, rect.right - width)) });
  }, [open, items.length]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const key = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', key);
    window.addEventListener('resize', () => setOpen(false), { once: true });
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', key);
    };
  }, [open]);

  return (
    <>
      <button ref={buttonRef} type="button" className="btn-icon" aria-label="Row actions" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <MoreVertical size={16} />
      </button>
      {open && createPortal(
        <div ref={menuRef} className="mod-row-menu" style={position} role="menu">
          {items.map(({ id, label, icon: Icon, danger }) => (
            <button key={id} type="button" role="menuitem" className={`mod-row-menu-item ${danger ? 'danger' : ''}`} onClick={() => { setOpen(false); onAction(id); }}>
              {Icon && <Icon size={14} />}
              {label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}
