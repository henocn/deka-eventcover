import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Met a jour le titre et la description HTML selon la langue.
function DocumentHead() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t('meta.title');
    document.documentElement.lang = i18n.language?.startsWith('en') ? 'en' : 'fr';

    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', t('meta.description'));

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', t('meta.title'));

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', t('meta.ogDescription'));

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', t('meta.title'));

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', t('meta.twitterDescription'));
  }, [i18n.language, t]);

  return null;
}

export default DocumentHead;
