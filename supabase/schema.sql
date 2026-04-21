-- ============================================================================
-- FoodBridge IA · Supabase schema
-- ============================================================================
-- Pegar en: Supabase Studio -> SQL Editor -> New query -> Run.
-- Se puede ejecutar varias veces sin romper (usa DROP IF EXISTS donde procede).
--
-- Decisiones tomadas:
--  - Auth simple (sin organizations / multi-tenant — se añade en una fase posterior)
--  - Invite-only: Maria crea cuentas desde Studio y asigna el role a mano
--  - 3 roles: 'fabricante' | 'comercial' | 'cliente'
--  - RLS activado en todas las tablas
-- ============================================================================

-- ============================================================================
-- 1. TABLA profiles — extiende auth.users con role y datos públicos
-- ============================================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text unique not null,
  full_name     text,
  role          text check (role in ('fabricante', 'comercial', 'cliente')),
  company_name  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on column public.profiles.role is
  'Rol del usuario. NULL tras signup; Maria lo asigna desde Studio antes de que el usuario entre.';

alter table public.profiles enable row level security;

drop policy if exists "profiles: user reads own profile" on public.profiles;
create policy "profiles: user reads own profile"
  on public.profiles for select
  using ( auth.uid() = id );

drop policy if exists "profiles: user updates own profile" on public.profiles;
create policy "profiles: user updates own profile"
  on public.profiles for update
  using ( auth.uid() = id )
  with check ( auth.uid() = id );

-- Helper para leer el role del usuario actual desde otras policies sin recursion
create or replace function public.current_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;


-- ============================================================================
-- 2. TRIGGER — crear profile automáticamente al registrar un user en auth.users
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================================
-- 3. TABLA products — catálogo del fabricante
-- ============================================================================
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  fabricante_id     uuid not null references public.profiles (id) on delete cascade,
  sku               text not null,
  name              text not null,
  description       text,
  unit              text not null default 'kg',
  price_current     numeric(10,4) not null,
  price_currency    text not null default 'EUR',
  certifications    text[] default '{}',       -- ['IFS', 'BRC', 'Eco', ...]
  allergens         text[] default '{}',
  active            boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (fabricante_id, sku)
);

create index if not exists idx_products_fabricante on public.products (fabricante_id);
create index if not exists idx_products_active on public.products (active) where active;

alter table public.products enable row level security;

-- Comercial y cliente leen todo el catálogo (es público al mercado).
drop policy if exists "products: read all authenticated" on public.products;
create policy "products: read all authenticated"
  on public.products for select
  to authenticated
  using ( true );

-- El fabricante gestiona solo sus propios productos.
drop policy if exists "products: fabricante manages own" on public.products;
create policy "products: fabricante manages own"
  on public.products for all
  to authenticated
  using ( fabricante_id = auth.uid() and public.current_role() = 'fabricante' )
  with check ( fabricante_id = auth.uid() and public.current_role() = 'fabricante' );


-- ============================================================================
-- 4. TABLA tarifas — histórico de cambios de precio
-- ============================================================================
create table if not exists public.tarifas (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products (id) on delete cascade,
  fabricante_id   uuid not null references public.profiles (id) on delete cascade,
  price_before    numeric(10,4) not null,
  price_after     numeric(10,4) not null,
  pct_change      numeric(5,2) generated always as
                    ( ((price_after - price_before) / nullif(price_before, 0)) * 100 ) stored,
  effective_date  date not null,
  reason          text,
  notified_at     timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists idx_tarifas_product on public.tarifas (product_id);
create index if not exists idx_tarifas_effective on public.tarifas (effective_date desc);

alter table public.tarifas enable row level security;

drop policy if exists "tarifas: read all authenticated" on public.tarifas;
create policy "tarifas: read all authenticated"
  on public.tarifas for select
  to authenticated
  using ( true );

drop policy if exists "tarifas: fabricante manages own" on public.tarifas;
create policy "tarifas: fabricante manages own"
  on public.tarifas for all
  to authenticated
  using ( fabricante_id = auth.uid() and public.current_role() = 'fabricante' )
  with check ( fabricante_id = auth.uid() and public.current_role() = 'fabricante' );


-- ============================================================================
-- 5. TABLA cotizaciones — comercial cotiza a cliente por un producto
-- ============================================================================
create table if not exists public.cotizaciones (
  id             uuid primary key default gen_random_uuid(),
  ref            text unique not null,                -- ej. 'COT-2026-00421'
  comercial_id   uuid not null references public.profiles (id) on delete restrict,
  cliente_id     uuid references public.profiles (id) on delete set null,
  cliente_name   text,                                -- fallback si cliente_id null
  product_id     uuid references public.products (id) on delete set null,
  product_name   text,
  fabricante_id  uuid references public.profiles (id) on delete set null,
  quantity       numeric(12,2) not null,
  unit           text not null default 'kg',
  unit_price     numeric(10,4) not null,
  total_price    numeric(14,2) generated always as ( quantity * unit_price ) stored,
  margin_pct     numeric(5,2),
  status         text not null default 'draft'
                   check (status in ('draft','sent','accepted','rejected','expired')),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_cotiz_comercial on public.cotizaciones (comercial_id);
create index if not exists idx_cotiz_cliente on public.cotizaciones (cliente_id);
create index if not exists idx_cotiz_fabricante on public.cotizaciones (fabricante_id);
create index if not exists idx_cotiz_status on public.cotizaciones (status);

alter table public.cotizaciones enable row level security;

-- Comercial: CRUD total sobre sus propias cotizaciones
drop policy if exists "cotizaciones: comercial manages own" on public.cotizaciones;
create policy "cotizaciones: comercial manages own"
  on public.cotizaciones for all
  to authenticated
  using ( comercial_id = auth.uid() and public.current_role() = 'comercial' )
  with check ( comercial_id = auth.uid() and public.current_role() = 'comercial' );

-- Cliente: lee las que le tocan
drop policy if exists "cotizaciones: cliente reads own" on public.cotizaciones;
create policy "cotizaciones: cliente reads own"
  on public.cotizaciones for select
  to authenticated
  using ( cliente_id = auth.uid() and public.current_role() = 'cliente' );

-- Fabricante: lee las cotizaciones de sus productos
drop policy if exists "cotizaciones: fabricante reads own products" on public.cotizaciones;
create policy "cotizaciones: fabricante reads own products"
  on public.cotizaciones for select
  to authenticated
  using ( fabricante_id = auth.uid() and public.current_role() = 'fabricante' );


-- ============================================================================
-- 6. TABLA pedidos — cliente compra producto al fabricante
-- ============================================================================
create table if not exists public.pedidos (
  id              uuid primary key default gen_random_uuid(),
  ref             text unique not null,                -- ej. 'PED-2026-00387'
  cliente_id      uuid not null references public.profiles (id) on delete restrict,
  fabricante_id   uuid not null references public.profiles (id) on delete restrict,
  cotizacion_id   uuid references public.cotizaciones (id) on delete set null,
  status          text not null default 'placed'
                    check (status in ('placed','confirmed','in_transit','delivered','cancelled')),
  total_amount    numeric(14,2) not null,
  expected_date   date,
  delivered_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.pedido_lines (
  id            uuid primary key default gen_random_uuid(),
  pedido_id     uuid not null references public.pedidos (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  product_name  text not null,
  quantity      numeric(12,2) not null,
  unit          text not null default 'kg',
  unit_price    numeric(10,4) not null,
  line_total    numeric(14,2) generated always as ( quantity * unit_price ) stored
);

create index if not exists idx_pedidos_cliente on public.pedidos (cliente_id);
create index if not exists idx_pedidos_fabricante on public.pedidos (fabricante_id);
create index if not exists idx_pedidos_status on public.pedidos (status);
create index if not exists idx_pedido_lines_pedido on public.pedido_lines (pedido_id);

alter table public.pedidos enable row level security;
alter table public.pedido_lines enable row level security;

-- Cliente: CRUD de sus pedidos
drop policy if exists "pedidos: cliente manages own" on public.pedidos;
create policy "pedidos: cliente manages own"
  on public.pedidos for all
  to authenticated
  using ( cliente_id = auth.uid() and public.current_role() = 'cliente' )
  with check ( cliente_id = auth.uid() and public.current_role() = 'cliente' );

-- Fabricante: lee y actualiza los pedidos que le tocan (confirmar, transit, delivered)
drop policy if exists "pedidos: fabricante reads own" on public.pedidos;
create policy "pedidos: fabricante reads own"
  on public.pedidos for select
  to authenticated
  using ( fabricante_id = auth.uid() and public.current_role() = 'fabricante' );

drop policy if exists "pedidos: fabricante updates status" on public.pedidos;
create policy "pedidos: fabricante updates status"
  on public.pedidos for update
  to authenticated
  using ( fabricante_id = auth.uid() and public.current_role() = 'fabricante' )
  with check ( fabricante_id = auth.uid() and public.current_role() = 'fabricante' );

-- Pedido lines: quien ve el pedido ve sus lineas
drop policy if exists "pedido_lines: read via pedido" on public.pedido_lines;
create policy "pedido_lines: read via pedido"
  on public.pedido_lines for select
  to authenticated
  using ( exists (
    select 1 from public.pedidos p
    where p.id = pedido_id
      and (
        (p.cliente_id = auth.uid() and public.current_role() = 'cliente') or
        (p.fabricante_id = auth.uid() and public.current_role() = 'fabricante')
      )
  ));

drop policy if exists "pedido_lines: cliente writes via own pedido" on public.pedido_lines;
create policy "pedido_lines: cliente writes via own pedido"
  on public.pedido_lines for all
  to authenticated
  using ( exists (
    select 1 from public.pedidos p
    where p.id = pedido_id
      and p.cliente_id = auth.uid()
      and public.current_role() = 'cliente'
  ))
  with check ( exists (
    select 1 from public.pedidos p
    where p.id = pedido_id
      and p.cliente_id = auth.uid()
      and public.current_role() = 'cliente'
  ));

-- Comercial lee pedidos originados por sus cotizaciones + sus lineas.
drop policy if exists "pedidos: comercial reads via own cotizaciones" on public.pedidos;
create policy "pedidos: comercial reads via own cotizaciones"
  on public.pedidos for select
  to authenticated
  using (
    public.current_role() = 'comercial'
    and exists (
      select 1 from public.cotizaciones c
      where c.id = pedidos.cotizacion_id
        and c.comercial_id = auth.uid()
    )
  );

drop policy if exists "pedido_lines: comercial reads via own cotizaciones" on public.pedido_lines;
create policy "pedido_lines: comercial reads via own cotizaciones"
  on public.pedido_lines for select
  to authenticated
  using (
    public.current_role() = 'comercial'
    and exists (
      select 1 from public.pedidos p
      join public.cotizaciones c on c.id = p.cotizacion_id
      where p.id = pedido_lines.pedido_id and c.comercial_id = auth.uid()
    )
  );


-- ============================================================================
-- 7. TABLA visitas — agenda de visitas del comercial a clientes
-- ============================================================================
create table if not exists public.visitas (
  id             uuid primary key default gen_random_uuid(),
  comercial_id   uuid not null references public.profiles (id) on delete cascade,
  cliente_id     uuid references public.profiles (id) on delete set null,
  cliente_name   text,
  location       text,
  scheduled_at   timestamptz not null,
  status         text not null default 'scheduled'
                   check (status in ('scheduled','checked_in','completed','cancelled')),
  checkin_lat    numeric(9,6),
  checkin_lng    numeric(9,6),
  checkin_at     timestamptz,
  outcome        text,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_visitas_comercial on public.visitas (comercial_id);
create index if not exists idx_visitas_cliente on public.visitas (cliente_id);
create index if not exists idx_visitas_scheduled on public.visitas (scheduled_at);

alter table public.visitas enable row level security;

drop policy if exists "visitas: comercial manages own" on public.visitas;
create policy "visitas: comercial manages own"
  on public.visitas for all
  to authenticated
  using ( comercial_id = auth.uid() and public.current_role() = 'comercial' )
  with check ( comercial_id = auth.uid() and public.current_role() = 'comercial' );

drop policy if exists "visitas: cliente reads own" on public.visitas;
create policy "visitas: cliente reads own"
  on public.visitas for select
  to authenticated
  using ( cliente_id = auth.uid() and public.current_role() = 'cliente' );


-- ============================================================================
-- 8. TABLA email_logs — registro de emails enviados vía /api/send-email
-- ============================================================================
create table if not exists public.email_logs (
  id           uuid primary key default gen_random_uuid(),
  sent_by      uuid references public.profiles (id) on delete set null,
  to_email     text not null,
  tipo         text not null,                     -- 'tarifas' | 'cotizacion' | ...
  ref          text,
  subject      text,
  status       text not null default 'sent'
                 check (status in ('sent','failed')),
  error        text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_emaillogs_sent_by on public.email_logs (sent_by);
create index if not exists idx_emaillogs_created on public.email_logs (created_at desc);

alter table public.email_logs enable row level security;

drop policy if exists "email_logs: user reads own" on public.email_logs;
create policy "email_logs: user reads own"
  on public.email_logs for select
  to authenticated
  using ( sent_by = auth.uid() );


-- ============================================================================
-- 9. TRIGGERS para mantener updated_at
-- ============================================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  for t in
    select unnest(array[
      'profiles','products','tarifas',
      'cotizaciones','pedidos','visitas'
    ])
  loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format(
      'create trigger touch_%1$s before update on public.%1$s
         for each row execute function public.touch_updated_at()',
      t
    );
  end loop;
end $$;


-- ============================================================================
-- 10. VISTAS AGREGADAS · Dashboard del fabricante
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
  pr.id as product_id, pr.fabricante_id, pr.name as product_name, pr.sku, pr.price_current, pr.unit,
  coalesce(sum(pl.quantity), 0) as cantidad_total,
  coalesce(sum(pl.line_total), 0) as facturacion_total,
  count(distinct pl.pedido_id) as num_pedidos,
  count(distinct pe.cliente_id) as clientes_unicos
from public.products pr
left join public.pedido_lines pl on pl.product_id = pr.id
left join public.pedidos pe on pe.id = pl.pedido_id and pe.status = 'delivered'
group by pr.id, pr.fabricante_id, pr.name, pr.sku, pr.price_current, pr.unit;
grant select on public.v_fabricante_rentabilidad to authenticated;

drop view if exists public.v_fabricante_ventas_cliente cascade;
create view public.v_fabricante_ventas_cliente
  with (security_invoker = on)
as
select
  p.fabricante_id, p.cliente_id,
  count(*) as num_pedidos,
  count(*) filter (where p.status = 'delivered') as pedidos_delivered,
  coalesce(sum(p.total_amount) filter (where p.status = 'delivered'), 0) as facturacion,
  max(p.created_at) as ultimo_pedido_at
from public.pedidos p
group by p.fabricante_id, p.cliente_id;
grant select on public.v_fabricante_ventas_cliente to authenticated;


-- ============================================================================
-- LISTO. Siguientes pasos manuales en Supabase Studio:
-- ============================================================================
-- 1. Authentication -> Users -> Add user:
--      * Crear Maria (email + password)
--      * Al crearse, el trigger inserta profile con role NULL
--      * Table editor -> profiles -> fila de Maria -> set role = 'fabricante'
--        (o el que toque). Repetir con cada usuario invitado.
--
-- 2. Authentication -> Settings:
--      * Disable "Enable sign-ups"   (queremos invite-only)
--      * Enable "Confirm email"      (opcional pero recomendado)
--      * Site URL = https://foodbridge-ochre.vercel.app
--      * Additional Redirect URLs = http://localhost:5173 (para desarrollo)
--
-- 3. Storage (si se añade en una iteracion posterior):
--      * Bucket 'product-photos' public = false, policy: fabricante del producto escribe
--      * Bucket 'pedido-docs' con policy similar
-- ============================================================================
