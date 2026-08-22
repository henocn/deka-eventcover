import { Camera, Images, ScanLine } from 'lucide-react';
import BrandLogo from './BrandLogo';
import ThemeToggle from './ThemeToggle';

function EventHero({ event, theme, onThemeToggle, onMyPhotos }) {
  return (
    <header className="mx-auto w-[min(1180px,100%)] pb-8 pt-1">
      <div className="mb-10 flex items-center justify-between gap-5 max-[680px]:items-start max-[680px]:gap-4">
        <BrandLogo />
        <div className="flex flex-wrap justify-end gap-2.5">
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[var(--gold)] bg-[color-mix(in_srgb,var(--accent)_88%,transparent)] px-4 font-black text-[var(--accent-ink)] shadow-[0_8px_24px_rgba(232,184,74,0.22)] backdrop-blur transition hover:-translate-y-0.5 hover:brightness-105"
            onClick={onMyPhotos}
          >
            <Camera size={17} />
            <span>Mes photos</span>
          </button>
        </div>
      </div>

      <div className="hero-gallery-title-wrap">
        <h2 className="hero-gallery-title" aria-label="Galerie photo en temps reel">
          Galerie photo en{' '}
          <span className="hero-gallery-title__live">
            <span className="hero-gallery-title__live-dot" aria-hidden="true" />
            temps reel
          </span>
        </h2>
      </div>

      <div className="grid mt-2 grid-cols-[minmax(0,1fr)_300px] items-center gap-[clamp(24px,4vw,56px)] max-[900px]:grid-cols-1">
        <div className="animate-fade-up">
          <h1 className="m-0 max-w-[780px] text-[clamp(2.2rem,5.8vw,5.4rem)] font-black leading-[0.93] tracking-normal text-[var(--text)]">
            {event?.title}
          </h1>
          <p className="mt-5 max-w-[700px] text-[clamp(1.12rem,2.15vw,1.42rem)] font-semibold leading-relaxed text-[var(--text)]">
            {event?.description}
          </p>

          <div className="mt-7 max-w-[620px] border-l-2 border-[rgba(255,215,64,0.35)] pl-4 text-[var(--muted)]">
            <p className="m-0 text-[11px] font-black uppercase tracking-[0.1em] text-[var(--gold-text)]">Comment ca marche</p>
            <ul className="mt-2.5 space-y-2 text-[13px] leading-snug">
              <li className="flex items-start gap-2">
                <ScanLine size={15} className="mt-0.5 shrink-0 text-[var(--icon-accent)]" />
                <span>Scannez le QR de votre badge ou entrez votre code d&apos;acces.</span>
              </li>
              <li className="flex items-start gap-2">
                <Images size={15} className="mt-0.5 shrink-0 text-[var(--icon-accent)]" />
                <span>Parcourez les albums mis a jour en direct pendant l&apos;evenement.</span>
              </li>
              <li className="flex items-start gap-2">
                <Camera size={15} className="mt-0.5 shrink-0 text-[var(--icon-accent)]" />
                <span>Utilisez « Mes photos » avec un selfie pour retrouver vos clichés.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex min-h-[320px] items-center justify-center animate-fade-up max-[900px]:min-h-56 max-[900px]:py-4" aria-hidden="true">
          <img
            className="h-[min(340px,72vw)] w-[min(340px,72vw)] max-[900px]:h-[min(260px,62vw)] max-[900px]:w-[min(260px,62vw)] object-contain drop-shadow-[0_20px_48px_rgba(0,0,0,0.32)]"
            src="/ppp-watermark.png"
            alt="Logo PPP Togo"
          />
        </div>
      </div>
    </header>
  );
}

export default EventHero;
