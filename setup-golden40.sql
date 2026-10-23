-- ===========================================================================
--  THE GOLDEN 40 — das fehlende Stück, damit die Fotos synchronisiert werden
--  Projekt: futdxrnvbdaofdhyaicy      Event: golden40-7wvnlpqv
--
--  Komplett markieren, einfügen, RUN. Nichts anpassen — die PIN steht schon
--  drin (Hajo86). Wiederholbar: zerstört nichts, Thomas' Fest bleibt heil.
-- ===========================================================================

-- 1. Direktes Lesen der Tabelle bleibt auf Thomas' Fest beschränkt.
--    Alle anderen Feste werden über die Funktionen unten gelesen — ohne die
--    vollständige Event-Kennung gibt der Server nichts heraus.
drop policy if exists "eventpic anon liest sichtbare fotos" on public.event_photos;
create policy "eventpic anon liest sichtbare fotos"
  on public.event_photos for select to anon
  using (hidden = false and event_id = 'thomas60-2026');

-- 2. Galerie lesen (das ist die Funktion, die für die Synchronisierung fehlt)
drop function if exists public.ep_list_photos(text, integer);
create or replace function public.ep_list_photos(p_event text, p_limit integer default 400)
returns table (
  id uuid, event_id text, task_id text, guest_name text, caption text,
  path text, width integer, height integer, created_at timestamptz, hidden boolean
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select p.id, p.event_id, p.task_id, p.guest_name, p.caption,
         p.path, p.width, p.height, p.created_at, p.hidden
  from public.event_photos p
  where p.event_id = p_event
    and p.hidden = false
    and char_length(p_event) >= 8
  order by p.created_at desc
  limit least(greatest(coalesce(p_limit, 400), 1), 1000);
$$;

-- 3. Die eigenen Fotos eines Gasts — daraus entstehen die Häkchen
drop function if exists public.ep_list_mine(text, text);
create or replace function public.ep_list_mine(p_event text, p_token text)
returns setof public.event_photos
language sql
security definer
set search_path = public, pg_temp
as $$
  select * from public.event_photos
  where event_id = p_event
    and owner_token = p_token
    and char_length(p_event) >= 8
    and char_length(p_token) >= 8
  order by created_at desc
  limit 400;
$$;

revoke all on function public.ep_list_photos(text, integer) from public;
revoke all on function public.ep_list_mine(text, text)      from public;
grant execute on function public.ep_list_photos(text, integer) to anon;
grant execute on function public.ep_list_mine(text, text)      to anon;

-- 4. Admin-PIN für die Moderation dieses Fests
insert into eventpic_private.admin (event_id, pin)
values ('golden40-7wvnlpqv', 'Hajo86')
on conflict (event_id) do update set pin = excluded.pin;

-- 5. REST-API die neuen Funktionen bekannt machen
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- 6. Selbsttest — muss viermal ✅ ergeben
-- ---------------------------------------------------------------------------
with checks(pruefung, ok) as (
  values
    ('1. Funktion ep_list_photos vorhanden',
      (select count(*) = 1 from information_schema.routines
        where routine_schema = 'public' and routine_name = 'ep_list_photos')),
    ('2. Funktion ep_list_mine vorhanden',
      (select count(*) = 1 from information_schema.routines
        where routine_schema = 'public' and routine_name = 'ep_list_mine')),
    ('3. Leserecht fuer anon erteilt',
      (select count(*) = 2 from information_schema.routine_privileges
        where routine_schema = 'public' and grantee = 'anon'
          and routine_name in ('ep_list_photos', 'ep_list_mine'))),
    ('4. Admin-PIN fuer golden40 gesetzt',
      (select count(*) = 1 from eventpic_private.admin
        where event_id = 'golden40-7wvnlpqv' and char_length(pin) >= 4))
)
select case when ok then '✅ ok' else '❌ FEHLT' end as status, pruefung
from checks
order by ok, pruefung;
