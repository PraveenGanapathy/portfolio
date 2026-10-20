-- Portfolio backend: visit stats and Mileo the dog.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste this file → Run.
--
-- Visitors (the public "anon" key) may only INSERT rows, and only through the checks below.
-- They can never read raw rows; they see totals through the two summary functions.
-- Notes are never readable with the anon key; read them in the dashboard (Table Editor → notes).
-- No IP addresses are stored. Region comes from the visitor's browser time zone.

create extension if not exists pgcrypto;

-- ---------- tables ----------
create table if not exists public.visits (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  region text not null check (char_length(region) between 1 and 60),
  source text not null check (char_length(source) between 1 and 40),
  visitor uuid not null
);

create table if not exists public.mileo_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('feed', 'cuddle')),
  food text check (food is null or food in ('bone', 'kibble', 'carrot', 'cookie')),
  region text not null check (char_length(region) between 1 and 60),
  visitor uuid not null
);

create table if not exists public.notes (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  message text not null check (char_length(message) between 1 and 1000),
  reply_to text check (reply_to is null or char_length(reply_to) <= 200),
  region text not null check (char_length(region) between 1 and 60),
  visitor uuid not null
);

create index if not exists visits_created_at on public.visits (created_at);
create index if not exists mileo_events_created_at on public.mileo_events (created_at);

-- ---------- row level security: insert only ----------
alter table public.visits enable row level security;
alter table public.mileo_events enable row level security;
alter table public.notes enable row level security;

drop policy if exists "anyone can log a visit" on public.visits;
create policy "anyone can log a visit" on public.visits for insert to anon with check (true);
drop policy if exists "anyone can feed or cuddle" on public.mileo_events;
create policy "anyone can feed or cuddle" on public.mileo_events for insert to anon with check (true);
drop policy if exists "anyone can leave a note" on public.notes;
create policy "anyone can leave a note" on public.notes for insert to anon with check (true);

-- Simple flood control: at most 3 notes and 30 Mileo events per visitor per hour.
create or replace function public.limit_per_visitor() returns trigger
language plpgsql security definer set search_path = public as $$
declare recent int;
begin
  if tg_table_name = 'notes' then
    select count(*) into recent from notes where visitor = new.visitor and created_at > now() - interval '1 hour';
    if recent >= 3 then raise exception 'Too many notes, try again later'; end if;
  else
    select count(*) into recent from mileo_events where visitor = new.visitor and created_at > now() - interval '1 hour';
    if recent >= 30 then raise exception 'Mileo is full, try again later'; end if;
  end if;
  return new;
end $$;
drop trigger if exists notes_limit on public.notes;
create trigger notes_limit before insert on public.notes for each row execute function public.limit_per_visitor();
drop trigger if exists mileo_limit on public.mileo_events;
create trigger mileo_limit before insert on public.mileo_events for each row execute function public.limit_per_visitor();

-- Regions and sources appear on the public page, so only real values are accepted: a source from the
-- fixed list backend.js uses, and a region that is one of its names or the city part of a real time zone.
create or replace function public.check_place() returns trigger
language plpgsql security definer set search_path = public, pg_catalog as $$
declare city text := replace(new.region, ' ', '_');
begin
  if new.region not in ('India', 'Sri Lanka', 'UAE', 'US East', 'US Central', 'US Mountain', 'US West',
                        'Canada East', 'Canada West', 'UK', 'Australia', 'Somewhere')
     and not exists (select 1 from pg_timezone_names where right(name, length(city) + 1) = '/' || city) then
    raise exception 'Unknown region';
  end if;
  if tg_table_name = 'visits' and new.source not in
     ('Direct', 'LinkedIn', 'GitHub', 'Google', 'Bing', 'DuckDuckGo', 'X', 'Facebook', 'Reddit', 'Other') then
    raise exception 'Unknown source';
  end if;
  return new;
end $$;
drop trigger if exists visits_place on public.visits;
create trigger visits_place before insert on public.visits for each row execute function public.check_place();
drop trigger if exists mileo_place on public.mileo_events;
create trigger mileo_place before insert on public.mileo_events for each row execute function public.check_place();
drop trigger if exists notes_place on public.notes;
create trigger notes_place before insert on public.notes for each row execute function public.check_place();
-- Older visits stored the raw referrer host or utm text; fold those into Other.
update public.visits set source = 'Other'
where source not in ('Direct', 'LinkedIn', 'GitHub', 'Google', 'Bing', 'DuckDuckGo', 'X', 'Facebook', 'Reddit', 'Other');

-- ---------- public summaries ----------
create or replace function public.visit_stats() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'total', (select count(*) from visits),
    'unique', (select count(distinct visitor) from visits),
    'daily', (
      select coalesce(json_agg(json_build_object('day', d.day, 'visits', coalesce(v.n, 0)) order by d.day), '[]'::json)
      from generate_series((now() at time zone 'utc')::date - 29, (now() at time zone 'utc')::date, interval '1 day') as d(day)
      left join (select (created_at at time zone 'utc')::date as day, count(*) n from visits group by 1) v on v.day = d.day
    ),
    'regions', (select coalesce(json_agg(r), '[]'::json) from (select region as name, count(*) as visits from visits group by region order by 2 desc limit 8) r),
    'sources', (select coalesce(json_agg(s), '[]'::json) from (select source as name, count(*) as visits from visits group by source order by 2 desc limit 6) s)
  );
$$;

create or replace function public.mileo_state() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'feeds', (select count(*) from mileo_events where kind = 'feed'),
    'cuddles', (select count(*) from mileo_events where kind = 'cuddle'),
    'last_feed', (select json_build_object('food', food, 'region', region, 'at', created_at) from mileo_events where kind = 'feed' order by created_at desc limit 1),
    'last_cuddle', (select json_build_object('region', region, 'at', created_at) from mileo_events where kind = 'cuddle' order by created_at desc limit 1)
  );
$$;

revoke all on function public.visit_stats() from public;
revoke all on function public.mileo_state() from public;
grant execute on function public.visit_stats() to anon;
grant execute on function public.mileo_state() to anon;
