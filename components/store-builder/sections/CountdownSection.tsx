"use client";

import React, { useState, useEffect } from 'react';

export default function CountdownSection({ settings }: { settings: any }) {
  const targetDate = settings?.targetDate || new Date(Date.now() + 86400000).toISOString(); // Default to +24h
  const title = settings?.title || "Offre à durée limitée !";
  const subtitle = settings?.subtitle || "Dépêchez-vous avant la fin de la promotion exceptionnelle.";
  const showDays = settings?.showDays ?? true;
  const showHours = settings?.showHours ?? true;
  const showMinutes = settings?.showMinutes ?? true;
  const showSeconds = settings?.showSeconds ?? true;
  const bgColor = settings?.bgColor || "#111827";
  const textColor = settings?.textColor || "#ffffff";
  const timerBgColor = settings?.timerBgColor || "#1f2937";
  const accentColor = settings?.accentColor || "#ef4444";
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return timeLeft;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center justify-center min-w-[80px] p-4 rounded-xl shadow-lg border border-white/10 backdrop-blur-md" style={{ backgroundColor: timerBgColor }}>
      <span className="text-4xl md:text-5xl font-black tabular-nums" style={{ color: accentColor }}>
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-xs md:text-sm font-bold uppercase tracking-widest mt-2" style={{ color: textColor, opacity: 0.8 }}>
        {label}
      </span>
    </div>
  );

  return (
    <section className="w-full py-16 px-4 md:px-8 flex flex-col items-center justify-center text-center" style={{ backgroundColor: bgColor }}>
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: textColor }}>{title}</h2>
          {subtitle && (
            <p className="text-lg font-medium opacity-80 max-w-xl mx-auto" style={{ color: textColor }}>{subtitle}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
          {showDays && <TimeUnit value={timeLeft.days} label="Jours" />}
          {showDays && showHours && <span className="text-2xl font-black opacity-30" style={{ color: textColor }}>:</span>}
          {showHours && <TimeUnit value={timeLeft.hours} label="Heures" />}
          {(showHours || showDays) && showMinutes && <span className="text-2xl font-black opacity-30" style={{ color: textColor }}>:</span>}
          {showMinutes && <TimeUnit value={timeLeft.minutes} label="Minutes" />}
          {(showMinutes || showHours || showDays) && showSeconds && <span className="text-2xl font-black opacity-30" style={{ color: textColor }}>:</span>}
          {showSeconds && <TimeUnit value={timeLeft.seconds} label="Secondes" />}
        </div>
      </div>
    </section>
  );
}
