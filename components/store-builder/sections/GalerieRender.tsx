'use client'
/**
 * Section "Galerie" déplaçable.
 * Réutilise MediasRender et lit les images du produit sélectionné.
 * C'est un simple wrapper typé pour le flux linéaire.
 */
import MediasRender from './MediasRender'

export default function GalerieRender({ product }: { product?: any }) {
  const images: string[] = product?.images?.length
    ? product.images
    : product?.image_url
    ? [product.image_url]
    : []
  return <MediasRender settings={{ images }} />
}
