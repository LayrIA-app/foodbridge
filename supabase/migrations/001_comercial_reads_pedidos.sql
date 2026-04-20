-- ============================================================================
-- Migracion 001 · Comercial puede leer pedidos originados por sus cotizaciones
-- ============================================================================
-- Pegar en Supabase Studio -> SQL Editor -> Run.
-- Idempotente (drop policy if exists).
--
-- Por que hace falta: las policies originales permiten a cliente y fabricante
-- leer sus pedidos, pero el comercial no ve nada. Sin embargo, el comercial
-- genero la cotizacion que dio origen al pedido y debe poder hacer seguimiento.
-- ============================================================================

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

-- Verificacion: el comercial de prueba debe ver los pedidos seeded que tienen
-- cotizacion_id ligada a sus cotizaciones.
select count(*) as pedidos_visibles_para_comercial
  from public.pedidos
 where cotizacion_id in (
   select id from public.cotizaciones
    where comercial_id = (select id from public.profiles where email = 'comercial@test.com')
 );
