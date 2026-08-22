import { useLocalizedText } from '../hooks/useLocalizedText';

// Affiche un contenu dynamique traduit en anglais si necessaire.
function LocalizedText({ text, as: Tag = 'span', className }) {
  const localized = useLocalizedText(text);

  if (!text) return null;

  return <Tag className={className}>{localized}</Tag>;
}

export default LocalizedText;
