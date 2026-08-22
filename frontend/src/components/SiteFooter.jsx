import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BrandLogo from './BrandLogo';
import PrivacyPolicyModal from './PrivacyPolicyModal';

function SiteFooter() {
  const { t } = useTranslation();
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="relative z-[1] mx-auto mt-14 w-[min(1180px,100%)] border-t border-[var(--line)] pt-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <BrandLogo size="sm" />
            <p className="m-0 text-xs font-bold text-[var(--muted)]">{t('footer.tagline')}</p>
          </div>
          <button
            type="button"
            className="accent-link text-sm font-black underline-offset-4 transition hover:underline"
            onClick={() => setIsPrivacyOpen(true)}
          >
            {t('footer.privacy')}
          </button>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">
          {t('footer.copyright')}
        </p>
      </footer>

      {isPrivacyOpen ? <PrivacyPolicyModal onClose={() => setIsPrivacyOpen(false)} /> : null}
    </>
  );
}

export default SiteFooter;
