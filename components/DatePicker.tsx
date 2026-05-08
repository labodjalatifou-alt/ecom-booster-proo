"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DatePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('7days');
  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Fermer si clic en dehors
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const presets = [
    { id: 'today', label: "Aujourd'hui" },
    { id: 'yesterday', label: 'Hier' },
    { id: '7days', label: '7 derniers jours' },
    { id: '30days', label: '30 derniers jours' },
    { id: 'all', label: 'Tout' },
    { id: 'custom', label: 'Personnalisé' },
  ];

  const handlePresetClick = (id: string) => {
    setSelectedPreset(id);
    if (id === 'custom') {
      setShowCalendar(true);
    } else {
      setShowCalendar(false);
      setIsOpen(false);
    }
  };

  const handleDateClick = (day: number) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else {
      if (day < startDate) {
        setStartDate(day);
        setEndDate(null);
      } else {
        setEndDate(day);
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:border-primary-500 transition-all shadow-sm active:scale-95"
      >
        <CalendarIcon className="w-4 h-4 text-primary-500" />
        <span>
          {selectedPreset === 'custom' && startDate && endDate 
            ? `${startDate} Avr - ${endDate} Avr` 
            : presets.find(p => p.id === selectedPreset)?.label}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 origin-top-right",
          showCalendar ? "w-[300px] md:w-[600px]" : "w-52"
        )}>
          <div className="flex flex-col md:flex-row">
            <div className={cn("py-2 bg-slate-50/50 dark:bg-slate-800/30", showCalendar ? "w-full md:w-44 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800" : "w-full")}>
              {presets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetClick(p.id)}
                  className={cn("w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between", selectedPreset === p.id ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800")}
                >
                  {p.label}
                  {selectedPreset === p.id && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>

            {showCalendar && (
              <div className="flex-1 p-6 bg-white dark:bg-slate-900">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-5">
                    <ChevronLeft className="w-5 h-5 text-slate-400 hover:text-primary-500 cursor-pointer" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-100">Avril 2024</span>
                    <ChevronRight className="w-5 h-5 text-slate-400 hover:text-primary-500 cursor-pointer" />
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center mb-3">
                    {['L','M','M','J','V','S','D'].map(d => <span key={d} className="text-[9px] font-black text-slate-400 uppercase">{d}</span>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {[...Array(30)].map((_, i) => {
                      const day = i + 1;
                      const active = day === startDate || day === endDate;
                      const ranged = startDate && endDate && day > startDate && day < endDate;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleDateClick(day)}
                          className={cn(
                            "h-8 w-8 flex items-center justify-center rounded-xl text-[10px] font-black transition-all",
                            active ? "bg-primary-600 text-white shadow-xl scale-110" : 
                            ranged ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600" : 
                            "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)}
                    className="px-8 py-3 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
