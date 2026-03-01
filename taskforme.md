# 📋 Tasks For Me — Pending Manual Setup Checklist
## Design QA Analyser — Things I Need to Do

> These are tasks that **cannot be automated** by the AI agent yet, because they involve setting up external accounts or adding billing details.

---

## 🟡 1. OpenAI — API Key (Required for Analyser)

| # | Task | Notes |
|---|---|---|
| 1.1 | **Create an OpenAI account** at [platform.openai.com](https://platform.openai.com) | |
| 1.2 | **Add billing / payment method** | GPT-4o Vision requires a paid API plan |
| 1.3 | **Create an API key** | Platform → API Keys → Create new secret key |
| 1.4 | **Add the key to `.env.local`** | Paste as `OPENAI_API_KEY=sk-your-key-here` |
| 1.5 | **Set a usage limit** (recommended) | Platform → Usage Limits → set monthly hard cap e.g. $50 |

---

## 🔴 2. Vercel — Deployment Setup (Optional for Local)

| # | Task | Notes |
|---|---|---|
| 2.1 | **Create a Vercel account** at [vercel.com](https://vercel.com) if you don't have one | |
| 2.2 | **Import GitHub repo** into Vercel | Vercel Dashboard → Add New Project → Import from GitHub |
| 2.3 | **Add all Environment Variables** in Vercel Dashboard | Project → Settings → Environment Variables |

### Vercel Environment Variables to Add:

| Variable Name | Value | Environment |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kuozhauvyywaytapoxzr.supabase.co` | Production + Preview + Dev |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | `sb_publishable_XQTr...` | Production + Preview + Dev |
| `OPENAI_API_KEY` | Your OpenAI key | Production + Preview only |

---

## 🟠 3. Supabase — Auth Redirect URLs (After Vercel Deploy)

| # | Task | Notes |
|---|---|---|
| 3.1 | **Add your Vercel URL to Supabase** allowed redirect URLs | Supabase → Auth → URL Configuration → Site URL: set to your Vercel production URL |
| 3.2 | **Add redirect URLs for local dev** | Additional → `http://localhost:4000`, `https://*.vercel.app` |

---

## 🔵 4. Google OAuth — Credentials Setup (Optional for Google Login)

| # | Task | Notes |
|---|---|---|
| 4.1 | **Go to** [console.cloud.google.com](https://console.cloud.google.com) | Sign in with your Google account |
| 4.2 | **Create a new project** or use an existing one | Name it e.g. `Design QA Analyser` |
| 4.3 | **Enable Google OAuth** | APIs & Services → Credentials → Create Credentials → OAuth Client ID |
| 4.4 | **Set Authorised redirect URI** to | `https://kuozhauvyywaytapoxzr.supabase.co/auth/v1/callback` |
| 4.5 | **Copy the Client ID and Client Secret** | Paste them into Supabase → Authentication → Providers → Google |

---

## ✅ Completion Checklist

- [ ] OpenAI API key created and added to `.env.local`
- [x] Vercel project connected to GitHub repo (for prod)
- [x] Vercel Environment Variables added
- [x] Supabase auth redirect URLs updated with Vercel domain
