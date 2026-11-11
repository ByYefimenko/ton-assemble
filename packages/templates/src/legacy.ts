import { z } from 'zod';
import type { Block } from './blocks';
import { SITE_VERSION } from './constants';
import type { SiteDocument } from './site';
import { themeSchema } from './theme';

// v1 data shapes, kept so pre-block-model rows still validate. Read-only:
// nothing is written in v1 form any more.

const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/).optional();

export const linktreeSchema = z.object({
  title: z.string().min(1).max(80),
  subtitle: z.string().max(160).optional(),
  avatarUrl: z.string().url().max(200).optional(),
  accentColor: hexColorSchema,
  links: z
    .array(z.object({ label: z.string().min(1).max(64), url: z.string().url().max(256) }))
    .min(1)
    .max(20),
});

export const projectSchema = z.object({
  name: z.string().min(1).max(80),
  tagline: z.string().min(1).max(160),
  description: z.string().min(1).max(2000),
  accentColor: hexColorSchema,
  primaryActionLabel: z.string().min(1).max(40).optional(),
  primaryActionUrl: z.string().url().max(256).optional(),
  secondaryActionLabel: z.string().min(1).max(40).optional(),
  secondaryActionUrl: z.string().url().max(256).optional(),
  features: z.array(z.object({ title: z.string().min(1).max(80), body: z.string().min(1).max(400) })).max(12).optional(),
});

export const forSaleSchema = z.object({
  domain: z.string().min(4).max(126),
  priceTon: z.number().min(0).max(1_000_000),
  accentColor: hexColorSchema,
  contactTelegram: z.string().min(1).max(64).optional(),
  contactEmail: z.string().email().max(160).optional(),
  description: z.string().max(1000).optional(),
});

export type LinktreeData = z.infer<typeof linktreeSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
export type ForSaleData = z.infer<typeof forSaleSchema>;

/** The three v1 template ids. */
export type LegacyTemplateId = 'linktree' | 'project' | 'for-sale';

export const LEGACY_TEMPLATE_IDS: LegacyTemplateId[] = ['linktree', 'project', 'for-sale'];

function baseTheme(accentColor: string | undefined) {
  return themeSchema.parse({ accent: accentColor, mode: 'dark', background: 'glow' });
}

/**
 * Converts a v1 payload to the equivalent v2 document. The block arrangement
 * and theme defaults reproduce the v1 rendering closely.
 */
export function migrateLegacyData(template: LegacyTemplateId, rawData: unknown): SiteDocument {
  if (template === 'linktree') {
    const data = linktreeSchema.parse(rawData);
    const blocks: Block[] = [
      {
        id: 'profile-1',
        type: 'profile',
        name: data.title,
        tagline: data.subtitle,
        avatarUrl: data.avatarUrl,
        shape: 'circle',
        align: 'center',
      },
      {
        id: 'links-1',
        type: 'links',
        layout: 'list',
        items: data.links.map((l) => ({ label: l.label, url: l.url })),
      },
    ];
    return {
      version: SITE_VERSION,
      theme: baseTheme(data.accentColor),
      layout: 'narrow',
      meta: { title: data.title, description: data.subtitle },
      blocks,
    };
  }

  if (template === 'project') {
    const data = projectSchema.parse(rawData);
    const blocks: Block[] = [
      {
        id: 'hero-1',
        type: 'hero',
        title: data.name,
        tagline: data.tagline,
        body: data.description || undefined,
        primaryLabel: data.primaryActionLabel,
        primaryUrl: data.primaryActionUrl,
        secondaryLabel: data.secondaryActionLabel,
        secondaryUrl: data.secondaryActionUrl,
        align: 'left',
      },
    ];
    if (data.features?.length) {
      blocks.push({
        id: 'features-1',
        type: 'features',
        columns: 'auto',
        items: data.features.map((f) => ({ title: f.title, body: f.body })),
      });
    }
    return {
      version: SITE_VERSION,
      theme: baseTheme(data.accentColor),
      layout: 'wide',
      meta: { title: data.name, description: data.tagline },
      blocks,
    };
  }

  const data = forSaleSchema.parse(rawData);
  return {
    version: SITE_VERSION,
    theme: baseTheme(data.accentColor),
    layout: 'narrow',
    meta: { title: `${data.domain} · For Sale` },
    blocks: [
      {
        id: 'for-sale-1',
        type: 'for-sale',
        domain: data.domain,
        priceTon: data.priceTon,
        description: data.description,
        telegram: data.contactTelegram,
        email: data.contactEmail,
      },
    ],
  };
}

export function isLegacyTemplateId(value: string): value is LegacyTemplateId {
  return (LEGACY_TEMPLATE_IDS as string[]).includes(value);
}
