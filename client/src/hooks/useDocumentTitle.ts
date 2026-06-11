import { useEffect } from 'react';

export function useDocumentTitle(title: string, prevailOnUnmount = false) {
  useEffect(() => {
    document.title = `${title} | QTechy`;
  }, [title]);

  useEffect(() => {
    return () => {
      if (!prevailOnUnmount) {
        document.title = 'QTechy Tickets';
      }
    };
  }, [prevailOnUnmount]);
}
