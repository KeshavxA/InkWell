-- ============================================================
-- InkWell — Supabase Database Schema
-- ============================================================
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for full-text search

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text unique not null,
  full_name   text,
  avatar_url  text,
  bio         text,
  website     text,
  twitter     text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── TAGS ────────────────────────────────────────────────────────────────────
create table if not exists tags (
  id         uuid default uuid_generate_v4() primary key,
  name       text unique not null,
  slug       text unique not null,
  color      text default '#6366f1',
  created_at timestamptz default now() not null
);

-- Seed tags
insert into tags (name, slug, color) values
  ('Technology',    'technology',    '#6366f1'),
  ('Programming',   'programming',   '#8b5cf6'),
  ('Design',        'design',        '#ec4899'),
  ('Science',       'science',       '#06b6d4'),
  ('AI & ML',       'ai-ml',         '#10b981'),
  ('Startup',       'startup',       '#f59e0b'),
  ('Career',        'career',        '#ef4444'),
  ('Lifestyle',     'lifestyle',     '#84cc16'),
  ('Finance',       'finance',       '#14b8a6'),
  ('Health',        'health',        '#f97316')
on conflict do nothing;

-- ─── POSTS ───────────────────────────────────────────────────────────────────
create table if not exists posts (
  id           uuid default uuid_generate_v4() primary key,
  author_id    uuid references public.profiles(id) on delete cascade not null,
  title        text not null,
  slug         text unique not null,
  excerpt      text,
  content      text not null default '',
  cover_image  text,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  reading_time integer,
  view_count   integer default 0 not null,
  like_count   integer default 0 not null,
  published_at timestamptz,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- Full-text search index
create index if not exists posts_search_idx on posts
  using gin ((to_tsvector('english', title || ' ' || coalesce(excerpt, '') || ' ' || content)));

-- ─── POST TAGS ───────────────────────────────────────────────────────────────
create table if not exists post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id  uuid references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ─── COMMENTS ────────────────────────────────────────────────────────────────
create table if not exists comments (
  id         uuid default uuid_generate_v4() primary key,
  post_id    uuid references public.posts(id) on delete cascade not null,
  author_id  uuid references public.profiles(id) on delete cascade not null,
  parent_id  uuid references public.comments(id) on delete cascade,
  content    text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ─── LIKES ───────────────────────────────────────────────────────────────────
create table if not exists likes (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  post_id    uuid references public.posts(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, post_id)
);

-- Keep like_count in sync
create or replace function update_like_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update posts set like_count = like_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update posts set like_count = like_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$;

create or replace trigger on_like_change
  after insert or delete on likes
  for each row execute procedure update_like_count();

-- ─── BOOKMARKS ───────────────────────────────────────────────────────────────
create table if not exists bookmarks (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  post_id    uuid references public.posts(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, post_id)
);

-- ─── FOLLOWS ─────────────────────────────────────────────────────────────────
create table if not exists follows (
  follower_id  uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at   timestamptz default now() not null,
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
alter table profiles  enable row level security;
alter table posts     enable row level security;
alter table post_tags enable row level security;
alter table comments  enable row level security;
alter table likes     enable row level security;
alter table bookmarks enable row level security;
alter table follows   enable row level security;
alter table tags      enable row level security;

-- Profiles
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);
create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Tags (public read)
create policy "Tags are viewable by everyone"
  on tags for select using (true);

-- Posts (published are public, drafts only by author)
create policy "Published posts are viewable by everyone"
  on posts for select using (status = 'published' or author_id = auth.uid());
create policy "Authors can create posts"
  on posts for insert with check (auth.uid() = author_id);
create policy "Authors can update their posts"
  on posts for update using (auth.uid() = author_id);
create policy "Authors can delete their posts"
  on posts for delete using (auth.uid() = author_id);

-- Post tags
create policy "Post tags are viewable by everyone"
  on post_tags for select using (true);
create policy "Authors can manage post tags"
  on post_tags for all using (
    exists (select 1 from posts where id = post_tags.post_id and author_id = auth.uid())
  );

-- Comments
create policy "Comments are viewable by everyone"
  on comments for select using (true);
create policy "Authenticated users can create comments"
  on comments for insert with check (auth.uid() = author_id);
create policy "Users can update their own comments"
  on comments for update using (auth.uid() = author_id);
create policy "Users can delete their own comments"
  on comments for delete using (auth.uid() = author_id);

-- Likes
create policy "Likes are viewable by everyone"
  on likes for select using (true);
create policy "Authenticated users can manage their likes"
  on likes for all using (auth.uid() = user_id);

-- Bookmarks
create policy "Users can view their own bookmarks"
  on bookmarks for select using (auth.uid() = user_id);
create policy "Authenticated users can manage their bookmarks"
  on bookmarks for all using (auth.uid() = user_id);

-- Follows
create policy "Follows are viewable by everyone"
  on follows for select using (true);
create policy "Authenticated users can manage their follows"
  on follows for all using (auth.uid() = follower_id);

-- ─── AUTO-UPDATE updated_at ──────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger set_updated_at_profiles
  before update on profiles
  for each row execute procedure update_updated_at();

create or replace trigger set_updated_at_posts
  before update on posts
  for each row execute procedure update_updated_at();

create or replace trigger set_updated_at_comments
  before update on comments
  for each row execute procedure update_updated_at();
