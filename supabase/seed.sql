-- ============================================================================
-- FoodBridge · Seed OPCIONAL para los 3 usuarios de prueba
-- ============================================================================
-- Ejecutar en Supabase Studio -> SQL Editor -> Run.
-- Requiere que los 3 users ya tengan profile con role asignado:
--   fabricante@test.com -> role fabricante
--   comercial@test.com  -> role comercial
--   cliente@test.com    -> role cliente
--
-- Seguro de ejecutar varias veces: usa ON CONFLICT para no duplicar.
-- ============================================================================

do $$
declare
  v_fab    uuid;
  v_com    uuid;
  v_cli    uuid;
  v_prod1  uuid;
  v_prod2  uuid;
  v_prod3  uuid;
  v_cot1   uuid;
begin
  select id into v_fab from public.profiles where email = 'fabricante@test.com';
  select id into v_com from public.profiles where email = 'comercial@test.com';
  select id into v_cli from public.profiles where email = 'cliente@test.com';

  if v_fab is null or v_com is null or v_cli is null then
    raise exception 'Faltan profiles de prueba (fabricante/comercial/cliente@test.com)';
  end if;

  -- =========== PRODUCTOS ===========
  insert into public.products (fabricante_id, sku, name, description, unit, price_current, certifications, allergens)
  values
    (v_fab, 'HAR-W280', 'Harina W-280',      'Harina de trigo media fuerza',  'kg', 0.85, array['IFS','Ecolabel'],   array['gluten']),
    (v_fab, 'HAR-W380', 'Harina W-380',      'Harina de trigo fuerza alta',   'kg', 1.15, array['IFS','BRC'],         array['gluten']),
    (v_fab, 'HAR-ECO-T110', 'Harina Eco T-110', 'Harina integral ecologica',  'kg', 1.33, array['Eco','Bio'],         array['gluten'])
  on conflict (fabricante_id, sku) do nothing;

  select id into v_prod1 from public.products where fabricante_id = v_fab and sku = 'HAR-W280';
  select id into v_prod2 from public.products where fabricante_id = v_fab and sku = 'HAR-W380';
  select id into v_prod3 from public.products where fabricante_id = v_fab and sku = 'HAR-ECO-T110';

  -- =========== TARIFAS (historico de precios) ===========
  insert into public.tarifas (product_id, fabricante_id, price_before, price_after, effective_date, reason)
  select v_prod1, v_fab, 0.79, 0.85, current_date - interval '45 days', 'Ajuste Q1 materias primas'
  where not exists (select 1 from public.tarifas where product_id = v_prod1 and effective_date = current_date - interval '45 days');

  insert into public.tarifas (product_id, fabricante_id, price_before, price_after, effective_date, reason)
  select v_prod2, v_fab, 1.08, 1.15, current_date - interval '30 days', 'Subida trigo panificable'
  where not exists (select 1 from public.tarifas where product_id = v_prod2 and effective_date = current_date - interval '30 days');

  -- =========== COTIZACIONES ===========
  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status)
  select 'COT-2026-00421', v_com, v_cli, 'Distribuciones SG',
         v_prod2, 'Harina W-380', v_fab, 5000, 'kg', 1.15, 18.3, 'sent'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00421');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status)
  select 'COT-2026-00422', v_com, v_cli, 'Distribuciones SG',
         v_prod1, 'Harina W-280', v_fab, 8000, 'kg', 0.85, 17.6, 'accepted'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00422');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status)
  select 'COT-2026-00423', v_com, v_cli, 'Distribuciones SG',
         v_prod3, 'Harina Eco T-110', v_fab, 2000, 'kg', 1.33, 13.5, 'draft'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00423');

  select id into v_cot1 from public.cotizaciones where ref = 'COT-2026-00422';

  -- =========== PEDIDOS ===========
  insert into public.pedidos (ref, cliente_id, fabricante_id, cotizacion_id, status, total_amount, expected_date)
  select 'PED-2026-00387', v_cli, v_fab, v_cot1, 'in_transit', 6800.00, current_date + interval '2 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00387');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select id, v_prod1, 'Harina W-280', 8000, 'kg', 0.85
  from public.pedidos where ref = 'PED-2026-00387'
  and not exists (
    select 1 from public.pedido_lines pl
    join public.pedidos p on p.id = pl.pedido_id
    where p.ref = 'PED-2026-00387' and pl.product_id = v_prod1
  );

  insert into public.pedidos (ref, cliente_id, fabricante_id, status, total_amount, expected_date)
  select 'PED-2026-00388', v_cli, v_fab, 'confirmed', 5750.00, current_date + interval '5 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00388');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select id, v_prod2, 'Harina W-380', 5000, 'kg', 1.15
  from public.pedidos where ref = 'PED-2026-00388'
  and not exists (
    select 1 from public.pedido_lines pl
    join public.pedidos p on p.id = pl.pedido_id
    where p.ref = 'PED-2026-00388' and pl.product_id = v_prod2
  );

  insert into public.pedidos (ref, cliente_id, fabricante_id, status, total_amount, delivered_at)
  select 'PED-2026-00386', v_cli, v_fab, 'delivered', 2660.00, now() - interval '7 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00386');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select id, v_prod3, 'Harina Eco T-110', 2000, 'kg', 1.33
  from public.pedidos where ref = 'PED-2026-00386'
  and not exists (
    select 1 from public.pedido_lines pl
    join public.pedidos p on p.id = pl.pedido_id
    where p.ref = 'PED-2026-00386' and pl.product_id = v_prod3
  );

  -- =========== VISITAS ===========
  insert into public.visitas (comercial_id, cliente_id, cliente_name, location, scheduled_at, status)
  select v_com, v_cli, 'Distribuciones SG', 'Valencia centro',
         date_trunc('day', now()) + interval '10 hours', 'scheduled'
  where not exists (
    select 1 from public.visitas
    where comercial_id = v_com and cliente_name = 'Distribuciones SG'
    and scheduled_at = date_trunc('day', now()) + interval '10 hours'
  );

  insert into public.visitas (comercial_id, cliente_name, location, scheduled_at, status)
  select v_com, 'Panaderias Leopold', 'Paterna',
         date_trunc('day', now()) + interval '12 hours 30 minutes', 'scheduled'
  where not exists (
    select 1 from public.visitas
    where comercial_id = v_com and cliente_name = 'Panaderias Leopold'
    and scheduled_at = date_trunc('day', now()) + interval '12 hours 30 minutes'
  );

  insert into public.visitas (comercial_id, cliente_name, location, scheduled_at, status)
  select v_com, 'Dulces Iberia', 'Manises',
         date_trunc('day', now()) + interval '16 hours', 'scheduled'
  where not exists (
    select 1 from public.visitas
    where comercial_id = v_com and cliente_name = 'Dulces Iberia'
    and scheduled_at = date_trunc('day', now()) + interval '16 hours'
  );

  raise notice 'Seed completado. Recarga FoodBridge para ver los datos.';
end $$;

-- Verificacion final
select 'products'     as tabla, count(*) as total from public.products     where fabricante_id = (select id from public.profiles where email='fabricante@test.com')
union all select 'tarifas',      count(*) from public.tarifas      where fabricante_id = (select id from public.profiles where email='fabricante@test.com')
union all select 'cotizaciones', count(*) from public.cotizaciones where comercial_id  = (select id from public.profiles where email='comercial@test.com')
union all select 'pedidos',      count(*) from public.pedidos      where cliente_id    = (select id from public.profiles where email='cliente@test.com')
union all select 'visitas',      count(*) from public.visitas      where comercial_id  = (select id from public.profiles where email='comercial@test.com');
