import type { Block, BlockType } from './blocks';
import { SITE_VERSION, makeTheme } from './constants';
import type { SiteDocument } from './site';

export interface Preset {
  id: string;
  name: string;
  description: string;
  /** Glyph shown on the gallery card. */
  glyph: string;
  build: () => SiteDocument;
}

const theme = makeTheme;

export const PRESETS: Preset[] = [
  {
    id: 'linktree',
    name: 'Link page',
    description: 'A profile photo, a short bio and a stack of links.',
    glyph: '🔗',
    build: () => ({
      version: SITE_VERSION,
      theme: theme({ accent: '#3b82f6', background: 'glow' }),
      layout: 'narrow',
      meta: {},
      blocks: [
        { id: 'profile-1', type: 'profile', name: 'Your name', tagline: 'What you do, in one line.', shape: 'circle', align: 'center' },
        {
          id: 'links-1',
          type: 'links',
          layout: 'list',
          items: [
            { label: 'Telegram', url: 'https://t.me/durov' },
            { label: 'Website', url: 'https://ton.org' },
          ],
        },
      ],
    }),
  },
  {
    id: 'project',
    name: 'Project',
    description: 'A headline, a description, call-to-action buttons and features.',
    glyph: '🚀',
    build: () => ({
      version: SITE_VERSION,
      theme: theme({ accent: '#06b6d4', background: 'mesh' }),
      layout: 'wide',
      meta: {},
      blocks: [
        {
          id: 'hero-1',
          type: 'hero',
          title: 'Project name',
          tagline: 'One sentence on what it does and who it is for.',
          body: 'Describe the project here. Leave a blank line to start a new paragraph.',
          primaryLabel: 'Get started',
          primaryUrl: 'https://ton.org',
          align: 'left',
        },
        {
          id: 'features-1',
          type: 'features',
          heading: 'Features',
          columns: 'auto',
          items: [
            { title: 'First feature', body: 'A sentence or two on what makes it useful.' },
            { title: 'Second feature', body: 'A sentence or two on what makes it useful.' },
            { title: 'Third feature', body: 'A sentence or two on what makes it useful.' },
          ],
        },
      ],
    }),
  },
  {
    id: 'for-sale',
    name: 'Domain for sale',
    description: 'A price, a pitch and your contact details.',
    glyph: '💎',
    build: () => ({
      version: SITE_VERSION,
      theme: theme({ accent: '#f59e0b', background: 'glow' }),
      layout: 'narrow',
      meta: {},
      blocks: [
        { id: 'for-sale-1', type: 'for-sale', domain: 'yourdomain.ton', priceTon: 100, description: 'Why this domain is worth owning.' },
      ],
    }),
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Profile, a gallery of work, and a way to get in touch.',
    glyph: '🎨',
    build: () => ({
      version: SITE_VERSION,
      theme: theme({ accent: '#a855f7', background: 'solid', font: 'grotesk', mode: 'dark' }),
      layout: 'wide',
      meta: {},
      blocks: [
        { id: 'profile-1', type: 'profile', name: 'Your name', tagline: 'Designer, photographer, maker.', shape: 'rounded', align: 'left' },
        {
          id: 'gallery-1',
          type: 'gallery',
          heading: 'Selected work',
          columns: 'two',
          items: [
            { url: 'https://picsum.photos/seed/one/800/600', caption: 'Replace with your own image URL' },
            { url: 'https://picsum.photos/seed/two/800/600', caption: 'Replace with your own image URL' },
          ],
        },
        { id: 'contact-1', type: 'contact', heading: 'Get in touch', note: 'Open for commissions.', telegram: '@yourhandle' },
      ],
    }),
  },
  {
    id: 'resume',
    name: 'Résumé',
    description: 'A one-page CV: summary, experience and contact details.',
    glyph: '📄',
    build: () => ({
      version: SITE_VERSION,
      theme: theme({ accent: '#22c55e', background: 'solid', mode: 'light', font: 'serif', button: 'outline' }),
      layout: 'narrow',
      meta: {},
      blocks: [
        { id: 'profile-1', type: 'profile', name: 'Your name', tagline: 'Role · City', shape: 'circle', align: 'left' },
        { id: 'text-1', type: 'text', heading: 'About', body: 'Two or three sentences on what you do and what you are looking for.', align: 'left' },
        {
          id: 'features-1',
          type: 'features',
          heading: 'Experience',
          columns: 'two',
          items: [
            { title: 'Job title · Company', body: '2023 — now. What you worked on and what changed because of it.' },
            { title: 'Job title · Company', body: '2021 — 2023. What you worked on and what changed because of it.' },
          ],
        },
        { id: 'contact-1', type: 'contact', heading: 'Contact', telegram: '@yourhandle', email: 'you@example.com' },
      ],
    }),
  },
  {
    id: 'shop',
    name: 'Small shop',
    description: 'Products in a grid, with pricing in the copy and a contact block.',
    glyph: '🛍️',
    build: () => ({
      version: SITE_VERSION,
      theme: theme({ accent: '#f43f5e', background: 'dots', radius: 'soft' }),
      layout: 'wide',
      meta: {},
      blocks: [
        { id: 'hero-1', type: 'hero', title: 'Shop name', tagline: 'What you sell, in one line.', align: 'center' },
        {
          id: 'gallery-1',
          type: 'gallery',
          heading: 'Products',
          columns: 'three',
          items: [
            { url: 'https://picsum.photos/seed/p1/600/600', caption: 'Product · 10 TON' },
            { url: 'https://picsum.photos/seed/p2/600/600', caption: 'Product · 12 TON' },
            { url: 'https://picsum.photos/seed/p3/600/600', caption: 'Product · 8 TON' },
          ],
        },
        { id: 'faq-1', type: 'faq', heading: 'Questions', items: [{ question: 'How do I order?', answer: 'Message us on Telegram and we will arrange payment and delivery.' }] },
        { id: 'contact-1', type: 'contact', heading: 'Order', note: 'Message us to place an order.', telegram: '@yourhandle' },
      ],
    }),
  },
  {
    id: 'event',
    name: 'Event',
    description: 'Date, details, FAQ and a sign-up link.',
    glyph: '🎟️',
    build: () => ({
      version: SITE_VERSION,
      theme: theme({ accent: '#8b5cf6', background: 'gradient', radius: 'pill' }),
      layout: 'narrow',
      meta: {},
      blocks: [
        {
          id: 'hero-1',
          type: 'hero',
          title: 'Event name',
          tagline: 'Date · Venue · City',
          body: 'What the event is and who should come.',
          primaryLabel: 'Register',
          primaryUrl: 'https://t.me/durov',
          align: 'center',
        },
        {
          id: 'faq-1',
          type: 'faq',
          heading: 'Good to know',
          items: [
            { question: 'Is there a ticket price?', answer: 'Say what it costs, or that it is free.' },
            { question: 'How do I get there?', answer: 'Directions, nearest transport, parking.' },
          ],
        },
        { id: 'contact-1', type: 'contact', heading: 'Questions', telegram: '@yourhandle' },
      ],
    }),
  },
  {
    id: 'community',
    name: 'Community',
    description: 'A landing page for a group: what it is, where to join, house rules.',
    glyph: '👥',
    build: () => ({
      version: SITE_VERSION,
      theme: theme({ accent: '#0ea5e9', background: 'grid', font: 'rounded' }),
      layout: 'narrow',
      meta: {},
      blocks: [
        { id: 'hero-1', type: 'hero', title: 'Community name', tagline: 'What brings this group together.', align: 'center' },
        {
          id: 'links-1',
          type: 'links',
          heading: 'Join us',
          layout: 'grid',
          items: [
            { label: 'Telegram group', url: 'https://t.me/durov' },
            { label: 'Announcements', url: 'https://t.me/durov' },
          ],
        },
        { id: 'text-1', type: 'text', heading: 'House rules', body: 'Be kind. Stay on topic. No spam.', align: 'left' },
        { id: 'socials-1', type: 'socials', align: 'center', items: [{ label: 'X', url: 'https://x.com' }, { label: 'GitHub', url: 'https://github.com' }] },
      ],
    }),
  },
];

export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}

/** Starter content for a block added from the builder. */
export function createBlock(type: BlockType, id: string): Block {
  switch (type) {
    case 'profile':
      return { id, type: 'profile', name: 'Your name', tagline: '', shape: 'circle', align: 'center' };
    case 'hero':
      return { id, type: 'hero', title: 'Headline', tagline: '', body: '', align: 'left' };
    case 'links':
      return { id, type: 'links', layout: 'list', items: [{ label: 'Telegram', url: 'https://t.me/durov' }] };
    case 'features':
      return { id, type: 'features', heading: 'Features', columns: 'auto', items: [{ title: 'Title', body: 'Description.' }] };
    case 'text':
      return { id, type: 'text', heading: '', body: 'Write something here.', align: 'left' };
    case 'gallery':
      return { id, type: 'gallery', heading: 'Gallery', columns: 'two', items: [{ url: 'https://picsum.photos/seed/new/800/600', caption: '' }] };
    case 'faq':
      return { id, type: 'faq', heading: 'FAQ', items: [{ question: 'Question?', answer: 'Answer.' }] };
    case 'contact':
      return { id, type: 'contact', heading: 'Contact', note: '' };
    case 'socials':
      return { id, type: 'socials', align: 'center', items: [{ label: 'X', url: 'https://x.com' }] };
    case 'for-sale':
      return { id, type: 'for-sale', domain: 'yourdomain.ton', priceTon: 100, description: '' };
    case 'divider':
      return { id, type: 'divider', style: 'line' };
    default: {
      const never: never = type;
      throw new Error(`Unknown block type: ${String(never)}`);
    }
  }
}
