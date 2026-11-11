import { z } from 'zod';
import { BLOCK_STYLES, Block, blockSchema, renderBlock } from './blocks';
import { htmlEscape, safeUrl } from './html';
import { DEFAULT_THEME, SITE_VERSION } from './constants';
import { buildThemeCss, themeSchema } from './theme';

export { SITE_VERSION } from './constants';

export const siteSchema = z.object({
  version: z.literal(SITE_VERSION),
  theme: themeSchema.default(DEFAULT_THEME),
  layout: z.enum(['narrow', 'wide']).default('narrow'),
  meta: z
    .object({
      title: z.string().max(120).optional(),
      description: z.string().max(300).optional(),
    })
    .default({}),
  blocks: z.array(blockSchema).min(1).max(40),
});

export type SiteDocument = z.infer<typeof siteSchema>;

export const ATTRIBUTION_FALLBACK_URL = 'https://t.me/TonAssembleBot';

export interface RenderOptions {
  /** Badge link target; defaults to the bot URL. */
  attributionUrl?: string;
  /** Set false to omit the "Made with TonAssemble" badge. */
  attribution?: boolean;
}

function derivePageTitle(doc: SiteDocument): string {
  if (doc.meta.title?.trim()) return doc.meta.title.trim();
  for (const block of doc.blocks) {
    if (block.type === 'profile') return block.name;
    if (block.type === 'hero') return block.title;
    if (block.type === 'for-sale') return `${block.domain} · For Sale`;
  }
  return 'My site';
}

function deriveDescription(doc: SiteDocument): string | undefined {
  if (doc.meta.description?.trim()) return doc.meta.description.trim();
  for (const block of doc.blocks) {
    if (block.type === 'profile' && block.tagline) return block.tagline;
    if (block.type === 'hero' && block.tagline) return block.tagline;
  }
  return undefined;
}

function renderAttribution(options?: RenderOptions): string {
  if (options?.attribution === false) return '';
  const url = options?.attributionUrl ?? ATTRIBUTION_FALLBACK_URL;
  return `<footer class="tf-foot"><a href="${safeUrl(
    url
  )}" target="_blank" rel="noopener noreferrer" class="tf-badge">Made with TonAssemble</a></footer>`;
}

/**
 * Renders a v2 document to one self-contained HTML string. In TON Storage mode
 * the output ships as a frozen bag, so it must not reference external assets.
 */
export function renderSiteDocument(input: unknown, options?: RenderOptions): string {
  const doc = siteSchema.parse(input);
  const title = htmlEscape(derivePageTitle(doc));
  const description = deriveDescription(doc);
  const body = doc.blocks.map((block: Block) => renderBlock(block)).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
${description ? `<meta name="description" content="${htmlEscape(description)}">` : ''}
<meta property="og:title" content="${title}">
${description ? `<meta property="og:description" content="${htmlEscape(description)}">` : ''}
<style>
${buildThemeCss(doc.theme)}
${BLOCK_STYLES}
</style>
</head>
<body>
<div class="tf-shell" data-width="${doc.layout}">
${body}
${renderAttribution(options)}
</div>
</body>
</html>`;
}

/** Throws ZodError on invalid input. */
export function validateSiteDocument(input: unknown): SiteDocument {
  return siteSchema.parse(input);
}

export function isSiteDocument(input: unknown): input is SiteDocument {
  return (
    typeof input === 'object' &&
    input !== null &&
    (input as { version?: unknown }).version === SITE_VERSION
  );
}
