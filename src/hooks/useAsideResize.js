import { useState, useLayoutEffect } from 'react';

const STORAGE_KEY = 'aside_width';
const MIN_WIDTH = 180;
const MAX_WIDTH = 480;

// Shared by Aside and AsideLibrary: drag the right edge to resize, width kept
// in --aside-width on :root and persisted in localStorage.
export default function useAsideResize() {
  const [resizing, setResizing] = useState(false);

  // Restore the stored width before paint so there is no jump on mount
  useLayoutEffect(() => {
    const asideWidth = localStorage.getItem(STORAGE_KEY);
    if (asideWidth) {
      document.documentElement.style.setProperty(
        '--aside-width',
        `${asideWidth}px`,
      );
    }
  }, []);

  const startResize = (event) => {
    const aside = event.currentTarget.parentElement;
    const startX = event.clientX;
    const startWidth = aside.getBoundingClientRect().width;
    let width = startWidth;
    setResizing(true);

    const onMove = (moveEvent) => {
      width = Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, startWidth + moveEvent.clientX - startX),
      );
      document.documentElement.style.setProperty('--aside-width', `${width}px`);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setResizing(false);
      localStorage.setItem(STORAGE_KEY, String(Math.round(width)));
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const resetResize = () => {
    document.documentElement.style.removeProperty('--aside-width');
    localStorage.removeItem(STORAGE_KEY);
  };

  // Props for the <aside> and for its resize handle
  return {
    resizing,
    asideClass: resizing ? 'is-resizing' : '',
    resizerProps: {
      className: 'sidebar__resizer',
      role: 'separator',
      'aria-orientation': 'vertical',
      onPointerDown: startResize,
      onDoubleClick: resetResize,
    },
  };
}
