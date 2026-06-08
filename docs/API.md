# API - Deka EventCover

Base locale prevue : `http://localhost:4000`

## Sante

- `GET /health`
  - Verifie que l'API repond.

## Participant public

- `GET /api/public/events/:slug`
  - Recupere un evenement public avec ses albums publies.
  - Si l'evenement est protege, le backend demandera un code d'acces.

- `POST /api/public/events/:slug/access`
  - Valide le code d'acces d'un evenement ferme.

- `GET /api/public/events/:slug/albums/:albumSlug`
  - Recupere un album avec ses medias publies.

- `GET /api/public/media/:mediaId/download`
  - Telecharge un media et enregistre une statistique de telechargement.

## Back-office interne

- Creation du premier admin :
  - Remplir `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_FULL_NAME` dans `backend/.env`.
  - Lancer `npm run admin:create` dans `backend` apres les migrations.

- `GET /api/admin/overview`
  - Endpoint de verification du back-office.
  - Requiert un token admin.

- `POST /api/admin/auth/login`
  - Authentifie un utilisateur interne.

- `GET /api/admin/events`
  - Liste les evenements.
  - Requiert un token admin.

- `POST /api/admin/events`
  - Cree un evenement.
  - Requiert un token admin.

- `PATCH /api/admin/events/:eventId`
  - Met a jour un evenement.
  - Requiert un token admin.

- `POST /api/admin/events/:eventId/albums`
  - Cree un album dans un evenement.
  - Requiert un token admin.

- `PATCH /api/admin/albums/:albumId`
  - Met a jour un album.
  - Requiert un token admin.

- `POST /api/admin/albums/:albumId/media`
  - Upload des images ou documents dans un album.

- `GET /api/admin/events/:eventId/qrcode`
  - Genere le QR code du lien public.
  - Requiert un token admin.

- `GET /api/admin/events/:eventId/stats`
  - Retourne les statistiques basiques.

## Temps reel

- Room Socket.IO : `event:{eventSlug}`
- Evenement prevu : `media:created`
- Evenement prevu : `album:updated`
