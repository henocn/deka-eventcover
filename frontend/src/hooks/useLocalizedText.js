import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError, translateFrToEn } from '../utils/translateContent';

// Traduit dynamiquement un texte backend ou message API selon la langue active.
export function useLocalizedText(text) {
  const { i18n } = useTranslation();
  const [localized, setLocalized] = useState(text || '');
  const isEnglish = i18n.language?.startsWith('en');

  useEffect(() => {
    const source = text || '';
    if (!source || !isEnglish) {
      setLocalized(source);
      return undefined;
    }

    let cancelled = false;

    translateFrToEn(source).then((result) => {
      if (!cancelled) setLocalized(result);
    });

    return () => {
      cancelled = true;
    };
  }, [text, isEnglish]);

  return localized;
}

// Affiche un message utilisateur traduit (UI, API ou contenu backend).
export function useDisplayMessage(message) {
  const { t, i18n } = useTranslation();
  const mapped = useMemo(() => translateApiError(message, t), [message, t]);
  const shouldAutoTranslate = Boolean(
    message && i18n.language?.startsWith('en') && mapped === message,
  );
  const autoTranslated = useLocalizedText(shouldAutoTranslate ? message : null);

  if (!message) return '';
  if (!i18n.language?.startsWith('en')) return message;
  if (mapped !== message) return mapped;
  return autoTranslated || message;
}
