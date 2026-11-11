import type { BlockType } from './blocks';
import type { Theme } from './theme';

// Runtime values with no zod dependency, so the Mini App bundle can skip it.
// The imports above are type-only and erase at compile time.

export const SITE_VERSION = 2 as const;

export const FONT_IDS = ['system', 'grotesk', 'serif', 'slab', 'rounded', 'mono'] as const;
export const MODE_IDS = ['dark', 'light', 'auto'] as const;
export const BACKGROUND_IDS = ['glow', 'solid', 'gradient', 'mesh', 'grid', 'dots'] as const;
export const RADIUS_IDS = ['sharp', 'soft', 'round', 'pill'] as const;
export const DENSITY_IDS = ['compact', 'normal', 'spacious'] as const;
export const BUTTON_IDS = ['solid', 'soft', 'outline', 'glass'] as const;
export const WIDTH_IDS = ['narrow', 'normal', 'wide'] as const;
export const LAYOUT_IDS = ['narrow', 'wide'] as const;

export const BLOCK_TYPES = [
  'profile',
  'hero',
  'links',
  'features',
  'text',
  'gallery',
  'faq',
  'contact',
  'socials',
  'for-sale',
  'divider',
] as const satisfies readonly BlockType[];

/** Blocks a site may hold only one of. */
export const SINGLETON_BLOCKS: ReadonlySet<BlockType> = new Set<BlockType>(['profile', 'for-sale']);

export const DEFAULT_THEME: Theme = {
  mode: 'dark',
  font: 'system',
  background: 'glow',
  radius: 'round',
  density: 'normal',
  button: 'solid',
  width: 'normal',
};

export function makeTheme(over: Partial<Theme> = {}): Theme {
  return { ...DEFAULT_THEME, ...over };
}
