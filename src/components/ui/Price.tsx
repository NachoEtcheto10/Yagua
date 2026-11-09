import { cn, discountPct, formatPrice } from '@/lib/format'

export function Price({
  price,
  salePrice,
  size = 'md',
  className,
}: {
  price: number
  salePrice: number | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const off = discountPct(price, salePrice)
  const current = off ? salePrice! : price
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2', className)}>
      <span
        className={cn(
          'font-semibold tabular-nums',
          off > 0 && 'text-brand-accent',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-3xl font-bold',
        )}
      >
        {formatPrice(current)}
      </span>
      {off > 0 && (
        <>
          <span className={cn('text-brand-muted line-through tabular-nums', size === 'lg' ? 'text-lg' : 'text-sm')}>{formatPrice(price)}</span>
          <span className={cn('font-semibold text-brand-accent', size === 'lg' ? 'text-base' : 'text-xs')}>-{off}%</span>
        </>
      )}
    </div>
  )
}
