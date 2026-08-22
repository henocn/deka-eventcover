import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function PrivacyPolicyModal({ onClose }) {
  const { t } = useTranslation();

  return (
    <div className="participant-modal-overlay fixed inset-0 z-50 grid place-items-center p-4" onMouseDown={onClose}>
      <section
        className="participant-modal max-h-[92svh] w-[min(760px,100%)] overflow-y-auto rounded-2xl p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-[var(--gold-text)]">{t('privacy.eventLabel')}</p>
            <h2 className="m-0 text-2xl font-black text-[var(--text)]">{t('privacy.title')}</h2>
            <p className="mt-2 text-sm font-bold text-[var(--muted)]">{t('privacy.updated')}</p>
          </div>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-[var(--line-strong)] text-[var(--text)] transition hover:border-[var(--accent)]"
            onClick={onClose}
            title={t('common.close')}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 text-sm leading-relaxed text-[var(--muted)]">
          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">{t('privacy.sections.controller.title')}</h3>
            <p>{t('privacy.sections.controller.body')}</p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">{t('privacy.sections.data.title')}</h3>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-[var(--text)]">{t('privacy.sections.data.access')}</strong>{' '}
                {t('privacy.sections.data.accessBody')}
              </li>
              <li>
                <strong className="text-[var(--text)]">{t('privacy.sections.data.media')}</strong>{' '}
                {t('privacy.sections.data.mediaBody')}
              </li>
              <li>
                <strong className="text-[var(--text)]">{t('privacy.sections.data.search')}</strong>{' '}
                {t('privacy.sections.data.searchBody')}
              </li>
              <li>
                <strong className="text-[var(--text)]">{t('privacy.sections.data.faces')}</strong>{' '}
                {t('privacy.sections.data.facesBody')}
              </li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">{t('privacy.sections.purposes.title')}</h3>
            <p>{t('privacy.sections.purposes.body')}</p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">{t('privacy.sections.legal.title')}</h3>
            <p>{t('privacy.sections.legal.body')}</p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">{t('privacy.sections.retention.title')}</h3>
            <ul className="list-disc space-y-2 pl-5">
              <li>{t('privacy.sections.retention.selfie')}</li>
              <li>{t('privacy.sections.retention.session')}</li>
              <li>{t('privacy.sections.retention.embeddings')}</li>
              <li>{t('privacy.sections.retention.stats')}</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">{t('privacy.sections.recipients.title')}</h3>
            <p>{t('privacy.sections.recipients.body')}</p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">{t('privacy.sections.rights.title')}</h3>
            <p>{t('privacy.sections.rights.body')}</p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">{t('privacy.sections.security.title')}</h3>
            <p>{t('privacy.sections.security.body')}</p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-black text-[var(--text)]">{t('privacy.sections.camera.title')}</h3>
            <p>{t('privacy.sections.camera.body')}</p>
          </section>
        </div>
      </section>
    </div>
  );
}

export default PrivacyPolicyModal;
