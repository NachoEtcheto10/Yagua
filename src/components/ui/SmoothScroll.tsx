'use client'
import Lenis from 'lenis'
import { useEffect } from 'react'

/**
 * Scroll suave con inercia en toda la tienda (Lenis).
 * - Respeta "reducir movimiento" del sistema.
 * - Las listas con scroll propio (carrito, filtros, menú) siguen funcionando normal.
 * - Se frena cuando el menú del celular o el carrito bloquean el scroll de la página.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ autoRaf: true, allowNestedScroll: true, lerp: 0.1, anchors: { offset: -80 } })
    const sync = () => (document.body.style.overflow === 'hidden' ? lenis.stop() : lenis.start())
    const obs = new MutationObserver(sync)
    obs.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    return () => {
      obs.disconnect()
      lenis.destroy()
    }
  }, [])
  return null
}
