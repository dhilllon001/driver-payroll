import { useEffect, useMemo, useRef } from 'react';
import { useApp, type PageHeaderAction, type PageHeaderControls } from '../context/AppContext';

/** Register page actions in the shared header (right side, beside notifications). */
export function usePageHeader(
  actions: PageHeaderAction[],
  options?: { showStatus?: boolean; enabled?: boolean },
) {
  const { setPageHeader } = useApp();
  const enabled = options?.enabled !== false;
  const showStatus = options?.showStatus ?? false;
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  const key = useMemo(
    () =>
      actions
        .map((a) => `${a.id}:${a.label}:${a.primary ? 1 : 0}:${a.disabled ? 1 : 0}`)
        .join('|'),
    [actions],
  );

  useEffect(() => {
    if (!enabled) {
      setPageHeader(null);
      return;
    }
    const next: PageHeaderControls = {
      showStatus,
      actions: actionsRef.current.map((action) => ({
        ...action,
        onClick: () => {
          const latest = actionsRef.current.find((item) => item.id === action.id);
          latest?.onClick();
        },
      })),
    };
    setPageHeader(next);
    return () => setPageHeader(null);
  }, [enabled, showStatus, key, setPageHeader]);
}
