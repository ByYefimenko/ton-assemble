import { useMemo, useReducer } from 'react';
import {
  BLOCK_TYPES,
  Block,
  BlockType,
  SINGLETON_BLOCKS,
  SiteDocument,
  Theme,
  createBlock,
  getPreset,
} from '@ton-site-builder/templates/editor';

export interface DraftState {
  doc: SiteDocument;
  /** Id of the expanded block, or null if all are collapsed. */
  openBlockId: string | null;
}

export type DraftAction =
  | { kind: 'load'; doc: SiteDocument }
  | { kind: 'preset'; presetId: string }
  | { kind: 'theme'; patch: Partial<Theme> }
  | { kind: 'layout'; layout: SiteDocument['layout'] }
  | { kind: 'addBlock'; blockType: BlockType }
  | { kind: 'removeBlock'; id: string }
  | { kind: 'moveBlock'; id: string; delta: number }
  | { kind: 'updateBlock'; id: string; patch: Record<string, unknown> }
  | { kind: 'openBlock'; id: string | null };

function nextId(doc: SiteDocument, type: BlockType): string {
  let n = 1;
  const taken = new Set(doc.blocks.map((b) => b.id));
  while (taken.has(`${type}-${n}`)) n += 1;
  return `${type}-${n}`;
}

function reducer(state: DraftState, action: DraftAction): DraftState {
  const { doc } = state;

  switch (action.kind) {
    case 'load':
      return { doc: action.doc, openBlockId: action.doc.blocks[0]?.id ?? null };

    case 'preset': {
      const preset = getPreset(action.presetId);
      if (!preset) return state;
      const next = preset.build();
      // Keep a title the user already set; the preset only reshapes blocks.
      return { doc: { ...next, meta: doc.meta.title ? doc.meta : next.meta }, openBlockId: next.blocks[0]?.id ?? null };
    }

    case 'theme':
      return { ...state, doc: { ...doc, theme: { ...doc.theme, ...action.patch } } };

    case 'layout':
      return { ...state, doc: { ...doc, layout: action.layout } };

    case 'addBlock': {
      if (SINGLETON_BLOCKS.has(action.blockType) && doc.blocks.some((b) => b.type === action.blockType)) {
        return state;
      }
      const block = createBlock(action.blockType, nextId(doc, action.blockType));
      return { doc: { ...doc, blocks: [...doc.blocks, block] }, openBlockId: block.id };
    }

    case 'removeBlock': {
      // A document needs at least one block to render.
      if (doc.blocks.length <= 1) return state;
      const blocks = doc.blocks.filter((b) => b.id !== action.id);
      return {
        doc: { ...doc, blocks },
        openBlockId: state.openBlockId === action.id ? null : state.openBlockId,
      };
    }

    case 'moveBlock': {
      const i = doc.blocks.findIndex((b) => b.id === action.id);
      const j = i + action.delta;
      if (i < 0 || j < 0 || j >= doc.blocks.length) return state;
      const blocks = [...doc.blocks];
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      return { ...state, doc: { ...doc, blocks } };
    }

    case 'updateBlock': {
      const blocks = doc.blocks.map((b) =>
        b.id === action.id ? ({ ...b, ...action.patch } as Block) : b
      );
      return { ...state, doc: { ...doc, blocks } };
    }

    case 'openBlock':
      return { ...state, openBlockId: action.id };

    default:
      return state;
  }
}

export function useSiteDraft(initial: SiteDocument) {
  const [state, dispatch] = useReducer(reducer, {
    doc: initial,
    openBlockId: initial.blocks[0]?.id ?? null,
  });

  /** Addable types, minus singletons already present. */
  const addableTypes = useMemo(
    () =>
      BLOCK_TYPES.filter(
        (t) => !(SINGLETON_BLOCKS.has(t) && state.doc.blocks.some((b) => b.type === t))
      ),
    [state.doc.blocks]
  );

  return { ...state, dispatch, addableTypes };
}
