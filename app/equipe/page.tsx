"use client";

import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Mail, Trash2, Key, Shield, Loader2,
  CheckCircle2, UserCircle2, Headset, Truck, Settings2, Save
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useStore } from '@/components/StoreProvider';
import { sanitizeError } from '@/lib/utils';
import ConfirmationModal from '@/components/ConfirmationModal';

// Keys used in localStorage for commission settings
export const COMMISSION_KEYS = {
  closerPerConfirm: 'commission_closer_per_confirm',
  closerPerDelivered: 'commission_closer_per_delivered',
  livreurPerDelivery: 'commission_livreur_per_delivery',
};

export function getCommissions() {
  if (typeof window === 'undefined') return { closerPerConfirm: 500, closerPerDelivered: 500, livreurPerDelivery: 1000 };
  return {
    closerPerConfirm: parseInt(localStorage.getItem(COMMISSION_KEYS.closerPerConfirm) || '500'),
    closerPerDelivered: parseInt(localStorage.getItem(COMMISSION_KEYS.closerPerDelivered) || '500'),
    livreurPerDelivery: parseInt(localStorage.getItem(COMMISSION_KEYS.livreurPerDelivery) || '1000'),
  };
}

export default function EquipePage() {
  const { currency } = useStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState<any[]>([]);

  // Commission rates (editable)
  const [closerPerConfirm, setCloserPerConfirm] = useState(500);
  const [closerPerDelivered, setCloserPerDelivered] = useState(500);
  const [livreurPerDelivery, setLivreurPerDelivery] = useState(1000);
  const [savingRates, setSavingRates] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CLOSER'
  });

  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    fetchMembers();
    // Load saved commission rates
    const saved = getCommissions();
    setCloserPerConfirm(saved.closerPerConfirm);
    setCloserPerDelivered(saved.closerPerDelivered);
    setLivreurPerDelivery(saved.livreurPerDelivery);
  }, []);

  async function fetchMembers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching members:', error);
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  }

  async function handleSaveRates() {
    setSavingRates(true);
    localStorage.setItem(COMMISSION_KEYS.closerPerConfirm, String(closerPerConfirm));
    localStorage.setItem(COMMISSION_KEYS.closerPerDelivered, String(closerPerDelivered));
    localStorage.setItem(COMMISSION_KEYS.livreurPerDelivery, String(livreurPerDelivery));
    
    try {
      // Update all existing Closers
      await supabase
        .from('User')
        .update({ commissionPerConfirm: closerPerConfirm, commissionPerDeliver: closerPerDelivered })
        .eq('role', 'CLOSER');
        
      // Update all existing Livreurs
      await supabase
        .from('User')
        .update({ commissionPerDeliver: livreurPerDelivery })
        .eq('role', 'LIVREUR');
        
      toast.success('Tarifs appliqués à tous les membres !');
      // Update local state
      setMembers(members.map(m => {
        if (m.role === 'CLOSER') return { ...m, commissionPerConfirm: closerPerConfirm, commissionPerDeliver: closerPerDelivered };
        if (m.role === 'LIVREUR') return { ...m, commissionPerDeliver: livreurPerDelivery };
        return m;
      }));
    } catch (err) {
      toast.error("Erreur lors de la mise à jour des utilisateurs");
    } finally {
      setSavingRates(false);
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { data, error } = await supabase
      .from('User')
      .insert([{
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        commissionPerConfirm: formData.role === 'CLOSER' ? closerPerConfirm : 0,
        commissionPerDeliver: formData.role === 'CLOSER' ? closerPerDelivered : (formData.role === 'LIVREUR' ? livreurPerDelivery : 0),
        earnings: 0
      }])
      .select();

    if (error) {
      toast.error(sanitizeError(error));
    } else {
      toast.success(`Compte ${formData.role} créé avec succès !`);
      setMembers([data[0], ...members]);
      setFormData({ name: '', email: '', password: '', role: 'CLOSER' });
    }
    setSubmitting(false);
  };

  const deleteMember = async (id: string) => {
    const { error } = await supabase.from('User').delete().eq('id', id);
    if (error) toast.error(sanitizeError(error));
    else {
      toast.success("Membre supprimé");
      setMembers(members.filter(m => m.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Team Management</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Gestion d&apos;Équipe</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium italic">Gérez vos collaborateurs et leurs tarifs de commission.</p>
        </div>
      </div>

      {/* ── TARIFS DE COMMISSION ── */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
            <Settings2 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Tarifs des Commissions</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modifiez les montants, puis cliquez sur Enregistrer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Closer — par confirmation */}
          <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Headset className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Closer — Confirmation</span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 mb-3">Montant versé par commande confirmée</p>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
              <input
                type="number"
                min="0"
                value={closerPerConfirm}
                onChange={e => setCloserPerConfirm(parseInt(e.target.value) || 0)}
                className="w-full bg-transparent text-xl font-black text-amber-700 dark:text-amber-400 focus:outline-none"
              />
              <span className="text-sm font-black text-slate-400 flex-shrink-0">{currency}</span>
            </div>
          </div>

          {/* Closer — si livré */}
          <div className="bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-100 dark:border-orange-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Headset className="w-5 h-5 text-orange-600" />
              <span className="text-xs font-black text-orange-700 dark:text-orange-400 uppercase tracking-widest">Closer — Si Livré</span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 mb-3">Bonus supplémentaire si la commande est livrée</p>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3">
              <input
                type="number"
                min="0"
                value={closerPerDelivered}
                onChange={e => setCloserPerDelivered(parseInt(e.target.value) || 0)}
                className="w-full bg-transparent text-xl font-black text-orange-700 dark:text-orange-400 focus:outline-none"
              />
              <span className="text-sm font-black text-slate-400 flex-shrink-0">{currency}</span>
            </div>
          </div>

          {/* Livreur — par livraison */}
          <div className="bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">Livreur — Par Livraison</span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 mb-3">Montant unique versé par commande livrée</p>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
              <input
                type="number"
                min="0"
                value={livreurPerDelivery}
                onChange={e => setLivreurPerDelivery(parseInt(e.target.value) || 0)}
                className="w-full bg-transparent text-xl font-black text-blue-700 dark:text-blue-400 focus:outline-none"
              />
              <span className="text-sm font-black text-slate-400 flex-shrink-0">{currency}</span>
            </div>
          </div>
        </div>

        {/* Résumé + Save */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t-2 border-slate-100 dark:border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 space-y-1">
            <p>• Closer total possible par commande livrée : <span className="text-slate-700 dark:text-slate-200 font-black">{new Intl.NumberFormat('fr-FR').format(closerPerConfirm + closerPerDelivered)} {currency}</span></p>
            <p>• Livreur par livraison : <span className="text-slate-700 dark:text-slate-200 font-black">{new Intl.NumberFormat('fr-FR').format(livreurPerDelivery)} {currency}</span></p>
          </div>
          <button
            onClick={handleSaveRates}
            disabled={savingRates}
            className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-60"
          >
            {savingRates ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Enregistrer les tarifs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire de création */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm sticky top-24">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <UserPlus className="w-6 h-6 text-primary-600" /> Nouvel Accès
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nom Complet</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Moussa Diop"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email / Identifiant</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="email@ecom.com"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Mot de Passe</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Rôle Attribué</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'ADMIN', label: 'Administrateur', desc: 'Accès complet' },
                    { id: 'CLOSER', label: 'Closer', desc: `${new Intl.NumberFormat('fr-FR').format(closerPerConfirm)} + ${new Intl.NumberFormat('fr-FR').format(closerPerDelivered)} ${currency}` },
                    { id: 'LIVREUR', label: 'Livreur', desc: `${new Intl.NumberFormat('fr-FR').format(livreurPerDelivery)} ${currency}/livraison` }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormData({...formData, role: r.id as any})}
                      className={`flex flex-col items-start px-5 py-3 rounded-2xl border-2 transition-all ${formData.role === r.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
                    >
                      <span className={`text-[10px] font-black uppercase tracking-widest ${formData.role === r.id ? 'text-primary-700 dark:text-primary-400' : 'text-slate-600'}`}>{r.label}</span>
                      <span className="text-[9px] font-bold text-slate-400">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-primary-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {submitting ? 'Création...' : "Générer l'Accès"}
              </button>
            </form>
          </div>
        </div>

        {/* Liste des membres */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm min-h-[500px]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black">Membres Actifs ({members.length})</h3>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                <p className="text-[10px] font-black uppercase tracking-widest">Chargement...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-300">
                <Users className="w-12 h-12" />
                <p className="text-sm font-black text-slate-500">Aucun membre enregistré</p>
              </div>
            ) : (
              <div className="space-y-4">
                {members.map((member) => {
                  const initials = member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
                  const isCloser = member.role === 'CLOSER';
                  const isLivreur = member.role === 'LIVREUR';
                  return (
                    <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-transparent hover:border-primary-100 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-11 h-11 flex-shrink-0 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600 font-black text-xs shadow-sm group-hover:scale-110 transition-transform">
                          {initials || <UserCircle2 className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-black truncate">{member.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 uppercase truncate">
                            <Mail className="w-3 h-3 flex-shrink-0" /> {member.email}
                          </p>
                          {(isCloser || isLivreur) && (
                            <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                              {isCloser
                                ? `Total: ${new Intl.NumberFormat('fr-FR').format((member.commissionPerConfirm ?? 500) + (member.commissionPerDeliver ?? 500))} ${currency}/livraison`
                                : `${new Intl.NumberFormat('fr-FR').format(member.commissionPerDeliver ?? 1000)} ${currency}/livraison`}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0">
                        <div className="text-left sm:text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Gains</p>
                          <p className="text-sm font-black text-emerald-600">{new Intl.NumberFormat('fr-FR').format(member.earnings || 0)} {currency}</p>
                        </div>

                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${
                          member.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                          member.role === 'LIVREUR' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {member.role}
                        </span>

                        <button onClick={() => setConfirmDelete({ isOpen: true, id: member.id })} className="p-2 text-slate-300 hover:text-red-500 transition-colors flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={() => confirmDelete.id && deleteMember(confirmDelete.id)}
        title="Supprimer ce membre ?"
        message="Cette action est irréversible. Le collaborateur perdra immédiatement ses accès au dashboard."
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
}
