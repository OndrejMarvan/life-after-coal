-- Life After Coal: database schema and row-level security for Supabase.
-- Run this once in the Supabase SQL editor (or with `supabase db push`).
-- Seed programmes, events and map points ship with the site itself; these tables
-- hold admin edits and everything people create.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- ---------------------------------------------------------------- content (admin-edited)
create table if not exists public.programmes (
  id text primary key,
  code text, country text, level text, lang text,
  name_local text, name_en text, type text,
  intro text, who_for text, who_excluded text, what_you_get text, conditions text, how_to_apply text,
  operator text, funder text, contact text, territory text, dates text, status_text text,
  legal_basis text, take_up text, known_problems text,
  evidence text, evidence_note text, source_note text,
  needs jsonb default '[]', groups jsonb default '[]', employers jsonb default '[]', regions jsonb default '[]',
  status text, individual boolean default true, url text,
  summary jsonb default '{}', i18n jsonb default '{}',
  last_checked date, updated_at timestamptz default now(), created_at timestamptz default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  "dateLabel" jsonb,
  country text not null default 'XB',
  kind text not null default 'community',
  title jsonb not null,
  who jsonb,
  place text, lat double precision, lng double precision,
  "programmeIds" jsonb, "crossBorder" boolean default false,
  source text,
  created_at timestamptz default now()
);

create table if not exists public.places (
  id text primary key default gen_random_uuid()::text,
  kind text not null, country text not null, name text not null,
  address text, phone text, email text,
  lat double precision not null, lng double precision not null, approx boolean default true,
  note jsonb, "mineState" text, "programmeIds" jsonb, regions jsonb,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------- community
create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  author_name text, topic text not null, title text not null, body text not null,
  hidden boolean not null default false, lang text,
  created_at timestamptz default now()
);

create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  author_name text, body text not null, hidden boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists public.forum_votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null, target_id text not null,
  user_id uuid references auth.users on delete set null,
  status text not null default 'new',
  created_at timestamptz default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null, body text not null, name text,
  approved boolean not null default false,
  user_id uuid references auth.users on delete set null, lang text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------- contact and sign-ups
create table if not exists public.callback_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null, phone text not null, language text, best_time text, topic text, note text,
  consent boolean not null default false, status text not null default 'new',
  created_at timestamptz default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  channel text not null, email text, phone text, language text, country text, topics jsonb default '[]',
  created_at timestamptz default now()
);

create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  kind text not null, title text not null, date date, place text, link text, note text,
  status text not null default 'new', lang text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------- personal
create table if not exists public.user_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  profile jsonb, steps jsonb, done jsonb default '[]', deadline date,
  created_at timestamptz default now()
);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  programme_id text not null,
  created_at timestamptz default now(),
  unique (user_id, programme_id)
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  programme_id text not null, status text not null default 'planned', note text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------- row-level security
alter table public.profiles enable row level security;
alter table public.programmes enable row level security;
alter table public.events enable row level security;
alter table public.places enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_replies enable row level security;
alter table public.forum_votes enable row level security;
alter table public.reports enable row level security;
alter table public.stories enable row level security;
alter table public.callback_requests enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.suggestions enable row level security;
alter table public.user_routes enable row level security;
alter table public.saved_items enable row level security;
alter table public.applications enable row level security;

-- profiles: you see and edit your own; admins see all. Nobody can make themselves admin.
create policy "profiles self read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and is_admin = public.is_admin());

-- content: everyone reads, admins write
create policy "programmes read" on public.programmes for select using (true);
create policy "programmes admin" on public.programmes for all using (public.is_admin()) with check (public.is_admin());
create policy "events read" on public.events for select using (true);
create policy "events admin" on public.events for all using (public.is_admin()) with check (public.is_admin());
create policy "places read" on public.places for select using (true);
create policy "places admin" on public.places for all using (public.is_admin()) with check (public.is_admin());

-- forum
create policy "posts read" on public.forum_posts for select using (not hidden or public.is_admin() or user_id = auth.uid());
create policy "posts insert own" on public.forum_posts for insert with check (user_id = auth.uid() and hidden = false);
create policy "posts admin update" on public.forum_posts for update using (public.is_admin());
create policy "posts delete own or admin" on public.forum_posts for delete using (user_id = auth.uid() or public.is_admin());
create policy "replies read" on public.forum_replies for select using (not hidden or public.is_admin() or user_id = auth.uid());
create policy "replies insert own" on public.forum_replies for insert with check (user_id = auth.uid() and hidden = false);
create policy "replies admin update" on public.forum_replies for update using (public.is_admin());
create policy "replies delete own or admin" on public.forum_replies for delete using (user_id = auth.uid() or public.is_admin());
create policy "votes read" on public.forum_votes for select using (true);
create policy "votes own" on public.forum_votes for insert with check (user_id = auth.uid());
create policy "votes delete own" on public.forum_votes for delete using (user_id = auth.uid());

-- reports, stories, contact forms, suggestions: anyone may send; only admins read and manage
create policy "reports insert" on public.reports for insert with check (status = 'new' and (user_id is null or user_id = auth.uid()));
create policy "reports admin" on public.reports for all using (public.is_admin()) with check (public.is_admin());
create policy "stories read approved" on public.stories for select using (approved or public.is_admin());
create policy "stories insert" on public.stories for insert with check (approved = false and (user_id is null or user_id = auth.uid()));
create policy "stories admin" on public.stories for update using (public.is_admin());
create policy "callbacks insert" on public.callback_requests for insert with check (consent and status = 'new');
create policy "callbacks admin" on public.callback_requests for all using (public.is_admin()) with check (public.is_admin());
create policy "subscribers insert" on public.newsletter_subscribers for insert with check (true);
create policy "subscribers admin" on public.newsletter_subscribers for all using (public.is_admin()) with check (public.is_admin());
create policy "suggestions insert" on public.suggestions for insert with check (status = 'new');
create policy "suggestions admin" on public.suggestions for all using (public.is_admin()) with check (public.is_admin());

-- personal data: only the owner
create policy "routes own" on public.user_routes for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "saved own" on public.saved_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "applications own" on public.applications for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- To make someone an admin, run (with their email):
-- update public.profiles set is_admin = true where id = (select id from auth.users where email = 'you@example.com');
