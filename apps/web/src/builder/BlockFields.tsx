import type { Block } from '@ton-site-builder/templates/editor';
import { Choice, Field, RepeatList, TextArea, TextInput } from './fields';

type Patch = (patch: Record<string, unknown>) => void;

const ALIGN = [
  { value: 'left' as const, label: 'Left' },
  { value: 'center' as const, label: 'Centre' },
];

export default function BlockFields({ block, onChange }: { block: Block; onChange: Patch }) {
  switch (block.type) {
    case 'profile':
      return (
        <>
          <Field label="Name">
            <TextInput value={block.name} onChange={(v) => onChange({ name: v })} placeholder="Your name" />
          </Field>
          <Field label="Tagline">
            <TextInput value={block.tagline ?? ''} onChange={(v) => onChange({ tagline: v })} placeholder="What you do" />
          </Field>
          <Field label="Avatar URL" hint="Loaded from the web when the page opens.">
            <TextInput value={block.avatarUrl ?? ''} onChange={(v) => onChange({ avatarUrl: v })} placeholder="https://…" />
          </Field>
          <Field label="Avatar shape">
            <Choice
              value={block.shape}
              onChange={(v) => onChange({ shape: v })}
              options={[
                { value: 'circle', label: 'Circle' },
                { value: 'rounded', label: 'Rounded' },
                { value: 'square', label: 'Square' },
              ]}
            />
          </Field>
          <Field label="Alignment">
            <Choice value={block.align} onChange={(v) => onChange({ align: v })} options={ALIGN} />
          </Field>
        </>
      );

    case 'hero':
      return (
        <>
          <Field label="Headline">
            <TextInput value={block.title} onChange={(v) => onChange({ title: v })} />
          </Field>
          <Field label="Tagline">
            <TextInput value={block.tagline ?? ''} onChange={(v) => onChange({ tagline: v })} />
          </Field>
          <Field label="Body" hint="Leave a blank line between paragraphs.">
            <TextArea value={block.body ?? ''} onChange={(v) => onChange({ body: v })} rows={4} />
          </Field>
          <Field label="Primary button">
            <div className="grid grid-cols-2 gap-1.5">
              <TextInput value={block.primaryLabel ?? ''} onChange={(v) => onChange({ primaryLabel: v })} placeholder="Label" />
              <TextInput value={block.primaryUrl ?? ''} onChange={(v) => onChange({ primaryUrl: v })} placeholder="https://…" />
            </div>
          </Field>
          <Field label="Secondary button">
            <div className="grid grid-cols-2 gap-1.5">
              <TextInput value={block.secondaryLabel ?? ''} onChange={(v) => onChange({ secondaryLabel: v })} placeholder="Label" />
              <TextInput value={block.secondaryUrl ?? ''} onChange={(v) => onChange({ secondaryUrl: v })} placeholder="https://…" />
            </div>
          </Field>
          <Field label="Alignment">
            <Choice value={block.align} onChange={(v) => onChange({ align: v })} options={ALIGN} />
          </Field>
        </>
      );

    case 'links':
      return (
        <>
          <Field label="Heading">
            <TextInput value={block.heading ?? ''} onChange={(v) => onChange({ heading: v })} placeholder="Optional" />
          </Field>
          <Field label="Layout">
            <Choice
              value={block.layout}
              onChange={(v) => onChange({ layout: v })}
              options={[
                { value: 'list', label: 'List' },
                { value: 'grid', label: 'Grid' },
                { value: 'inline', label: 'Pills' },
              ]}
            />
          </Field>
          <Field label="Links">
            <RepeatList
              items={block.items}
              max={30}
              addLabel="Add link"
              blank={{ label: '', url: '' }}
              onChange={(items) => onChange({ items })}
              render={(item, set) => (
                <>
                  <TextInput value={item.label} onChange={(v) => set({ label: v })} placeholder="Label" />
                  <TextInput value={item.url} onChange={(v) => set({ url: v })} placeholder="https://…" />
                  <TextInput
                    value={item.description ?? ''}
                    onChange={(v) => set({ description: v })}
                    placeholder="Description (optional)"
                  />
                </>
              )}
            />
          </Field>
        </>
      );

    case 'features':
      return (
        <>
          <Field label="Heading">
            <TextInput value={block.heading ?? ''} onChange={(v) => onChange({ heading: v })} placeholder="Optional" />
          </Field>
          <Field label="Columns">
            <Choice
              value={block.columns}
              onChange={(v) => onChange({ columns: v })}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'two', label: '2' },
                { value: 'three', label: '3' },
              ]}
            />
          </Field>
          <Field label="Items">
            <RepeatList
              items={block.items}
              max={12}
              addLabel="Add item"
              blank={{ title: '', body: '' }}
              onChange={(items) => onChange({ items })}
              render={(item, set) => (
                <>
                  <TextInput value={item.title} onChange={(v) => set({ title: v })} placeholder="Title" />
                  <TextArea value={item.body} onChange={(v) => set({ body: v })} placeholder="Description" rows={2} />
                </>
              )}
            />
          </Field>
        </>
      );

    case 'text':
      return (
        <>
          <Field label="Heading">
            <TextInput value={block.heading ?? ''} onChange={(v) => onChange({ heading: v })} placeholder="Optional" />
          </Field>
          <Field label="Body" hint="Leave a blank line between paragraphs.">
            <TextArea value={block.body} onChange={(v) => onChange({ body: v })} rows={5} />
          </Field>
          <Field label="Alignment">
            <Choice value={block.align} onChange={(v) => onChange({ align: v })} options={ALIGN} />
          </Field>
        </>
      );

    case 'gallery':
      return (
        <>
          <Field label="Heading">
            <TextInput value={block.heading ?? ''} onChange={(v) => onChange({ heading: v })} placeholder="Optional" />
          </Field>
          <Field label="Columns">
            <Choice
              value={block.columns}
              onChange={(v) => onChange({ columns: v })}
              options={[
                { value: 'two', label: '2' },
                { value: 'three', label: '3' },
              ]}
            />
          </Field>
          <Field label="Images" hint="Image URLs are fetched from the web when the page loads.">
            <RepeatList
              items={block.items}
              max={24}
              addLabel="Add image"
              blank={{ url: '', caption: '' }}
              onChange={(items) => onChange({ items })}
              render={(item, set) => (
                <>
                  <TextInput value={item.url} onChange={(v) => set({ url: v })} placeholder="https://…" />
                  <TextInput value={item.caption ?? ''} onChange={(v) => set({ caption: v })} placeholder="Caption (optional)" />
                </>
              )}
            />
          </Field>
        </>
      );

    case 'faq':
      return (
        <>
          <Field label="Heading">
            <TextInput value={block.heading ?? ''} onChange={(v) => onChange({ heading: v })} placeholder="Optional" />
          </Field>
          <Field label="Questions">
            <RepeatList
              items={block.items}
              max={20}
              addLabel="Add question"
              blank={{ question: '', answer: '' }}
              onChange={(items) => onChange({ items })}
              render={(item, set) => (
                <>
                  <TextInput value={item.question} onChange={(v) => set({ question: v })} placeholder="Question" />
                  <TextArea value={item.answer} onChange={(v) => set({ answer: v })} placeholder="Answer" rows={2} />
                </>
              )}
            />
          </Field>
        </>
      );

    case 'contact':
      return (
        <>
          <Field label="Heading">
            <TextInput value={block.heading ?? ''} onChange={(v) => onChange({ heading: v })} placeholder="Optional" />
          </Field>
          <Field label="Note">
            <TextInput value={block.note ?? ''} onChange={(v) => onChange({ note: v })} placeholder="Optional" />
          </Field>
          <Field label="Telegram">
            <TextInput value={block.telegram ?? ''} onChange={(v) => onChange({ telegram: v })} placeholder="@handle" />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={block.email ?? ''} onChange={(v) => onChange({ email: v })} placeholder="you@example.com" />
          </Field>
          <Field label="Website">
            <TextInput value={block.website ?? ''} onChange={(v) => onChange({ website: v })} placeholder="https://…" />
          </Field>
        </>
      );

    case 'socials':
      return (
        <>
          <Field label="Alignment">
            <Choice value={block.align} onChange={(v) => onChange({ align: v })} options={ALIGN} />
          </Field>
          <Field label="Profiles">
            <RepeatList
              items={block.items}
              max={12}
              addLabel="Add profile"
              blank={{ label: '', url: '' }}
              onChange={(items) => onChange({ items })}
              render={(item, set) => (
                <>
                  <TextInput value={item.label} onChange={(v) => set({ label: v })} placeholder="X, GitHub, …" />
                  <TextInput value={item.url} onChange={(v) => set({ url: v })} placeholder="https://…" />
                </>
              )}
            />
          </Field>
        </>
      );

    case 'for-sale':
      return (
        <>
          <Field label="Domain">
            <TextInput value={block.domain} onChange={(v) => onChange({ domain: v })} placeholder="yourdomain.ton" />
          </Field>
          <Field label="Price (TON)">
            <TextInput
              type="number"
              value={String(block.priceTon)}
              onChange={(v) => onChange({ priceTon: v === '' ? 0 : Number(v) })}
            />
          </Field>
          <Field label="Description">
            <TextArea value={block.description ?? ''} onChange={(v) => onChange({ description: v })} rows={3} />
          </Field>
          <Field label="Telegram">
            <TextInput value={block.telegram ?? ''} onChange={(v) => onChange({ telegram: v })} placeholder="@handle" />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={block.email ?? ''} onChange={(v) => onChange({ email: v })} placeholder="you@example.com" />
          </Field>
        </>
      );

    case 'divider':
      return (
        <Field label="Style">
          <Choice
            value={block.style}
            onChange={(v) => onChange({ style: v })}
            options={[
              { value: 'line', label: 'Line' },
              { value: 'dashed', label: 'Dashed' },
              { value: 'space', label: 'Space' },
            ]}
          />
        </Field>
      );

    default: {
      const never: never = block;
      throw new Error(`No field editor for block: ${JSON.stringify(never)}`);
    }
  }
}
