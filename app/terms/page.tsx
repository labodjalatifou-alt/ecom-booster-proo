import React from 'react';
import { FileText, CheckCircle, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions d\'Utilisation | Ecom Booster Pro',
  description: 'Conditions générales d\'utilisation de l\'application Ecom Booster Pro',
};

export default function TermsPage() {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
          <FileText className="w-8 h-8 text-slate-700 dark:text-slate-300" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
          Conditions d'Utilisation
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
          Dernière mise à jour : {currentDate}
        </p>
      </div>

      <div className="space-y-12 text-slate-700 dark:text-slate-300">
        
        {/* Introduction */}
        <section className="prose dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed">
            Bienvenue sur <strong>Ecom Booster Pro</strong>. En accédant à notre application ou en l'installant sur votre boutique Shopify, 
            vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation (CGU). 
            Veuillez les lire attentivement avant d'utiliser nos services.
          </p>
        </section>

        {/* 1. Description du service */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">1. Description du Service</h2>
          </div>
          <p className="mb-4">
            Ecom Booster Pro est un logiciel SaaS (Software as a Service) destiné aux e-commerçants. L'application permet de :
          </p>
          <ul className="space-y-2 list-disc list-inside ml-2">
            <li>Gérer, synchroniser et optimiser les commandes Shopify.</li>
            <li>Créer des fiches produits optimisées par Intelligence Artificielle (IA).</li>
            <li>Suivre les performances de livraison et la rentabilité.</li>
          </ul>
        </section>

        {/* 2. Responsabilités de l'utilisateur */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">2. Engagements de l'Utilisateur</h2>
          </div>
          <p className="mb-4">En utilisant notre service, vous vous engagez à :</p>
          <ul className="space-y-2 list-disc list-inside ml-2">
            <li>Ne pas utiliser l'application pour des activités illégales ou frauduleuses.</li>
            <li>Fournir des informations exactes lors de la configuration de votre compte.</li>
            <li>Ne pas tenter de pirater, de compromettre la sécurité ou de surcharger nos serveurs.</li>
            <li>Être seul responsable des produits que vous vendez via Shopify. L'IA fournit des suggestions que vous devez vérifier avant publication.</li>
          </ul>
        </section>

        {/* 3. Abonnements et paiements */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">3. Facturation et Abonnements</h2>
          </div>
          <p className="mb-4">
            L'utilisation d'Ecom Booster Pro peut être soumise à des frais d'abonnement. 
            Tous les paiements sont gérés de manière sécurisée par Shopify Billing API ou notre prestataire de paiement.
            Nous nous réservons le droit de modifier nos tarifs avec un préavis de 30 jours.
          </p>
        </section>

        {/* 4. Résiliation */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">4. Résiliation</h2>
          </div>
          <p className="mb-4">
            Vous pouvez résilier votre abonnement à tout moment en désinstallant l'application depuis votre tableau de bord Shopify.
            Ecom Booster Pro se réserve le droit de suspendre ou de fermer votre compte en cas de violation de ces conditions.
          </p>
        </section>

        {/* 5. Limitation de responsabilité */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-slate-200 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">5. Limitation de Responsabilité</h2>
          </div>
          <p className="mb-4">
            Ecom Booster Pro est fourni "tel quel". Bien que nous fassions tout notre possible pour garantir un service continu et de haute qualité, 
            nous ne pouvons être tenus responsables des pertes de revenus, de données, ou des problèmes techniques liés à des API tierces (comme Shopify ou Meta).
          </p>
        </section>

      </div>
    </div>
  );
}
