# InkWell — AI-Powered Blogging Platform

![InkWell Cover](/public/preview.png)

## 🚀 Live Demo
**[https://ink-well-orpin.vercel.app](https://ink-well-orpin.vercel.app)**

## 📋 Project Overview
InkWell is a fully-featured, premium blogging platform that leverages the power of Artificial Intelligence to streamline content creation and discovery. Built utilizing a modern Next.js 16 architecture with a Supabase PostgreSQL backbone, the platform enforces strict user access controls while supporting authors natively with automated Gemini LLM text summarizations optimizing reader retention.

## 🛠 Tech Stack
| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 16 (App Router / Turbopack) |
| **Language** | TypeScript |
| **Styling** | Vanilla CSS (Fintech Aesthetics) |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Supabase SSR |
| **AI Integration** | Google Gemini (1.5 Flash Model) |
| **Components** | Lucide React |

## ✨ Features
- **AI-generated Post Summaries**: Automated AI digest generation natively integrated with Google Gemini.
- **Role-based Access**: Custom roles isolating `Viewer`, `Author`, and `Admin` rights.
- **Tiptap Rich Text Editor**: Modern, extensible editor for professional content creation.
- **Interactive Comment System**: Authenticated real-time communication on every post.
- **Admin Dashboard**: Master view for monitoring users, managing posts, and filtering comments.
- **Premium Design**: Sleek dark mode, glassmorphism, and responsive layouts.

## 📝 How to Use

### 1. Registration & Login
- Click the **"Get Started"** or **"Login"** button in the top navigation.
- To create an account, click **"Don't have an account? Sign up"**.
- Enter your email, full name, and password.
- After signing up, you will be automatically logged in and assigned the **Viewer** role.

### 2. Becoming an Author
- To write posts, you need the **Author** role.
- Currently, you can join as an author by clicking **"Become an Author"** on the landing page or by asking an **Admin** to upgrade your role.
- Once you have author rights, a **"Dashboard"** link will appear in your profile menu.

### 3. Writing with AI
- Inside the Dashboard, click **"Create New Post"**.
- Write your story using the Tiptap editor.
- Click **"Generate AI Summary"** to let Google Gemini read your post and create a concise digest automatically.
- Hit **"Publish Post"** to make it live!

---

## 🗄 Database Schema

**`users` Table**
| Field | Type | Description |
| --- | --- | --- |
| `id` | uuid | Primary Key, references auth.users |
| `full_name` | text | User's display name |
| `role` | text | 'viewer', 'author', or 'admin' |

**`posts` Table**
| Field | Type | Description |
| --- | --- | --- |
| `id` | uuid | Primary Key |
| `title` | text | Title of the blog post |
| `summary` | text | AI-generated summary |
| `content` | text | HTML payload of the complete post |
| `featured_image` | text | URL for the post cover image |
| `author_id` | uuid | Foreign Key referencing users(id) |

---

## ⚙️ Local Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/KeshavxA/InkWell.git
   cd InkWell
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Rename `.env.example` to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   GEMINI_API_KEY=your_gemini_key
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## 🤖 AI Tool Used
The bulk of InkWell's logic and architecture was built dynamically utilizing **Antigravity**, a high-performance agentic coding assistant engine by Google DeepMind. Antigravity operated as an active pair programmer navigating the user's local filesystem context executing real-time iterative coding workflows to handle complex integrations.

## 💡 Key Technical Decisions
- **Cost-Optimized AI Inference**: Summaries are generated once and stored in the database to avoid redundant API costs.
- **Supabase SSR Clients**: Implemented the latest Supabase SSR patterns for secure, server-side authentication handling.
- **Fintech Aesthetic**: Used a custom design system with `Slate-900` backgrounds and bold typography for a premium look.

## ⚖️ License
MIT License - Copyright (c) 2026 KeshavxA

 
