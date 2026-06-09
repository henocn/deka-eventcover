# TODO - Plateforme media evenementielle

Objectif : construire une plateforme interne simple, elegante et maintenable pour gerer des evenements, albums, photos et documents, avec un parcours participant mobile-first accessible par QR code.

## 0. Cadrage

- [x] Lire et analyser `PROMPT.md`
- [x] Identifier les priorites produit : participant mobile-first, back-office interne, media par evenement/album
- [x] Definir une feuille de route progressive et cochable
- [x] Valider les choix techniques exacts apres audit du code existant

## 1. Audit du projet existant

- [x] Verifier la structure reelle des dossiers `backend`, `frontend` et `backoffice`
- [x] Identifier les dependances deja installees
- [x] Verifier les scripts disponibles (`dev`, `start`, `build`, `lint`)
- [x] Reperer les fichiers manquants ou incoherents par rapport au prompt
- [x] Noter les conventions existantes pour eviter une reorganisation inutile

## 2. Architecture cible

- [x] Definir une architecture backend simple et maintenable
- [x] Choisir une organisation claire : routes, controllers, services, models, middlewares
- [x] Definir la structure PostgreSQL : users, events, albums, media, stats
- [x] Prevoir l'organisation des fichiers uploades par evenement et album
- [x] Definir les variables d'environnement necessaires
- [x] Documenter les endpoints API principaux

## 3. Backend Node.js / Express

- [x] Configurer Express proprement
- [x] Configurer Nodemon pour le developpement
- [x] Ajouter la connexion PostgreSQL
- [x] Ajouter la gestion centralisee des erreurs
- [x] Ajouter la validation des donnees entrantes
- [x] Ajouter les routes publiques participant
- [x] Ajouter les routes internes back-office
- [x] Ajouter l'upload de fichiers images et documents
- [x] Servir les medias stockes sur le VPS
- [x] Ajouter les statistiques basiques
- [x] Ajouter une base pour les notifications temps reel

## 4. Modele de donnees

- [x] Creer la table des utilisateurs internes
- [x] Creer la table des evenements
- [x] Creer la table des albums
- [x] Creer la table des medias
- [x] Creer la table des consultations ou telechargements
- [x] Ajouter les relations evenement -> albums -> medias
- [x] Ajouter les champs de publication et visibilite
- [x] Ajouter un champ optionnel de code d'acces evenement
- [x] Prevoir les migrations ou scripts SQL initiaux

## 5. Experience participant

Priorite design : interface simple, premium, mobile-first, rapide a comprendre en moins de 5 secondes.

- [x] Definir une direction visuelle sobre et institutionnelle
- [x] Construire une page evenement claire apres scan QR code
- [x] Afficher le titre, la date et une courte description de l'evenement
- [x] Presenter les albums avec couvertures elegantes
- [x] Eviter les gros blocs marketing inutiles
- [x] Garder une navigation directe vers les medias
- [x] Construire une galerie photo fluide en scroll
- [x] Optimiser l'affichage mobile des grilles d'images
- [x] Ajouter un mode plein ecran pour les photos
- [x] Ajouter la navigation swipe gauche/droite
- [x] Ajouter les boutons de telechargement
- [x] Differencier clairement images et documents
- [x] Ajouter les etats vides avec un ton simple et professionnel
- [x] Ajouter les etats de chargement sans bloquer l'experience
- [x] Ajouter une protection par code d'acces si l'evenement est ferme
- [x] Verifier le rendu sur mobile, tablette et desktop

## 6. Design participant - niveau de finition attendu

- [x] Utiliser une mise en page aeree mais dense en information utile
- [x] Limiter la palette a des couleurs sobres, lisibles et professionnelles
- [x] Utiliser une typographie nette avec une bonne hierarchie
- [x] Garder les cartes d'album compactes et elegantes
- [x] Eviter les effets decoratifs lourds
- [x] Garantir un contraste suffisant
- [x] Eviter tout chevauchement de texte sur mobile
- [x] Rendre les boutons et icones faciles a toucher
- [x] Ajouter des micro-interactions discretes
- [x] Optimiser les images avec tailles stables et chargement progressif
- [ ] Tester que le design reste elegant avec peu ou beaucoup d'albums
- [ ] Tester que le design reste propre avec des titres longs

## 7. Frontend participant React

- [x] Nettoyer l'application Vite/React initiale
- [x] Mettre en place le routing public
- [x] Creer la page publique d'evenement
- [x] Creer la vue albums
- [x] Creer la vue galerie
- [x] Creer le viewer plein ecran
- [x] Creer le composant document telechargeable
- [x] Ajouter la logique de fetch API
- [x] Ajouter la gestion des erreurs reseau
- [x] Ajouter le support du code d'acces optionnel
- [x] Preparer la reception des notifications temps reel

## 8. Back-office interne

- [x] Mettre en place une application admin separee
- [x] Ajouter une authentification admin / super admin
- [x] Creer la liste des evenements
- [x] Creer le formulaire de creation/modification d'evenement
- [ ] Creer la gestion des albums
- [ ] Creer l'upload de medias
- [ ] Ajouter l'edition des titres, descriptions et couvertures
- [x] Ajouter la generation de QR code par evenement
- [x] Afficher automatiquement le QR code sur la page detail evenement
- [x] Ajouter des badges QR par role avec acces limite a certains albums
- [x] Ajouter la copie du lien public
- [x] Ajouter les statistiques basiques
- [ ] Ajouter la gestion simple des utilisateurs internes

## 9. Upload et stockage des medias

- [x] Accepter les images courantes
- [x] Accepter les documents PDF, PPTX et DOCX
- [x] Refuser les types de fichiers non supportes
- [x] Organiser les fichiers par evenement et album
- [x] Generer des noms de fichiers robustes
- [x] Stocker les metadonnees en base
- [ ] Prevoir les miniatures ou apercus images
- [x] Prevoir les limites de taille de fichier
- [ ] Ajouter une strategie de sauvegarde simple pour VPS

## 10. Temps reel

- [x] Choisir l'approche temps reel adaptee au projet
- [x] Notifier l'ajout de nouveaux medias
- [x] Notifier la mise a jour d'un album
- [ ] Garder une degradation propre si le temps reel est indisponible

## 11. Reconnaissance faciale optionnelle

- [ ] Garder cette fonctionnalite hors MVP
- [ ] Prevoir une structure extensible pour l'ajouter plus tard
- [ ] Evaluer une librairie JavaScript legere
- [ ] Definir le parcours selfie -> recherche de photos
- [ ] Anticiper les questions de confidentialite et conservation des donnees

## 12. Qualite, tests et verification

- [ ] Ajouter un lint coherent sur les applications
- [ ] Tester les routes API critiques
- [ ] Tester le parcours participant complet
- [ ] Tester l'upload de chaque type de fichier supporte
- [ ] Tester les evenements publics et proteges par code
- [x] Tester le rendu responsive
- [ ] Tester la generation de QR code
- [ ] Verifier les performances de chargement galerie
- [ ] Documenter les commandes de lancement

## 13. Deploiement VPS

- [ ] Definir les ports et variables d'environnement
- [ ] Prevoir le build frontend
- [ ] Prevoir le build back-office
- [ ] Prevoir le lancement backend en production
- [ ] Prevoir la configuration PostgreSQL
- [ ] Prevoir le dossier persistant des uploads
- [ ] Documenter une procedure de deploiement simple
- [ ] Documenter une procedure de sauvegarde

## 14. Definition de fini du MVP

- [ ] Un admin peut creer un evenement
- [ ] Un admin peut creer des albums
- [ ] Un admin peut uploader photos et documents
- [ ] Un admin peut generer/copier un QR code evenement
- [x] Un admin peut generer/copier des QR codes par badge d'acces album
- [ ] Un participant peut ouvrir un evenement via lien public
- [ ] Un participant peut consulter les albums
- [ ] Un participant peut ouvrir une galerie photo fluide
- [ ] Un participant peut voir les photos en plein ecran
- [ ] Un participant peut telecharger les medias
- [ ] L'application fonctionne correctement sur mobile
- [ ] Le projet est documente et deployable sur VPS
