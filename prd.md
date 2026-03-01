# Product Requirements Document (PRD)
## Design QA Analyser — Visual Screenshot Comparison Tool
**Version:** 2.0 (Post-Clarification)
**Status:** Ready for Development
**Stack:** Next.js 14 · TypeScript · Supabase · Vercel · GitHub
**Design System:** elite-frontend-design-v3

---

## 1. Product Overview

### 1.1 The One-Sentence Pitch
> **Design QA Analyser** instantly tells you whether two screenshots of your UI are the same — and if not, exactly what changed and where.

### 1.2 Problem Statement
Design, QA, and product teams manually compare screenshots frame-by-frame to catch visual regressions — a slow, error-prone, and deeply human process.

Whether it is:
- A staging build vs. the production UI
- A Figma design export vs. the implemented interface
- A "before deploy" vs. an "after deploy" snapshot
- Two versions of the same screen from different sprints

…the only method today is the painful "squint and spot it" technique or expensive tools like Percy/Chromatic that require full pipeline integration.

Design QA Analyser solves this for anyone, instantly, with a simple drag-and-drop upload.

### 1.3 Solution
A two-panel upload interface where the user drops two screenshots. The system normalises both images to the same dimensions, performs a multi-layer comparison (pixel, layout, colour, text regions), generates a similarity score, produces a **highlighted visual diff**, and outputs a **human-readable change report** — all powered by AI and computer vision.

### 1.4 Core Value Proposition

| Who | Pain | Design QA Analyser Solves It By |
|---|---|---|
| QA Engineers | Manual visual regression takes hours | Automated diff in seconds |
| Designers | Don't know if devs matched the Figma exactly | Side-by-side + diff overlay |
| PMs | Can't tell what changed between releases | Natural-language change summary |
| Frontend Devs | UI bugs are invisible until prod | Catch regressions before merge |

---

## 2. Core Concept & User Mental Model

The user's mental model is simple: **two images in → one truth out.**

```
┌─────────────────────────────────────────────────────────┐
│   📎 DROP SCREENSHOT A          📎 DROP SCREENSHOT B     │
│   (Expected / Old / Figma)      (Actual / New / Prod)    │
│                                                          │
│                   [ ANALYSE ▶ ]                          │
│                                                          │
│   ◼ 93.4% Match                                         │
│   📊 Visual Diff Overlay                                 │
│   📝 "Button moved 8px. Font weight changed in header."  │
└─────────────────────────────────────────────────────────┘
```

The tool operates in **three acts**:
1. **Upload** — Drop two screenshots
2. **Analyse** — System processes, normalises, compares
3. **Report** — Score + diff overlay + text explanation

---

## 3. Tech Stack & Infrastructure

### 3.1 Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS configured with elite-design tokens |
| State | Zustand |
| Drag & Drop | react-dropzone |
| Canvas/Image | HTML5 Canvas API + custom compositing |
| Diff Visualisation | Custom canvas overlay rendering |
| Animation | Framer Motion |
| Fonts | `Fraunces` (display/headings) + `IBM Plex Sans` (body) via Google Fonts |

### 3.2 Backend & Database
| Layer | Technology |
|---|---|
| Backend-as-a-Service | Supabase |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email/password + Google OAuth) |
| File Storage | Supabase Storage — bucket: `screenshots` |
| Edge Functions | Supabase Edge Functions — image normalisation + AI analysis |

### 3.3 AI & Image Processing
| Service | Purpose |
|---|---|
| OpenAI GPT-4o Vision | Natural language change description |
| Sharp (Deno/Node) | Server-side image normalisation and resizing |
| Canvas pixel diffing | Per-pixel colour delta computation in Edge Function |
| Optional: Tesseract.js | OCR for text-region change detection |

### 3.4 Deployment & DevOps
| Layer | Technology |
|---|---|
| Hosting | Vercel |
| CI/CD | Vercel GitHub Integration |
| Version Control | GitHub |
| Branch Strategy | `main` → Production · `develop` → Staging · `feature/*` → PR |

---

## 4. Design System — elite-frontend-design-v3

All UI follows the **elite-frontend-design-v3** design system. This is non-negotiable.

### 4.1 Design Philosophy

> **"Clarity → Confidence → Emotional Impact → Memorability."**

Three governing principles:
- **Apple-Level Craft** — Relentless refinement. Remove everything unnecessary. Every element must earn its place.
- **Google-Level Systems Thinking** — Token-driven consistency. Every colour, spacing, and radius value comes from the token set.
- **Airbnb-Level Experience** — Human warmth even in a technical tool. The interface should feel empowering, not intimidating.

**Visual language rule:** Hierarchy is established through contrast and spatial rhythm — never through decoration alone.

**Interaction law:** Every interaction must communicate state and causality. If the user does something, they must see immediate, clear feedback.

### 4.2 Design Tokens

#### Colour System
```css
:root {
  --color-background:       #0B0D10;   /* App shell */
  --color-surface-primary:  #12151A;   /* Cards, panels, upload zones */
  --color-surface-elevated: #1A1E26;   /* Hover states, dialogs */
  --color-accent:           #00E0FF;   /* CTAs, active states, progress */
  --color-accent-warm:      #FF6B35;   /* Error / regression indicators */
  --color-accent-green:     #00D68F;   /* Match / success indicators */
  --color-text-primary:     #F5F7FA;   /* Headlines, body text */
  --color-text-secondary:   #8B92A5;   /* Labels, captions, helpers */
  --color-border:           #1E232D;   /* Dividers, field borders */
  --color-border-active:    #00E0FF40; /* Focused or hover borders (accent/25%) */
  --radius-sm:              8px;
  --radius-md:              12px;
  --radius-lg:              20px;
}
```

#### Typography System
```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=IBM+Plex+Sans:wght@300;400;600&display=swap');

:root {
  --font-display: 'Fraunces', serif;    /* Hero titles, score display */
  --font-body:    'IBM Plex Sans', sans-serif; /* All UI text */
}
```

#### Spacing — 8pt Grid
All spacing, padding, margin, and gap values are multiples of 8:
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96px`

#### Motion Principles
- Physics-based easing (`cubic-bezier(0.16, 1, 0.3, 1)` — spring-like)
- Duration: micro 100ms · standard 220ms · complex 400ms
- **Signature moment:** The diff overlay "sweeps in" from left to right like a reveal curtain when analysis completes
- All animations respect `prefers-reduced-motion`

---

## 5. UX Architecture & User Flows

### 5.1 Information Architecture

```
/ (Landing)
  → /app (Main Tool — requires auth)
      → /app/compare (Active comparison session)
      → /app/history (Past comparisons)
      → /app/history/[id] (Saved comparison result)
  → /login
  → /signup
```

### 5.2 User Flow — First-Time User

```
Landing Page
  ↓ Click "Start Comparing"
Auth / Signup (email or Google)
  ↓
Empty State Dashboard (animated prompt)
  ↓ Drop screenshots OR click to upload
Upload Zone — Screenshot A (left) + Screenshot B (right)
  ↓ Both uploaded
"Analyse" CTA becomes active (glowing accent button)
  ↓ Click Analyse
Analysis in Progress (loading state with step-by-step progress)
  ↓ Complete
Results View:
  - Similarity Score (large, central, Fraunces font)
  - Diff Overlay toggle on/off
  - Change Report (text findings)
  - Export CTA (PNG diff / CSV / PDF)
  ↓ Optional
Save to History
```

### 5.3 User Flow — Returning User

```
Login → Dashboard (shows last 5 comparisons)
  ↓ Click "New Comparison" or use keyboard shortcut ⌘N
Comparison tool pre-loaded
  ↓ Upload → Analyse → Report
Optionally view/share previous saved result
```

---

## 6. Screen-by-Screen UX & Interaction Design

### 6.1 Landing Page

**Purpose:** Establish trust, explain the tool in 5 seconds, drive to sign-up.

**Layout:**
- Full-viewport dark canvas (`--color-background: #0B0D10`)
- Centre-aligned hero section

**Content Structure:**
```
[Logo: "Design QA"] — top left, IBM Plex Sans 600
[Sign In] [Get Started] — top right

HERO:
  Subheadline (IBM Plex Sans Light): "Screenshot comparison for design and QA teams"
  Headline (Fraunces 700, 64px): "See exactly what changed."
  CTA Button: "Start Comparing Free →" (accent #00E0FF, radius-lg)

BELOW: Animated demo loop showing two screenshots → diff overlay reveal

TRUST ROW: "Works with any screenshot · No integrations needed · Results in 30 seconds"

FOOTER: minimal — Privacy · Terms · GitHub
```

**Interactions:**
- CTA button: on hover → subtle glow pulse on accent colour (`box-shadow: 0 0 32px #00E0FF40`)
- Animated demo: auto-plays on loop, pauses on hover, aria-label "Product demo animation"
- Scroll reveal: hero content fades up on load (Framer Motion, 400ms)

---

### 6.2 Authentication Pages (`/login`, `/signup`)

**Layout:** Centred card on dark background. Card uses `--color-surface-primary`.

**Fields:**
- Email input
- Password input
- [Login with Google] button (primary — white icon, dark bg, border `--color-border`)
- Divider: "or continue with email"

**Interactions:**
- Input focus: border transitions to `--color-border-active` with 220ms ease
- Error states: red border glow + inline message (IBM Plex Sans 300, `--color-accent-warm`)
- Submit button: loading spinner replaces label text during auth request
- Success: smooth fade transition to `/app`

---

### 6.3 Main Comparison Tool (`/app/compare`)

This is the **core screen** — the heart of the product.

#### Layout: Three-Zone Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  TOPBAR: [Logo]  [New] [History]  [User Avatar]                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌────────────────────┐  VS  ┌────────────────────┐                │
│   │  ZONE A            │      │  ZONE B            │                │
│   │  Drop Screenshot A │      │  Drop Screenshot B │                │
│   │  (Expected/Old)    │      │  (Actual/New)      │                │
│   └────────────────────┘      └────────────────────┘                │
│                                                                      │
│            [ ▶  ANALYSE — Compare Screenshots  ]                    │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  RESULTS ZONE (appears after analysis, slides up)                   │
│  [Score Badge] [Diff Toggle] [Export]                               │
│  [Findings Panel]                                                   │
└──────────────────────────────────────────────────────────────────────┘
```

#### Upload Zones (A & B)

- Background: `--color-surface-primary`
- Border: `2px dashed --color-border`
- Icon: upload arrow, `--color-text-secondary`, 48px
- Label (IBM Plex Sans 400): "Drop Screenshot A here" / "Drop Screenshot B here"
- Sub-label (IBM Plex Sans 300, 13px, `--color-text-secondary`): "PNG, JPG, WebP · max 10 MB"

**Drag Interactions:**
- File dragged over zone: border snaps to `--color-accent`, background tints to `#00E0FF08`, subtle scale `1.02` (220ms spring)
- File dropped: border pulses once in accent, preview image fades in inside the zone (100ms)
- Wrong file type: zone shakes (keyframe: ±8px horizontal, 3 cycles, 300ms total), border turns `--color-accent-warm`
- File too large: same shake + inline error beneath zone

**Uploaded State:**
- Screenshot fills the zone with `object-fit: contain`
- Overlay controls appear: `[✕ Remove]` (top-right, ghost button) + `[🔍 Preview]` (bottom-right)
- Filename shown beneath zone in caption style

**"VS" Divider:**
- Text: `VS` in `--color-text-secondary`, IBM Plex Sans 600, 16px
- When both zones have images: `VS` transitions to a subtle animated pulse (indicating readiness)

**Analyse Button:**
- Disabled state (no images or only one image): ghost outline, `--color-text-secondary` text, cursor `not-allowed`
- Ready state (both images uploaded): filled accent button `#00E0FF`, `--color-background` text, subtle glow aura
- On hover: brightness +5%, scale 1.02, glow intensifies
- On click: transitions to loading state

**Keyboard:** `⌘ + Enter` triggers analysis when button is enabled

---

### 6.4 Analysis In Progress State

When user clicks Analyse, a progress tracker replaces the button zone:

```
┌───────────────────────────────────────────────────────┐
│  Analysing your screenshots                           │
│                                                       │
│  ✅  Normalising dimensions                          │
│  ⏳  Running pixel comparison            [60%]       │
│  ○   Detecting layout shifts                         │
│  ○   Generating AI description                       │
│                                                       │
│  [═══════════════════════────────]  60%               │
└───────────────────────────────────────────────────────┘
```

**Interactions:**
- Steps check off in real time as Edge Function emits progress via Supabase Realtime
- Progress bar fills with `--color-accent` using `transition: width 400ms ease`
- Completed steps: checkmark icon animates in (scale 0 → 1, spring easing)
- Active step: subtle shimmer/pulse on the label
- Total estimated time shown: "~15 seconds"
- Cancel option: small ghost "Cancel" link beneath progress bar

---

### 6.5 Results View

After analysis completes, the results zone **slides up** from the bottom (Framer Motion `y: 80 → 0`, opacity `0 → 1`, 400ms spring) and pins below the upload zones.

#### 6.5.1 Similarity Score

```
     ○
   ╱   ╲
  │ 93.4│    ← Fraunces 700, 72px
  │  %  │    ← IBM Plex Sans 300, 20px
   ╲   ╱      colour: --color-accent-green (>80%), --color-accent (50-80%), --color-accent-warm (<50%)
     ○
```

- Animated counter: counts up from 0 to final score in 800ms (easing out)
- Ring progress indicator around the number (SVG stroke-dashoffset animation)
- Verbal label beneath: `"Strong Match"` / `"Partial Match"` / `"Significant Differences"` in IBM Plex Sans 400)

#### 6.5.2 Diff Overlay Controls

```
[ 🔲 Side-by-Side ]  [ ◑ Overlay Blend ]  [ 🔴 Highlight Diff ]  [ ↔ Slider ]
```

- Four view modes as a segmented toggle:
  1. **Side-by-Side** — A and B shown next to each other (default)
  2. **Overlay Blend** — A on top of B at 50% opacity, showing misalignments
  3. **Highlight Diff** — Diff mask rendered: unchanged areas greyed, changed areas highlighted in `--color-accent-warm` (#FF6B35)
  4. **Slider** — Interactive swipe-divider: drag left/right to reveal A vs B (the "curtain reveal" signature moment)

**Signature Moment — Diff Slider:**
- When user first sees results, the slider auto-animates from left to right and back once (1200ms), demonstrating the feature
- After that, user takes full control
- Slider thumb: circular handle, `--color-accent`, `box-shadow: 0 0 16px #00E0FF60`
- Smooth dragging physics on mouse/touch

#### 6.5.3 Change Report Panel

Below the visual diff, a structured findings panel:

```
📝 WHAT CHANGED

Found 4 differences

  🔴 [LAYOUT]   Primary button moved 8px down and 4px right
  🟡 [COLOUR]   Header background changed from #003D99 to #001F80
  🟡 [TYPOGRAPHY] Title font-weight changed from 400 to 600
  🔵 [CONTENT]  New notification badge appeared in top-right corner
```

**Card-per-finding:**
- Each finding is a card: `--color-surface-primary`, `radius-md`, padding `16px`
- Left accent bar: red/yellow/blue by category (layout/style/content)
- Label: IBM Plex Sans 600, 14px
- Description: IBM Plex Sans 300, 14px, `--color-text-secondary`
- Hover: card elevates (box-shadow), background transitions to `--color-surface-elevated`

**Finding Categories & Colours:**
| Category | Colour | Icon |
|---|---|---|
| Layout shift | `--color-accent-warm` (#FF6B35) | 🔴 |
| Colour change | `#FFD166` (amber) | 🟡 |
| Typography | `#A78BFA` (violet) | 🟣 |
| Content/New element | `--color-accent` (#00E0FF) | 🔵 |
| Removed element | `#F87171` (red) | 🔴 |

---

### 6.6 Export Options

After results, an export strip appears:

```
[ 📥 Download Diff Image (PNG) ]   [ 📄 Export Report (PDF) ]   [ 🗂 Export CSV ]   [ 🔗 Share Link ]
```

- **Diff Image PNG:** Canvas composited image of the highlighted diff overlay
- **PDF Report:** Score + all findings + side-by-side thumbnails
- **CSV:** Machine-readable list of findings (for Jira/Linear import)
- **Share Link:** Generates a public read-only URL of the result (stored in Supabase)

---

### 6.7 History Page (`/app/history`)

Tabular + card view of past comparisons:

```
┌─────────────────────────────────────────────────────────────────────┐
│  📂 My Comparisons                            [New Comparison +]    │
├──────────┬──────────┬────────────┬───────────────┬──────────────────┤
│ Thumb A  │ Thumb B  │ Score      │ Date          │ Actions          │
│ (small)  │ (small)  │ 93.4% ✅  │ 2 Mar, 1:30am │ [View] [Delete]  │
│ ...      │ ...      │ 42.1% 🔴  │ 1 Mar, 8:12pm │ [View] [Delete]  │
└──────────┴──────────┴────────────┴───────────────┴──────────────────┘
```

- Score coloured with same green/amber/red logic
- Click row → opens saved result at `/app/history/[id]`
- Empty state: illustration + "You haven't compared anything yet." + "Start your first comparison →"

---

### 6.8 Topbar / Global Navigation

```
[◈ Design QA]    [New ⌘N]  [History]  [Settings]   [Avatar ]
```

- Logo: `◈ Design QA` — monogram icon + Fraunces display name
- Active page: underline `--color-accent`, 2px
- User avatar: circular, 32px, shows initials or photo from Supabase profile
- Topbar background: `--color-background`, `border-bottom: 1px solid --color-border`

---

## 7. Accessibility (WCAG 2.1 AA)

- Colour contrast: all text/background pairings checked ≥ 4.5:1
- All interactive elements keyboard-accessible (Tab, Enter, Space, Escape)
- Upload zones: full keyboard drop-zone behaviour + `aria-dropeffect`, `aria-grabbed`
- Diff slider: `role="slider"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` with arrow key control
- All animations: wrapped in `@media (prefers-reduced-motion: reduce)` — motion disabled or simplified
- Focus rings: `outline: 2px solid --color-accent` on all focusable elements
- Screen reader: analysis progress announced via `aria-live="polite"` region

---

## 8. Database Schema (Supabase)

### 8.1 Users / Profiles
```sql
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.2 Comparisons
```sql
CREATE TABLE public.comparisons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  screenshot_a_path TEXT NOT NULL,   -- Supabase Storage path
  screenshot_b_path TEXT NOT NULL,
  status          TEXT DEFAULT 'pending', -- pending | processing | complete | error
  similarity_score NUMERIC(5,2),         -- 0.00 to 100.00
  diff_image_path  TEXT,                 -- Supabase Storage path for rendered diff
  share_token      TEXT UNIQUE,          -- for public share links
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);
```

### 8.3 Findings (Change Report Items)
```sql
CREATE TABLE public.findings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comparison_id  UUID REFERENCES public.comparisons(id) ON DELETE CASCADE,
  category       TEXT,     -- layout | colour | typography | content | removed
  severity       TEXT,     -- high | medium | low
  description    TEXT,
  location_hint  TEXT,     -- e.g. "top-right navigation area"
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.4 Row Level Security
```sql
ALTER TABLE public.comparisons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_comparisons" ON public.comparisons
  USING (owner_id = auth.uid());

ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_findings" ON public.findings
  USING (
    comparison_id IN (
      SELECT id FROM public.comparisons WHERE owner_id = auth.uid()
    )
  );

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_profile" ON public.profiles
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
```

---

## 9. Supabase Storage

### Bucket: `screenshots`
- **Visibility:** Private (signed URLs only)
- **Max file size:** 10 MB
- **Allowed MIME types:** `image/png`, `image/jpeg`, `image/webp`
- **Path structure:** `screenshots/{user_id}/{comparison_id}/A.png` and `.../B.png`

### Bucket: `diffs`
- **Visibility:** Private + optional public signing for share links
- **Path structure:** `diffs/{comparison_id}/diff.png`

---

## 10. Supabase Edge Functions

### Function: `process-comparison`
**Trigger:** Called by Next.js API route after both screenshots are uploaded.

**Steps:**
1. Fetch Screenshot A and B from Supabase Storage as binary buffers
2. Use `sharp` to normalise both to identical dimensions (resize to largest bounding box, preserve aspect ratio with transparent fill)
3. Run pixel-level diff using a custom algorithm:
   - Compute per-pixel colour delta (RGBA)
   - Flag pixels where delta > threshold (configurable, default: 10/255)
   - Calculate similarity score: `(unchanged_pixels / total_pixels) * 100`
4. Generate diff image: overlay A as base, paint flagged pixels `#FF6B3580` (warm accent, 50% opacity)
5. Save diff image to `diffs` bucket
6. Call **OpenAI GPT-4o Vision** with both original images + structured prompt:
   ```
   Analyse these two UI screenshots and identify what visually changed.
   Categorise each change as: layout | colour | typography | content | removed.
   For each change, provide: category, severity (high/medium/low), description, location_hint.
   Return strictly as JSON array.
   ```
7. Parse AI response, insert rows into `findings`
8. Update `comparisons.status = 'complete'`, `similarity_score`, `diff_image_path`

**Progress Updates:** Edge Function writes intermediate status updates to a `comparison_progress` column (or emits via Supabase Realtime broadcast) for the frontend progress tracker.

---

## 11. Application Routes

| Route | Description | Auth Required |
|---|---|---|
| `/` | Landing page | No |
| `/login` | Login | No |
| `/signup` | Sign up | No |
| `/app` | Redirect to `/app/compare` | Yes |
| `/app/compare` | Main comparison tool | Yes |
| `/app/history` | Past comparisons list | Yes |
| `/app/history/[id]` | Saved comparison result | Yes |
| `/share/[token]` | Public read-only result | No |
| `/settings` | User profile settings | Yes |

---

## 12. GitHub Repository Structure

```
design-qa-analyser/
├── .github/
│   └── workflows/
│       └── ci.yml
├── app/
│   ├── (marketing)/
│   │   └── page.tsx                  # Landing page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── (app)/
│   │   ├── compare/page.tsx          # Core tool
│   │   ├── history/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── settings/page.tsx
│   │   └── layout.tsx
│   ├── share/[token]/page.tsx        # Public share page
│   └── api/
│       └── compare/route.ts          # Kicks off Edge Function
├── components/
│   ├── ui/                           # Design system primitives (Button, Card, Badge...)
│   ├── upload/
│   │   ├── UploadZone.tsx
│   │   └── ImagePreview.tsx
│   ├── analysis/
│   │   ├── ProgressTracker.tsx
│   │   ├── ScoreBadge.tsx
│   │   ├── DiffViewer.tsx            # All 4 view modes incl. slider
│   │   └── FindingsPanel.tsx
│   ├── history/
│   │   └── HistoryTable.tsx
│   └── layout/
│       └── Topbar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── utils.ts
├── styles/
│   ├── globals.css                   # Tokens from elite-frontend-design-v3
│   └── animations.css                # Framer Motion variants
├── supabase/
│   ├── migrations/
│   │   ├── 001_create_profiles.sql
│   │   ├── 002_create_comparisons.sql
│   │   └── 003_create_findings.sql
│   └── functions/
│       └── process-comparison/
│           └── index.ts
├── types/
│   └── database.types.ts
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 13. Environment Variables

### `.env.local` (local development)
```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
OPENAI_API_KEY=<openai-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel Environment Variables (set in dashboard)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
NEXT_PUBLIC_APP_URL   → https://<your-vercel-domain>.vercel.app
```

### Supabase Edge Function Secrets (set via CLI)
```
OPENAI_API_KEY
SUPABASE_SERVICE_ROLE_KEY
```

---

## 14. MVP Feature Scope

| Feature | In MVP |
|---|---|
| Upload 2 screenshots (A/B) | ✅ |
| Image normalisation (size match) | ✅ |
| Pixel-level diff computation | ✅ |
| Similarity percentage score | ✅ |
| Diff overlay (highlight mode) | ✅ |
| Side-by-side view | ✅ |
| Slider "curtain reveal" view | ✅ |
| AI natural-language change report | ✅ |
| Save comparison to history | ✅ |
| Email + Google auth | ✅ |
| Export diff image (PNG) | ✅ |
| Public share link | ✅ |
| Export PDF report | ❌ Phase 2 |
| Export CSV | ❌ Phase 2 |
| OCR text detection | ❌ Phase 2 |
| Batch comparison (multiple pairs) | ❌ Phase 2 |
| Figma direct import | ❌ Phase 3 |
| CI/CD visual regression API | ❌ Phase 3 |
| Slack / Jira integration | ❌ Phase 3 |

---

## 15. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Analysis turnaround (P95) | < 30 seconds |
| Upload file size max | 10 MB per image |
| Page load (LCP) | < 2.5s |
| Uptime | 99.9% |
| Accessibility | WCAG 2.1 AA |
| Supported browsers | Chrome, Safari, Firefox, Edge (latest 2 versions) |
| Responsive | Desktop-first; tablet supported; mobile: upload + score view only |
| Security | RLS on all Supabase tables; service role key never exposed client-side |

---

## 16. Success Metrics

- 95% of analyses complete within 30 seconds
- < 3% error rate on Edge Function calls
- User can complete first comparison within 3 minutes of sign-up
- NPS > 50 from beta testers
- 70% of users return within 7 days (weekly active retention)

---

*Last updated: March 2026 · Design System: elite-frontend-design-v3 · Stack: Next.js 14 + Supabase + Vercel*