import type { Block, BlockType } from '@ton-site-builder/templates/editor';
import BlockFields from './BlockFields';
import type { DraftAction } from './useSiteDraft';

// Section list: add, remove, reorder and edit blocks. One expands at a time
// so the list stays navigable on a phone.

const BLOCK_LABELS: Record<BlockType, { name: string; glyph: string }> = {
  profile: { name: 'Profile', glyph: '👤' },
  hero: { name: 'Headline', glyph: '✨' },
  links: { name: 'Links', glyph: '🔗' },
  features: { name: 'Features', glyph: '▦' },
  text: { name: 'Text', glyph: '¶' },
  gallery: { name: 'Gallery', glyph: '🖼' },
  faq: { name: 'FAQ', glyph: '?' },
  contact: { name: 'Contact', glyph: '✉' },
  socials: { name: 'Socials', glyph: '◎' },
  'for-sale': { name: 'For sale', glyph: '💎' },
  divider: { name: 'Divider', glyph: '—' },
};

/** Content summary shown on the collapsed row. */
function summarise(block: Block): string {
  switch (block.type) {
    case 'profile':
      return block.name;
    case 'hero':
      return block.title;
    case 'links':
      return `${block.items.length} link${block.items.length === 1 ? '' : 's'}`;
    case 'features':
      return `${block.items.length} item${block.items.length === 1 ? '' : 's'}`;
    case 'text':
      return block.heading || block.body.slice(0, 40);
    case 'gallery':
      return `${block.items.length} image${block.items.length === 1 ? '' : 's'}`;
    case 'faq':
      return `${block.items.length} question${block.items.length === 1 ? '' : 's'}`;
    case 'contact':
      return block.telegram || block.email || 'No details yet';
    case 'socials':
      return block.items.map((i) => i.label).join(', ');
    case 'for-sale':
      return `${block.domain} · ${block.priceTon} TON`;
    case 'divider':
      return block.style;
    default:
      return '';
  }
}

export default function BlockList({
  blocks,
  openBlockId,
  addableTypes,
  dispatch,
}: {
  blocks: Block[];
  openBlockId: string | null;
  addableTypes: readonly BlockType[];
  dispatch: (action: DraftAction) => void;
}) {
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        const open = openBlockId === block.id;
        const meta = BLOCK_LABELS[block.type];
        return (
          <div
            key={block.id}
            className={`overflow-hidden rounded-2xl border transition-colors ${
              open ? 'border-tg-link/30 bg-white/[0.04]' : 'border-white/[0.07] bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center gap-2 p-2.5">
              <button
                type="button"
                onClick={() => dispatch({ kind: 'openBlock', id: open ? null : block.id })}
                className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-sm">
                  {meta.glyph}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-tg-text">{meta.name}</span>
                  <span className="block truncate text-[11px] text-tg-hint">{summarise(block)}</span>
                </span>
              </button>

              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => dispatch({ kind: 'moveBlock', id: block.id, delta: -1 })}
                  disabled={i === 0}
                  aria-label="Move up"
                  className="rounded-md px-1.5 py-1 text-tg-hint transition-colors hover:bg-white/5 hover:text-tg-text disabled:opacity-25 disabled:hover:bg-transparent"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ kind: 'moveBlock', id: block.id, delta: 1 })}
                  disabled={i === blocks.length - 1}
                  aria-label="Move down"
                  className="rounded-md px-1.5 py-1 text-tg-hint transition-colors hover:bg-white/5 hover:text-tg-text disabled:opacity-25 disabled:hover:bg-transparent"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ kind: 'removeBlock', id: block.id })}
                  disabled={blocks.length <= 1}
                  aria-label="Remove section"
                  className="rounded-md px-1.5 py-1 text-tg-hint transition-colors hover:bg-white/5 hover:text-red-400 disabled:opacity-25 disabled:hover:bg-transparent"
                >
                  ×
                </button>
              </div>
            </div>

            {open && (
              <div className="space-y-2.5 border-t border-white/[0.06] p-3">
                <BlockFields
                  block={block}
                  onChange={(patch) => dispatch({ kind: 'updateBlock', id: block.id, patch })}
                />
              </div>
            )}
          </div>
        );
      })}

      <div className="pt-1">
        <p className="mb-1.5 text-xs font-medium text-tg-hint">Add a section</p>
        <div className="flex flex-wrap gap-1.5">
          {addableTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => dispatch({ kind: 'addBlock', blockType: type })}
              className="flex items-center gap-1.5 rounded-xl border border-dashed border-white/[0.14] px-2.5 py-1.5 text-xs font-medium text-tg-hint transition-colors hover:border-tg-link/40 hover:bg-white/[0.03] hover:text-tg-text"
            >
              <span>{BLOCK_LABELS[type].glyph}</span>
              {BLOCK_LABELS[type].name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
