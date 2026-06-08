function demoImage(label, background, accent) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${background}"/>
          <stop offset="1" stop-color="${accent}"/>
        </linearGradient>
        <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#182018" flood-opacity="0.20"/>
        </filter>
      </defs>
      <rect width="1200" height="800" fill="url(#g)"/>
      <circle cx="1040" cy="120" r="190" fill="#ffffff" opacity="0.16"/>
      <circle cx="160" cy="690" r="260" fill="#101813" opacity="0.14"/>
      <rect x="120" y="150" width="960" height="500" rx="28" fill="#ffffff" opacity="0.18" filter="url(#s)"/>
      <rect x="170" y="210" width="360" height="260" rx="18" fill="#ffffff" opacity="0.30"/>
      <rect x="570" y="210" width="460" height="42" rx="21" fill="#ffffff" opacity="0.42"/>
      <rect x="570" y="284" width="330" height="34" rx="17" fill="#ffffff" opacity="0.28"/>
      <rect x="570" y="344" width="390" height="34" rx="17" fill="#ffffff" opacity="0.24"/>
      <text x="170" y="575" fill="#ffffff" font-family="Arial, sans-serif" font-size="42" font-weight="700">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const demoImageUrls = [
  demoImage('Ouverture officielle', '#6f806f', '#d7ded4'),
  demoImage('Panel institutionnel', '#4f665d', '#d9dfd2'),
  demoImage('Vue de la salle', '#7c7e6f', '#ece7d9'),
  demoImage('Espace presse', '#5a6570', '#d9e1e4'),
];

export const demoEvent = {
  id: 'demo',
  title: 'Conference institutionnelle',
  slug: 'conference-institutionnelle',
  description:
    'Selection officielle des photos et documents partages avec les participants.',
  location: 'Auditorium principal',
  startsAt: new Date().toISOString(),
  isProtected: false,
  albums: [
    {
      id: 'album-1',
      title: 'Temps forts',
      slug: 'temps-forts',
      description: 'Moments cles de la ceremonie et prises de parole officielles.',
      coverUrl: demoImageUrls[0],
      mediaCount: 8,
    },
    {
      id: 'album-2',
      title: 'Coulisses presse',
      slug: 'coulisses-presse',
      description: 'Rencontres medias, preparation et espaces partenaires.',
      coverUrl: demoImageUrls[1],
      mediaCount: 6,
    },
    {
      id: 'album-3',
      title: 'Documents',
      slug: 'documents',
      description: 'Communiques, programme officiel et dossier de presentation.',
      coverUrl: demoImageUrls[3],
      mediaCount: 3,
    },
  ],
};

export const demoAlbums = {
  'temps-forts': {
    id: 'album-1',
    title: 'Temps forts',
    slug: 'temps-forts',
    description: 'Moments cles de la ceremonie et prises de parole officielles.',
    media: [
      {
        id: 'demo-1',
        type: 'image',
        originalName: 'Ouverture officielle',
        publicUrl: demoImageUrls[0],
      },
      {
        id: 'demo-2',
        type: 'image',
        originalName: 'Panel institutionnel',
        publicUrl: demoImageUrls[1],
      },
      {
        id: 'demo-3',
        type: 'image',
        originalName: 'Vue de la salle',
        publicUrl: demoImageUrls[2],
      },
      {
        id: 'demo-4',
        type: 'document',
        mimeType: 'application/pdf',
        originalName: 'Programme officiel.pdf',
        publicUrl: '#',
        downloadUrl: '#',
      },
    ],
  },
  'coulisses-presse': {
    id: 'album-2',
    title: 'Coulisses presse',
    slug: 'coulisses-presse',
    description: 'Rencontres medias, preparation et espaces partenaires.',
    media: [
      {
        id: 'demo-5',
        type: 'image',
        originalName: 'Briefing media',
        publicUrl: demoImageUrls[3],
      },
      {
        id: 'demo-6',
        type: 'image',
        originalName: 'Interview officielle',
        publicUrl: demoImageUrls[1],
      },
    ],
  },
  documents: {
    id: 'album-3',
    title: 'Documents',
    slug: 'documents',
    description: 'Communiques, programme officiel et dossier de presentation.',
    media: [
      {
        id: 'demo-7',
        type: 'document',
        mimeType: 'application/pdf',
        originalName: 'Communique de presse.pdf',
        publicUrl: '#',
        downloadUrl: '#',
      },
      {
        id: 'demo-8',
        type: 'document',
        mimeType:
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        originalName: 'Presentation officielle.pptx',
        publicUrl: '#',
        downloadUrl: '#',
      },
    ],
  },
};
