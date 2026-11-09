'use client'
import { Search, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { formatPrice } from '@/lib/format'
import type { ProductCardData } from '@/features/catalog/queries'

/** Buscador con sugerencias en vivo (debounce 250 ms) */
export function SearchBox({ autoFocus, onNavigate }: { autoFocus?: boolean; onNavigate?: () => void }) {
  const router = useRouter()
  const listId = useId()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<ProductCardData[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        if (res.ok) setResults(await res.json())
      } catch {
        /* búsqueda cancelada */
      }
    }, 250)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [q])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const go = (href: string) => {
    setOpen(false)
    setQ('')
    onNavigate?.()
    router.push(href)
  }

  return (
    <div ref={box} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          if (active >= 0 && results[active]) go(results[active].href)
          else if (q.trim()) go(`/buscar?q=${encodeURIComponent(q.trim())}`)
        }}
        className="flex items-center gap-2 bg-brand-mist px-3"
      >
        <Search size={18} className="shrink-0 text-brand-muted" aria-hidden />
        <input
          type="search"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
            setActive(-1)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') setActive((a) => Math.min(results.length - 1, a + 1))
            if (e.key === 'ArrowUp') setActive((a) => Math.max(-1, a - 1))
            if (e.key === 'Escape') setOpen(false)
          }}
          placeholder="Buscar"
          aria-label="Buscar productos"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          className="h-10 w-full bg-transparent text-[16px] outline-none placeholder:text-brand-muted sm:text-sm"
        />
        {q && (
          <button type="button" onClick={() => setQ('')} aria-label="Borrar búsqueda" className="text-brand-muted">
            <X size={16} />
          </button>
        )}
      </form>
      {open && results.length > 0 && (
        <ul id={listId} role="listbox" className="absolute right-0 top-full z-50 mt-1 w-full min-w-[320px] border border-brand-line bg-white shadow-xl">
          {results.map((r, i) => (
            <li key={r.id} role="option" aria-selected={i === active}>
              <Link
                href={r.href}
                onClick={(e) => {
                  e.preventDefault()
                  go(r.href)
                }}
                className={`flex items-center gap-3 px-3 py-2 ${i === active ? 'bg-brand-mist' : 'hover:bg-brand-mist'}`}
              >
                <span className="relative h-12 w-12 shrink-0 bg-brand-mist">
                  {r.images[0] && <Image src={r.images[0].url} alt="" fill sizes="48px" className="object-contain p-1" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{r.name}</span>
                  <span className="block text-xs text-brand-muted">{r.sportName}</span>
                </span>
                <span className="text-sm font-semibold tabular-nums">{formatPrice(r.salePrice ?? r.price)}</span>
              </Link>
            </li>
          ))}
          <li>
            <button type="button" onClick={() => go(`/buscar?q=${encodeURIComponent(q.trim())}`)} className="w-full border-t border-brand-line px-3 py-2.5 text-left text-sm font-semibold hover:bg-brand-mist">
              Ver todos los resultados de “{q}”
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
