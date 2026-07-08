import React from 'react';

export default function HeroSection({ settings }: { settings: any }) {
  // Use default or provided settings
  const title = settings?.title || "Titre de la bannière";
  const subtitle = settings?.subtitle || "Rédigez un sous-titre accrocheur ici pour capter l'attention de vos visiteurs.";
  const button1Text = settings?.button1Text || "Acheter maintenant";
  const button1Url = settings?.button1Url || "#";
  const button2Text = settings?.button2Text || "";
  const button2Url = settings?.button2Url || "#";
  const imageUrl = settings?.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80";
  const overlayColor = settings?.overlayColor || "#000000";
  const overlayOpacity = settings?.overlayOpacity || 40;
  const textAlign = settings?.textAlign || "center";
  const badgeText = settings?.badgeText || "";
  const showBadge = settings?.showBadge || false;
  const badgeColor = settings?.badgeColor || "#008060";
  const animation = settings?.animation || "fadeIn";
  const minHeight = settings?.minHeight || 500;
  
  // For overlay
  const rgbaColor = `rgba(0, 0, 0, ${overlayOpacity / 100})`;

  const alignClass = textAlign === 'gauche' ? 'items-start text-left' : textAlign === 'droite' ? 'items-end text-right' : 'items-center text-center';

  return (
    <section 
      className="relative w-full overflow-hidden flex items-center justify-center bg-gray-100"
      style={{ minHeight: `${minHeight}px` }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 z-10 transition-opacity"
        style={{ backgroundColor: overlayColor, opacity: overlayOpacity / 100 }}
      />

      {/* Content */}
      <div className={`relative z-20 w-full max-w-5xl mx-auto px-6 @md:px-12 py-16 flex flex-col ${alignClass} gap-6 ${animation === 'slideUp' ? 'animate-in slide-in-from-bottom-8 duration-1000' : 'animate-in fade-in duration-1000'}`}>
        
        {showBadge && badgeText && (
          <span 
            className="px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-white rounded-full shadow-lg backdrop-blur-sm"
            style={{ backgroundColor: badgeColor }}
          >
            {badgeText}
          </span>
        )}

        <h1 className="text-4xl @md:text-5xl @lg:text-7xl font-black text-white leading-[1.1] tracking-tight drop-shadow-lg">
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-lg @md:text-xl text-white/90 max-w-2xl font-medium drop-shadow-md">
            {subtitle}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 mt-4">
          {button1Text && (
            <a 
              href={button1Url}
              className="px-8 py-4 bg-white text-gray-900 font-bold text-sm uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-xl"
            >
              {button1Text}
            </a>
          )}
          {button2Text && (
            <a 
              href={button2Url}
              className="px-8 py-4 border-2 border-white text-white font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-white hover:text-gray-900 transition-colors shadow-lg"
            >
              {button2Text}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
