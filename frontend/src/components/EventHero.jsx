import { Camera, Images, ScanLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LocalizedText from './LocalizedText';
import ParticipantTopBar from './ParticipantTopBar';

function EventHero({ event, theme, onThemeToggle, onMyPhotos }) {
  const { t } = useTranslation();

  return (
    <header className="mx-auto w-[min(1180px,100%)] pb-8">
      <ParticipantTopBar theme={theme} onThemeToggle={onThemeToggle} onMyPhotos={onMyPhotos} />

      <div className="hero-gallery-title-wrap">
        <h2 className="hero-gallery-title" aria-label={`${t('hero.galleryLiveBefore')} ${t('hero.live')}`}>
          {t('hero.galleryLiveBefore')}{' '}
          <span className="hero-gallery-title__live">
            <span className="hero-gallery-title__live-dot" aria-hidden="true" />
            {t('hero.live')}
          </span>
        </h2>
      </div>

      <div className="grid mt-2 grid-cols-[minmax(0,1fr)_300px] items-center gap-[clamp(24px,4vw,56px)] max-[900px]:grid-cols-1">
        <div className="animate-fade-up">
          <h1 className="m-0 max-w-[780px] text-[clamp(2.2rem,5.8vw,5.4rem)] font-black leading-[0.93] tracking-normal text-[var(--text)]">
            <LocalizedText text={event?.title} />
          </h1>
          <p className="mt-5 max-w-[700px] text-[clamp(1.12rem,2.15vw,1.42rem)] font-semibold leading-relaxed text-[var(--text)]">
            <LocalizedText text={event?.description} />
          </p>

          <div className="mt-7 max-w-[620px] border-l-2 border-[rgba(255,215,64,0.35)] pl-4 text-[var(--muted)]">
            <p className="m-0 text-[11px] font-black uppercase tracking-[0.1em] text-[var(--gold-text)]">{t('hero.howItWorks')}</p>
            <ul className="mt-2.5 space-y-2 text-[13px] leading-snug">
              <li className="flex items-start gap-2">
                <ScanLine size={15} className="mt-0.5 shrink-0 text-[var(--icon-accent)]" />
                <span>{t('hero.stepQr')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Images size={15} className="mt-0.5 shrink-0 text-[var(--icon-accent)]" />
                <span>{t('hero.stepAlbums')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Camera size={15} className="mt-0.5 shrink-0 text-[var(--icon-accent)]" />
                <span>{t('hero.stepSelfie')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="hidden min-h-[320px] min-[901px]:flex items-center justify-center animate-fade-up" aria-hidden="true">
          <img
            className="h-[min(340px,72vw)] w-[min(340px,72vw)] object-contain drop-shadow-[0_20px_48px_rgba(0,0,0,0.32)]"
            src="/ppp-watermark.png"
            alt={t('hero.pppLogoAlt')}
          />
        </div>
      </div>
    </header>
  );
}

export default EventHero;
