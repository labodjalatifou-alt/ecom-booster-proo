'use client'

import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('@/components/store-builder/Editor'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-[#f1f2f4]">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Chargement de l&apos;éditeur...</p>
        </div>
    ),
})

interface EditorClientProps {
    storeId: string
    initialData: any
    products?: any[]
}

export default function EditorClient({ storeId, initialData, products }: EditorClientProps) {
    return (
        <Editor
            storeId={storeId}
            initialData={initialData}
            products={products}
        />
    )
}