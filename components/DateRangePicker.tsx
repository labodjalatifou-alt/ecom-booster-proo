"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, isSameMonth, isSameDay, isWithinInterval,
  isAfter, isBefore, startOfDay, endOfDay, subDays, subMonths as subM, subYears,
  parseISO
} from 'date-fns';
import { fr } from 'date-fns/locale';

export interface DateRange {
  from: string | null;  // ISO string
  to: string | null;    // ISO string
  label: string;
}

export type PeriodPreset =
  | 'TODAY' | 'YESTERDAY' | '7D' | '30D' | '3M' | '12M' | 'ALL' | 'CUSTOM';

interface Preset {
  id: PeriodPreset;
  label: string;
  getRange: () => { from: Date | null; to: Date | null };
}

const PRESETS: Preset[] = [
  {
    id: 'TODAY',
    label: "Aujourd'hui",
    getRange: () => {
      const d = new Date();
      return { from: startOfDay(d), to: endOfDay(d) };
    },
  },
  {
    id: 'YESTERDAY',
    label: 'Hier',
    getRange: () => {
      const d = subDays(new Date(), 1);
      return { from: startOfDay(d), to: endOfDay(d) };
    },
  },
  {
    id: '7D',
    label: '7 derniers jours',
    getRange: () => ({ from: subDays(new Date(), 6), to: new Date() }),
  },
  {
    id: '30D',
    label: '30 derniers jours',
    getRange: () => ({ from: subDays(new Date(), 29), to: new Date() }),
  },
  {
    id: '3M',
    label: '3 derniers mois',
    getRange: () => ({ from: subM(new Date(), 3), to: new Date() }),
  },
  {
    id: '12M',
    label: '12 derniers mois',
    getRange: () => ({ from: subYears(new Date(), 1), to: new Date() }),
  },
  {
    id: 'ALL',
    label: 'Toute la période',
    getRange: () => ({ from: null, to: null }),
  },
  {
    id: 'CUSTOM',
    label: 'Personnalisé...',
    getRange: () => ({ from: null, to: null }),
  },
];

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
  align?: 'left' | 'right';
}

function getMiniCalendarDays(viewMonth: Date): Date[] {
  const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
  const days: Date[] = [];
  let current = start;
  while (!isAfter(current, end)) {
    days.push(new Date(current));
    current = new Date(current.getTime() + 86400000);
  }
  return days;
}

function MiniCalendar({
  viewMonth,
  onChangeMonth,
  rangeStart,
  rangeEnd,
  hovered,
  onDayClick,
  onDayHover,
}: {
  viewMonth: Date;
  onChangeMonth: (d: Date) => void;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  hovered: Date | null;
  onDayClick: (d: Date) => void;
  onDayHover: (d: Date | null) => void;
}) {
  const days = getMiniCalendarDays(viewMonth);
  const effectiveEnd = rangeEnd || hovered;

  const isInRange = (d: Date) => {
    if (!rangeStart || !effectiveEnd) return false;
    const [s, e] = isAfter(rangeStart, effectiveEnd)
      ? [effectiveEnd, rangeStart]
      : [rangeStart, effectiveEnd];
    return isWithinInterval(d, { start: startOfDay(s), end: endOfDay(e) });
  };

  const isStart = (d: Date) => rangeStart && isSameDay(d, rangeStart);
  const isEnd = (d: Date) => effectiveEnd && isSameDay(d, effectiveEnd);

  return (
    <div className="select-none">
      {/* Month Nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onChangeMonth(subMonths(viewMonth, 1))}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-black capitalize">
          {format(viewMonth, 'MMMM yyyy', { locale: fr })}
        </span>
        <button
          onClick={() => onChangeMonth(addMonths(viewMonth, 1))}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-2">
        {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map(n => (
          <div key={n} className="text-center text-[9px] font-black text-slate-400 uppercase py-1">
            {n}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day, i) => {
          const inRange = isInRange(day);
          const isS = isStart(day);
          const isE = isEnd(day);
          const isCurrentMonth = isSameMonth(day, viewMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={i}
              onClick={() => onDayClick(day)}
              onMouseEnter={() => onDayHover(day)}
              onMouseLeave={() => onDayHover(null)}
              className={`
                relative h-8 w-full text-xs font-bold transition-all
                ${!isCurrentMonth ? 'opacity-30' : ''}
                ${isS || isE
                  ? 'bg-primary-600 text-white rounded-xl z-10 shadow-lg shadow-primary-500/20'
                  : inRange
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : isToday
                  ? 'text-primary-600 font-black'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300'}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangePicker({ value, onChange, align = 'right' }: Props) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<PeriodPreset>('ALL');
  const [showCustom, setShowCustom] = useState(false);

  // Custom calendar state
  const [viewMonth1, setViewMonth1] = useState(subMonths(new Date(), 1));
  const [viewMonth2, setViewMonth2] = useState(new Date());
  const [pickStart, setPickStart] = useState<Date | null>(null);
  const [pickEnd, setPickEnd] = useState<Date | null>(null);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [pickStep, setPickStep] = useState<'start' | 'end'>('start');

  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowCustom(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync activePreset from value.label
  useEffect(() => {
    const preset = PRESETS.find(p => p.label === value.label);
    if (preset) setActivePreset(preset.id);
    else if (value.label.startsWith('Du')) setActivePreset('CUSTOM');
    else setActivePreset('ALL');
  }, [value.label]);

  const applyPreset = (preset: Preset) => {
    if (preset.id === 'CUSTOM') {
      setShowCustom(true);
      setPickStart(null);
      setPickEnd(null);
      setPickStep('start');
      return;
    }
    setShowCustom(false);
    const { from, to } = preset.getRange();
    setActivePreset(preset.id);
    onChange({
      from: from ? from.toISOString() : null,
      to: to ? to.toISOString() : null,
      label: preset.label,
    });
    setOpen(false);
  };

  const handleDayClick = (day: Date) => {
    if (pickStep === 'start') {
      setPickStart(day);
      setPickEnd(null);
      setPickStep('end');
    } else {
      let start = pickStart!;
      let end = day;
      if (isAfter(start, end)) [start, end] = [end, start];
      setPickEnd(end);
      setPickStep('start');
    }
  };

  const applyCustom = () => {
    if (!pickStart) return;
    const end = pickEnd || pickStart;
    const label = `Du ${format(pickStart, 'd MMM', { locale: fr })} au ${format(end, 'd MMM yyyy', { locale: fr })}`;
    onChange({
      from: startOfDay(pickStart).toISOString(),
      to: endOfDay(end).toISOString(),
      label,
    });
    setActivePreset('CUSTOM');
    setOpen(false);
    setShowCustom(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:border-primary-300 hover:text-primary-600 transition-all shadow-sm min-w-[160px]"
      >
        <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-primary-500" />
        <span className="flex-1 text-left truncate">{value.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute top-full mt-2 z-[200] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${showCustom ? 'w-[580px] max-w-[95vw]' : 'w-56'}`}
        >
          {!showCustom ? (
            /* Preset list */
            <div className="py-2">
              {PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`w-full text-left px-5 py-3 text-xs font-black transition-all flex items-center justify-between group ${
                    activePreset === preset.id && preset.id !== 'CUSTOM'
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  } ${preset.id === 'CUSTOM' ? 'border-t border-slate-100 dark:border-slate-800 mt-1 pt-3 text-indigo-600 dark:text-indigo-400' : ''}`}
                >
                  {preset.label}
                  {activePreset === preset.id && preset.id !== 'CUSTOM' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                  )}
                  {preset.id === 'CUSTOM' && (
                    <Calendar className="w-3.5 h-3.5 opacity-60" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            /* Custom range picker */
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">
                  Période personnalisée
                </h4>
                <button
                  onClick={() => setShowCustom(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Pick step indicator */}
              <div className="flex gap-3 mb-4">
                <div className={`flex-1 p-2.5 rounded-xl border-2 transition-all ${pickStep === 'start' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-100 dark:border-slate-800'}`}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Début</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200 mt-0.5">
                    {pickStart ? format(pickStart, 'd MMM yyyy', { locale: fr }) : '—'}
                  </p>
                </div>
                <div className={`flex-1 p-2.5 rounded-xl border-2 transition-all ${pickStep === 'end' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-100 dark:border-slate-800'}`}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fin</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200 mt-0.5">
                    {pickEnd ? format(pickEnd, 'd MMM yyyy', { locale: fr }) : '—'}
                  </p>
                </div>
              </div>

              {/* Instruction */}
              <p className="text-[10px] font-bold text-primary-500 mb-4 text-center">
                {pickStep === 'start' ? '👆 Cliquez sur la date de début' : '👆 Cliquez sur la date de fin'}
              </p>

              {/* Dual calendar */}
              <div className="grid grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                <MiniCalendar
                  viewMonth={viewMonth1}
                  onChangeMonth={setViewMonth1}
                  rangeStart={pickStart}
                  rangeEnd={pickEnd}
                  hovered={hoveredDay}
                  onDayClick={handleDayClick}
                  onDayHover={setHoveredDay}
                />
                <MiniCalendar
                  viewMonth={viewMonth2}
                  onChangeMonth={setViewMonth2}
                  rangeStart={pickStart}
                  rangeEnd={pickEnd}
                  hovered={hoveredDay}
                  onDayClick={handleDayClick}
                  onDayHover={setHoveredDay}
                />
              </div>

              {/* Apply button */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  onClick={() => { setPickStart(null); setPickEnd(null); setPickStep('start'); }}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Effacer
                </button>
                <button
                  disabled={!pickStart}
                  onClick={applyCustom}
                  className="px-6 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all disabled:opacity-30 shadow-lg shadow-primary-500/20"
                >
                  Appliquer
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Utility: convert DateRange to query params ────────────────
export function dateRangeToQuery(range: DateRange): { from: string | null; to: string | null } {
  return { from: range.from, to: range.to };
}

// ── Default "All" range ───────────────────────────────────────
export const DEFAULT_RANGE: DateRange = { from: null, to: null, label: 'Toute la période' };
