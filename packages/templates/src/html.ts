export const htmlEscape = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Allows http(s) and mailto only; anything else becomes '#'. */
export function safeUrl(raw: string | undefined): string {
  if (!raw) return '#';
  const trimmed = raw.trim();
  if (/^(https?:\/\/|mailto:)/i.test(trimmed)) return htmlEscape(trimmed);
  return '#';
}

/** Strips quotes, backslashes and newlines for use inside a CSS value. */
export function cssString(raw: string): string {
  return raw.replace(/[\\'"\n\r]/g, '');
}

/** Joins markup parts, skipping empty ones. */
export function joinHtml(parts: Array<string | false | null | undefined>): string {
  return parts.filter((p): p is string => typeof p === 'string' && p.length > 0).join('\n');
}
