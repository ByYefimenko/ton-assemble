import { z } from 'zod';
import {
  BACKGROUND_IDS,
  BUTTON_IDS,
  DENSITY_IDS,
  FONT_IDS,
  MODE_IDS,
  RADIUS_IDS,
  WIDTH_IDS,
} from './constants';
import { cssString } from './html';

// Published sites ship as a frozen bag on TON Storage, so every value here
// must be pure CSS: no remote font, stylesheet or image.

const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .optional();


export const themeSchema = z.object({
  mode: z.enum(MODE_IDS).default('dark'),
  accent: hexColorSchema,
  font: z.enum(FONT_IDS).default('system'),
  headingFont: z.enum(FONT_IDS).optional(),
  background: z.enum(BACKGROUND_IDS).default('glow'),
  radius: z.enum(RADIUS_IDS).default('round'),
  density: z.enum(DENSITY_IDS).default('normal'),
  button: z.enum(BUTTON_IDS).default('solid'),
  width: z.enum(WIDTH_IDS).default('normal'),
});

export type Theme = z.infer<typeof themeSchema>;
export type FontId = (typeof FONT_IDS)[number];

export { DEFAULT_THEME, makeTheme } from './constants';

/** OS stacks only; a webfont here would break offline bags. */
const FONT_STACKS: Record<FontId, string> = {
  system: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
  grotesk: `"Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif`,
  serif: `Georgia, "Iowan Old Style", "Times New Roman", Times, serif`,
  slab: `"Rockwell", "Roboto Slab", "Bookman Old Style", Georgia, serif`,
  rounded: `ui-rounded, "SF Pro Rounded", "Hiragino Maru Gothic ProN", "Varela Round", system-ui, sans-serif`,
  mono: `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`,
};

const RADIUS_SCALE: Record<Theme['radius'], { lg: string; md: string; sm: string; pill: string }> = {
  sharp: { lg: '0px', md: '0px', sm: '0px', pill: '0px' },
  soft: { lg: '10px', md: '8px', sm: '6px', pill: '999px' },
  round: { lg: '20px', md: '12px', sm: '10px', pill: '999px' },
  pill: { lg: '28px', md: '999px', sm: '999px', pill: '999px' },
};

const DENSITY_SCALE: Record<Theme['density'], { gap: string; pad: string; section: string; lh: string }> = {
  compact: { gap: '8px', pad: '16px', section: '20px', lh: '1.45' },
  normal: { gap: '10px', pad: '22px', section: '28px', lh: '1.6' },
  spacious: { gap: '16px', pad: '30px', section: '44px', lh: '1.75' },
};

const WIDTH_SCALE: Record<Theme['width'], { narrow: string; wide: string }> = {
  narrow: { narrow: '440px', wide: '720px' },
  normal: { narrow: '520px', wide: '960px' },
  wide: { narrow: '640px', wide: '1200px' },
};

interface Palette {
  bg: string;
  surface: string;
  surfaceSolid: string;
  text: string;
  muted: string;
  border: string;
  shadow: string;
}

const DARK: Palette = {
  bg: '#0a0e14',
  surface: 'rgba(15, 20, 28, 0.92)',
  surfaceSolid: '#0f141c',
  text: '#e6e9ec',
  muted: '#8b95a0',
  border: 'rgba(148, 163, 184, 0.2)',
  shadow: '0 24px 56px rgba(0, 0, 0, 0.35)',
};

const LIGHT: Palette = {
  bg: '#f6f7f9',
  surface: 'rgba(255, 255, 255, 0.92)',
  surfaceSolid: '#ffffff',
  text: '#11161d',
  muted: '#5b6672',
  border: 'rgba(15, 23, 42, 0.12)',
  shadow: '0 18px 44px rgba(15, 23, 42, 0.1)',
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

/** Relative luminance, WCAG 2.1. */
function luminance(hex: string): number {
  const channel = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = channel(parseInt(hex.slice(1, 3), 16));
  const g = channel(parseInt(hex.slice(3, 5), 16));
  const b = channel(parseInt(hex.slice(5, 7), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function accentForeground(hex: string): string {
  return luminance(hex) > 0.45 ? '#10151c' : '#ffffff';
}

function paletteVars(p: Palette): string {
  return [
    `--tf-bg: ${p.bg};`,
    `--tf-card: ${p.surface};`,
    `--tf-card-solid: ${p.surfaceSolid};`,
    `--tf-text: ${p.text};`,
    `--tf-muted: ${p.muted};`,
    `--tf-border: ${p.border};`,
    `--tf-shadow: ${p.shadow};`,
  ].join(' ');
}

function backgroundCss(background: Theme['background']): string {
  switch (background) {
    case 'solid':
      return `background: var(--tf-bg);`;
    case 'gradient':
      return `background: linear-gradient(160deg, rgba(var(--tf-accent-rgb), 0.18), var(--tf-bg) 55%);`;
    case 'mesh':
      return `background:
        radial-gradient(ellipse 60% 45% at 15% 10%, rgba(var(--tf-accent-rgb), 0.22), transparent 60%),
        radial-gradient(ellipse 50% 40% at 85% 25%, rgba(var(--tf-accent-rgb), 0.12), transparent 60%),
        radial-gradient(ellipse 60% 50% at 50% 100%, rgba(var(--tf-accent-rgb), 0.1), transparent 60%),
        var(--tf-bg);`;
    case 'grid':
      return `background:
        linear-gradient(var(--tf-border) 1px, transparent 1px) 0 0 / 44px 44px,
        linear-gradient(90deg, var(--tf-border) 1px, transparent 1px) 0 0 / 44px 44px,
        var(--tf-bg);`;
    case 'dots':
      return `background:
        radial-gradient(circle at 1px 1px, var(--tf-border) 1px, transparent 0) 0 0 / 22px 22px,
        var(--tf-bg);`;
    case 'glow':
    default:
      return `background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(var(--tf-accent-rgb), 0.16), var(--tf-bg) 55%);`;
  }
}

function buttonCss(button: Theme['button']): string {
  switch (button) {
    case 'soft':
      return `.tf-btn-primary { background: rgba(var(--tf-accent-rgb), 0.16); color: var(--tf-accent); border-color: rgba(var(--tf-accent-rgb), 0.35); }
  .tf-btn-primary:hover { background: rgba(var(--tf-accent-rgb), 0.24); }`;
    case 'outline':
      return `.tf-btn-primary { background: transparent; color: var(--tf-accent); border-color: var(--tf-accent); }
  .tf-btn-primary:hover { background: rgba(var(--tf-accent-rgb), 0.12); }`;
    case 'glass':
      return `.tf-btn-primary { background: rgba(var(--tf-accent-rgb), 0.18); color: var(--tf-text); border-color: rgba(var(--tf-accent-rgb), 0.4); backdrop-filter: blur(10px); }
  .tf-btn-primary:hover { background: rgba(var(--tf-accent-rgb), 0.3); }`;
    case 'solid':
    default:
      return `.tf-btn-primary { background: var(--tf-accent); color: var(--tf-accent-fg); border-color: transparent; box-shadow: 0 4px 20px rgba(var(--tf-accent-rgb), 0.35); }
  .tf-btn-primary:hover { box-shadow: 0 6px 26px rgba(var(--tf-accent-rgb), 0.45); }`;
  }
}

/** Emits the design tokens and component primitives for one theme. */
export function buildThemeCss(input: Theme): string {
  const theme = themeSchema.parse(input);
  const accent = theme.accent && /^#[0-9a-fA-F]{6}$/.test(theme.accent) ? theme.accent : '#3b82f6';
  const accentRgb = hexToRgb(accent);
  const accentFg = accentForeground(accent);
  const radius = RADIUS_SCALE[theme.radius];
  const density = DENSITY_SCALE[theme.density];
  const width = WIDTH_SCALE[theme.width];
  const bodyFont = FONT_STACKS[theme.font];
  const headingFont = FONT_STACKS[theme.headingFont ?? theme.font];

  const shared = `
    --tf-accent: ${accent};
    --tf-accent-rgb: ${accentRgb};
    --tf-accent-fg: ${accentFg};
    --tf-font: ${cssString(bodyFont)};
    --tf-font-heading: ${cssString(headingFont)};
    --tf-radius: ${radius.lg};
    --tf-radius-md: ${radius.md};
    --tf-radius-sm: ${radius.sm};
    --tf-radius-pill: ${radius.pill};
    --tf-gap: ${density.gap};
    --tf-pad: ${density.pad};
    --tf-section: ${density.section};
    --tf-leading: ${density.lh};
    --tf-w-narrow: ${width.narrow};
    --tf-w-wide: ${width.wide};`;

  let modeBlock: string;
  if (theme.mode === 'light') {
    modeBlock = `:root { color-scheme: light; ${paletteVars(LIGHT)}${shared} }`;
  } else if (theme.mode === 'auto') {
    modeBlock = `:root { color-scheme: light dark; ${paletteVars(LIGHT)}${shared} }
  @media (prefers-color-scheme: dark) { :root { ${paletteVars(DARK)} } }`;
  } else {
    modeBlock = `:root { color-scheme: dark; ${paletteVars(DARK)}${shared} }`;
  }

  return `${modeBlock}
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: var(--tf-font);
    color: var(--tf-text);
    line-height: var(--tf-leading);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    ${backgroundCss(theme.background)}
  }
  h1, h2, h3, h4 { font-family: var(--tf-font-heading); letter-spacing: -0.03em; font-weight: 600; }
  a { color: inherit; }
  img { max-width: 100%; }
  .tf-shell { width: 100%; max-width: var(--tf-w-wide); margin: 0 auto; padding: var(--tf-section) 20px calc(var(--tf-section) + 16px); }
  .tf-shell[data-width="narrow"] { max-width: var(--tf-w-narrow); }
  .tf-block + .tf-block { margin-top: var(--tf-section); }
  .tf-card {
    background: var(--tf-card);
    border: 1px solid var(--tf-border);
    border-radius: var(--tf-radius);
    padding: var(--tf-pad);
    box-shadow: var(--tf-shadow);
  }
  .tf-btn {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 11px 20px;
    border-radius: var(--tf-radius-md);
    border: 1px solid transparent;
    text-decoration: none;
    font-size: 0.92rem; font-weight: 500;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease;
  }
  .tf-btn:hover { transform: translateY(-1px); }
  .tf-btn-secondary { background: rgba(127, 127, 127, 0.08); color: var(--tf-text); border-color: var(--tf-border); }
  .tf-btn-secondary:hover { border-color: rgba(var(--tf-accent-rgb), 0.4); }
  ${buttonCss(theme.button)}
  .tf-muted { color: var(--tf-muted); }
  .tf-badge {
    display: inline-block;
    margin-top: 12px;
    padding: 6px 12px;
    border-radius: var(--tf-radius-pill);
    font-size: 0.75rem; font-weight: 500;
    color: var(--tf-muted); text-decoration: none;
    border: 1px solid var(--tf-border);
    background: var(--tf-card);
    transition: color 0.15s ease, border-color 0.15s ease;
  }
  .tf-badge:hover { color: var(--tf-accent); border-color: rgba(var(--tf-accent-rgb), 0.4); }
  .tf-foot { margin-top: var(--tf-section); text-align: center; font-size: 0.8rem; color: var(--tf-muted); }
  @media (prefers-reduced-motion: reduce) {
    * { transition: none !important; animation: none !important; }
    .tf-btn:hover { transform: none; }
  }`;
}
