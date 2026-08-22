import { useDisplayMessage } from '../hooks/useLocalizedText';

// Affiche un message d'erreur traduit selon la langue active.
function DisplayMessage({ message, className, as: Tag = 'span' }) {
  const display = useDisplayMessage(message);

  if (!message) return null;

  return <Tag className={className}>{display}</Tag>;
}

export default DisplayMessage;
