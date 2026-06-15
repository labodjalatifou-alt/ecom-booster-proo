import type { BuilderPage } from './types'

export function renderBuilderPage(builderPage: BuilderPage) {
  return builderPage.sections
    .filter(section => section.visible)
    .map(section => renderSection(section))
    .join('\n')
}

function renderSection(section: any) {
  switch (section.type) {
    case 'hero':
      return `
        <section style="background:${section.props.bg_color};color:${section.props.text_color};padding:60px 0;">
          <div style="max-width:1200px;margin:0 auto;display:flex;gap:40px;align-items:center;flex-wrap:wrap;">
            <div style="flex:1;min-width:320px;">
              <h1 style="font-size:42px;margin-bottom:20px;">${section.props.headline}</h1>
              <p style="font-size:18px;line-height:1.7;margin-bottom:30px;">${section.props.subheadline}</p>
              <a href="${section.props.cta_link}" style="background:#111827;color:#fff;padding:14px 26px;border-radius:999px;text-decoration:none;">${section.props.cta_text}</a>
            </div>
            ${section.props.image_url ? `<div style="flex:1;min-width:320px;"><img src="${section.props.image_url}" alt="" style="width:100%;border-radius:30px;object-fit:cover;height:420px;"/></div>` : ''}
          </div>
        </section>`
    case 'product':
      return `
        <section style="background:#fff;padding:60px 0;">
          <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1.2fr 0.8fr;gap:40px;align-items:center;">
            <div>
              <h2 style="font-size:36px;margin-bottom:16px;">Fiche produit</h2>
              <p style="margin-bottom:24px;">Prix attractif, variantes flexibles et résumé rapide pour booster les conversions.</p>
              <div style="display:flex;gap:12px;flex-wrap:wrap;">
                <button style="background:${section.props.cta_color};color:#fff;padding:16px 28px;border-radius:999px;border:none;cursor:pointer;">${section.props.cta_text}</button>
              </div>
            </div>
            <div style="border:1px solid #e5e7eb;border-radius:32px;padding:24px;">Produit</div>
          </div>
        </section>`
    case 'countdown':
      return `
        <section style="background:${section.props.bg_color};color:${section.props.text_color};padding:60px 0;">
          <div style="max-width:1200px;margin:0 auto;text-align:center;">
            <h2 style="font-size:32px;margin-bottom:16px;">${section.props.title}</h2>
            <p style="margin-bottom:32px;">Offre limitée, ne manquez pas cette promotion.</p>
            <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
              <div style="background:#00000010;padding:18px 24px;border-radius:24px;min-width:120px;">00<br/><span style="font-size:12px;">jours</span></div>
              <div style="background:#00000010;padding:18px 24px;border-radius:24px;min-width:120px;">00<br/><span style="font-size:12px;">heures</span></div>
              <div style="background:#00000010;padding:18px 24px;border-radius:24px;min-width:120px;">00<br/><span style="font-size:12px;">minutes</span></div>
            </div>
          </div>
        </section>`
    case 'order_form':
      return `
        <section style="background:${section.props.bg_color};padding:60px 0;">
          <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:40px;">
            <div>
              <h2 style="font-size:32px;margin-bottom:16px;">${section.props.title}</h2>
              <p style="margin-bottom:24px;">Formulaire prêt à capturer vos commandes avec un rendu mobile-friendly.</p>
            </div>
            <form style="background:#fff;border:1px solid #e5e7eb;border-radius:32px;padding:32px;">
              ${section.props.fields.map((field: any) => `<label style="display:block;margin-bottom:16px;"><span style="display:block;font-size:14px;margin-bottom:8px;">${field.label}</span><input style="width:100%;padding:14px 16px;border:1px solid #d1d5db;border-radius:16px;" placeholder="${field.placeholder}" /></label>`).join('')}
              <button type="button" style="background:${section.props.submit_color};color:${section.props.submit_text_color};padding:16px 26px;border-radius:999px;border:none;cursor:pointer;">${section.props.submit_text}</button>
            </form>
          </div>
        </section>`
    case 'footer':
      return `
        <footer style="background:${section.props.bg_color};color:${section.props.text_color};padding:40px 0;">
          <div style="max-width:1200px;margin:0 auto;text-align:center;">
            <p>${section.props.text}</p>
          </div>
        </footer>`
    default:
      return ''
  }
}
