import React from 'react';

export default function ToggleField({ label, value, onChange }: any) {
  return (
    <div className="flex items-center justify-between mb-4">
      <label className="text-[13px] font-semibold text-gray-800 cursor-pointer" onClick={() => onChange(!value)}>{label}</label>
      <button 
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${value ? 'bg-[#008060]' : 'bg-gray-200'}`}
      >
        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}