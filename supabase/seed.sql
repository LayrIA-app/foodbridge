-- ============================================================================
-- FoodBridge · Seed abundante para demos comerciales
-- ============================================================================
-- Modelo de negocio: el FABRICANTE (fabricante@test.com) es quien paga y
-- contrata la app. Sus distribuidores no necesitan cuenta; aparecen como
-- cliente_name denormalizado. El cliente@test.com representa UNO de esos
-- distribuidores que sí tiene acceso al portal (beta).
--
-- Pre-requisitos en Supabase Studio (ya hechos por Maria):
--   fabricante@test.com  -> profile.role = 'fabricante'
--   comercial@test.com   -> profile.role = 'comercial'
--   cliente@test.com     -> profile.role = 'cliente'
--
-- Migraciones requeridas (ejecutar antes si no lo has hecho):
--   001_comercial_reads_pedidos.sql
--   002_vistas_agregadas.sql
--   003_pedidos_cliente_name.sql  <- IMPORTANTE para este seed
--
-- Opcional: si creas comercial2@test.com y comercial3@test.com (role 'comercial')
-- desde Studio, el seed reparte cotizaciones y visitas entre los tres. Si no
-- existen, todo va al comercial principal.
--
-- Idempotente: usa ON CONFLICT / NOT EXISTS. Ejecutable multiples veces.
-- ============================================================================

do $$
declare
  v_fab    uuid;
  v_com    uuid;
  v_com2   uuid;
  v_com3   uuid;
  v_cli    uuid;

  -- Productos (15)
  v_p1   uuid; v_p2   uuid; v_p3   uuid; v_p4   uuid; v_p5   uuid;
  v_p6   uuid; v_p7   uuid; v_p8   uuid; v_p9   uuid; v_p10  uuid;
  v_p11  uuid; v_p12  uuid; v_p13  uuid; v_p14  uuid; v_p15  uuid;

  -- Cotizaciones reusables
  v_c_acc_1 uuid; v_c_acc_2 uuid; v_c_acc_3 uuid; v_c_acc_4 uuid; v_c_acc_5 uuid;
  v_c_acc_6 uuid; v_c_acc_7 uuid; v_c_acc_8 uuid;
begin
  select id into v_fab from public.profiles where email = 'fabricante@test.com';
  select id into v_com from public.profiles where email = 'comercial@test.com';
  select id into v_cli from public.profiles where email = 'cliente@test.com';
  -- Opcionales
  select id into v_com2 from public.profiles where email = 'comercial2@test.com';
  select id into v_com3 from public.profiles where email = 'comercial3@test.com';
  if v_com2 is null then v_com2 := v_com; end if;
  if v_com3 is null then v_com3 := v_com; end if;

  if v_fab is null or v_com is null or v_cli is null then
    raise exception 'Faltan profiles de prueba (fabricante/comercial/cliente@test.com)';
  end if;

  -- ================ PRODUCTOS (15) ================
  insert into public.products (fabricante_id, sku, name, description, unit, price_current, certifications, allergens)
  values
    (v_fab, 'HAR-W280',      'Harina Panadera W-280',       'Harina de trigo media fuerza para panificacion',      'kg', 0.85, array['IFS Food v8','BRC A+'],               array['gluten']),
    (v_fab, 'HAR-W380',      'Harina Fuerza W-380',         'Harina de trigo fuerza alta para bolleria',            'kg', 1.15, array['IFS Food v8','BRC'],                  array['gluten']),
    (v_fab, 'HAR-ECO-T110',  'Harina Ecologica T-110',      'Harina integral ecologica certificada CAECV',          'kg', 1.33, array['Eco CAECV','Bio EU'],                 array['gluten']),
    (v_fab, 'HAR-W260',      'Harina Panificable W-260',    'Harina panificable estandar sector horeca',            'kg', 0.79, array['IFS Food v8'],                        array['gluten']),
    (v_fab, 'SEM-DUR',       'Semola Trigo Duro',           'Semola de trigo duro para pasta artesana',             'kg', 0.81, array['IFS Food v8'],                        array['gluten']),
    (v_fab, 'HAR-INT150',    'Harina Integral T-150',       'Harina integral alta extraccion',                       'kg', 1.28, array['BRC Grade A'],                        array['gluten']),
    (v_fab, 'HAR-W450',      'Harina Gran Fuerza W-450',    'Harina gran fuerza para masas largas fermentaciones',  'kg', 1.42, array['IFS Food v8','BRC A+'],               array['gluten']),
    (v_fab, 'HAR-CEN130',    'Harina Centeno T-130',        'Harina de centeno para panes especiales',              'kg', 1.18, array['Eco CAECV'],                          array['gluten']),
    (v_fab, 'MAN-82',        'Mantequilla 82% MG',          'Mantequilla laminar profesional 82% materia grasa',    'kg', 7.20, array['IFS Food v8','Kosher'],               array['lacteos']),
    (v_fab, 'NAT-35',        'Nata 35% MG UHT',             'Nata UHT 35% materia grasa, envase 1 litro',           'l',  3.85, array['IFS Food v8'],                        array['lacteos']),
    (v_fab, 'LEC-UHT',       'Leche Entera UHT',            'Leche entera UHT envase brick',                        'l',  1.05, array['IFS Food v8'],                        array['lacteos']),
    (v_fab, 'QUE-MEZ',       'Queso Curado Mezcla',         'Queso curado mezcla oveja/vaca 6 meses',               'kg', 12.40, array['IFS Food v8','DOP'],                 array['lacteos']),
    (v_fab, 'YOG-BIO',       'Yogur Natural Bio 125g',      'Yogur natural ecologico, paquete 125g',                'ud', 0.95, array['Eco CAECV','Bio EU'],                 array['lacteos']),
    (v_fab, 'MAR-PF42',      'Margarina Profesional PF42',  'Margarina para hojaldre punto fusion 42C',             'kg', 4.30, array['IFS Food v8','RSPO'],                 array['soja']),
    (v_fab, 'COB-NEG55',     'Cobertura Negra 55%',         'Cobertura de chocolate negro 55% cacao',               'kg', 8.50, array['UTZ','Rainforest Alliance'],          array['soja','lacteos','frutos_secos'])
  on conflict (fabricante_id, sku) do nothing;

  select id into v_p1  from public.products where fabricante_id = v_fab and sku = 'HAR-W280';
  select id into v_p2  from public.products where fabricante_id = v_fab and sku = 'HAR-W380';
  select id into v_p3  from public.products where fabricante_id = v_fab and sku = 'HAR-ECO-T110';
  select id into v_p4  from public.products where fabricante_id = v_fab and sku = 'HAR-W260';
  select id into v_p5  from public.products where fabricante_id = v_fab and sku = 'SEM-DUR';
  select id into v_p6  from public.products where fabricante_id = v_fab and sku = 'HAR-INT150';
  select id into v_p7  from public.products where fabricante_id = v_fab and sku = 'HAR-W450';
  select id into v_p8  from public.products where fabricante_id = v_fab and sku = 'HAR-CEN130';
  select id into v_p9  from public.products where fabricante_id = v_fab and sku = 'MAN-82';
  select id into v_p10 from public.products where fabricante_id = v_fab and sku = 'NAT-35';
  select id into v_p11 from public.products where fabricante_id = v_fab and sku = 'LEC-UHT';
  select id into v_p12 from public.products where fabricante_id = v_fab and sku = 'QUE-MEZ';
  select id into v_p13 from public.products where fabricante_id = v_fab and sku = 'YOG-BIO';
  select id into v_p14 from public.products where fabricante_id = v_fab and sku = 'MAR-PF42';
  select id into v_p15 from public.products where fabricante_id = v_fab and sku = 'COB-NEG55';

  -- ================ TARIFAS · historico 90 dias (10) ================
  insert into public.tarifas (product_id, fabricante_id, price_before, price_after, effective_date, reason)
  select v_p1, v_fab, 0.79, 0.85, current_date - interval '75 days', 'Subida trigo panificable Q1 2026'
  where not exists (select 1 from public.tarifas where product_id = v_p1 and effective_date = current_date - interval '75 days');

  insert into public.tarifas (product_id, fabricante_id, price_before, price_after, effective_date, reason)
  select v_p2, v_fab, 1.08, 1.15, current_date - interval '60 days', 'Ajuste por coste materia prima'
  where not exists (select 1 from public.tarifas where product_id = v_p2 and effective_date = current_date - interval '60 days');

  insert into public.tarifas (product_id, fabricante_id, price_before, price_after, effective_date, reason)
  select v_p3, v_fab, 1.40, 1.33, current_date - interval '45 days', 'Bajada promocional linea eco'
  where not exists (select 1 from public.tarifas where product_id = v_p3 and effective_date = current_date - interval '45 days');

  insert into public.tarifas (product_id, fabricante_id, price_before, price_after, effective_date, reason)
  select v_p7, v_fab, 1.35, 1.42, current_date - interval '30 days', 'Revision trimestral grano fuerza'
  where not exists (select 1 from public.tarifas where product_id = v_p7 and effective_date = current_date - interval '30 days');

  insert into public.tarifas (product_id, fabricante_id, price_before, price_after, effective_date, reason)
  select v_p9, v_fab, 6.80, 7.20, current_date - interval '25 days', 'Coste leche cruda +5.8% OCM lacteos'
  where not exists (select 1 from public.tarifas where product_id = v_p9 and effective_date = current_date - interval '25 days');

  insert into public.tarifas (product_id, fabricante_id, price_before, price_after, effective_date, reason)
  select v_p10, v_fab, 3.60, 3.85, current_date - interval '20 days', 'Ajuste materia grasa nata UHT'
  where not exists (select 1 from public.tarifas where product_id = v_p10 and effective_date = current_date - interval '20 days');

  insert into public.tarifas (product_id, fabricante_id, price_before, price_after, effective_date, reason)
  select v_p12, v_fab, 11.80, 12.40, current_date - interval '18 days', 'Curacion 6m prolongada + leche DOP'
  where not exists (select 1 from public.tarifas where product_id = v_p12 and effective_date = current_date - interval '18 days');

  insert into public.tarifas (product_id, fabricante_id, price_before, price_after, effective_date, reason)
  select v_p14, v_fab, 4.10, 4.30, current_date - interval '12 days', 'RSPO certificada: premium aceite palma'
  where not exists (select 1 from public.tarifas where product_id = v_p14 and effective_date = current_date - interval '12 days');

  insert into public.tarifas (product_id, fabricante_id, price_before, price_after, effective_date, reason)
  select v_p15, v_fab, 8.20, 8.50, current_date - interval '8 days', 'Subida cacao internacional ICE-NY'
  where not exists (select 1 from public.tarifas where product_id = v_p15 and effective_date = current_date - interval '8 days');

  insert into public.tarifas (product_id, fabricante_id, price_before, price_after, effective_date, reason)
  select v_p5, v_fab, 0.76, 0.81, current_date - interval '5 days', 'Subida trigo duro Sicilia import'
  where not exists (select 1 from public.tarifas where product_id = v_p5 and effective_date = current_date - interval '5 days');

  -- ================ COTIZACIONES (25) ================
  -- Reparto entre 3 comerciales (si no existen, todos a v_com)
  -- Distribucion por estado: 5 draft, 8 sent, 9 accepted (-> pedidos), 2 rejected, 1 expired

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00421', v_com,  v_cli,  'Distribuciones SG',           v_p2,  'Harina Fuerza W-380',         v_fab, 5000, 'kg', 1.15, 18.3, 'accepted',  'Cliente habitual · entrega semanal', now() - interval '14 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00421');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00422', v_com,  v_cli,  'Distribuciones SG',           v_p1,  'Harina Panadera W-280',       v_fab, 8000, 'kg', 0.85, 17.6, 'accepted',  'Palet completo · descuento volumen', now() - interval '12 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00422');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00423', v_com,  v_cli,  'Distribuciones SG',           v_p3,  'Harina Ecologica T-110',      v_fab, 2000, 'kg', 1.33, 13.5, 'sent',      'Pendiente confirmacion stock eco', now() - interval '10 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00423');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00424', v_com,  null,   'Panaderias Leopold S.L.',     v_p1,  'Harina Panadera W-280',       v_fab, 3000, 'kg', 0.85, 18.0, 'accepted',  'Cliente Valencia centro', now() - interval '13 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00424');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00425', v_com,  null,   'Congelados Martz',            v_p14, 'Margarina Profesional PF42',  v_fab, 2000, 'kg', 4.30, 15.2, 'accepted',  'Pedido urgente masa hojaldre', now() - interval '11 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00425');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00426', v_com,  null,   'Dulces Iberia',               v_p15, 'Cobertura Negra 55%',         v_fab,  400, 'kg', 8.50, 21.4, 'accepted',  'Presentacion de nueva linea', now() - interval '9 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00426');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00427', v_com2, null,   'Bolleria Artesana Lux',       v_p2,  'Harina Fuerza W-380',         v_fab, 1500, 'kg', 1.15, 17.0, 'sent',      'Albacete · 1 visita pendiente', now() - interval '8 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00427');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00428', v_com2, null,   'Agrudispa',                   v_p14, 'Margarina Profesional PF42',  v_fab, 2000, 'kg', 4.30, 16.8, 'sent',      'Seguimiento Torrent', now() - interval '7 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00428');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00429', v_com,  null,   'Pasteleros del Sur',          v_p11, 'Leche Entera UHT',            v_fab, 3000, 'l',  1.05, 14.1, 'accepted',  'Cliente Sevilla', now() - interval '10 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00429');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00430', v_com2, null,   'Obrador Santa Clara',         v_p9,  'Mantequilla 82% MG',          v_fab,  250, 'kg', 7.20, 19.5, 'accepted',  'Pedido semanal recurrente', now() - interval '6 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00430');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00431', v_com3, null,   'Catering Levante',            v_p6,  'Harina Integral T-150',       v_fab,  800, 'kg', 1.28, 18.2, 'sent',      'Presentacion Levante', now() - interval '6 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00431');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00432', v_com,  null,   'Helados Artesanos MED',       v_p10, 'Nata 35% MG UHT',             v_fab, 1500, 'l',  3.85, 15.5, 'rejected',  'Precio fuera de rango competencia', now() - interval '20 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00432');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00433', v_com,  null,   'Panificadora Valencia',       v_p4,  'Harina Panificable W-260',    v_fab, 4000, 'kg', 0.79, 16.5, 'accepted',  'Distribuidor zona Levante', now() - interval '5 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00433');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00434', v_com3, null,   'Cerealia Distribucion',       v_p7,  'Harina Gran Fuerza W-450',    v_fab, 2500, 'kg', 1.42, 19.2, 'accepted',  'Cliente top facturacion anual', now() - interval '4 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00434');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00435', v_com2, null,   'Harinera del Tajo',           v_p8,  'Harina Centeno T-130',        v_fab,  600, 'kg', 1.18, 17.3, 'draft',     'Revisar margen antes de enviar', now() - interval '3 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00435');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00436', v_com,  null,   'Grupo Carnico Extremadura',   v_p11, 'Leche Entera UHT',            v_fab, 2000, 'l',  1.05, 13.8, 'draft',     'Pedido a confirmar', now() - interval '3 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00436');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00437', v_com,  null,   'Quesos La Mancha Selecta',    v_p11, 'Leche Entera UHT',            v_fab, 8000, 'l',  1.05, 12.4, 'sent',      'Gran cuenta · 2 semanas suministro', now() - interval '2 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00437');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00438', v_com3, null,   'Lacteos Asturcanos',          v_p10, 'Nata 35% MG UHT',             v_fab, 1200, 'l',  3.85, 16.0, 'sent',      'Contacto via feria alimentaria', now() - interval '2 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00438');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00439', v_com2, null,   'Conservas Ria Baja',          v_p5,  'Semola Trigo Duro',           v_fab, 1000, 'kg', 0.81, 14.7, 'draft',     'Pendiente confirmacion producto', now() - interval '1 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00439');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00440', v_com,  null,   'Congelados Mediterraneo',     v_p14, 'Margarina Profesional PF42',  v_fab,  800, 'kg', 4.30, 15.8, 'expired',   'Sin respuesta 30+ dias', now() - interval '35 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00440');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00441', v_com3, null,   'Horno Madrid Centro',         v_p1,  'Harina Panadera W-280',       v_fab, 2000, 'kg', 0.85, 17.0, 'accepted',  'Cliente Madrid centro', now() - interval '8 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00441');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00442', v_com,  null,   'Confiteria Cataluna Dulce',   v_p15, 'Cobertura Negra 55%',         v_fab,  200, 'kg', 8.50, 22.0, 'draft',     'Barcelona · presentacion catalogo', now() - interval '1 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00442');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00443', v_com,  v_cli,  'Distribuciones SG',           v_p12, 'Queso Curado Mezcla',         v_fab,  150, 'kg', 12.40,18.8, 'sent',      'Nueva linea quesos para SG', now() - interval '4 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00443');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00444', v_com2, null,   'Panaderias Leopold S.L.',     v_p13, 'Yogur Natural Bio 125g',      v_fab, 2000, 'ud', 0.95, 19.0, 'rejected',  'Cliente dice que aun no vende bio', now() - interval '15 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00444');

  insert into public.cotizaciones (ref, comercial_id, cliente_id, cliente_name, product_id, product_name, fabricante_id, quantity, unit, unit_price, margin_pct, status, notes, created_at)
  select 'COT-2026-00445', v_com,  v_cli,  'Distribuciones SG',           v_p9,  'Mantequilla 82% MG',          v_fab,  180, 'kg', 7.20, 18.5, 'accepted',  'Ampliacion catalogo SG', now() - interval '7 days'
  where not exists (select 1 from public.cotizaciones where ref = 'COT-2026-00445');

  -- Guardamos ids de cotizaciones accepted para crear pedidos enlazados
  select id into v_c_acc_1 from public.cotizaciones where ref = 'COT-2026-00421';
  select id into v_c_acc_2 from public.cotizaciones where ref = 'COT-2026-00422';
  select id into v_c_acc_3 from public.cotizaciones where ref = 'COT-2026-00424';
  select id into v_c_acc_4 from public.cotizaciones where ref = 'COT-2026-00425';
  select id into v_c_acc_5 from public.cotizaciones where ref = 'COT-2026-00426';
  select id into v_c_acc_6 from public.cotizaciones where ref = 'COT-2026-00429';
  select id into v_c_acc_7 from public.cotizaciones where ref = 'COT-2026-00445';
  select id into v_c_acc_8 from public.cotizaciones where ref = 'COT-2026-00433';

  -- ================ PEDIDOS (20) ================
  -- Distribucion: 4 placed, 4 confirmed, 5 in_transit, 5 delivered, 2 cancelled
  -- Los del v_cli los ve el cliente en su portal. El resto son clientes que no
  -- tienen cuenta (cliente_id=null) pero el fabricante los ve en sus KPIs.

  -- A. Pedidos del cliente@test.com (6) en distintos estados
  insert into public.pedidos (ref, cliente_id, cliente_name, fabricante_id, cotizacion_id, status, total_amount, expected_date, created_at)
  select 'PED-2026-00501', v_cli, 'Distribuciones SG', v_fab, v_c_acc_1, 'in_transit', 5750.00, current_date + interval '2 days', now() - interval '10 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00501');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p2, 'Harina Fuerza W-380', 5000, 'kg', 1.15 from public.pedidos p where p.ref = 'PED-2026-00501'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_id, cliente_name, fabricante_id, cotizacion_id, status, total_amount, delivered_at, created_at)
  select 'PED-2026-00502', v_cli, 'Distribuciones SG', v_fab, v_c_acc_2, 'delivered', 6800.00, now() - interval '2 days', now() - interval '9 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00502');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p1, 'Harina Panadera W-280', 8000, 'kg', 0.85 from public.pedidos p where p.ref = 'PED-2026-00502'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_id, cliente_name, fabricante_id, cotizacion_id, status, total_amount, expected_date, created_at)
  select 'PED-2026-00503', v_cli, 'Distribuciones SG', v_fab, v_c_acc_7, 'confirmed', 1296.00, current_date + interval '5 days', now() - interval '4 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00503');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p9, 'Mantequilla 82% MG', 180, 'kg', 7.20 from public.pedidos p where p.ref = 'PED-2026-00503'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_id, cliente_name, fabricante_id, status, total_amount, delivered_at, created_at)
  select 'PED-2026-00504', v_cli, 'Distribuciones SG', v_fab, 'delivered', 3990.00, now() - interval '18 days', now() - interval '25 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00504');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p11, 'Leche Entera UHT', 3800, 'l', 1.05 from public.pedidos p where p.ref = 'PED-2026-00504'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_id, cliente_name, fabricante_id, status, total_amount, delivered_at, created_at)
  select 'PED-2026-00505', v_cli, 'Distribuciones SG', v_fab, 'delivered', 2480.00, now() - interval '30 days', now() - interval '38 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00505');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p3, 'Harina Ecologica T-110', 1860, 'kg', 1.33 from public.pedidos p where p.ref = 'PED-2026-00505'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_id, cliente_name, fabricante_id, status, total_amount, expected_date, created_at)
  select 'PED-2026-00506', v_cli, 'Distribuciones SG', v_fab, 'placed', 860.00, current_date + interval '9 days', now() - interval '1 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00506');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p14, 'Margarina Profesional PF42', 200, 'kg', 4.30 from public.pedidos p where p.ref = 'PED-2026-00506'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  -- B. Pedidos de clientes ficticios (14)
  insert into public.pedidos (ref, cliente_name, fabricante_id, cotizacion_id, status, total_amount, expected_date, created_at)
  select 'PED-2026-00507', 'Panaderias Leopold S.L.',    v_fab, v_c_acc_3, 'in_transit',   2550.00, current_date + interval '1 days', now() - interval '11 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00507');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p1, 'Harina Panadera W-280', 3000, 'kg', 0.85 from public.pedidos p where p.ref = 'PED-2026-00507'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_name, fabricante_id, cotizacion_id, status, total_amount, expected_date, created_at)
  select 'PED-2026-00508', 'Congelados Martz',           v_fab, v_c_acc_4, 'confirmed',    8600.00, current_date + interval '3 days', now() - interval '8 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00508');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p14, 'Margarina Profesional PF42', 2000, 'kg', 4.30 from public.pedidos p where p.ref = 'PED-2026-00508'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_name, fabricante_id, cotizacion_id, status, total_amount, delivered_at, created_at)
  select 'PED-2026-00509', 'Dulces Iberia',              v_fab, v_c_acc_5, 'delivered',    3400.00, now() - interval '3 days', now() - interval '15 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00509');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p15, 'Cobertura Negra 55%', 400, 'kg', 8.50 from public.pedidos p where p.ref = 'PED-2026-00509'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_name, fabricante_id, cotizacion_id, status, total_amount, expected_date, created_at)
  select 'PED-2026-00510', 'Pasteleros del Sur',         v_fab, v_c_acc_6, 'in_transit',   3150.00, current_date + interval '2 days', now() - interval '7 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00510');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p11, 'Leche Entera UHT', 3000, 'l', 1.05 from public.pedidos p where p.ref = 'PED-2026-00510'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_name, fabricante_id, cotizacion_id, status, total_amount, expected_date, created_at)
  select 'PED-2026-00511', 'Panificadora Valencia',      v_fab, v_c_acc_8, 'placed',       3160.00, current_date + interval '6 days', now() - interval '2 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00511');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p4, 'Harina Panificable W-260', 4000, 'kg', 0.79 from public.pedidos p where p.ref = 'PED-2026-00511'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_name, fabricante_id, status, total_amount, delivered_at, created_at)
  select 'PED-2026-00512', 'Obrador Santa Clara',        v_fab, 'delivered',    1800.00, now() - interval '5 days', now() - interval '10 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00512');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p9, 'Mantequilla 82% MG', 250, 'kg', 7.20 from public.pedidos p where p.ref = 'PED-2026-00512'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_name, fabricante_id, status, total_amount, expected_date, created_at)
  select 'PED-2026-00513', 'Cerealia Distribucion',      v_fab, 'in_transit',   3550.00, current_date - interval '1 days', now() - interval '6 days'  -- retrasado
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00513');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p7, 'Harina Gran Fuerza W-450', 2500, 'kg', 1.42 from public.pedidos p where p.ref = 'PED-2026-00513'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_name, fabricante_id, status, total_amount, expected_date, created_at)
  select 'PED-2026-00514', 'Horno Madrid Centro',        v_fab, 'in_transit',   1700.00, current_date + interval '1 days', now() - interval '5 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00514');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p1, 'Harina Panadera W-280', 2000, 'kg', 0.85 from public.pedidos p where p.ref = 'PED-2026-00514'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_name, fabricante_id, status, total_amount, expected_date, created_at)
  select 'PED-2026-00515', 'Bolleria Artesana Lux',      v_fab, 'confirmed',    1725.00, current_date + interval '4 days', now() - interval '3 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00515');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p2, 'Harina Fuerza W-380', 1500, 'kg', 1.15 from public.pedidos p where p.ref = 'PED-2026-00515'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_name, fabricante_id, status, total_amount, delivered_at, created_at)
  select 'PED-2026-00516', 'Catering Levante',           v_fab, 'delivered',    1024.00, now() - interval '8 days', now() - interval '16 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00516');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p6, 'Harina Integral T-150', 800, 'kg', 1.28 from public.pedidos p where p.ref = 'PED-2026-00516'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_name, fabricante_id, status, total_amount, expected_date, created_at)
  select 'PED-2026-00517', 'Quesos La Mancha Selecta',   v_fab, 'placed',       8400.00, current_date + interval '8 days', now() - interval '1 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00517');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p11, 'Leche Entera UHT', 8000, 'l', 1.05 from public.pedidos p where p.ref = 'PED-2026-00517'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_name, fabricante_id, status, total_amount, delivered_at, created_at)
  select 'PED-2026-00518', 'Grupo Carnico Extremadura',  v_fab, 'delivered',    2100.00, now() - interval '22 days', now() - interval '30 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00518');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p11, 'Leche Entera UHT', 2000, 'l', 1.05 from public.pedidos p where p.ref = 'PED-2026-00518'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_name, fabricante_id, status, total_amount, expected_date, created_at)
  select 'PED-2026-00519', 'Confiteria Cataluna Dulce',  v_fab, 'cancelled',    1700.00, current_date + interval '10 days', now() - interval '6 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00519');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p15, 'Cobertura Negra 55%', 200, 'kg', 8.50 from public.pedidos p where p.ref = 'PED-2026-00519'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  insert into public.pedidos (ref, cliente_name, fabricante_id, status, total_amount, expected_date, created_at)
  select 'PED-2026-00520', 'Agrudispa',                  v_fab, 'cancelled',    8600.00, current_date + interval '5 days', now() - interval '14 days'
  where not exists (select 1 from public.pedidos where ref = 'PED-2026-00520');

  insert into public.pedido_lines (pedido_id, product_id, product_name, quantity, unit, unit_price)
  select p.id, v_p14, 'Margarina Profesional PF42', 2000, 'kg', 4.30 from public.pedidos p where p.ref = 'PED-2026-00520'
  and not exists (select 1 from public.pedido_lines l where l.pedido_id = p.id);

  -- ================ VISITAS (15) ================
  -- Mezcla: 6 hoy, 4 proximos 3 dias, 3 completadas semana pasada, 2 checked_in recientes

  -- HOY
  insert into public.visitas (comercial_id, cliente_id, cliente_name, location, scheduled_at, status)
  select v_com,  v_cli, 'Distribuciones SG',         'Valencia centro',    date_trunc('day', now()) + interval '9 hours',  'scheduled'
  where not exists (select 1 from public.visitas where comercial_id = v_com and cliente_name = 'Distribuciones SG' and scheduled_at = date_trunc('day', now()) + interval '9 hours');

  insert into public.visitas (comercial_id, cliente_name, location, scheduled_at, status)
  select v_com,  'Panaderias Leopold S.L.',          'Valencia · Plaza del Ayto',  date_trunc('day', now()) + interval '10 hours 30 minutes', 'scheduled'
  where not exists (select 1 from public.visitas where comercial_id = v_com and cliente_name = 'Panaderias Leopold S.L.' and scheduled_at = date_trunc('day', now()) + interval '10 hours 30 minutes');

  insert into public.visitas (comercial_id, cliente_name, location, scheduled_at, status)
  select v_com,  'Congelados Martz',                 'Paterna · Pol. Fuente Jarro', date_trunc('day', now()) + interval '12 hours 30 minutes', 'scheduled'
  where not exists (select 1 from public.visitas where comercial_id = v_com and cliente_name = 'Congelados Martz' and scheduled_at = date_trunc('day', now()) + interval '12 hours 30 minutes');

  insert into public.visitas (comercial_id, cliente_name, location, scheduled_at, status)
  select v_com,  'Dulces Iberia',                    'Manises · Pol. Ind. la Cova', date_trunc('day', now()) + interval '15 hours', 'scheduled'
  where not exists (select 1 from public.visitas where comercial_id = v_com and cliente_name = 'Dulces Iberia' and scheduled_at = date_trunc('day', now()) + interval '15 hours');

  insert into public.visitas (comercial_id, cliente_name, location, scheduled_at, status)
  select v_com,  'Agrudispa',                        'Torrent · Avda del Pais Valencia', date_trunc('day', now()) + interval '17 hours', 'scheduled'
  where not exists (select 1 from public.visitas where comercial_id = v_com and cliente_name = 'Agrudispa' and scheduled_at = date_trunc('day', now()) + interval '17 hours');

  insert into public.visitas (comercial_id, cliente_name, location, scheduled_at, status, checkin_at, checkin_lat, checkin_lng)
  select v_com,  'Bolleria Artesana Lux',            'Albacete · C/ del Rosal',   date_trunc('day', now()) - interval '2 hours',  'checked_in', date_trunc('day', now()) - interval '1 hours 45 minutes', 38.9943, -1.8585
  where not exists (select 1 from public.visitas where comercial_id = v_com and cliente_name = 'Bolleria Artesana Lux' and scheduled_at = date_trunc('day', now()) - interval '2 hours');

  -- PROXIMOS DIAS
  insert into public.visitas (comercial_id, cliente_name, location, scheduled_at, status)
  select v_com2, 'Pasteleros del Sur',               'Sevilla · Nervion',         date_trunc('day', now()) + interval '1 day' + interval '10 hours', 'scheduled'
  where not exists (select 1 from public.visitas where comercial_id = v_com2 and cliente_name = 'Pasteleros del Sur' and scheduled_at = date_trunc('day', now()) + interval '1 day' + interval '10 hours');

  insert into public.visitas (comercial_id, cliente_name, location, scheduled_at, status)
  select v_com2, 'Harinera del Tajo',                'Toledo · Pol. Santa Maria', date_trunc('day', now()) + interval '1 day' + interval '13 hours', 'scheduled'
  where not exists (select 1 from public.visitas where comercial_id = v_com2 and cliente_name = 'Harinera del Tajo' and scheduled_at = date_trunc('day', now()) + interval '1 day' + interval '13 hours');

  insert into public.visitas (comercial_id, cliente_name, location, scheduled_at, status)
  select v_com3, 'Cerealia Distribucion',            'Madrid · Vallecas',         date_trunc('day', now()) + interval '2 days' + interval '11 hours', 'scheduled'
  where not exists (select 1 from public.visitas where comercial_id = v_com3 and cliente_name = 'Cerealia Distribucion' and scheduled_at = date_trunc('day', now()) + interval '2 days' + interval '11 hours');

  insert into public.visitas (comercial_id, cliente_name, location, scheduled_at, status)
  select v_com3, 'Lacteos Asturcanos',               'Oviedo · Pumarin',          date_trunc('day', now()) + interval '3 days' + interval '10 hours 30 minutes', 'scheduled'
  where not exists (select 1 from public.visitas where comercial_id = v_com3 and cliente_name = 'Lacteos Asturcanos' and scheduled_at = date_trunc('day', now()) + interval '3 days' + interval '10 hours 30 minutes');

  -- COMPLETADAS (semana pasada)
  insert into public.visitas (comercial_id, cliente_name, location, scheduled_at, status, checkin_at, outcome, notes)
  select v_com,  'Quesos La Mancha Selecta',         'Albacete · Polig. Campollano', date_trunc('day', now()) - interval '5 days' + interval '11 hours', 'completed', date_trunc('day', now()) - interval '5 days' + interval '11 hours 10 minutes', 'Cotizacion generada', 'Cliente abierto a comprar volumen alto leche UHT Q2'
  where not exists (select 1 from public.visitas where comercial_id = v_com and cliente_name = 'Quesos La Mancha Selecta' and status = 'completed');

  insert into public.visitas (comercial_id, cliente_name, location, scheduled_at, status, checkin_at, outcome, notes)
  select v_com,  'Conservas Ria Baja',               'Vigo · Cabral',              date_trunc('day', now()) - interval '6 days' + interval '16 hours', 'completed', date_trunc('day', now()) - interval '6 days' + interval '16 hours 5 minutes', 'Pedido pequeno', 'Empieza con 1000kg semola · evaluar plazo'
  where not exists (select 1 from public.visitas where comercial_id = v_com and cliente_name = 'Conservas Ria Baja' and status = 'completed');

  insert into public.visitas (comercial_id, cliente_name, location, scheduled_at, status, checkin_at, outcome, notes)
  select v_com2, 'Helados Artesanos MED',            'Alicante · San Gabriel',     date_trunc('day', now()) - interval '8 days' + interval '12 hours', 'completed', date_trunc('day', now()) - interval '8 days' + interval '12 hours 10 minutes', 'Sin pedido', 'Cotizacion rechazada por precio. Recuperable en Q2'
  where not exists (select 1 from public.visitas where comercial_id = v_com2 and cliente_name = 'Helados Artesanos MED' and status = 'completed');

  insert into public.visitas (comercial_id, cliente_name, location, scheduled_at, status, checkin_at, outcome, notes)
  select v_com3, 'Grupo Carnico Extremadura',        'Badajoz · Pol. El Nevero',   date_trunc('day', now()) - interval '10 days' + interval '10 hours', 'completed', date_trunc('day', now()) - interval '10 days' + interval '10 hours 5 minutes', 'Pedido confirmado', 'Entrega semanal de leche UHT iniciada'
  where not exists (select 1 from public.visitas where comercial_id = v_com3 and cliente_name = 'Grupo Carnico Extremadura' and status = 'completed');

  insert into public.visitas (comercial_id, cliente_name, location, scheduled_at, status, checkin_at, outcome, notes)
  select v_com3, 'Horno Madrid Centro',              'Madrid · Chamberi',          date_trunc('day', now()) - interval '12 days' + interval '9 hours', 'completed', date_trunc('day', now()) - interval '12 days' + interval '9 hours 10 minutes', 'Cotizacion generada', 'Visita tecnica exitosa. Solicitan nueva linea de pan de masa madre'
  where not exists (select 1 from public.visitas where comercial_id = v_com3 and cliente_name = 'Horno Madrid Centro' and status = 'completed');

  raise notice 'Seed ampliado completado. Recarga FoodBridge para ver los datos abundantes.';
end $$;

-- Verificacion final
select 'products'     as tabla, count(*) as total from public.products
 where fabricante_id = (select id from public.profiles where email='fabricante@test.com')
union all select 'tarifas',      count(*) from public.tarifas      where fabricante_id = (select id from public.profiles where email='fabricante@test.com')
union all select 'cotizaciones', count(*) from public.cotizaciones where fabricante_id  = (select id from public.profiles where email='fabricante@test.com')
union all select 'pedidos',      count(*) from public.pedidos      where fabricante_id = (select id from public.profiles where email='fabricante@test.com')
union all select 'pedidos_cliente', count(*) from public.pedidos   where cliente_id    = (select id from public.profiles where email='cliente@test.com')
union all select 'visitas',      count(*) from public.visitas;
