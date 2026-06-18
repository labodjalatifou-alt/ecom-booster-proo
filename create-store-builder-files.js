const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components', 'store-builder');
const fieldsDir = path.join(componentsDir, 'fields');
const sectionsDir = path.join(componentsDir, 'sections');

// Ensure directories exist
[componentsDir, fieldsDir, sectionsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Create Field components
const fields = [
  'TextField', 'TextareaField', 'ColorField', 'ImageField', 
  'ToggleField', 'SliderField', 'SelectField', 'ItemsListField'
];

fields.forEach(field => {
  const code = `import React from 'react';

export default function ${field}({ label, value, onChange, ...props }: any) {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-xs font-semibold text-gray-700">{label}</label>
      <div className="text-sm text-gray-500">[{field} en construction]</div>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(fieldsDir, `${field}.tsx`), code);
});

// Create Section components
const sections = [
  'AnnouncementBarSection', 'HeroSection', 'MarqueeSection', 'ProductSection',
  'CountdownSection', 'TestimonialsSection', 'BenefitsSection', 'BeforeAfterSection',
  'StatsSection', 'GallerySection', 'FaqSection', 'ComparisonTableSection',
  'GuaranteesSection', 'VideoSection', 'ImageWithTextSection', 'OrderFormSection',
  'ProductGridSection', 'PricingTableSection', 'NewsletterSection', 'SlideshowSection',
  'IconGridSection', 'TextBlockSection', 'SpacerSection', 'PopupSection', 'FooterSection'
];

sections.forEach(section => {
  const code = `import React from 'react';

export default function ${section}({ settings }: any) {
  return (
    <div className="w-full p-8 text-center bg-white border border-dashed border-gray-300">
      <h2 className="text-2xl font-bold text-gray-800">${section}</h2>
      <p className="text-gray-500">Composant en cours de construction avec les settings : {JSON.stringify(settings)}</p>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(sectionsDir, `${section}.tsx`), code);
});

console.log('Tous les fichiers boilerplate générés avec succès.');
