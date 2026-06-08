const emptyEventForm = {
  title: '',
  description: '',
  location: '',
  startsAt: '',
  endsAt: '',
  accessCode: '',
  isPublished: true,
};

const eventFilters = [
  { id: 'all', label: 'Tout' },
  { id: 'published', label: 'Publie' },
  { id: 'draft', label: 'Brouillon' },
  { id: 'protected', label: 'Protege' },
];

function formatDate(value) {
  if (!value) return 'Non planifie';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function toDatetimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function fromDatetimeLocal(value) {
  return value ? new Date(value).toISOString() : null;
}

function formFromEvent(event) {
  if (!event) return emptyEventForm;

  return {
    title: event.title || '',
    description: event.description || '',
    location: event.location || '',
    startsAt: toDatetimeLocal(event.startsAt),
    endsAt: toDatetimeLocal(event.endsAt),
    accessCode: event.accessCode || '',
    isPublished: Boolean(event.isPublished),
  };
}

function buildEventPayload(form) {
  return {
    title: form.title,
    description: form.description || null,
    location: form.location || null,
    startsAt: fromDatetimeLocal(form.startsAt),
    endsAt: fromDatetimeLocal(form.endsAt),
    accessCode: form.accessCode || null,
    isPublished: form.isPublished,
  };
}

function getEventStatus(event) {
  if (!event.isPublished) return 'draft';
  if (event.accessCode) return 'protected';
  return 'published';
}

function getStatusLabel(status) {
  return {
    draft: 'Brouillon',
    protected: 'Protege',
    published: 'Publie',
  }[status];
}

function getInitials(name) {
  return (name || 'AD')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export {
  buildEventPayload,
  emptyEventForm,
  eventFilters,
  formatDate,
  formFromEvent,
  getEventStatus,
  getInitials,
  getStatusLabel,
};
