import {
  ForSaleData,
  LegacyTemplateId,
  LinktreeData,
  ProjectData,
  forSaleSchema,
  isLegacyTemplateId,
  linktreeSchema,
  migrateLegacyData,
  projectSchema,
} from './legacy';
import { renderForSale, renderLinktree, renderProject } from './legacyRender';
import {
  RenderOptions,
  SiteDocument,
  isSiteDocument,
  renderSiteDocument,
  validateSiteDocument,
} from './site';

export * from './constants';
export * from './blocks';
export * from './html';
export * from './legacy';
export * from './presets';
export * from './site';
export * from './theme';

/** Renders a v1 payload through the frozen renderers. */
export function renderLegacyTemplate(
  id: LegacyTemplateId,
  rawData: unknown,
  options?: RenderOptions
): string {
  switch (id) {
    case 'linktree':
      return renderLinktree(linktreeSchema.parse(rawData) as LinktreeData, options);
    case 'project':
      return renderProject(projectSchema.parse(rawData) as ProjectData, options);
    case 'for-sale':
      return renderForSale(forSaleSchema.parse(rawData) as ForSaleData, options);
    default: {
      const never: never = id;
      throw new Error(`Unknown template id: ${String(never)}`);
    }
  }
}

/**
 * Entry point for anything stored in the `sites` table. Branches on the data
 * rather than the template column, so v1 rows keep the frozen v1 output until
 * their owner re-saves them in the builder.
 */
export function renderStoredSite(
  template: string,
  rawData: unknown,
  options?: RenderOptions
): string {
  if (isSiteDocument(rawData)) {
    return renderSiteDocument(rawData, options);
  }
  if (isLegacyTemplateId(template)) {
    return renderLegacyTemplate(template, rawData, options);
  }
  throw new Error(`Cannot render site: unrecognised template "${template}" and non-v2 data`);
}

/**
 * Returns a stored site as an editable v2 document, migrating v1 rows on read.
 * Does not persist: the row stays v1 on disk until the builder saves it.
 */
export function toSiteDocument(template: string, rawData: unknown): SiteDocument {
  if (isSiteDocument(rawData)) return validateSiteDocument(rawData);
  if (isLegacyTemplateId(template)) return migrateLegacyData(template, rawData);
  throw new Error(`Cannot load site: unrecognised template "${template}" and non-v2 data`);
}

/** @deprecated Use renderStoredSite. Retained for the existing API call sites. */
export const renderTemplate = renderLegacyTemplate;

/** @deprecated The v1 template union; v2 sites carry a preset id instead. */
export type TemplateId = LegacyTemplateId;
