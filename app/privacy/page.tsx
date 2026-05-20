import React from 'react';
import { Shield, Lock, Eye, Database, Server, UserCheck, Mail } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | Ecom Booster Pro',
  description: 'Politique de confidentialité et protection des données de Ecom Booster Pro',
};

export default function PrivacyPolicyPage() {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-6">
          <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
          Politique de Confidentialité
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
          Dernière mise à jour : {currentDate}
        </p>
      </div>

      <div className="space-y-12 text-slate-700 dark:text-slate-300">
        
        {/* Introduction */}
        <section className="prose dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed">
            Chez <strong>Ecom Booster Pro</strong>, la protection de vos données personnelles est notre priorité absolue. 
            Cette politique de confidentialité vous explique de manière transparente quelles données nous collectons, 
            comment nous les utilisons et comment nous les protégeons au quotidien.
          </p>
        </section>

        {/* 1. Quelles données on collecte */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <Database className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">1. Les données que nous collectons</h2>
          </div>
          <p className="mb-4">Dans le cadre de l'utilisation de notre application, nous sommes amenés à collecter :</p>
          <ul className="space-y-2 list-disc list-inside ml-2">
            <li><strong>Données d'identification :</strong> Votre nom, adresse email et coordonnées.</li>
            <li><strong>Données Shopify :</strong> Les informations relatives à votre boutique (produits, commandes, clients, inventaire).</li>
            <li><strong>Données de navigation :</strong> Vos préférences et données d'utilisation de l'application pour améliorer notre service.</li>
          </ul>
        </section>

        {/* 2. Comment on utilise ces données */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">2. Utilisation de vos données</h2>
          </div>
          <p className="mb-4">Vos données sont utilisées exclusivement pour vous fournir nos services et optimiser votre boutique :</p>
          <ul className="space-y-2 list-disc list-inside ml-2">
            <li>Synchronisation et gestion centralisée de vos commandes.</li>
            <li>Création et mise à jour de vos fiches produits via l'IA.</li>
            <li>Analyse de l'inventaire et prévisions de stocks.</li>
            <li>Génération de campagnes publicitaires (Facebook Ads) ciblées.</li>
          </ul>
        </section>

        {/* 3. Protection et 6. Stockage Shopify */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Server className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">3. Sécurité et Stockage des données</h2>
          </div>
          <p className="mb-4">Nous appliquons les standards de sécurité les plus stricts du marché :</p>
          <ul className="space-y-2 list-disc list-inside ml-2">
            <li><strong>Chiffrement de bout en bout :</strong> Toutes les communications sont sécurisées via HTTPS/TLS.</li>
            <li><strong>Stockage Supabase sécurisé :</strong> Les jetons d'accès (Access Tokens) Shopify sont stockés de manière chiffrée et ultra-sécurisée dans notre base de données Supabase, garantissant qu'aucun tiers n'y a accès.</li>
            <li><strong>Accès restreint :</strong> L'accès aux bases de données est strictement limité à l'infrastructure nécessaire au fonctionnement de l'app.</li>
          </ul>
        </section>

        {/* 7. Revente de données */}
        <section className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-3xl border border-amber-100 dark:border-amber-900/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-500">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">4. Revente de données (Tolérance Zéro)</h2>
          </div>
          <p className="font-medium text-amber-900 dark:text-amber-200">
            Nous avons une politique stricte concernant la commercialisation de vos informations. 
            <strong> Nous ne vendons, ne louons et ne cédons JAMAIS vos données personnelles ou celles de vos clients à des tiers.</strong>
          </p>
        </section>

        {/* 4. Droits des utilisateurs (RGPD) */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">5. Vos Droits (Conformité RGPD)</h2>
          </div>
          <p className="mb-4">Conformément aux réglementations sur la protection des données (notamment le RGPD), vous disposez des droits suivants :</p>
          <ul className="space-y-2 list-disc list-inside ml-2">
            <li><strong>Droit d'accès :</strong> Vous pouvez demander une copie de toutes les données que nous possédons sur vous.</li>
            <li><strong>Droit de rectification :</strong> Vous pouvez corriger vos données si elles sont inexactes.</li>
            <li><strong>Droit à l'oubli :</strong> Vous pouvez demander la suppression totale de votre compte et de toutes vos données de nos serveurs.</li>
            <li><strong>Droit d'opposition :</strong> Vous pouvez vous opposer au traitement de certaines données.</li>
          </ul>
        </section>

        {/* 5. Contact */}
        <section className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-slate-200 dark:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">6. Nous contacter</h2>
          </div>
          <p className="mb-4">
            Pour exercer vos droits, ou pour toute question concernant la manière dont nous protégeons et gérons vos données, 
            n'hésitez pas à nous contacter directement. Notre délégué à la protection des données vous répondra dans les plus brefs délais.
          </p>
          <a 
            href="mailto:labodjalatifou300@gmail.com" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            <Mail className="w-4 h-4" />
            labodjalatifou300@gmail.com
          </a>
        </section>

      </div>
    </div>
  );
}
