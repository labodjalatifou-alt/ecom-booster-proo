// Layout plein écran pour l'éditeur — retire la sidebar globale
export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen overflow-hidden bg-gray-100">
      {children}
    </div>
  )
}
