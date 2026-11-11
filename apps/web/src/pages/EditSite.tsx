import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { SiteDocument } from '@ton-site-builder/templates/editor';
import { getSite, updateSite } from '../api';
import SiteBuilder from '../builder/SiteBuilder';
import { useLang } from '../context/LangContext';

export default function EditSite() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const { t } = useLang();
  const id = siteId ? parseInt(siteId, 10) : 0;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [doc, setDoc] = useState<SiteDocument | null>(null);
  const [presetId, setPresetId] = useState<string>('');
  const [slug, setSlug] = useState('');
  const [domainName, setDomainName] = useState('');
  /** True when the loaded row predates the block model. */
  const [wasLegacy, setWasLegacy] = useState(false);

  useEffect(() => {
    if (!id || !Number.isInteger(id) || id <= 0) {
      setError(t('invalidSiteId'));
      setLoading(false);
      return;
    }
    getSite(id)
      .then((r) => {
        if (!r.ok || !r.site) {
          setError(t('siteNotFound'));
          return;
        }
        const s = r.site;
        if (s.status !== 'draft') {
          setError(t('onlyDraftsEditable'));
          return;
        }
        if (!s.doc) {
          setError(t('siteNotFound'));
          return;
        }
        setDoc(s.doc);
        setPresetId(s.template);
        setSlug(s.slug || '');
        setDomainName(s.domainName || '');

        const parsed = JSON.parse(s.data_json) as { version?: number };
        setWasLegacy(parsed.version !== 2);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, t]);

  const submit = (next: SiteDocument) => {
    setError(null);
    setSubmitting(true);
    updateSite(id, {
      template: presetId,
      data: next as unknown as Record<string, unknown>,
      slug: slug.trim() || null,
    })
      .then(() => navigate(`/preview/${id}`))
      .catch((e: Error) => setError(e.message))
      .finally(() => setSubmitting(false));
  };

  if (loading) return <p className="text-sm text-tg-hint">{t('loading')}</p>;

  if (error && !doc) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-400">{error}</p>
        <button type="button" onClick={() => navigate('/sites')} className="btn-secondary">
          {t('backToMySites')}
        </button>
      </div>
    );
  }

  if (!doc) return null;

  const header = (
    <div className="space-y-4">
      <div>
        <h1 className="text-[1.35rem] font-semibold tracking-tight text-tg-text">{t('editSite')}</h1>
        {domainName && <p className="mt-1 text-sm text-tg-hint">{domainName}</p>}
      </div>

      {wasLegacy && (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-3">
          <p className="text-xs leading-relaxed text-amber-200/90">{t('legacyConverted')}</p>
        </div>
      )}

      <div className="card-app">
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
        </label>
      </div>
    </div>
  );

  return (
    <SiteBuilder
      // The draft seeds from initialDoc on mount only, so key by id to get a
      // fresh builder when navigating between sites.
      key={id}
      initialDoc={doc}
      presetId={presetId}
      onPresetChange={setPresetId}
      header={header}
      // Swapping preset would discard existing content.
      showGallery={false}
      footer={(next) => (
        <div className="space-y-3 pt-1">
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="button"
            onClick={() => submit(next)}
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? t('saving') : t('saveChanges')}
          </button>
        </div>
      )}
    />
  );
}
