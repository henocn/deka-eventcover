# TODO - Plateforme media evenementielle

Objectif : construire une plateforme interne simple, elegante et maintenable pour gerer des evenements, albums, photos et documents, avec un parcours participant mobile-first accessible par QR code.

## 0. Cadrage

- [x] Lire et analyser `PROMPT.md`
- [x] Identifier les priorites produit : participant mobile-first, back-office interne, media par evenement/album
- [x] Definir une feuille de route progressive et cochable
- [ ] Valider les choix techniques exacts apres audit du code existant

## 1. Audit du projet existant

- [ ] Verifier la structure reelle des dossiers `backend`, `frontend` et `backoffice`
- [ ] Identifier les dependances deja installees
- [ ] Verifier les scripts disponibles (`dev`, `start`, `build`, `lint`)
- [ ] Reperer les fichiers manquants ou incoherents par rapport au prompt
- [ ] Noter les conventions existantes pour eviter une reorganisation inutile

## 2. Architecture cible

- [ ] Definir une architecture backend simple et maintenable
- [ ] Choisir une organisation claire : routes, controllers, services, models, middlewares
- [ ] Definir la structure PostgreSQL : users, events, albums, media, stats
- [ ] Prevoir l'organisation des fichiers uploades par evenement et album
- [ ] Definir les variables d'environnement necessaires
- [ ] Documenter les endpoints API principaux

## 3. Backend Node.js / Express

- [ ] Configurer Express proprement
- [ ] Configurer Nodemon pour le developpement
- [ ] Ajouter la connexion PostgreSQL
- [ ] Ajouter la gestion centralisee des erreurs
- [ ] Ajouter la validation des donnees entrantes
- [ ] Ajouter les routes publiques participant
- [ ] Ajouter les routes internes back-office
- [ ] Ajouter l'upload de fichiers images et documents
- [ ] Servir les medias stockes sur le VPS
- [ ] Ajouter les statistiques basiques
- [ ] Ajouter une base pour les notifications temps reel

## 4. Modele de donnees

- [ ] Creer la table des utilisateurs internes
- [ ] Creer la table des evenements
- [ ] Creer la table des albums
- [ ] Creer la table des medias
- [ ] Creer la table des consultations ou telechargements
- [ ] Ajouter les relations evenement -> albums -> medias
- [ ] Ajouter les champs de publication et visibilite
- [ ] Ajouter un champ optionnel de code d'acces evenement
- [ ] Prevoir les migrations ou scripts SQL initiaux

## 5. Experience participant

Priorite design : interface simple, premium, mobile-first, rapide a comprendre en moins de 5 secondes.

- [ ] Definir une direction visuelle sobre et institutionnelle
- [ ] Construire une page evenement claire apres scan QR code
- [ ] Afficher le titre, la date et une courte description de l'evenement
- [ ] Presenter les albums avec couvertures elegantes
- [ ] Eviter les gros blocs marketing inutiles
- [ ] Garder une navigation directe vers les medias
- [ ] Construire une galerie photo fluide en scroll
- [ ] Optimiser l'affichage mobile des grilles d'images
- [ ] Ajouter un mode plein ecran pour les photos
- [ ] Ajouter la navigation swipe gauche/droite
- [ ] Ajouter les boutons de telechargement
- [ ] Differencier clairement images et documents
- [ ] Ajouter les etats vides avec un ton simple et professionnel
- [ ] Ajouter les etats de chargement sans bloquer l'experience
- [ ] Ajouter une protection par code d'acces si l'evenement est ferme
- [ ] Verifier le rendu sur mobile, tablette et desktop

## 6. Design participant - niveau de finition attendu

- [ ] Utiliser une mise en page aeree mais dense en information utile
- [ ] Limiter la palette a des couleurs sobres, lisibles et professionnelles
- [ ] Utiliser une typographie nette avec une bonne hierarchie
- [ ] Garder les cartes d'album compactes et elegantes
- [ ] Eviter les effets decoratifs lourds
- [ ] Garantir un contraste suffisant
- [ ] Eviter tout chevauchement de texte sur mobile
- [ ] Rendre les boutons et icones faciles a toucher
- [ ] Ajouter des micro-interactions discretes
- [ ] Optimiser les images avec tailles stables et chargement progressif
- [ ] Tester que le design reste elegant avec peu ou beaucoup d'albums
- [ ] Tester que le design reste propre avec des titres longs

## 7. Frontend participant React

- [ ] Nettoyer l'application Vite/React initiale
- [ ] Mettre en place le routing public
- [ ] Creer la page publique d'evenement
- [ ] Creer la vue albums
- [ ] Creer la vue galerie
- [ ] Creer le viewer plein ecran
- [ ] Creer le composant document telechargeable
- [ ] Ajouter la logique de fetch API
- [ ] Ajouter la gestion des erreurs reseau
- [ ] Ajouter le support du code d'acces optionnel
- [ ] Preparer la reception des notifications temps reel

## 8. Back-office interne

- [ ] Mettre en place une application admin separee
- [ ] Ajouter une authentification admin / super admin
- [ ] Creer la liste des evenements
- [ ] Creer le formulaire de creation/modification d'evenement
- [ ] Creer la gestion des albums
- [ ] Creer l'upload de medias
- [ ] Ajouter l'edition des titres, descriptions et couvertures
- [ ] Ajouter la generation de QR code par evenement
- [ ] Ajouter la copie du lien public
- [ ] Ajouter les statistiques basiques
- [ ] Ajouter la gestion simple des utilisateurs internes

## 9. Upload et stockage des medias

- [ ] Accepter les images courantes
- [ ] Accepter les documents PDF, PPTX et DOCX
- [ ] Refuser les types de fichiers non supportes
- [ ] Organiser les fichiers par evenement et album
- [ ] Generer des noms de fichiers robustes
- [ ] Stocker les metadonnees en base
- [ ] Prevoir les miniatures ou apercus images
- [ ] Prevoir les limites de taille de fichier
- [ ] Ajouter une strategie de sauvegarde simple pour VPS

## 10. Temps reel

- [ ] Choisir l'approche temps reel adaptee au projet
- [ ] Notifier l'ajout de nouveaux medias
- [ ] Notifier la mise a jour d'un album
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
- [ ] Tester le rendu responsive
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
- [ ] Un participant peut ouvrir un evenement via lien public
- [ ] Un participant peut consulter les albums
- [ ] Un participant peut ouvrir une galerie photo fluide
- [ ] Un participant peut voir les photos en plein ecran
- [ ] Un participant peut telecharger les medias
- [ ] L'application fonctionne correctement sur mobile
- [ ] Le projet est documente et deployable sur VPS
