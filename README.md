# InkWell — AI-Powered Blogging Platform

![InkWell Cover](/public/preview.png) <!-- Add preview image here later -->

## 🚀 Live Demo
[Live Site URL goes here]

## 📋 Project Overview
InkWell is a fully-featured, premium blogging platform that leverages the power of Artificial Intelligence to streamline content creation and discovery. Built utilizing a modern Next.js 14 architecture with a Supabase PostgreSQL backbone, the platform enforces strict user access controls while supporting authors natively with automated Gemini LLM text summarizations optimizing reader retention.

## 🛠 Tech Stack
| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Supabase Auth |
| **AI Integration** | Google Gemini (1.5 Flash Model) |
| **Components** | Lucide React |

## ✨ Features
- **Role-based Access**: Custom claims isolating `Author`, `Viewer`, and `Admin` rights.
- **AI-generated Post Summaries**: Automated AI digest generation natively integrated with Google Gemini using explicit generation confirmation.
- **Full CRUD for Blog Posts**: Robust creation, dynamic reading, updating, and protected remote un-publishing.
- **Interactive Comment System**: Authenticated cross-population communication directly mapped to readers.
- **Search and Pagination**: High-performance URL-based querying and chunked dynamic routing boundaries for seamless UI traversal.
- **Admin Dashboard**: Consolidated master view monitoring comprehensive user logs, granular post deletion, and native comment filtering tools.

## 🗄 Database Schema

**`users` Table**
| Field | Type | Description |
| --- | --- | --- |
| `id` | uuid | Primary Key, references auth.users |
| `full_name` | text | User's display name |
| `email` | text | Registered email |
| `role` | text | 'viewer', 'author', or 'admin' |
| `created_at` | timestamp | Registration date |

**`posts` Table**
| Field | Type | Description |
| --- | --- | --- |
| `id` | uuid | Primary Key |
| `title` | text | Title of the blog post |
| `summary` | text | AI-generated summary |
| `content` | text | HTML payload of the complete post |
| `featured_image` | text | Standard URL mapped image cover |
| `author_id` | uuid | Foreign Key referencing users(id) |
| `created_at` | timestamp | Publication date |

**`comments` Table**
| Field | Type | Description |
| --- | --- | --- |
| `id` | uuid | Primary Key |
| `post_id` | uuid | Foreign Key referencing posts(id) |
| `author_id` | uuid | Foreign Key referencing users(id) |
| `content` | text | The content of the user comment |
| `created_at` | timestamp | Posting date |

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
   Rename `.env.example` to `.env.local` and populate these values:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Prepare Supabase Backend Tables**
   Run the generated schema SQL scripts from inside your Supabase project's native SQL editor. This establishes the tables along with RLS (Row Level Security) definitions binding native Next.js handlers.

5. **Run the local development server**
   ```bash
   npm run dev
   ```
   *InkWell should now be running on `http://localhost:3000`*

## 🌐 Deployment Steps (Vercel)

1. Create a [Vercel](https://vercel.com/) account and connect it securely to your GitHub profile.
2. Select **"Add New Project"** and import the `InkWell` repository.
3. The integrated Vercel build systems will automatically recognize Next.js configs. 
4. Under the **"Environment Variables"** tab within the deployment dashboard, meticulously copy the four identical keys documented from your local `.env.local` configuration.
5. Click **"Deploy"**.
6. Retrieve your newly generated Vercel domain, and assign it to the `NEXT_PUBLIC_APP_URL` variable inside the Vercel variables dashboard and trigger a redeploy for native absolute URI links.
7. Within your Supabase Dashboard -> Authentication -> URL Configuration, append your new Vercel domain to the `Site URL` and `Redirect URLs` to secure session bridging on the remote server.

## 🤖 AI Tool Used
The bulk of InkWell's logic and architecture was built dynamically utilizing **Antigravity**, a high-performance agentic coding assistant engine by Google DeepMind. Antigravity operated as an active pair programmer navigating the user's local filesystem context executing real-time iterative coding workflows to handle complex integrations encompassing native API endpoints, database RLS design implementations, and UI/UX element alignments.

## 💡 Key Technical Decisions
- **Cost-Optimized AI Inference Strategy**: Summaries are generated strictly precisely *once* at standard post creation. They are immediately materialized natively onto the Postgres database completely avoiding redundant LLM API hits protecting server cost limits.
- **Server Components Paradigm**: Hardened critical boundaries utilizing bleeding-edge React Server Components drastically improving the SEO visibility mapping mechanisms associated with large text payloads delivered dynamically for public readers.
- **RLS Boundary Validations**: Implemented multi-layer role validations ensuring comprehensive defense against spoofing via strict Supabase backend queries enforcing user constraints.

## 🐛 Known Issues / Future Improvements
- Implement a paginated infinite-scroll capability for the native comment rendering lists.
- Transition `featured_image` to a native Supabase Storage buckets implementation from strict URL injections.
- Finalize mobile UI alignment optimization for deeply nested comment chains.
