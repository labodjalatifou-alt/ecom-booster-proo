import React from 'react';
import { ArrowLeft, Trash2, Sliders } from 'lucide-react';
import TextField from './fields/TextField';
import ColorField from './fields/ColorField';
import SliderField from './fields/SliderField';
import ToggleField from './fields/ToggleField';
import TextareaField from './fields/TextareaField';
import SelectField from './fields/SelectField';

interface PropertiesPanelProps {
  section: any;
  onUpdate: (sectionId: string, newSettings: any) => void;
  onDelete: (sectionId: string) => void;
  onClose: () => void;
  isFixed?: boolean;
}

export default function PropertiesPanel({ section, onUpdate, onDelete, onClose, isFixed = false }: PropertiesPanelProps) {
  
  const updateSetting = (key: string, value: any) => {
    onUpdate(section.id, { ...section.settings, [key]: value });
  };

  // Rendu dynamique basé sur le type de la section
  const renderFields = () => {
    switch (section.type) {
      case 'Hero':
        return (
          <>
            <TextField label="Titre principal" value={section.settings.title} onChange={(val: string) => updateSetting('title', val)} />
            <TextareaField label="Sous-titre" value={section.settings.subtitle} onChange={(val: string) => updateSetting('subtitle', val)} />
            <TextField label="Texte bouton 1" value={section.settings.button1Text} onChange={(val: string) => updateSetting('button1Text', val)} />
            <ColorField label="Couleur de l'overlay" value={section.settings.overlayColor} onChange={(val: string) => updateSetting('overlayColor', val)} />
            <SliderField label="Opacité de l'overlay" min={0} max={100} value={section.settings.overlayOpacity} onChange={(val: number) => updateSetting('overlayOpacity', val)} />
            <SelectField label="Alignement" value={section.settings.textAlign} options={[{label: 'Gauche', value: 'gauche'}, {label: 'Centre', value: 'centre'}, {label: 'Droite', value: 'droite'}]} onChange={(val: string) => updateSetting('textAlign', val)} />
          </>
        );
      case 'Countdown':
        return (
          <>
            <TextField label="Titre" value={section.settings.title} onChange={(val: string) => updateSetting('title', val)} />
            <TextareaField label="Sous-titre" value={section.settings.subtitle} onChange={(val: string) => updateSetting('subtitle', val)} />
            <ToggleField label="Afficher les jours" value={section.settings.showDays} onChange={(val: boolean) => updateSetting('showDays', val)} />
            <ColorField label="Couleur de fond" value={section.settings.bgColor} onChange={(val: string) => updateSetting('bgColor', val)} />
            <ColorField label="Couleur d'accent" value={section.settings.accentColor} onChange={(val: string) => updateSetting('accentColor', val)} />
          </>
        );
      case 'OrderForm':
        return (
          <>
            <TextField label="Titre" value={section.settings.title} onChange={(val: string) => updateSetting('title', val)} />
            <TextField label="Texte du bouton" value={section.settings.btnText} onChange={(val: string) => updateSetting('btnText', val)} />
            <ColorField label="Couleur du bouton" value={section.settings.btnColor} onChange={(val: string) => updateSetting('btnColor', val)} />
            <SelectField label="Mise en page" value={section.settings.layout} options={[{label: 'Split', value: 'split'}, {label: 'Standard', value: 'standard'}]} onChange={(val: string) => updateSetting('layout', val)} />
          </>
        );
      case 'Testimonials':
        return (
          <>
            <TextField label="Titre" value={section.settings.title} onChange={(val: string) => updateSetting('title', val)} />
            <ColorField label="Couleur de fond" value={section.settings.bgColor} onChange={(val: string) => updateSetting('bgColor', val)} />
            {/* TODO: Implement ItemsListField for managing array of testimonials */}
            <div className="p-4 bg-yellow-50 text-yellow-800 text-xs rounded-lg border border-yellow-200 mt-4">
              L'édition avancée des items (liste dynamique) sera ajoutée dans la prochaine mise à jour.
            </div>
          </>
        );
      case 'Benefits':
        return (
          <>
            <TextField label="Titre" value={section.settings.title} onChange={(val: string) => updateSetting('title', val)} />
            <ColorField label="Couleur de fond" value={section.settings.bgColor} onChange={(val: string) => updateSetting('bgColor', val)} />
          </>
        );
      case 'Footer':
        return (
          <>
            <TextField label="Texte du Logo" value={section.settings.logoText} onChange={(val: string) => updateSetting('logoText', val)} />
            <TextareaField label="Description" value={section.settings.description} onChange={(val: string) => updateSetting('description', val)} />
            <ColorField label="Couleur de fond" value={section.settings.bgColor} onChange={(val: string) => updateSetting('bgColor', val)} />
            <ColorField label="Couleur du texte" value={section.settings.textColor} onChange={(val: string) => updateSetting('textColor', val)} />
          </>
        );
      default:
        return (
          <div className="p-4 text-center">
            <Sliders className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Paramètres pour {section.type} non encore implémentés.</p>
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 bg-gray-50 z-20 flex flex-col animate-in slide-in-from-right duration-200 border-l border-gray-200 shadow-xl">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 flex items-center gap-3 bg-white flex-shrink-0">
        <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-gray-900 truncate max-w-[180px]">{section.title}</h2>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{section.type}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {renderFields()}
      </div>

      {/* Footer Action */}
      {!isFixed && (
        <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
          <button 
            onClick={() => onDelete(section.id)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Supprimer la section
          </button>
        </div>
      )}
    </div>
  );
}
