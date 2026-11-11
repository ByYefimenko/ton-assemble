import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PRESETS, SiteDocument, getPreset } from '@ton-site-builder/templates/editor';
import { createSite, getDomains, is4nDomain } from '../api';
import SiteBuilder from '../builder/SiteBuilder';
import { useLang } from '../context/LangContext';

const DEFAULT_PRESET = PRESETS[0].id;

export default function CreateSite() {
  const navigate = useNavigate();
  const { t } = useLang();

  const [domains, setDomains] = useState<Awaited<ReturnType<typeof getDomains>>['domains']>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [domainId, setDomainId] = useState('');
  const [saleDomain, setSaleDomain] = useState('');
  const [slug, setSlug] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [presetId, setPresetId] = useState(DEFAULT_PRESET);

  const initialDoc = useMemo<SiteDocument>(() => getPreset(DEFAULT_PRESET)!.build(), []);

  useEffect(() => {
    getDomains()
      .then((r) => r.ok && setDomains(r.domains))
      .catch(() => setLoadError(t('loadDomainsFailed')))
      .finally(() => setLoading(false));
  }, [t]);

  const verifiedDomains = domains.filter((d) => d.verified);
  const selectedDomain = domains.find((d) => String(d.id) === domainId)?.domain ?? '';
  const isForSale = presetId === 'for-sale';
  const effectiveDomain = (isForSale ? saleDomain.trim() || selectedDomain : selectedDomain)
    .trim()
    .toLowerCase();

  useEffect(() => {
    if (isForSale && selectedDomain) setSaleDomain(selectedDomain);
  }, [isForSale, selectedDomain]);

  const publicBase =
    import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  // A for-sale page advertises the domain it is attached to, so the selection
  // above feeds the block instead of being typed twice.
  const applyDomain = useCallback(
    (d: SiteDocument): SiteDocument => {
      if (!effectiveDomain) return d;
      const needsSync = d.blocks.some((b) => b.type === 'for-sale' && b.domain !== effectiveDomain);
      if (!needsSync) return d;
      return {
        ...d,
        blocks: d.blocks.map((b) => (b.type === 'for-sale' ? { ...b, domain: effectiveDomain } : b)),
      };
    },
    [effectiveDomain]
  );

  const submit = (doc: SiteDocument) => {
    if (!effectiveDomain) {
      setFormError(isForSale ? t('enterDomainRequired') : t('selectDomainRequired'));
      return;
    }
    if (!is4nDomain(effectiveDomain) && !accessKey.trim()) {
      setFormError(t('non4nNeedKey'));
      return;
    }

    setFormError(null);
    setSubmitting(true);
    createSite({
      domain: effectiveDomain,
      template: presetId,
      data: doc as unknown as Record<string, unknown>,
      slug: slug.trim() || undefined,
      accessKey: !is4nDomain(effectiveDomain) ? accessKey.trim() || undefined : undefined,
    })
      .then((r) => {
        if (r.ok) navigate(`/preview/${r.siteId}`);
      })
      .catch((e: Error) => setFormError(e.message))
      .finally(() => setSubmitting(false));
  };

  if (loading) return <p className="text-sm text-tg-hint">{t('loading')}</p>;

  if (loadError) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-400">{loadError}</p>
        <Link to="/" className="btn-secondary inline-block text-center">
          {t('home')}
        </Link>
      </div>
    );
  }

  const header = (
    <div className="space-y-4">
      <div>
        <h1 className="text-[1.35rem] font-semibold tracking-tight text-tg-text">{t('createSiteTitle')}</h1>
        <p className="mt-1 text-sm text-tg-hint">{t('step2Hint')}</p>
      </div>

      {verifiedDomains.length === 0 && !isForSale ? (
        <div className="card-app space-y-3">
          <p className="text-sm text-tg-hint">{t('noVerifiedDomains')}</p>
          <Link to="/domains" className="btn-primary inline-block text-center">
            {t('goToDomains')}
          </Link>
        </div>
      ) : (
        <div className="card-app space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-tg-hint">{t('domains')}</span>
            {isForSale ? (
              <input
                type="text"
                value={saleDomain}
                onChange={(e) => setSaleDomain(e.target.value)}
                placeholder={t('domainExamplePlaceholder')}
                className="input-app"
              />
            ) : (
              <select value={domainId} onChange={(e) => setDomainId(e.target.value)} className="input-app">
                <option value="">{t('selectDomain')}</option>
                {verifiedDomains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.domain}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-tg-hint">{t('previewUrlSlug')}</span>
            <input
              type="text"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase().slice(0, 64))
              }
              placeholder={t('slugPlaceholder')}
              className="input-app"
            />
            <span className="mt-1 block text-[11px] text-tg-hint/70">
              {publicBase}/{slug || t('slugPlaceholder')}
            </span>
          </label>

          {effectiveDomain && !is4nDomain(effectiveDomain) && (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-tg-hint">{t('accessKeyLabel')}</span>
              <input
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder={t('accessKeyPlaceholder')}
                className="input-app"
              />
            </label>
          )}
        </div>
      )}
    </div>
  );

  return (
    <SiteBuilder
      initialDoc={initialDoc}
      presetId={presetId}
      onPresetChange={setPresetId}
      header={header}
      docTransform={applyDomain}
      footer={(doc) => (
        <div className="space-y-3 pt-1">
          {formError && <p className="text-sm text-red-400">{formError}</p>}
          <button
            type="button"
            onClick={() => submit(doc)}
            disabled={submitting || (verifiedDomains.length === 0 && !isForSale)}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? t('creating') : t('createAndPreview')}
          </button>
        </div>
      )}
    />
  );
}
