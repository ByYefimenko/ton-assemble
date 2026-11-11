import { PRESETS } from '@ton-site-builder/templates/editor';

export default function TemplateGallery({
  value,
  onPick,
}: {
  value: string | null;
  onPick: (presetId: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PRESETS.map((preset) => {
        const active = value === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onPick(preset.id)}
            className={`flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition-all ${
              active
                ? 'border-tg-link/50 bg-tg-link/[0.08]'
                : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
            }`}
          >
            <span className="text-lg leading-none">{preset.glyph}</span>
            <span className="text-sm font-medium text-tg-text">{preset.name}</span>
            <span className="text-[11px] leading-snug text-tg-hint">{preset.description}</span>
          </button>
        );
      })}
    </div>
  );
}
