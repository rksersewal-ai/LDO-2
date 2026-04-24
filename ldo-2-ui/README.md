# LDO-2 UI — Next.js 14 + shadcn/ui

**Locomotive Document Organization System** — rebuilt from scratch with Next.js 14 App Router, shadcn/ui, Radix UI, TanStack Table/Query, Zustand, and react-hook-form + Zod.

---

## Quick Start

```bash
# 1. Navigate to app directory
cd ldo-2-ui

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.local.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL to your FastAPI backend

# 4. Install shadcn components (run once)
npx shadcn@latest add button card badge avatar dropdown-menu
npx shadcn@latest add table pagination dialog sheet drawer popover tooltip
npx shadcn@latest add form input textarea select checkbox radio-group
npx shadcn@latest add tabs accordion collapsible
npx shadcn@latest add alert alert-dialog toast sonner
npx shadcn@latest add progress skeleton
npx shadcn@latest add command combobox
npx shadcn@latest add scroll-area separator resizable
npx shadcn@latest add sidebar navigation-menu breadcrumb

# 5. Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | FastAPI backend URL |
| `NEXT_PUBLIC_APP_NAME` | `LDO-2` | App display name |
| `NEXT_PUBLIC_MAX_FILE_SIZE_MB` | `50` | Max upload file size |
| `NEXT_PUBLIC_ALLOWED_FILE_TYPES` | `pdf,docx,dwg,...` | Accepted file extensions |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          ← Login page (JWT auth)
│   ├── (dashboard)/          ← All dashboard pages
│   └── providers.tsx         ← TanStack Query provider
├── components/
│   ├── ui/                   ← shadcn/ui primitives
│   ├── layout/               ← Sidebar, Header, ThemeToggle
│   ├── dashboard/            ← KPI cards, charts, activity feed
│   ├── documents/            ← Table, upload zone, PDF viewer
│   ├── bom/                  ← BOM table + collapsible tree
│   ├── configuration/        ← Locomotive config cards
│   ├── ocr/                  ← OCR job queue with progress
│   └── shared/               ← DataTable, EmptyState, PageHeader
├── hooks/                    ← use-documents, use-bom, use-ocr
├── lib/
│   ├── api/                  ← Axios client + API modules
│   └── validations/          ← Zod schemas
├── stores/                   ← Zustand UI + filter stores
└── types/                    ← TypeScript interfaces
```

---

## Feature Modules

| Module | Route | Status |
|---|---|---|
| Dashboard | `/` | ✅ KPI cards, chart, activity feed, recent docs |
| Documents | `/documents` | ✅ TanStack Table with sorting, filters, actions |
| Document Upload | `/documents/upload` | ✅ Dropzone, progress, multi-file |
| Document Viewer | `/documents/[id]` | ✅ PDF viewer shell + metadata panel |
| BOM List | `/bom` | ✅ Table with part numbers |
| BOM Tree | `/bom/[id]` | ✅ Radix collapsible tree |
| Loco Configs | `/configuration` | ✅ WAG9/WAP7 card grid |
| OCR Jobs | `/ocr` | ✅ Job queue with progress bars |
| Deduplication | `/deduplication` | ✅ Similarity match cards |
| Search | `/search` | ⚠️ Placeholder |
| Reports | `/reports` | ⚠️ Placeholder |
| IRIS Audit Log | `/audit` | ⚠️ Placeholder |
| Settings | `/settings` | ⚠️ Placeholder |
| Login | `/login` | ✅ JWT auth form |

---

## Backend Integration

This UI connects to the existing **FastAPI** backend at `http://localhost:8000`.
All API calls go through `src/lib/api/client.ts` (Axios with JWT interceptors).
No backend changes are required.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript, strict mode)
- **UI**: shadcn/ui + Radix UI primitives + Tailwind CSS v3
- **Tables**: TanStack Table v8 (sorting, filtering, pagination, row selection)
- **Server state**: TanStack Query v5 (caching, refetch, optimistic updates)
- **Forms**: react-hook-form + Zod validation
- **Client state**: Zustand (UI store + filter store)
- **Charts**: Recharts
- **File upload**: react-dropzone
- **PDF viewer**: react-pdf + PDF.js (shell ready — install pdfjs-dist)
- **Theming**: next-themes (light/dark/system)
- **Icons**: lucide-react
