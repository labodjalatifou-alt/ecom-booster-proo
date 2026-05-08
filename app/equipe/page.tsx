"use client";

import React, { useState } from 'react';
import { Users, UserPlus, Mail, Send, Trash2, Key, Shield } from 'lucide-react';

export default function EquipePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Closer');
  const [members, setMembers] = useState([
    { name: "Moussa Diakité", email: "moussa@ecom.com", role: "Administrateur", status: "Actif", avatar: "MD" },
    { name: "Saliou Traoré", email: "saliou@ecom.com", role: "Closer", status: "Actif", avatar: "ST" },
  ]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    const newMember = { name: "Nouveau Membre", email, role, status: "Prêt", avatar: "?" };
    setMembers([newMember, ...members]);
    setEmail(''); setPassword('');
    alert(`Compte ${role} créé !`);
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Management</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Gestion d'Équipe</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xl font-black mb-8">Créer un Accès</h3>
            <form onSubmit={handleInvite} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemple.com" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Mot de passe</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['Admin', 'Closer', 'Livreur'].map((r) => (
                  <button key={r} type="button" onClick={() => setRole(r)} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${role === r ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500'}`}>{r}</button>
                ))}
              </div>
              <button type="submit" className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-primary-700 transition-all">Générer l'accès</button>
            </form>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-sm">
            <h3 className="text-xl font-black mb-8">Membres Actifs ({members.length})</h3>
            <div className="space-y-4">
              {members.map((member, i) => (
                <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-3xl transition-all border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 font-black">{member.avatar}</div>
                    <div><h4 className="text-sm font-black">{member.name}</h4><p className="text-[10px] text-slate-400 font-bold">{member.email}</p></div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-[9px] font-black px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase">{member.role}</span>
                    <button className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
