# 👥 AI Group Photo — AI Group Photo Studio SaaS

> **Instantly combine multiple portrait photos of a single person into a dreamy, high-fidelity, and realistic group photo.** Upload up to 6 front-facing portraits, customize your scene style prompts, configure custom aspect ratios and target resolutions, and generate a seamless composite image using Google's `nano-banana-2-edit` model. A production-ready, self-hostable Next.js SaaS.

**Tech stack:** Next.js 16 (App Router) · Prisma · PostgreSQL · NextAuth (Google OAuth) · Stripe · Tailwind CSS (v4) · MuAPI (nano-banana-2-edit) · Webhook-backed async delivery  
**Use cases:** Family portrait generation · Corporate team avatars · Custom friendship composites · High-fidelity personalized avatars

![AI Group Photo Demo Interface](https://cdn.muapi.ai/data/2/403909915354/Screenshot_2026-06-01_182940.png)

## 🌐 Project Details

**GitHub Repository:** [github.com/SamurAIGPT/ai-group-photo](https://github.com/SamurAIGPT/ai-group-photo)

**Live Demo:** [ai-group-photo-mocha.vercel.app](https://ai-group-photo-mocha.vercel.app/)

---

AI Group Photo is a premium SaaS web application that merges portraits into realistic group pictures using advanced deep learning. Users upload up to 6 portrait photos, define custom prompts describing their dream group setting, and configure standard aspect ratios and target resolutions directly in the left sidebar workspace.

## ✨ Core Features

### 👥 AI Group Photo Studio (Main Page `/`)
- Upload up to 6 front-facing portrait images via file selector.
- Fully interactive **guest preview mode** allowing unauthenticated users to explore settings, aspect ratios, and custom prompts, immediately prompting Google OAuth sign-in only when the generate action is clicked.
- **AI Model**:
  - **Standard (nano-banana-2-edit)**: Fast, high-fidelity portrait combination with advanced concept search tuning.
- **7 Workspace Aspect Ratios**:
  - `1:1` (Square), `16:9` (Landscape), `9:16` (Portrait), `4:3` (Standard), `3:4` (Vertical), `3:2` (Wide), `2:3` (Photo) via custom select dropdowns.
- **Dual Resolutions**:
  - **1K Resolution** (Standard)
  - **2K Ultra HD**
- **Tactile Sliding Option Switches**:
  - **Strict Face Align**: Forces strict pose alignment to compilation targets.
  - **HD Face Restoration**: Enhances final facial details for photorealistic results.
- **Dynamic Pricing**:
  - Flat rate of **18 credits** per successful generation.
- Responsive split panel workspace: Control forms on the left, full-size result canvas preview on the right.

### 🖼️ Creations Portfolio Gallery (`/gallery`)
- Responsive CSS grid of completed group photo creations.
- Detail view modal displaying input face thumbnails, final images, and prompts.
- Server-side CORS-bypass download proxy (HD download).
- Auto-refresh gallery every 4 seconds to poll processing generations.

### 💳 Stripe Credit Billing (`/pricing`)
- Four one-time credit packs (no subscriptions):
  - **Basic Pack** ($5 / 1,000 credits — ~55 generations)
  - **Standard Pack** ($10 / 2,000 credits — ~110 generations)
  - **Professional Pack** ($20 / 4,000 credits — ~220 generations — Best Value)
  - **Business Pack** ($50 / 10,000 credits — ~550 generations)

### 🔐 Google Auth & live balance syncing
- NextAuth Google Provider with Prisma PostgreSQL adapter.
- Pulse credit balances display in Navbar.

---

## ⚡ Deployment: Vercel & Production

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SamurAIGPT/ai-group-photo)

### 🔑 Required Environment Variables

| Service | Variable | Description |
| :--- | :--- | :--- |
| **Database** | `DATABASE_URL` | PostgreSQL connection string (Supabase pooled connection) |
| | `DIRECT_URL` | Direct PostgreSQL connection string |
| **NextAuth** | `NEXTAUTH_SECRET` | Secure random string via `openssl rand -base64 32` |
| | `NEXTAUTH_URL` | Your production domain |
| | `WEBHOOK_URL` | Public URL for MuAPI async callbacks |
| **Google OAuth** | `GOOGLE_CLIENT_ID` | Google Cloud Console OAuth |
| | `GOOGLE_CLIENT_SECRET` | Google Cloud Console OAuth |
| **Stripe** | `STRIPE_SECRET_KEY` | Stripe Secret Key |
| | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key |
| | `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| **AI** | `MUAPIAPP_API_KEY` | Get from [muapi.ai](https://muapi.ai) |

### 🚀 Production Deployment Setup

1. **Database**: Spin up a PostgreSQL instance.
2. **Import**: Import the forked repo into Vercel.
3. **Environment**: Add all required env keys listed above.
4. **Build Script**: Project builds automatically using `prisma generate && next build`.
5. **Database sync**: Run `npx prisma db push` to generate tables.
6. **Callbacks**:
   - Google: `https://ai-group-photo-mocha.vercel.app/api/auth/callback/google`
   - Stripe Webhook: `https://ai-group-photo-mocha.vercel.app/api/webhook/stripe`
   - MuAPI: `https://ai-group-photo-mocha.vercel.app/api/webhook/muapi`

---

## 🛠️ Local Development

### Prerequisites
- Node.js v18+
- PostgreSQL connection string

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/SamurAIGPT/ai-group-photo
cd ai-group-photo

# 2. Install dependencies
npm install

# 3. Setup local environment
cp .env.example .env
# Fill in credentials

# 4. Generate Client & Sync DB
npx prisma generate
npx prisma db push

# 5. Start dev server
npm run dev
```

---

## ⚠️ Database Safety Warning (Shared Pool)

The database is shared across multiple applications. Running `npx prisma db push` on a clean schema will drop other apps' tables. Always follow the **Pull-Declare-Push-Cleanup** sequence:

1. `npx prisma db pull` — Introspect all existing tables into `schema.prisma`
2. Add your `GroupPhotoCreation` model and its `User` relation
3. `npx prisma db push` — Safely add new tables and relations
4. Clean `schema.prisma` to keep only `Account`, `Session`, `User`, `VerificationToken`, `GroupPhotoCreation`
5. `npx prisma generate` — Rebuild the type-safe Prisma client

---

## 🏗️ Technical Architecture

```
ai-group-photo/
├── prisma.config.ts          # Dynamic datasource for Prisma v7
├── prisma/
│   └── schema.prisma         # GroupPhotoCreation model + NextAuth tables
├── src/
│   ├── app/
│   │   ├── page.js           # Studio Page (upload grid, prompt panel, custom dropdowns)
│   │   ├── gallery/page.js   # Personal creations portfolio gallery
│   │   ├── pricing/page.js   # Stripe pricing plans and cards
│   │   ├── privacy/page.js   # Privacy Policy page
│   │   ├── terms/page.js     # Terms of Service page
│   │   └── api/
│   │       ├── auth/         # NextAuth route handler
│   │       ├── upload/       # CDN upload proxy
│   │       ├── generation/   # Credit deduction & multi-portrait compilation trigger
│   │       ├── creations/    # GET/DELETE creations with self-healing polling
│   │       ├── download/     # CORS-bypass download proxy
│   │       ├── checkout/     # Stripe checkout session
│   │       └── webhook/
│   │           ├── muapi/    # MuAPI async callback webhook
│   │           └── stripe/   # Stripe billing webhook
│   ├── components/
│   │   ├── Providers.js      # Auth session provider wrapper
│   │   ├── Header.js         # sticky navbar navigation and mobile hamburger dropdown menu
│   │   ├── ProductCanvas.js  # Main canvas workspace preview
│   │   └── LoadingTipsCarousel.js # Loading tips carousel
│   └── lib/
│       ├── auth.js           # NextAuth configuration
│       ├── config.js         # central app-wide configurations
│       ├── prisma.js         # Singleton Prisma client connection pool
│       ├── stripe.js         # Stripe SDK initialization
│       └── services/
│           ├── user.js       # Credit ledger services
│           └── billing.js    # Stripe checkout session helper
└── next.config.mjs           # Next image routing config
```

---

## 📄 License

MIT Licensed.

---

_AI Group Photo: A premium, dark-themed AI group photo generator SaaS built with the Inter font family and Nano Banana._
