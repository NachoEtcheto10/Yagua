'use client'
import Lenis from 'lenis'
import { useEffect } from 'react'

/**
 * Scroll suave con inercia en toda la tienda (Lenis).
 * - Respeta "reducir movimiento" del sistema.
 * - Las listas con scroll propio (carrito, filtros, menú) siguen funcionando normal.
 * - Se frena cuando el menú del celular o el carrito bloquean el scroll de la página.
 */
let current: Lenis | null = null
/** La instancia activa (null si el sistema pide reducir movimiento) */
export const getLenis = () => current

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ autoRaf: true, allowNestedScroll: true, lerp: 0.1, anchors: { offset: -80 } })
    current = lenis
    const sync = () => (document.body.style.overflow === 'hidden' ? lenis.stop() : lenis.start())
    const obs = new MutationObserver(sync)
    obs.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    return () => {
      obs.disconnect()
      lenis.destroy()
      current = null
    }
  }, [])
  return null
}
