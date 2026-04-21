-- ============================================================================
-- Migracion 003 · Pedidos con cliente_name denormalizado (multi-tenant soft)
-- ============================================================================
-- Hasta ahora pedidos.cliente_id era NOT NULL referenciando auth.users. Eso
-- obligaba a crear un auth.user por cada distribuidor comprador, inviable
-- para demos y para el modelo real (el FABRICANTE es quien paga y gestiona;
-- sus distribuidores no tienen necesariamente cuenta en la app).
--
-- Esta migracion:
--   1. Hace cliente_id nullable
--   2. Anade cliente_name denormalizado
--   3. Recrea las vistas agregadas para contar clientes unicos por
--      coalesce(cliente_id, cliente_name)
--   4. Actualiza la policy de cliente para que solo vea pedidos donde
--      cliente_id = su uid (los con cliente_id=null no son "suyos")
--
-- Idempotente. Pegar en Supabase Studio -> SQL Editor.
-- ============================================================================

-- 1. Cliente_id nullable
alter table public.pedidos
  alter column cliente_id drop not null;

-- 2. cliente_name denormalizado (si no existe)
alter table public.pedidos
  add column if not exists cliente_name text;

-- Policy: cliente solo ve pedidos con su uid (sigue igual, no hace falta cambio)
-- Pero aseguramos policy de INSERT/UPDATE permite cliente_id null
-- (el cliente no inserta pedidos sin cliente_id asi que OK).


-- 3. Recrear vistas agregadas contando clientes unicos por coalesce
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
  count(distinct coalesce(p.cliente_id::text, p.cliente_name))              as clientes_unicos,
  coalesce(
    sum(p.total_amount) filter (where p.status = 'delivered')::numeric
    / nullif(count(*) filter (where p.status = 'delivered'), 0),
    0
  )                                                                          as ticket_medio,
  count(*) filter (where p.expected_date < now() and p.status not in ('delivered','cancelled')) as pedidos_retrasados
from public.pedidos p
group by p.fabricante_id;
grant select on public.v_fabricante_kpis to authenticated;

drop view if exists public.v_fabricante_ventas_cliente cascade;
create view public.v_fabricante_ventas_cliente
  with (security_invoker = on)
as
select
  p.fabricante_id,
  p.cliente_id,
  coalesce(p.cliente_name, 'Cliente sin nombre')        as cliente_name,
  count(*)                                              as num_pedidos,
  count(*) filter (where p.status = 'delivered')        as pedidos_delivered,
  coalesce(sum(p.total_amount) filter (where p.status = 'delivered'), 0) as facturacion,
  max(p.created_at)                                     as ultimo_pedido_at
from public.pedidos p
group by p.fabricante_id, p.cliente_id, p.cliente_name;
grant select on public.v_fabricante_ventas_cliente to authenticated;

-- Verificacion
select 'Migracion 003 aplicada. cliente_id nullable, cliente_name anadido, vistas refrescadas.' as status;
