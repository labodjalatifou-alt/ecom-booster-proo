import React from 'react';

export default function SliderField({ label, value, onChange, min = 0, max = 100, step = 1 }: any) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-semibold text-gray-800">{label}</label>
        <span className="text-[13px] text-gray-500 font-medium">{value}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={value || min} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#008060]"
      />
    </div>
  );
}