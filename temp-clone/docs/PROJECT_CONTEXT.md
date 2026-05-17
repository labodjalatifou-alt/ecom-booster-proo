# Ecom Booster – PRO Edition | Documentation de Référence

Ce document sert de guide de contexte pour tout assistant IA ou développeur reprenant le projet. Il récapitule l'architecture, les choix techniques et l'état d'avancement du SaaS.

## 1. Objectif du Projet
**Ecom Booster** est une plateforme SaaS "all-in-one" pour les vendeurs e-commerce (spécifiquement en Afrique de l'Ouest et Centrale). Elle automatise l'analyse de produits, la génération de contenu marketing par IA, et gère tout le flux opérationnel (Commandes, Closers, Livreurs, Stocks).

## 2. Stack Technique
- **Framework** : Next.js (App Router)
- **Styling** : Tailwind CSS (Design System "Compact Premium")
- **Base de Données** : Supabase (PostgreSQL) avec Prisma comme ORM
- **Authentification** : Supabase Auth
- **Icônes** : Lucide React
- **Notifications** : React Hot Toast
- **IA** : Intégration via des API pour la génération de texte et d'analyses.

## 3. Architecture du Projet
- `/app` : Pages de l'application et routes API.
  - `/api/sync-shopify` : Synchronise les commandes depuis Shopify.
  - `/api/sync-products` : Synchronise le catalogue produits.
  - `/api/create-product` : Crée un produit sur Shopify après analyse.
- `/components` : Composants UI réutilisables et widgets du dashboard.
- `/lib` : Configuration Supabase et hooks personnalisés.
- `/prisma` : Schéma de la base de données.

## 4. État Actuel des Modules (Mai 2024)
Le projet a été entièrement nettoyé de ses données fictives ("dummy data").

### IA & E-Commerce
- **Analyse IA** : Formulaire strict (3 images max, prix d'achat, description). Les résultats alimentent directement les autres pages.
- **Score et Prix** : Calculateur de rentabilité (Prix d'achat + 8k min / 15k max).
- **Page Shopify** : Générateur de fiches produits prêtes à l'export.
- **Ads & Scripts** : Générateurs de publicités Facebook et scripts voix off basés sur l'analyse IA.

### Opérations & CRM
- **Commandes** : Système de pagination (50/page) avec filtrage par statut.
- **Interface Closer** : Outil de confirmation des commandes avec historique des appels et notes.
- **Interface Livreur** : Gestion par onglets (À livrer, Livrées, Annulées) avec calcul du cash en temps réel.
- **CRM Clients** : Segmentation automatique (VIP, Régulier, Nouveau) basée sur l'historique réel des achats.
- **Stock** : Inventaire synchronisé en temps réel avec Shopify.

### Finance
- **Comptabilité** : Dashboard financier gérant les devises (FCFA/GNF) selon la localisation et suivant le cash en transit.

## 5. Logique Métier Critique
- **Géographie** : Les commandes sont traitées par ville. Le système détecte automatiquement la devise (GNF pour la Guinée, FCFA pour les autres pays).
- **Nettoyage des données** : Les noms de villes et provinces sont nettoyés lors de la synchronisation pour éviter les doublons (ex: "Dakar, Dakar" devient "Dakar").
- **Statuts** : Mapping strict entre les statuts Shopify et les statuts internes (A Confirmer -> Confirmé -> Livré/Annulé).

## 6. Prochaines Étapes
1. **Déploiement final** : Vérifier le build de production (`npm run build`).
2. **Webhooks** : Finaliser l'écoute en temps réel des changements Shopify via `/api/shopify-webhook`.
3. **Optimisation IA** : Affiner les prompts pour des analyses encore plus précises selon les marchés locaux.

---
*Dernière mise à jour : 09 Mai 2024*
