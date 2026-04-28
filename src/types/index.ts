export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

// ─── Profile ──────────────────────────────────────────────────────────────────
export interface Profile {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
    bio: string | null
    website: string | null
    twitter: string | null
    created_at: string
    updated_at: string
}

// ─── Post ─────────────────────────────────────────────────────────────────────
export type PostStatus = 'draft' | 'published'

export interface Post {
    id: string
    author_id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    cover_image: string | null
    status: PostStatus
    reading_time: number | null
    view_count: number
    like_count: number
    published_at: string | null
    created_at: string
    updated_at: string
    // Joined fields
    author?: Profile
    tags?: Tag[]
}

// ─── Tag ──────────────────────────────────────────────────────────────────────
export interface Tag {
    id: string
    name: string
    slug: string
    color: string | null
}

// ─── Comment ──────────────────────────────────────────────────────────────────
export interface Comment {
    id: string
    post_id: string
    author_id: string
    parent_id: string | null
    content: string
    created_at: string
    updated_at: string
    author?: Profile
    replies?: Comment[]
}

// ─── Bookmark ─────────────────────────────────────────────────────────────────
export interface Bookmark {
    id: string
    user_id: string
    post_id: string
    created_at: string
    post?: Post
}

// ─── Like ─────────────────────────────────────────────────────────────────────
export interface Like {
    id: string
    user_id: string
    post_id: string
    created_at: string
}

// ─── Follow ───────────────────────────────────────────────────────────────────
export interface Follow {
    follower_id: string
    following_id: string
    created_at: string
}

// ─── Utility types ────────────────────────────────────────────────────────────
export type WithAuthor<T> = T & { author: Profile }
export type PostWithMeta = Post & { author: Profile; tags: Tag[] }
