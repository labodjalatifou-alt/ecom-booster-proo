export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen overflow-hidden bg-[#f1f2f4]">
      {children}
    </div>
  )
}
