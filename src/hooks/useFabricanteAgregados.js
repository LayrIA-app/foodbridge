import { useSupabaseList } from './useSupabaseList'

/** KPIs agregados del fabricante (1 fila). */
export function useFabricanteKpis({ profile }) {
  const enabled = !!profile?.id && profile.role === 'fabricante'
  const { rows, loading, error, refresh } = useSupabaseList({
    table: 'v_fabricante_kpis',
    select: 'fabricante_id, pedidos_activos, pedidos_delivered, pedidos_cancelled, facturacion_delivered, facturacion_total, clientes_unicos, ticket_medio, pedidos_retrasados',
    enabled,
    filter: (q) => q.eq('fabricante_id', profile?.id).limit(1),
  })
  const kpis = rows[0] || {
    pedidos_activos: 0, pedidos_delivered: 0, pedidos_cancelled: 0,
    facturacion_delivered: 0, facturacion_total: 0,
    clientes_unicos: 0, ticket_medio: 0, pedidos_retrasados: 0,
  }
  return { kpis, loading, error, refresh }
}

/** Rentabilidad por producto del fabricante. */
export function useFabricanteRentabilidad({ profile }) {
  const enabled = !!profile?.id && profile.role === 'fabricante'
  const { rows, loading, error, refresh } = useSupabaseList({
    table: 'v_fabricante_rentabilidad',
    select: 'product_id, product_name, sku, price_current, unit, cantidad_total, facturacion_total, num_pedidos, clientes_unicos',
    enabled,
    filter: (q) => q.eq('fabricante_id', profile?.id).order('facturacion_total', { ascending: false }),
  })
  return { filas: rows, loading, error, refresh }
}

/** Ventas por cliente del fabricante (1 fila por cliente). */
export function useFabricanteVentasCliente({ profile }) {
  const enabled = !!profile?.id && profile.role === 'fabricante'
  const { rows, loading, error, refresh } = useSupabaseList({
    table: 'v_fabricante_ventas_cliente',
    select: 'cliente_id, num_pedidos, pedidos_delivered, facturacion, ultimo_pedido_at',
    enabled,
    filter: (q) => q.eq('fabricante_id', profile?.id).order('facturacion', { ascending: false }),
  })
  return { filas: rows, loading, error, refresh }
}
