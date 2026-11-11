import {
  BACKGROUND_IDS,
  BUTTON_IDS,
  DENSITY_IDS,
  FONT_IDS,
  MODE_IDS,
  RADIUS_IDS,
  SiteDocument,
  Theme,
} from '@ton-site-builder/templates/editor';
import { Choice, Field } from './fields';

// Maps onto the CSS custom properties emitted by buildThemeCss. Every option
// is pure CSS so it survives a frozen TON Storage bag.

const ACCENT_PRESETS = [
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Rose', hex: '#f43f5e' },
];

const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const opts = <T extends string>(ids: readonly T[], labels?: Partial<Record<T, string>>) =>
  ids.map((v) => ({ value: v, label: labels?.[v] ?? label(v) }));

export default function ThemePanel({
  theme,
  layout,
  onTheme,
  onLayout,
}: {
  theme: Theme;
  layout: SiteDocument['layout'];
  onTheme: (patch: Partial<Theme>) => void;
  onLayout: (v: SiteDocument['layout']) => void;
}) {
  const accent = theme.accent ?? '#3b82f6';

  return (
    <div className="space-y-4">
      <Field label="Accent colour">
        <div className="flex flex-wrap gap-2">
          {ACCENT_PRESETS.map(({ name, hex }) => (
            <button
              key={hex}
              type="button"
              title={name}
              onClick={() => onTheme({ accent: hex })}
              className={`h-8 w-8 rounded-xl border-2 transition-all ${
                accent.toLowerCase() === hex ? 'scale-110 border-tg-button' : 'border-white/20 hover:border-white/40'
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
          <label className="relative h-8 w-8 overflow-hidden rounded-xl border-2 border-white/20 transition-colors hover:border-white/40">
            <input
              type="color"
              value={accent}
              onChange={(e) => onTheme({ accent: e.target.value })}
              className="absolute -inset-2 h-[200%] w-[200%] cursor-pointer border-0 p-0"
              aria-label="Custom accent colour"
            />
          </label>
        </div>
      </Field>

      <Field label="Colour mode">
        <Choice
          value={theme.mode}
          onChange={(v) => onTheme({ mode: v })}
          options={opts(MODE_IDS, { auto: 'Auto' })}
        />
      </Field>

      <Field label="Background">
        <Choice value={theme.background} onChange={(v) => onTheme({ background: v })} options={opts(BACKGROUND_IDS)} />
      </Field>

      <Field label="Font" hint="System fonts only; no external requests.">
        <Choice
          value={theme.font}
          onChange={(v) => onTheme({ font: v })}
          options={opts(FONT_IDS, { system: 'System', grotesk: 'Grotesk', slab: 'Slab', mono: 'Mono' })}
        />
      </Field>

      <Field label="Corners">
        <Choice value={theme.radius} onChange={(v) => onTheme({ radius: v })} options={opts(RADIUS_IDS)} />
      </Field>

      <Field label="Spacing">
        <Choice value={theme.density} onChange={(v) => onTheme({ density: v })} options={opts(DENSITY_IDS)} />
      </Field>

      <Field label="Buttons">
        <Choice value={theme.button} onChange={(v) => onTheme({ button: v })} options={opts(BUTTON_IDS)} />
      </Field>

      <Field label="Page width">
        <Choice
          value={layout}
          onChange={onLayout}
          options={[
            { value: 'narrow' as const, label: 'Narrow' },
            { value: 'wide' as const, label: 'Wide' },
          ]}
        />
      </Field>
    </div>
  );
}
