import { z } from 'zod';
import { htmlEscape, joinHtml, safeUrl } from './html';

// A site is an ordered list of blocks; a preset is just a starting arrangement.

const url = z.string().url().max(512);
const shortText = z.string().min(1).max(120);
const mediumText = z.string().min(1).max(400);
const longText = z.string().min(1).max(4000);

const alignSchema = z.enum(['left', 'center']).default('left');

export const profileBlockSchema = z.object({
  id: z.string().max(64),
  type: z.literal('profile'),
  name: z.string().min(1).max(80),
  tagline: z.string().max(200).optional(),
  avatarUrl: url.optional(),
  shape: z.enum(['circle', 'rounded', 'square']).default('circle'),
  align: alignSchema,
});

export const heroBlockSchema = z.object({
  id: z.string().max(64),
  type: z.literal('hero'),
  title: z.string().min(1).max(100),
  tagline: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
  primaryLabel: z.string().max(40).optional(),
  primaryUrl: url.optional(),
  secondaryLabel: z.string().max(40).optional(),
  secondaryUrl: url.optional(),
  align: alignSchema,
});

export const linksBlockSchema = z.object({
  id: z.string().max(64),
  type: z.literal('links'),
  heading: z.string().max(80).optional(),
  layout: z.enum(['list', 'grid', 'inline']).default('list'),
  items: z
    .array(
      z.object({
        label: shortText,
        url,
        description: z.string().max(140).optional(),
      })
    )
    .min(1)
    .max(30),
});

export const featuresBlockSchema = z.object({
  id: z.string().max(64),
  type: z.literal('features'),
  heading: z.string().max(80).optional(),
  columns: z.enum(['auto', 'two', 'three']).default('auto'),
  items: z.array(z.object({ title: shortText, body: mediumText })).min(1).max(12),
});

export const textBlockSchema = z.object({
  id: z.string().max(64),
  type: z.literal('text'),
  heading: z.string().max(80).optional(),
  body: longText,
  align: alignSchema,
});

export const galleryBlockSchema = z.object({
  id: z.string().max(64),
  type: z.literal('gallery'),
  heading: z.string().max(80).optional(),
  columns: z.enum(['two', 'three']).default('two'),
  items: z.array(z.object({ url, caption: z.string().max(140).optional() })).min(1).max(24),
});

export const faqBlockSchema = z.object({
  id: z.string().max(64),
  type: z.literal('faq'),
  heading: z.string().max(80).optional(),
  items: z.array(z.object({ question: shortText, answer: mediumText })).min(1).max(20),
});

export const contactBlockSchema = z.object({
  id: z.string().max(64),
  type: z.literal('contact'),
  heading: z.string().max(80).optional(),
  note: z.string().max(300).optional(),
  telegram: z.string().max(64).optional(),
  email: z.string().email().max(160).optional(),
  website: url.optional(),
});

export const socialsBlockSchema = z.object({
  id: z.string().max(64),
  type: z.literal('socials'),
  items: z.array(z.object({ label: shortText, url })).min(1).max(12),
  align: alignSchema,
});

export const forSaleBlockSchema = z.object({
  id: z.string().max(64),
  type: z.literal('for-sale'),
  domain: z.string().min(4).max(126),
  priceTon: z.number().min(0).max(1_000_000),
  description: z.string().max(1000).optional(),
  telegram: z.string().max(64).optional(),
  email: z.string().email().max(160).optional(),
});

export const dividerBlockSchema = z.object({
  id: z.string().max(64),
  type: z.literal('divider'),
  style: z.enum(['line', 'dashed', 'space']).default('line'),
});

export const blockSchema = z.discriminatedUnion('type', [
  profileBlockSchema,
  heroBlockSchema,
  linksBlockSchema,
  featuresBlockSchema,
  textBlockSchema,
  galleryBlockSchema,
  faqBlockSchema,
  contactBlockSchema,
  socialsBlockSchema,
  forSaleBlockSchema,
  dividerBlockSchema,
]);

export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block['type'];

export { BLOCK_TYPES, SINGLETON_BLOCKS } from './constants';

// ---------------------------------------------------------------------------
// Renderers
// ---------------------------------------------------------------------------

/** Blank lines become paragraph breaks, single newlines become <br>. */
function paragraphs(raw: string): string {
  return raw
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${htmlEscape(p).replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

function heading(text: string | undefined): string {
  return text ? `<h2 class="tf-h">${htmlEscape(text)}</h2>` : '';
}

function actionButtons(
  primaryLabel: string | undefined,
  primaryUrl: string | undefined,
  secondaryLabel: string | undefined,
  secondaryUrl: string | undefined
): string {
  const primary =
    primaryLabel && primaryUrl
      ? `<a class="tf-btn tf-btn-primary" href="${safeUrl(primaryUrl)}" rel="noopener noreferrer">${htmlEscape(primaryLabel)}</a>`
      : '';
  const secondary =
    secondaryLabel && secondaryUrl
      ? `<a class="tf-btn tf-btn-secondary" href="${safeUrl(secondaryUrl)}" rel="noopener noreferrer">${htmlEscape(secondaryLabel)}</a>`
      : '';
  if (!primary && !secondary) return '';
  return `<div class="tf-actions">${primary}${secondary}</div>`;
}

function renderProfile(b: z.infer<typeof profileBlockSchema>): string {
  const avatar = b.avatarUrl
    ? `<img class="tf-avatar tf-avatar-${b.shape}" src="${safeUrl(b.avatarUrl)}" alt="${htmlEscape(b.name)}">`
    : '';
  return `<header class="tf-block tf-profile" data-align="${b.align}">
  ${avatar}
  <h1 class="tf-name">${htmlEscape(b.name)}</h1>
  ${b.tagline ? `<p class="tf-muted tf-tagline">${htmlEscape(b.tagline)}</p>` : ''}
</header>`;
}

function renderHero(b: z.infer<typeof heroBlockSchema>): string {
  return `<section class="tf-block tf-hero" data-align="${b.align}">
  <h1 class="tf-hero-title">${htmlEscape(b.title)}</h1>
  ${b.tagline ? `<p class="tf-muted tf-hero-tagline">${htmlEscape(b.tagline)}</p>` : ''}
  ${b.body ? `<div class="tf-card tf-hero-body">${paragraphs(b.body)}</div>` : ''}
  ${actionButtons(b.primaryLabel, b.primaryUrl, b.secondaryLabel, b.secondaryUrl)}
</section>`;
}

function renderLinks(b: z.infer<typeof linksBlockSchema>): string {
  const items = b.items
    .map(
      (l) => `<a class="tf-link" href="${safeUrl(l.url)}" rel="noopener noreferrer">
    <span class="tf-link-label">${htmlEscape(l.label)}</span>
    ${l.description ? `<span class="tf-link-desc tf-muted">${htmlEscape(l.description)}</span>` : ''}
  </a>`
    )
    .join('\n');
  return `<section class="tf-block">
  ${heading(b.heading)}
  <div class="tf-links" data-layout="${b.layout}">
${items}
  </div>
</section>`;
}

function renderFeatures(b: z.infer<typeof featuresBlockSchema>): string {
  const items = b.items
    .map(
      (f) => `<article class="tf-card tf-feature">
    <h3>${htmlEscape(f.title)}</h3>
    <p class="tf-muted">${htmlEscape(f.body)}</p>
  </article>`
    )
    .join('\n');
  return `<section class="tf-block">
  ${heading(b.heading)}
  <div class="tf-grid" data-columns="${b.columns}">
${items}
  </div>
</section>`;
}

function renderText(b: z.infer<typeof textBlockSchema>): string {
  return `<section class="tf-block tf-text" data-align="${b.align}">
  ${heading(b.heading)}
  <div class="tf-prose">${paragraphs(b.body)}</div>
</section>`;
}

function renderGallery(b: z.infer<typeof galleryBlockSchema>): string {
  const items = b.items
    .map(
      (g) => `<figure class="tf-shot">
    <img src="${safeUrl(g.url)}" alt="${htmlEscape(g.caption ?? '')}" loading="lazy">
    ${g.caption ? `<figcaption class="tf-muted">${htmlEscape(g.caption)}</figcaption>` : ''}
  </figure>`
    )
    .join('\n');
  return `<section class="tf-block">
  ${heading(b.heading)}
  <div class="tf-gallery" data-columns="${b.columns}">
${items}
  </div>
</section>`;
}

function renderFaq(b: z.infer<typeof faqBlockSchema>): string {
  const items = b.items
    .map(
      (f) => `<details class="tf-faq-item">
    <summary>${htmlEscape(f.question)}</summary>
    <p class="tf-muted">${htmlEscape(f.answer)}</p>
  </details>`
    )
    .join('\n');
  return `<section class="tf-block">
  ${heading(b.heading)}
  <div class="tf-faq">
${items}
  </div>
</section>`;
}

function renderContact(b: z.infer<typeof contactBlockSchema>): string {
  const handle = b.telegram?.replace(/^@/, '');
  const rows = joinHtml([
    handle &&
      `<a class="tf-contact-row" href="https://t.me/${htmlEscape(handle)}" rel="noopener noreferrer">Telegram <span>@${htmlEscape(handle)}</span></a>`,
    b.email &&
      `<a class="tf-contact-row" href="mailto:${htmlEscape(b.email)}">Email <span>${htmlEscape(b.email)}</span></a>`,
    b.website &&
      `<a class="tf-contact-row" href="${safeUrl(b.website)}" rel="noopener noreferrer">Website <span>${htmlEscape(b.website)}</span></a>`,
  ]);
  // Avoids rendering an empty card when nothing is filled in.
  const placeholder = '<div class="tf-contact-row tf-muted">No contact details yet</div>';
  return `<section class="tf-block">
  ${heading(b.heading)}
  <div class="tf-card tf-contact">
    ${b.note ? `<p class="tf-muted">${htmlEscape(b.note)}</p>` : ''}
    ${rows || (b.note ? '' : placeholder)}
  </div>
</section>`;
}

function renderSocials(b: z.infer<typeof socialsBlockSchema>): string {
  const items = b.items
    .map(
      (s) =>
        `<a class="tf-social" href="${safeUrl(s.url)}" rel="noopener noreferrer">${htmlEscape(s.label)}</a>`
    )
    .join('\n');
  return `<section class="tf-block tf-socials-wrap" data-align="${b.align}">
  <div class="tf-socials">
${items}
  </div>
</section>`;
}

function renderForSale(b: z.infer<typeof forSaleBlockSchema>): string {
  const price = b.priceTon.toLocaleString('en-US', { maximumFractionDigits: 4 });
  const handle = b.telegram?.replace(/^@/, '');
  const rows = joinHtml([
    handle &&
      `<div class="tf-contact-row">Telegram <a href="https://t.me/${htmlEscape(handle)}" rel="noopener noreferrer">@${htmlEscape(handle)}</a></div>`,
    b.email && `<div class="tf-contact-row">Email <a href="mailto:${htmlEscape(b.email)}">${htmlEscape(b.email)}</a></div>`,
  ]);
  return `<section class="tf-block">
  <article class="tf-card tf-sale">
    <div class="tf-sale-label">TON Domain · For sale</div>
    <h1 class="tf-sale-domain">${htmlEscape(b.domain)}</h1>
    <div class="tf-sale-price">${price} TON <span class="tf-muted">(or best offer)</span></div>
    ${b.description ? `<div class="tf-prose">${paragraphs(b.description)}</div>` : ''}
    <div class="tf-sale-meta">
      ${rows || '<div class="tf-contact-row tf-muted">Contact details available on request.</div>'}
      <p class="tf-muted tf-sale-hint">Ownership is verified on-chain. Final sale completes via a secure TON transfer.</p>
    </div>
  </article>
</section>`;
}

function renderDivider(b: z.infer<typeof dividerBlockSchema>): string {
  if (b.style === 'space') return `<div class="tf-block tf-spacer"></div>`;
  return `<hr class="tf-block tf-rule" data-style="${b.style}">`;
}

export function renderBlock(block: Block): string {
  switch (block.type) {
    case 'profile':
      return renderProfile(block);
    case 'hero':
      return renderHero(block);
    case 'links':
      return renderLinks(block);
    case 'features':
      return renderFeatures(block);
    case 'text':
      return renderText(block);
    case 'gallery':
      return renderGallery(block);
    case 'faq':
      return renderFaq(block);
    case 'contact':
      return renderContact(block);
    case 'socials':
      return renderSocials(block);
    case 'for-sale':
      return renderForSale(block);
    case 'divider':
      return renderDivider(block);
    default: {
      const never: never = block;
      throw new Error(`Unhandled block type: ${JSON.stringify(never)}`);
    }
  }
}

/** Layout CSS for the blocks; consumes the tokens from buildThemeCss. */
export const BLOCK_STYLES = `
  .tf-h { margin: 0 0 14px; font-size: 1.15rem; }
  .tf-profile { text-align: left; }
  .tf-profile[data-align="center"] { text-align: center; }
  .tf-avatar { width: 92px; height: 92px; object-fit: cover; margin-bottom: 14px; border: 2px solid rgba(var(--tf-accent-rgb), 0.5); box-shadow: 0 0 0 4px rgba(var(--tf-accent-rgb), 0.12); }
  .tf-avatar-circle { border-radius: 50%; }
  .tf-avatar-rounded { border-radius: var(--tf-radius-md); }
  .tf-avatar-square { border-radius: 0; }
  .tf-name { margin: 0 0 4px; font-size: 1.6rem; }
  .tf-tagline { margin: 0; font-size: 0.95rem; }
  .tf-hero[data-align="center"] { text-align: center; }
  .tf-hero[data-align="center"] .tf-actions { justify-content: center; }
  .tf-hero-title { margin: 0 0 8px; font-size: clamp(1.9rem, 4vw, 2.6rem); }
  .tf-hero-tagline { margin: 0 0 18px; font-size: 1.02rem; max-width: 640px; }
  .tf-hero[data-align="center"] .tf-hero-tagline { margin-left: auto; margin-right: auto; }
  .tf-hero-body p { margin: 0 0 10px; }
  .tf-hero-body p:last-child { margin-bottom: 0; }
  .tf-actions { display: flex; flex-wrap: wrap; gap: var(--tf-gap); margin-top: 18px; }
  .tf-links { display: flex; flex-direction: column; gap: var(--tf-gap); }
  .tf-links[data-layout="grid"] { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
  .tf-links[data-layout="inline"] { flex-direction: row; flex-wrap: wrap; justify-content: center; }
  .tf-link {
    display: flex; flex-direction: column; gap: 3px;
    padding: 14px 18px; text-align: center; text-decoration: none;
    border-radius: var(--tf-radius-md);
    background: rgba(127, 127, 127, 0.07);
    border: 1px solid var(--tf-border);
    color: var(--tf-text); font-weight: 500;
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  }
  .tf-link:hover { background: rgba(var(--tf-accent-rgb), 0.12); border-color: rgba(var(--tf-accent-rgb), 0.4); transform: translateY(-1px); }
  .tf-links[data-layout="inline"] .tf-link { padding: 9px 16px; border-radius: var(--tf-radius-pill); }
  .tf-link-desc { font-size: 0.8rem; font-weight: 400; }
  .tf-grid { display: grid; gap: var(--tf-gap); grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
  .tf-grid[data-columns="two"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tf-grid[data-columns="three"] { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .tf-feature h3 { margin: 0 0 6px; font-size: 0.98rem; }
  .tf-feature p { margin: 0; font-size: 0.88rem; }
  .tf-text[data-align="center"] { text-align: center; }
  .tf-prose p { margin: 0 0 12px; font-size: 0.96rem; }
  .tf-prose p:last-child { margin-bottom: 0; }
  .tf-gallery { display: grid; gap: var(--tf-gap); }
  .tf-gallery[data-columns="two"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tf-gallery[data-columns="three"] { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .tf-shot { margin: 0; }
  .tf-shot img { width: 100%; display: block; border-radius: var(--tf-radius-md); border: 1px solid var(--tf-border); }
  .tf-shot figcaption { margin-top: 6px; font-size: 0.8rem; }
  .tf-faq { display: flex; flex-direction: column; gap: var(--tf-gap); }
  .tf-faq-item { border: 1px solid var(--tf-border); border-radius: var(--tf-radius-md); padding: 14px 16px; background: var(--tf-card); }
  .tf-faq-item summary { cursor: pointer; font-weight: 500; font-size: 0.95rem; }
  .tf-faq-item p { margin: 10px 0 0; font-size: 0.88rem; }
  .tf-contact-row { display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; font-size: 0.9rem; text-decoration: none; color: var(--tf-text); border-bottom: 1px solid var(--tf-border); }
  .tf-contact-row:last-child { border-bottom: none; }
  .tf-contact-row span, .tf-contact-row a { color: var(--tf-accent); text-decoration: none; }
  .tf-socials-wrap[data-align="center"] .tf-socials { justify-content: center; }
  .tf-socials { display: flex; flex-wrap: wrap; gap: var(--tf-gap); }
  .tf-social { padding: 8px 15px; border-radius: var(--tf-radius-pill); border: 1px solid var(--tf-border); background: rgba(127,127,127,0.07); text-decoration: none; font-size: 0.85rem; font-weight: 500; transition: border-color 0.15s ease, background 0.15s ease; }
  .tf-social:hover { border-color: rgba(var(--tf-accent-rgb), 0.45); background: rgba(var(--tf-accent-rgb), 0.12); }
  .tf-sale-label { display: inline-flex; padding: 5px 12px; border-radius: var(--tf-radius-pill); font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; background: rgba(var(--tf-accent-rgb), 0.15); border: 1px solid rgba(var(--tf-accent-rgb), 0.45); color: var(--tf-accent); margin-bottom: 14px; }
  .tf-sale-domain { margin: 0 0 6px; font-size: 1.9rem; color: var(--tf-accent); }
  .tf-sale-price { font-size: 1.2rem; font-weight: 600; margin-bottom: 12px; }
  .tf-sale-price span { font-size: 0.85rem; font-weight: 400; }
  .tf-sale-meta { margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--tf-border); font-size: 0.88rem; }
  .tf-sale-hint { margin: 10px 0 0; font-size: 0.78rem; }
  .tf-rule { border: none; border-top: 1px solid var(--tf-border); }
  .tf-rule[data-style="dashed"] { border-top-style: dashed; }
  .tf-spacer { height: var(--tf-section); }
  @media (max-width: 640px) {
    .tf-grid[data-columns="three"], .tf-gallery[data-columns="three"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 460px) {
    .tf-grid, .tf-grid[data-columns="two"], .tf-grid[data-columns="three"],
    .tf-gallery, .tf-gallery[data-columns="two"], .tf-gallery[data-columns="three"] { grid-template-columns: minmax(0, 1fr); }
    .tf-links[data-layout="grid"] { grid-template-columns: minmax(0, 1fr); }
  }
`;
