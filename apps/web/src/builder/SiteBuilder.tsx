import { ReactNode, useMemo, useState } from 'react';
import type { SiteDocument } from '@ton-site-builder/templates/editor';
import BlockList from './BlockList';
import LivePreview from './LivePreview';
import TemplateGallery from './TemplateGallery';
import ThemePanel from './ThemePanel';
import { useSiteDraft } from './useSiteDraft';

// Shared by Create and Edit; the two differ only in what they pass in and
// what they do on submit.

export type BuilderTab = 'design' | 'sections' | 'theme';

export interface SiteBuilderProps {
  initialDoc: SiteDocument;
  /** Preset id, highlighted in the gallery. */
  presetId: string | null;
  onPresetChange: (presetId: string) => void;
  /** Rendered above the tabs: domain, slug, access key. */
  header?: ReactNode;
  /** Rendered at the bottom: the submit button and any errors. */
  footer?: (doc: SiteDocument) => ReactNode;
  showGallery?: boolean;
  /**
   * Applied to the draft before preview and submit, without being stored.
   * Create uses it to push the selected domain into a for-sale block.
   */
  docTransform?: (doc: SiteDocument) => SiteDocument;
}

const TABS: Array<{ id: BuilderTab; label: string }> = [
  { id: 'design', label: 'Template' },
  { id: 'sections', label: 'Sections' },
  { id: 'theme', label: 'Style' },
];

export default function SiteBuilder({
  initialDoc,
  presetId,
  onPresetChange,
  header,
  footer,
  showGallery = true,
  docTransform,
}: SiteBuilderProps) {
  const { doc, openBlockId, dispatch, addableTypes } = useSiteDraft(initialDoc);
  const [tab, setTab] = useState<BuilderTab>(showGallery ? 'design' : 'sections');

  const effectiveDoc = useMemo(
    () => (docTransform ? docTransform(doc) : doc),
    [doc, docTransform]
  );

  const tabs = showGallery ? TABS : TABS.filter((t) => t.id !== 'design');

  return (
    <div className="space-y-4">
      {header}

      <LivePreview doc={effectiveDoc} />

      <div className="flex gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
              tab === t.id ? 'bg-tg-button text-tg-button-text' : 'text-tg-hint hover:bg-white/5 hover:text-tg-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'design' && showGallery && (
        <div className="space-y-2">
          <p className="text-xs text-tg-hint">
            Pick a ready-made starting point, then change anything you like in Sections and Style.
          </p>
          <TemplateGallery
            value={presetId}
            onPick={(id) => {
              onPresetChange(id);
              dispatch({ kind: 'preset', presetId: id });
              setTab('sections');
            }}
          />
        </div>
      )}

      {tab === 'sections' && (
        <BlockList
          blocks={doc.blocks}
          openBlockId={openBlockId}
          addableTypes={addableTypes}
          dispatch={dispatch}
        />
      )}

      {tab === 'theme' && (
        <ThemePanel
          theme={doc.theme}
          layout={doc.layout}
          onTheme={(patch) => dispatch({ kind: 'theme', patch })}
          onLayout={(layout) => dispatch({ kind: 'layout', layout })}
        />
      )}

      {footer?.(effectiveDoc)}
    </div>
  );
}
