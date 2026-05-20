import React from 'react';
import { LifeBuoy, Mail, MessageSquare, Clock, BookOpen } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support & Assistance | Ecom Booster Pro',
  description: 'Page d\'assistance et de support technique pour Ecom Booster Pro',
};

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
          <LifeBuoy className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
          Support & Assistance
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
          Nous sommes là pour vous aider à tirer le meilleur de votre boutique.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        
        {/* Contact direct */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
            <Mail className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Nous Contacter par Email</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow">
            Notre équipe technique est disponible pour résoudre vos problèmes et répondre à vos questions.
          </p>
          <a 
            href="mailto:labodjalatifou300@gmail.com" 
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            <Mail className="w-4 h-4" />
            labodjalatifou300@gmail.com
          </a>
        </div>

        {/* Délais de réponse */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-6">
            <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Délais de Réponse</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow">
            Nous faisons tout notre possible pour vous répondre dans les plus brefs délais, généralement sous <strong>24 à 48 heures ouvrées</strong>.
          </p>
          <div className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl font-medium text-slate-700 dark:text-slate-300">
            Du Lundi au Vendredi (9h - 18h)
          </div>
        </div>

      </div>

      {/* FAQ */}
      <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white m-0">Foire Aux Questions (FAQ)</h2>
        </div>

        <div className="space-y-6">
          <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Comment désinstaller l'application ?</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Pour désinstaller Ecom Booster Pro, rendez-vous dans le tableau de bord de votre boutique Shopify, allez dans l'onglet "Applications", trouvez notre app et cliquez sur "Supprimer". Votre abonnement sera automatiquement annulé.
            </p>
          </div>

          <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Mes données sont-elles en sécurité ?</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Absolument. Nous utilisons un chiffrement de pointe et vos accès Shopify sont stockés de manière sécurisée (vous pouvez consulter notre <a href="/privacy" className="text-blue-600 hover:underline">Politique de confidentialité</a>).
            </p>
          </div>

          <div className="pb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">L'IA ne génère pas de bonnes fiches produits, que faire ?</h3>
            <p className="text-slate-600 dark:text-slate-400">
              L'IA d'Ecom Booster Pro est basée sur le contexte. Assurez-vous d'entrer un nom de produit précis et de donner un maximum de détails si possible. En cas de problème récurrent, contactez-nous par email.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
