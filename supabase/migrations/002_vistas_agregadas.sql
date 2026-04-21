-- ============================================================================
-- Migracion 002 · Vistas agregadas para el Dashboard del fabricante
-- ============================================================================
-- Pegar en Supabase Studio -> SQL Editor -> Run.
-- Idempotente (drop view if exists).
--
-- Que hace:
--  - v_fabricante_kpis: una fila por fabricante con sus KPIs agregados
--  - v_fabricante_rentabilidad: una fila por producto con cantidades y total vendido
--  - v_fabricante_ventas_cliente: una fila por cliente con total comprado
--
-- Las vistas usan security_invoker = on para que RLS aplique por fila
-- segun el usuario que consulta (solo su propio fabricante_id visible).
-- ============================================================================

drop view if exists public.v_fabricante_kpis cascade;
create view public.v_fabricante_kpis
  with (security_invoker = on)
as
select
  p.fabricante_id,
  count(*) filter (where p.status in ('placed','confirmed','in_transit')) as pedidos_activos,
  count(*) filter (where p.status = 'delivered')                           as pedidos_delivered,
  count(*) filter (where p.status = 'cancelled')                            as pedidos_cancelled,
  coalesce(sum(p.total_amount) filter (where p.status = 'delivered'), 0)    as facturacion_delivered,
  coalesce(sum(p.total_amount) filter (where p.status in ('placed','confirmed','in_transit','delivered')), 0) as facturacion_total,
  count(distinct p.cliente_id)                                              as clientes_unicos,
  coalesce(
    sum(p.total_amount) filter (where p.status = 'delivered')::numeric
    / nullif(count(*) filter (where p.status = 'delivered'), 0),
    0
  )                                                                          as ticket_medio,
  count(*) filter (where p.expected_date < now() and p.status not in ('delivered','cancelled')) as pedidos_retrasados
from public.pedidos p
group by p.fabricante_id;

grant select on public.v_fabricante_kpis to authenticated;


drop view if exists public.v_fabricante_rentabilidad cascade;
create view public.v_fabricante_rentabilidad
  with (security_invoker = on)
as
select
  pr.id                                    as product_id,
  pr.fabricante_id,
  pr.name                                  as product_name,
  pr.sku,
  pr.price_current,
  pr.unit,
  coalesce(sum(pl.quantity), 0)            as cantidad_total,
  coalesce(sum(pl.line_total), 0)          as facturacion_total,
  count(distinct pl.pedido_id)             as num_pedidos,
  count(distinct pe.cliente_id)            as clientes_unicos
from public.products pr
left join public.pedido_lines pl on pl.product_id = pr.id
left join public.pedidos pe      on pe.id = pl.pedido_id and pe.status = 'delivered'
group by pr.id, pr.fabricante_id, pr.name, pr.sku, pr.price_current, pr.unit;

grant select on public.v_fabricante_rentabilidad to authenticated;


drop view if exists public.v_fabricante_ventas_cliente cascade;
create view public.v_fabricante_ventas_cliente
  with (security_invoker = on)
as
select
  p.fabricante_id,
  p.cliente_id,
  count(*)                                 as num_pedidos,
  count(*) filter (where p.status = 'delivered') as pedidos_delivered,
  coalesce(sum(p.total_amount) filter (where p.status = 'delivered'), 0) as facturacion,
  max(p.created_at)                        as ultimo_pedido_at
from public.pedidos p
group by p.fabricante_id, p.cliente_id;

grant select on public.v_fabricante_ventas_cliente to authenticated;


-- Verificacion
select 'v_fabricante_kpis' as vista, count(*) as filas_visibles from public.v_fabricante_kpis
union all select 'v_fabricante_rentabilidad', count(*) from public.v_fabricante_rentabilidad
union all select 'v_fabricante_ventas_cliente', count(*) from public.v_fabricante_ventas_cliente;
