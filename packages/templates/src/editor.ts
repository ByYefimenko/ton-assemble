// Entry point for the Mini App: plain values and types only, no zod and no
// renderers. Keeps the validation layer out of the browser bundle.

export * from './constants';
export * from './presets';

export type { Block, BlockType } from './blocks';
export type { FontId, Theme } from './theme';
export type { SiteDocument } from './site';
export type { LegacyTemplateId } from './legacy';
