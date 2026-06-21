'use client'

export default function TextBlockRender({ settings }: { settings: Record<string, any> }) {
  const content = settings.content ?? 'Votre texte ici...'
  const textAlign = settings.text_align ?? 'center' // left, center, right
  const bgColor = settings.bg_color ?? '#ffffff'
  const textColor = settings.text_color ?? '#111827'

  return (
    <div 
      className="w-full py-8 px-4 md:px-8 rounded-xl"
      style={{ backgroundColor: bgColor, color: textColor, textAlign: textAlign as any }}
    >
      <div className="prose max-w-none whitespace-pre-wrap font-medium">
        {content}
      </div>
    </div>
  )
}
