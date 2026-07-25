const fs = require('fs');
const file = 'components/store-builder/sections/OrderFormRender.tsx';
let content = fs.readFileSync(file, 'utf8');
const startIdx = content.indexOf('      } catch (e) {}');
const endIdx = content.indexOf('  return (\n    <div className="w-full px-4 py-8" id="order-form">');

if (startIdx !== -1 && endIdx !== -1) {
  const replaceStr = `      } catch (e) {}
    }
  }, [sent])

  if (sent) {
    const productImage = product?.image_url || product?.images?.[0] || 'https://placehold.co/100x100/e2e8f0/64748b?text=Produit'
    const waNumber = themeSettings?.whatsapp_number || ''
    const defaultWaMsg = \`Bonjour, je viens de passer une commande pour \${product?.title || 'un produit'} (\${finalQty}x). Mon nom est \${name}.\`
    const waText = encodeURIComponent(s.popup_whatsapp_msg || defaultWaMsg)
    const waLink = waNumber ? \`https://wa.me/\${waNumber.replace(/\\D/g, '')}?text=\${waText}\` : ''
    
    // Génère un numéro de commande aléatoire (ou utilise un hash) pour l'affichage
    const randomId = Math.floor(10000 + Math.random() * 90000)
    
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto" 
           style={{ background: 'rgba(23, 37, 84, 0.6)', backdropFilter: 'blur(8px)' }}>
        <div className="bg-white rounded-[28px] shadow-2xl max-w-[500px] w-full p-6 @md:p-8 text-center anim-pop relative overflow-hidden my-auto border border-gray-100">
          
          {/* Confetti Background (CSS) */}
          <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none opacity-60">
             <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10%" cy="20%" r="3" fill="#E8527A" opacity="0.8"/>
                <circle cx="80%" cy="10%" r="4" fill="#E8527A" opacity="0.6"/>
                <rect x="20%" y="30%" width="6" height="6" fill="#10B981" opacity="0.7" transform="rotate(25)"/>
                <rect x="85%" y="40%" width="5" height="5" fill="#3B82F6" opacity="0.8" transform="rotate(45)"/>
                <path d="M50,10 L54,18 L46,18 Z" fill="#F59E0B" opacity="0.9" />
                <path d="M70,30 L73,36 L67,36 Z" fill="#10B981" opacity="0.6" transform="rotate(-20 70 30)"/>
                <circle cx="30%" cy="10%" r="2" fill="#3B82F6" opacity="0.5"/>
                <circle cx="90%" cy="25%" r="3" fill="#F59E0B" opacity="0.8"/>
             </svg>
          </div>

          <button onClick={() => { setSent(false); setName(''); setPhone(''); setCity(''); setEmail('') }}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-100 hover:bg-gray-100 rounded-full text-gray-500 transition-colors z-20 shadow-sm">
            ✕
          </button>

          {/* Icône succès */}
          <div className="relative z-10 w-[88px] h-[88px] mx-auto mb-5 bg-[#0066ff] rounded-full flex items-center justify-center shadow-[0_0_0_12px_rgba(0,102,255,0.08)]">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          
          <h3 className="text-[26px] font-black mb-1.5 text-[#0b1f3f] relative z-10 tracking-tight">Commande confirmée !</h3>
          <p className="text-[14px] mb-5 text-[#475569] relative z-10 px-2 font-medium">
            Merci pour votre confiance, votre commande a été enregistrée avec succès.
          </p>

          <div className="inline-flex items-center gap-1.5 bg-[#0066ff] text-white px-4 py-1.5 rounded-full text-[13px] font-bold mb-7 shadow-sm relative z-10 tracking-wide">
            <ShieldCheck size={14} strokeWidth={2.5} /> N° Commande : #CMD-{randomId}
          </div>

          <div className="flex flex-col gap-4 text-left relative z-10">
            
            {/* Récapitulatif Box */}
            <div className="bg-white border border-[#e2e8f0] shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl overflow-hidden">
              <div className="p-4 flex items-center gap-2 border-b border-gray-100/50">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <h4 className="text-xs font-bold text-[#0b1f3f] uppercase tracking-wide">RÉCAPITULATIF DE VOTRE COMMANDE</h4>
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                    <img src={productImage} alt={product?.title || 'Produit'} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0b1f3f] text-[15px] leading-tight mb-1.5 line-clamp-2">{product?.title || 'Votre produit'}</p>
                    <span className="inline-block bg-[#eff6ff] text-[#0066ff] px-2.5 py-0.5 rounded-md text-[11px] font-bold">
                      Quantité : {finalQty}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#0066ff] text-base">{total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 my-4"></div>

                <div className="space-y-2.5 text-[13px] text-[#475569] font-medium">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg> Sous-total</div>
                    <span>{total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2"><Truck size={16} strokeWidth={2.5} /> Livraison</div>
                    <span className="font-bold text-[#16a34a]">Gratuite</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2"><Sparkles size={16} strokeWidth={2.5} /> Frais de service</div>
                    <span>0 FCFA</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#eff6ff] px-4 py-3 border-t border-[#bfdbfe] flex justify-between items-center">
                <span className="font-black text-[#0b1f3f] text-[15px]">Total payé</span>
                <span className="font-black text-lg text-[#0066ff]">{total.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            {/* Traitement Box (Vert) */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden shadow-sm">
              <div className="w-11 h-11 rounded-full bg-[#22c55e] text-white flex items-center justify-center flex-shrink-0 shadow-sm z-10">
                <ShieldCheck size={22} strokeWidth={2.5} />
              </div>
              <div className="flex-1 z-10">
                <h4 className="font-bold text-[#166534] text-[13px] mb-0.5 tracking-tight">Votre commande est en cours de traitement.</h4>
                <p className="text-[11px] text-[#15803d]/90 leading-snug pr-12 font-medium">Vous recevrez un appel ou un message pour confirmer les détails de la livraison.</p>
              </div>
              {/* Illustration Livreur */}
              <img 
                src="https://cdn-icons-png.flaticon.com/512/2830/2830305.png" 
                alt="Livraison" 
                className="w-[70px] h-[70px] absolute -right-2 -bottom-2 opacity-95 object-contain"
                style={{ filter: 'drop-shadow(-2px 4px 6px rgba(22,101,52,0.15))' }}
              />
            </div>

            {/* WhatsApp Box (Bleu) */}
            {waLink && (
              <div className="bg-[#0066ff] rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden text-white shadow-[0_8px_20px_rgba(0,102,255,0.25)]">
                <div className="flex-1 z-10">
                  <h4 className="font-bold text-[15px] mb-1.5 tracking-tight">Une question ? Besoin d'aide ?</h4>
                  <p className="text-[11px] text-white/90 mb-4 leading-snug pr-16 font-medium">Notre équipe est disponible sur WhatsApp pour vous accompagner.</p>
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 bg-white text-[#0b1f3f] px-4 py-2 rounded-full text-[13px] font-black shadow-md hover:scale-[1.02] active:scale-95 transition-all w-fit">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Discuter sur WhatsApp <span className="text-gray-400 font-normal">›</span>
                  </a>
                </div>
                {/* Illustration Téléphone */}
                <div className="absolute -right-4 -bottom-6 w-36 h-36 opacity-100 z-0">
                  <img src="https://cdn3d.iconscout.com/3d/free/thumb/free-whatsapp-9238385-7566213.png" alt="WhatsApp" className="w-full h-full object-contain drop-shadow-2xl" />
                </div>
              </div>
            )}
          </div>

          {/* Pied de page (Réassurance) */}
          <div className="flex justify-center items-center gap-3 @md:gap-6 mt-7 pt-5 flex-wrap relative z-10">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-8 h-8 rounded-full border border-[#bfdbfe] flex items-center justify-center text-[#0066ff] bg-white shadow-sm"><ShieldCheck size={16} strokeWidth={2.5} /></div>
              <span className="text-[10px] font-bold text-[#475569] leading-tight">Paiement<br/>sécurisé</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-8 h-8 rounded-full border border-[#bfdbfe] flex items-center justify-center text-[#0066ff] bg-white shadow-sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
              <span className="text-[10px] font-bold text-[#475569] leading-tight">Livraison<br/>rapide</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-8 h-8 rounded-full border border-[#bfdbfe] flex items-center justify-center text-[#0066ff] bg-white shadow-sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></div>
              <span className="text-[10px] font-bold text-[#475569] leading-tight">Produits<br/>de qualité</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-8 h-8 rounded-full border border-[#bfdbfe] flex items-center justify-center text-[#0066ff] bg-white shadow-sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg></div>
              <span className="text-[10px] font-bold text-[#475569] leading-tight">Support client<br/>réactif</span>
            </div>
          </div>
          
        </div>
      </div>
    )
  }

`;
  
  content = content.substring(0, startIdx) + replaceStr + content.substring(endIdx);
  fs.writeFileSync(file, content);
  console.log('Success');
} else {
  console.log('Not found bounds', startIdx, endIdx);
}
