import { useEffect } from 'react';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Newsdesk` : 'Newsdesk — Market Intelligence | Mr. Chartist';
  }, [title]);
}
