import fs from 'fs';
import path from 'path';

const fieldsDir = path.join(__dirname, 'components', 'store-builder', 'fields');

const textField = `import React from 'react';

export default function TextField({ label, value, onChange, placeholder }: any) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-[13px] font-semibold text-gray-800">{label}</label>
      <input 
        type="text" 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
      />
    </div>
  );
}`;

const textareaField = `import React from 'react';

export default function TextareaField({ label, value, onChange, placeholder }: any) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-[13px] font-semibold text-gray-800">{label}</label>
      <textarea 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
      />
    </div>
  );
}`;

const colorField = `import React from 'react';

export default function ColorField({ label, value, onChange }: any) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-[13px] font-semibold text-gray-800">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 rounded-full border border-gray-200 shadow-inner overflow-hidden flex-shrink-0 cursor-pointer">
          <input 
            type="color" 
            value={value || '#000000'} 
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
          />
        </div>
        <input 
          type="text" 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}`;

const toggleField = `import React from 'react';

export default function ToggleField({ label, value, onChange }: any) {
  return (
    <div className="flex items-center justify-between mb-4">
      <label className="text-[13px] font-semibold text-gray-800 cursor-pointer" onClick={() => onChange(!value)}>{label}</label>
      <button 
        type="button"
        onClick={() => onChange(!value)}
        className={\`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 \${value ? 'bg-[#008060]' : 'bg-gray-200'}\`}
      >
        <span className={\`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out \${value ? 'translate-x-4' : 'translate-x-0'}\`} />
      </button>
    </div>
  );
}`;

const sliderField = `import React from 'react';

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
}`;

const selectField = `import React from 'react';

export default function SelectField({ label, value, onChange, options = [] }: any) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-[13px] font-semibold text-gray-800">{label}</label>
      <select 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow appearance-none cursor-pointer"
      >
        {options.map((opt: any, i: number) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}`;

fs.writeFileSync(path.join(fieldsDir, 'TextField.tsx'), textField);
fs.writeFileSync(path.join(fieldsDir, 'TextareaField.tsx'), textareaField);
fs.writeFileSync(path.join(fieldsDir, 'ColorField.tsx'), colorField);
fs.writeFileSync(path.join(fieldsDir, 'ToggleField.tsx'), toggleField);
fs.writeFileSync(path.join(fieldsDir, 'SliderField.tsx'), sliderField);
fs.writeFileSync(path.join(fieldsDir, 'SelectField.tsx'), selectField);

console.log('Champs mis à jour.');
