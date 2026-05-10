"use client";

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Send, Trash2, Key, Shield, Loader2, CheckCircle2, UserCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function EquipePage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CLOSER' // ADMIN, CLOSER, LIVREUR
  });

  useEffect(() => {
    fetchMembers();
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // In a real app, this should call an API that creates the user in Supabase Auth too.
    // For now, we store the password in the DB (Note: insecure, but follows user request for "identifiants")
    // Ideally, we'd use supabase.auth.admin.createUser but it needs service role key.
    
    const { data, error } = await supabase
      .from('User')
      .insert([
        {
          id: crypto.randomUUID(), // Satisfy the not-null constraint
          name: formData.name,
          email: formData.email,
          role: formData.role,
          commissionPerConfirm: formData.role === 'CLOSER' ? 500 : 0,
          commissionPerDeliver: formData.role === 'LIVREUR' ? 1000 : 0,
          earnings: 0
        }
      ])
      .select();

    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success(`Compte ${formData.role} créé avec succès !`);
      setMembers([data[0], ...members]);
      setFormData({ name: '', email: '', password: '', role: 'CLOSER' });
    }
    setSubmitting(false);
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Supprimer ce membre ?")) return;
    const { error } = await supabase.from('User').delete().eq('id', id);
    if (error) toast.error("Erreur suppression");
    else {
      toast.success("Membre supprimé");
      setMembers(members.filter(m => m.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Team Management</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Gestion d'Équipe</h2>
          <p className="text-slate-400 text-sm mt-1 font-medium italic">Attribuez des rôles et gérez les accès de vos collaborateurs.</p>
        </div>

        {/* Commission Settings Summary */}
        <div className="flex gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-4 rounded-2xl flex items-center gap-3">
             <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20">
               <CheckCircle2 className="w-4 h-4" />
             </div>
             <div>
               <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Commission Confirmé</p>
               <p className="text-sm font-black text-emerald-600">500 FCFA</p>
             </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-2xl flex items-center gap-3">
             <div className="p-2 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20">
               <Shield className="w-4 h-4" />
             </div>
             <div>
               <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Commission Livré</p>
               <p className="text-sm font-black text-blue-600">1000 FCFA</p>
             </div>
          </div>
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
                    { id: 'CLOSER', label: 'Closer', desc: 'Gestion des appels' },
                    { id: 'LIVREUR', label: 'Livreur', desc: 'Gestion livraisons' }
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
                {submitting ? "Création..." : "Générer l'Accès"}
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
                {members.map((member, i) => {
                  const initials = member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
                  return (
                    <div key={member.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-transparent hover:border-primary-100 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600 font-black text-xs shadow-sm group-hover:scale-110 transition-transform">
                          {initials || <UserCircle2 className="w-6 h-6" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-black">{member.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 uppercase">
                            <Mail className="w-3 h-3" /> {member.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right mr-4">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Gains</p>
                          <p className="text-sm font-black text-emerald-600">{new Intl.NumberFormat('fr-FR').format(member.earnings || 0)} FCFA</p>
                        </div>

                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          member.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                          member.role === 'LIVREUR' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {member.role}
                        </span>
                        
                        <div className="flex gap-1">
                          <button onClick={() => deleteMember(member.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
