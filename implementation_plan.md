# Plan de refonte et d'amélioration Ecom Booster Pro

Voici le plan détaillé des modifications à apporter, divisé en grandes étapes pour ne pas écraser le code existant et s'assurer que chaque fonctionnalité est validée avant de passer à la suite.

## Étape 1 : Nettoyage du Dashboard et Menu Global
- **Header/Menu** : Retirer la mention "principal" à côté de Dashboard.
- **Header/Menu** : Supprimer "Statut Shopify : connecté" et "Synchroniser Shopify" pour désencombrer l'interface.
- **Dashboard** : Alléger les informations affichées (supprimer "tunnel opérationnel" en bas, et revoir ce qui peut être enlevé pour éviter la surcharge visuelle).
- **Comptabilité** : Supprimer complètement cette section pour éviter les répétitions inutiles avec le Dashboard.

## Étape 2 : Analyse IA (Formulaire, Score et Disposition)
- **Formulaire** : Refonte totale pour le rendre esthétique, dynamique et moderne (fini le côté "fade").
- **Prix d'achat** : Modifier le champ pour qu'il s'incrémente par paliers de 500 (500, 1000, 1500, etc.).
- **Score et Prix** : Remanier l'interface pour que le Prix soit affiché en haut à côté du Score, afin de ne plus avoir à défiler tout en bas pour le voir. 
- **Arguments de vente** : Revoir la structure et la génération des arguments pour qu'ils soient plus convaincants.

## Étape 3 : Analyse IA (Avatar Client et Concurrents)
- **Avatar Client** : Refonte de la page et suppression des informations inutiles ("profil psychographique complet", "client idéal", "ciblage précis", "revenu", "profil").
- **Avatar Client** : On gardera uniquement : *Sexe, Tranche d'âge, Centres d'intérêt, Peurs, Frustrations, Désirs, et Phrase déclenchante*.
- **Analyse Concurrents** : Traduction automatique du nom du produit pour les pays anglophones, comme c'est le cas dans les autres sections.

## Étape 4 : Scripteur de Voix Off
- **Scripts** : Générer uniquement 2 scripts au lieu de plusieurs.
- **Structure** : S'assurer que chaque script suit la logique "Poser le problème, donner la solution".
- **Contenu** : Retirer la génération de noms propres/personnages dans les scripts.

## Étape 5 : Page Shopify et Textes Publicitaires (Ad Copy)
- **Page Shopify (Refonte)** : Améliorer le design et déplacer l'image générée en haut de page.
- **Page Shopify (Bug)** : Corriger le problème où l'importation d'images regénère et duplique la description (qui s'affiche 3 fois).
- **Textes Publicitaires** : Déplacer la section "Créatives/Textes publicitaires générés" juste en bas de la page Shopify, dans une section dédiée ("Ad copy" ou "Texte publicitaire Facebook").

## Étape 6 : Publicité Facebook (Meta Ads)
- **Bug de connexion** : Régler le problème "Facebook token manquant dans l'environnement local".
- **Refonte** : Reconstruire l'interface pour qu'elle ressemble davantage au Business Manager classique de Meta.
- **Onglets** : S'assurer que le reste (Statistiques et Lancement des pubs) soit bien structuré dans cette interface.

## Étape 7 : Commandes, Interface Closer & Livreur
- **Commandes** : Refonte esthétique de la page. Ajouter les champs manquants "Ville" et "Adresse".
- **Interface Closer** : Remplacer les statuts textuels (à confirmer, suivi, noté, confirmé, programmé, annulé) par une liste déroulante (select) et refonte de la page.
- **Interface Livreur** : Remplacer les statuts (à livrer, programmé, livré, annulé) par une liste déroulante.

## Étape 8 : Gestion d'Équipe
- **Commissions** : Permettre la modification et la sauvegarde des commissions (pour les livreurs et closers) afin de les utiliser dans les calculs.
- **Design** : Refonte de la page pour la rendre plus premium et moins basique.

## Étape 9 : Notifications, Sécurité et Persistance de Session
- **Notifications** : Rendre le système fonctionnel (ventes, confirmations, livraisons, paiements reçus).
- **Session** : Corriger le bug de déconnexion à la fermeture de l'onglet. Mettre en place une session persistante pour que vous restiez connecté et receviez les notifications sur mobile.
- **Sécurité** : Empêcher le chargement et la connexion aux boutiques si aucun compte administrateur n'est connecté. Cacher la vue des boutiques pour les visiteurs non authentifiés.

---

> [!NOTE]
> Nous procéderons étape par étape. Je vais d'abord attendre ta validation sur cet ordre, et on pourra commencer directement par l'**Étape 1**. Es-tu d'accord avec cette répartition ?
