import { useEffect, useRef, useState } from 'react';
import type { SiteDocument } from '@ton-site-builder/templates/editor';
import { renderPreview } from '../api';

interface PreviewState {
  html: string;
  pending: boolean;
  /** True when the draft does not currently validate server-side. */
  invalid: boolean;
}

/**
 * Renders the draft on the API as the user types. Superseded requests are
 * aborted so a slow render cannot overwrite a newer one, and a draft that
 * fails validation keeps the last good HTML instead of blanking.
 */
export function useLivePreview(doc: SiteDocument, delayMs = 400): PreviewState {
  const [state, setState] = useState<PreviewState>({ html: '', pending: true, invalid: false });
  const abortRef = useRef<AbortController | null>(null);
  const lastGoodRef = useRef('');

  useEffect(() => {
    setState((s) => ({ ...s, pending: true }));

    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      renderPreview(doc, controller.signal)
        .then((r) => {
          lastGoodRef.current = r.html;
          setState({ html: r.html, pending: false, invalid: false });
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          // Keep the previous render, flag it as stale.
          setState({ html: lastGoodRef.current, pending: false, invalid: true });
          if (err instanceof Error && err.name !== 'AbortError') {
            console.debug('[preview] render rejected:', err.message);
          }
        });
    }, delayMs);

    return () => clearTimeout(timer);
  }, [doc, delayMs]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return state;
}
