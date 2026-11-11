import type { SiteDocument } from '@ton-site-builder/templates/editor';
import { useLivePreview } from './useLivePreview';

/**
 * Live preview of the draft, fed through `srcdoc` so nothing has to be saved
 * first. `sandbox` is empty by design: rendered sites are static, and the
 * frame must not reach the Mini App origin or run user-entered script.
 */
export default function LivePreview({ doc, className = '' }: { doc: SiteDocument; className?: string }) {
  const { html, pending, invalid } = useLivePreview(doc);

  return (
    <div className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-[22px] border border-white/[0.1] bg-black/40 shadow-[0_18px_44px_rgba(0,0,0,0.35)]">
        {html ? (
          <iframe
            srcDoc={html}
            title="Site preview"
            sandbox=""
            className="block h-[460px] w-full border-0 bg-white"
          />
        ) : (
          <div className="flex h-[460px] items-center justify-center text-sm text-tg-hint">
            {pending ? 'Rendering…' : 'Nothing to preview yet'}
          </div>
        )}

        {/* Dim a stale render rather than clearing it. */}
        {(pending || invalid) && html && (
          <div className="pointer-events-none absolute inset-0 bg-black/10" />
        )}
      </div>

      <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-tg-hint">
        <span>{invalid ? 'Showing last valid version' : 'Live preview'}</span>
        {pending && <span className="animate-pulse">updating…</span>}
      </div>
    </div>
  );
}
