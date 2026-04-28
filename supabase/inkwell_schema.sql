-- ============================================================
--  InkWell — Supabase SQL Schema
--  Run this entire file in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ─────────────────────────────────────────────────────────────
-- 1. TABLES
-- ─────────────────────────────────────────────────────────────

-- 1a. USERS
--   Mirrors auth.users; created automatically via trigger on signup.
create table if not exists public.users (
  id         uuid        primary key references auth.users(id) on delete cascade,
  name       text,
  email      text        not null,
  role       text        not null default 'viewer'
                         check (role in ('viewer', 'author', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1b. POSTS
create table if not exists public.posts (
  id         uuid        primary key default uuid_generate_v4(),
  title      text        not null,
  body       text        not null default '',
  image_url  text,
  summary    text,
  author_id  uuid        not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1c. COMMENTS
create table if not exists public.comments (
  id           uuid        primary key default uuid_generate_v4(),
  post_id      uuid        not null references public.posts(id)  on delete cascade,
  user_id      uuid        not null references public.users(id)  on delete cascade,
  comment_text text        not null,
  created_at   timestamptz not null default now()
);


-- ─────────────────────────────────────────────────────────────
-- 2. HELPER FUNCTION — auto-update updated_at
-- ─────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_users_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();

create or replace trigger trg_posts_updated_at
  before update on public.posts
  for each row execute procedure public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 3. TRIGGER — auto-create public.users row on Auth signup
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer                   -- runs as DB owner, not the anon role
set search_path = public as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'name',          -- Google / GitHub OAuth name
      new.raw_user_meta_data ->> 'full_name',      -- some providers
      split_part(new.email, '@', 1)                -- fallback: username part
    )
  )
  on conflict (id) do nothing;   -- idempotent: safe if trigger fires twice
  return new;
end;
$$;

-- Attach the trigger to auth.users (fires after every new signup)
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();


-- ─────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

-- Enable RLS on all tables
alter table public.users    enable row level security;
alter table public.posts    enable row level security;
alter table public.comments enable row level security;


-- ── 4a. USERS policies ──────────────────────────────────────

-- Anyone can view all user profiles
create policy "users: public read"
  on public.users for select
  using (true);

-- Users can update only their own row
create policy "users: self update"
  on public.users for update
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can update any user (e.g. promote roles)
create policy "users: admin update any"
  on public.users for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );


-- ── 4b. POSTS policies ──────────────────────────────────────

-- Everyone (including anon) can read all posts
create policy "posts: public read"
  on public.posts for select
  using (true);

-- Only authors and admins can create posts
create policy "posts: author or admin insert"
  on public.posts for insert
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid()
        and role in ('author', 'admin')
    )
  );

-- Authors can update only their own posts
create policy "posts: author update own"
  on public.posts for update
  using  (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- Admins can update any post
create policy "posts: admin update any"
  on public.posts for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Authors can delete their own posts
create policy "posts: author delete own"
  on public.posts for delete
  using (auth.uid() = author_id);

-- Admins can delete any post
create policy "posts: admin delete any"
  on public.posts for delete
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );


-- ── 4c. COMMENTS policies ───────────────────────────────────

-- Everyone can read comments
create policy "comments: public read"
  on public.comments for select
  using (true);

-- Any authenticated user can insert a comment
create policy "comments: authenticated insert"
  on public.comments for insert
  with check (auth.uid() = user_id);

-- Users can delete only their own comments
create policy "comments: self delete"
  on public.comments for delete
  using (auth.uid() = user_id);

-- Admins can delete any comment
create policy "comments: admin delete any"
  on public.comments for delete
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );


-- ─────────────────────────────────────────────────────────────
-- 5. INDEXES (performance)
-- ─────────────────────────────────────────────────────────────
create index if not exists idx_posts_author_id   on public.posts    (author_id);
create index if not exists idx_posts_created_at  on public.posts    (created_at desc);
create index if not exists idx_comments_post_id  on public.comments (post_id);
create index if not exists idx_comments_user_id  on public.comments (user_id);

-- ─────────────────────────────────────────────────────────────
-- Done! ✅
-- ─────────────────────────────────────────────────────────────
