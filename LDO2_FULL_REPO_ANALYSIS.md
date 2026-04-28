# LDO-2 Frontend Static Analysis Report (Corrected)

## Prior Knowledge Summary
Existing phase documents already cover backend security/performance/deploy hardening and identify frontend consistency debt; this corrected report focuses on source-of-truth frontend structure, nested `src/src` anomaly, type-safety hotspots, and shadcn consumption paths without duplicating resolved backend findings.

## Component Map Table (All `src/**/*.ts(x)` Files)

| File | Type | Exports | Internal | Shadcn | External | Hooks | API Calls | Props | Complexity |
|---|---|---|---:|---:|---:|---|---|---|---|
| `src/App.tsx` | page | App | 2 | 0 | 1 | - | - | none | low |
| `src/components/ActivityFeed.tsx` | component | ActivityFeed | 0 | 2 | 1 | - | - | none | low |
| `src/components/Dashboard.tsx` | component | Dashboard | 4 | 1 | 0 | - | - | none | low |
| `src/components/Documents.tsx` | component | Documents | 0 | 3 | 2 | useState | - | none | medium |
| `src/components/Layout.tsx` | component | Layout | 4 | 0 | 1 | useState | - | none | low |
| `src/components/QuickActions.tsx` | component | QuickActions | 0 | 2 | 1 | - | - | none | low |
| `src/components/RecentFilesList.tsx` | component | RecentFilesList | 0 | 2 | 1 | - | - | none | low |
| `src/components/Sidebar.tsx` | component | Sidebar | 0 | 1 | 2 | useState | - | SidebarProps | high |
| `src/components/StorageAnalytics.tsx` | component | StorageAnalytics | 0 | 2 | 2 | - | - | none | medium |
| `src/components/StorageOverviewCard.tsx` | component | StorageOverviewCard | 0 | 2 | 1 | - | - | none | low |
| `src/components/figma/ImageWithFallback.tsx` | component | ImageWithFallback | 0 | 0 | 1 | useState | - | none | low |
| `src/components/ui/accordion.tsx` | component | - | 1 | 0 | 3 | - | - | none | low |
| `src/components/ui/alert-dialog.tsx` | component | - | 2 | 0 | 2 | - | - | none | medium |
| `src/components/ui/alert.tsx` | component | - | 1 | 0 | 2 | - | - | none | low |
| `src/components/ui/aspect-ratio.tsx` | component | - | 0 | 0 | 1 | - | - | none | low |
| `src/components/ui/avatar.tsx` | component | - | 1 | 0 | 2 | - | - | none | low |
| `src/components/ui/badge.tsx` | component | - | 1 | 0 | 3 | - | - | none | low |
| `src/components/ui/breadcrumb.tsx` | component | - | 1 | 0 | 3 | - | - | none | low |
| `src/components/ui/button.tsx` | component | - | 1 | 0 | 3 | - | - | none | low |
| `src/components/ui/calendar.tsx` | component | - | 2 | 0 | 3 | - | - | none | low |
| `src/components/ui/card.tsx` | component | - | 1 | 0 | 1 | - | - | none | low |
| `src/components/ui/carousel.tsx` | component | - | 2 | 0 | 3 | useCallback, useCarousel, useContext, useEffect, useEmblaCarousel | - | none | high |
| `src/components/ui/chart.tsx` | component | ChartConfig | 1 | 0 | 2 | useChart, useContext, useId, useMemo | - | inline | high |
| `src/components/ui/checkbox.tsx` | component | - | 1 | 0 | 3 | - | - | none | low |
| `src/components/ui/collapsible.tsx` | component | - | 0 | 0 | 1 | - | - | none | low |
| `src/components/ui/command.tsx` | component | - | 2 | 0 | 3 | - | - | none | medium |
| `src/components/ui/context-menu.tsx` | component | - | 1 | 0 | 3 | - | - | none | high |
| `src/components/ui/dialog.tsx` | component | - | 1 | 0 | 3 | - | - | none | medium |
| `src/components/ui/drawer.tsx` | component | - | 1 | 0 | 2 | - | - | none | medium |
| `src/components/ui/dropdown-menu.tsx` | component | - | 1 | 0 | 3 | - | - | none | high |
| `src/components/ui/form.tsx` | component | - | 2 | 0 | 4 | useContext, useFormContext, useFormField, useFormState, useId | - | none | medium |
| `src/components/ui/hover-card.tsx` | component | - | 1 | 0 | 2 | - | - | none | low |
| `src/components/ui/input-otp.tsx` | component | - | 1 | 0 | 3 | useContext | - | none | low |
| `src/components/ui/input.tsx` | component | - | 1 | 0 | 1 | - | - | none | low |
| `src/components/ui/label.tsx` | component | - | 1 | 0 | 2 | - | - | none | low |
| `src/components/ui/menubar.tsx` | component | - | 1 | 0 | 3 | - | - | none | high |
| `src/components/ui/navigation-menu.tsx` | component | - | 1 | 0 | 4 | - | - | none | medium |
| `src/components/ui/pagination.tsx` | component | - | 2 | 0 | 2 | - | - | none | medium |
| `src/components/ui/popover.tsx` | component | - | 1 | 0 | 2 | - | - | none | low |
| `src/components/ui/progress.tsx` | component | - | 1 | 0 | 2 | - | - | none | low |
| `src/components/ui/radio-group.tsx` | component | - | 1 | 0 | 3 | - | - | none | low |
| `src/components/ui/resizable.tsx` | component | - | 1 | 0 | 3 | - | - | none | low |
| `src/components/ui/scroll-area.tsx` | component | - | 1 | 0 | 2 | - | - | none | low |
| `src/components/ui/select.tsx` | component | - | 1 | 0 | 3 | - | - | none | medium |
| `src/components/ui/separator.tsx` | component | - | 1 | 0 | 2 | - | - | none | low |
| `src/components/ui/sheet.tsx` | component | - | 1 | 0 | 3 | - | - | none | medium |
| `src/components/ui/sidebar.tsx` | component | - | 8 | 0 | 4 | useCallback, useContext, useEffect, useIsMobile, useMemo | - | none | high |
| `src/components/ui/skeleton.tsx` | component | - | 1 | 0 | 0 | - | - | none | low |
| `src/components/ui/slider.tsx` | component | - | 1 | 0 | 2 | useMemo | - | none | low |
| `src/components/ui/sonner.tsx` | component | - | 0 | 0 | 2 | useTheme | - | none | low |
| `src/components/ui/switch.tsx` | component | - | 1 | 0 | 2 | - | - | none | low |
| `src/components/ui/table.tsx` | component | - | 1 | 0 | 1 | - | - | none | low |
| `src/components/ui/tabs.tsx` | component | - | 1 | 0 | 2 | - | - | none | low |
| `src/components/ui/textarea.tsx` | component | - | 1 | 0 | 1 | - | - | none | low |
| `src/components/ui/toggle-group.tsx` | component | - | 2 | 0 | 3 | useContext | - | none | low |
| `src/components/ui/toggle.tsx` | component | - | 1 | 0 | 3 | - | - | none | low |
| `src/components/ui/tooltip.tsx` | component | - | 1 | 0 | 2 | - | - | none | low |
| `src/components/ui/use-mobile.ts` | component | useIsMobile | 0 | 0 | 1 | useEffect, useIsMobile, useState | - | none | medium |
| `src/components/ui/utils.ts` | component | cn | 0 | 0 | 2 | - | - | none | low |
| `src/main.tsx` | page | - | 0 | 0 | 0 | - | - | none | low |
| `src/src/components/layout/AppLayout.tsx` | component | AppLayout, function | 3 | 0 | 2 | useAuth | - | none | low |
| `src/src/components/layout/Header.tsx` | component | Header | 2 | 0 | 3 | useAuth, useEffect, useLocation, useNavigate, useRef | - | none | high |
| `src/src/components/layout/NotificationPanel.tsx` | component | NotificationPanel | 1 | 0 | 2 | useState | - | inline | low |
| `src/src/components/layout/Sidebar.tsx` | component | Sidebar | 1 | 0 | 4 | useAuth, useEffect, useLocation, useState | - | none | medium |
| `src/src/components/ui/Shared.tsx` | component | GlassCard, Badge, Button, Input | 0 | 0 | 1 | - | - | inline | low |
| `src/src/lib/auth.tsx` | hook | UserRole, User, AuthProvider, useAuth | 0 | 0 | 1 | useAuth, useContext, useEffect, useState | - | inline | medium |
| `src/src/lib/bomData.test.ts` | test | - | 1 | 0 | 1 | - | - | none | low |
| `src/src/lib/bomData.ts` | util | NodeType, LifecycleState, DocType, LinkedDocument, LinkedDrawing, WhereUsedEntry, ChangeHistoryEntry, PLRecord, BOMNode, BOMVersion, cloneTree, findNode, findParent, isDescendant, removeNode, addNodeToParent, moveNode, getAllIds, searchTree, countNodes, FlatBOMEntry, flattenBOM, PL_DATABASE, getPLRecord, INITIAL_BOM_TREE | 0 | 0 | 0 | - | - | none | high |
| `src/src/lib/designSystem.ts` | util | DESIGN_TOKENS, ComponentEntry, COMPONENT_INVENTORY, ScreenMapping, SCREEN_MAP, FlowEntry, USER_FLOWS, StateDefinition, STATE_MATRIX, NAMING_CONVENTIONS, FIGMA_FILE_STRUCTURE | 0 | 0 | 0 | useEffect, useLocation, useRef | - | none | high |
| `src/src/lib/mock.ts` | util | MOCK_DOCUMENTS, MOCK_PL_RECORDS, MOCK_BOM_TREE, MOCK_AUDIT_LOG | 0 | 0 | 0 | - | - | none | medium |
| `src/src/lib/mockExtended.ts` | util | MOCK_SEARCH_RESULTS, MOCK_WORK_LEDGER, MOCK_CASES, MOCK_APPROVALS, MOCK_OCR_JOBS, MOCK_AUDIT_EXTENDED, MOCK_NOTIFICATIONS, MOCK_BANNERS, MOCK_REPORTS | 0 | 0 | 0 | - | - | none | low |
| `src/src/pages/AdminWorkspace.tsx` | page | AdminWorkspace, function | 1 | 1 | 2 | useNavigate | - | none | medium |
| `src/src/pages/Approvals.tsx` | page | Approvals, function | 1 | 1 | 3 | useNavigate, useState | - | none | medium |
| `src/src/pages/AuditLog.tsx` | page | AuditLog, function | 1 | 1 | 2 | useState | - | none | low |
| `src/src/pages/BOMExplorer.tsx` | page | BOMExplorer, function | 2 | 1 | 5 | useAuth, useCallback, useDrag, useDrop, useEffect | - | inline | high |
| `src/src/pages/BannerManagement.tsx` | page | BannerManagement, function | 1 | 1 | 2 | useState | - | none | low |
| `src/src/pages/Cases.tsx` | page | Cases, function | 1 | 1 | 3 | useNavigate, useState | - | none | medium |
| `src/src/pages/Dashboard.tsx` | page | Dashboard, function | 1 | 1 | 2 | - | - | none | medium |
| `src/src/pages/DesignSystem.tsx` | page | DesignSystem, function | 1 | 1 | 2 | useState | - | inline | high |
| `src/src/pages/DocumentDetail.tsx` | page | DocumentDetail, function | 2 | 1 | 3 | useMemo, useNavigate, useParams, useState | - | none | high |
| `src/src/pages/Documents.tsx` | page | Documents, function | 2 | 1 | 3 | useAuth, useMemo, useNavigate, useRef, useState | - | none | high |
| `src/src/pages/LedgerReports.tsx` | page | LedgerReports, function | 1 | 1 | 3 | useState | - | none | medium |
| `src/src/pages/Login.tsx` | page | Login, function | 1 | 0 | 3 | useAuth, useState | - | none | medium |
| `src/src/pages/OCRMonitor.tsx` | page | OCRMonitor, function | 1 | 1 | 3 | useNavigate, useState | - | none | medium |
| `src/src/pages/PLDetail.tsx` | page | PLDetail, function | 2 | 1 | 3 | useMemo, useNavigate, useParams, useState | - | inline | high |
| `src/src/pages/PLKnowledgeHub.tsx` | page | PLKnowledgeHub, function | 2 | 1 | 3 | useNavigate, useState | - | inline | high |
| `src/src/pages/Placeholder.tsx` | page | Placeholder, function | 0 | 0 | 0 | - | - | inline | low |
| `src/src/pages/Reports.tsx` | page | Reports, function | 1 | 1 | 3 | useState | - | none | low |
| `src/src/pages/RestrictedAccess.tsx` | page | RestrictedAccess, function | 0 | 1 | 2 | useNavigate | - | none | low |
| `src/src/pages/Settings.tsx` | page | Settings, function | 0 | 1 | 2 | useState | - | none | medium |
| `src/src/pages/WorkLedger.tsx` | page | WorkLedger, function | 1 | 1 | 3 | useNavigate, useState | - | none | medium |
| `src/src/routes.ts` | util | router | 20 | 0 | 1 | - | - | none | low |

**High complexity targets:** `src/components/Sidebar.tsx`, `src/components/ui/carousel.tsx`, `src/components/ui/chart.tsx`, `src/components/ui/context-menu.tsx`, `src/components/ui/dropdown-menu.tsx`, `src/components/ui/menubar.tsx`, `src/components/ui/sidebar.tsx`, `src/src/components/layout/Header.tsx`, `src/src/lib/bomData.ts`, `src/src/lib/designSystem.ts`, `src/src/pages/BOMExplorer.tsx`, `src/src/pages/DesignSystem.tsx`, `src/src/pages/DocumentDetail.tsx`, `src/src/pages/Documents.tsx`, `src/src/pages/PLDetail.tsx`, `src/src/pages/PLKnowledgeHub.tsx`

## Graphify JSON
Graph exported to `GRAPHIFY_DEPENDENCY_GRAPH.json` with corrected edge semantics (no pseudo export edges).

## ESLint/TypeScript Findings (Simulated)
FINDING | Rule: @typescript-eslint/no-explicit-any | File: src/src/components/layout/Sidebar.tsx:L14 | Severity: WARN | Fix: replace any with concrete type
FINDING | Rule: typescript/no-unsafe-cast | File: src/src/pages/BOMExplorer.tsx:L247 | Severity: WARN | Fix: remove double-cast with typed callback
FINDING | Rule: @typescript-eslint/no-explicit-any | File: src/src/pages/PLDetail.tsx:L93 | Severity: WARN | Fix: replace any with concrete type
FINDING | Rule: @typescript-eslint/no-explicit-any | File: src/src/pages/PLDetail.tsx:L651 | Severity: WARN | Fix: replace any with concrete type
FINDING | Rule: @typescript-eslint/no-explicit-any | File: src/src/pages/PLDetail.tsx:L653 | Severity: WARN | Fix: replace any with concrete type
FINDING | Rule: @typescript-eslint/no-explicit-any | File: src/src/pages/PLDetail.tsx:L714 | Severity: WARN | Fix: replace any with concrete type

## shadcn/ui Audit

| shadcn Component | Used In | Override Type | Risk | Recommendation |
|---|---|---|---|---|
| `accordion` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `alert` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `alert-dialog` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `aspect-ratio` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `avatar` | src/components/ActivityFeed.tsx | variant + className mix | Low | Prefer variant-driven tokens and avoid hardcoded palette utilities |
| `badge` | src/components/Dashboard.tsx, src/components/RecentFilesList.tsx, src/components/StorageAnalytics.tsx | variant + className mix | Low | Prefer variant-driven tokens and avoid hardcoded palette utilities |
| `breadcrumb` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `button` | src/components/Documents.tsx, src/components/QuickActions.tsx | variant + className mix | Low | Prefer variant-driven tokens and avoid hardcoded palette utilities |
| `calendar` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `card` | src/components/ActivityFeed.tsx, src/components/Documents.tsx, src/components/QuickActions.tsx … | variant + className mix | Low | Prefer variant-driven tokens and avoid hardcoded palette utilities |
| `carousel` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `chart` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `checkbox` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `collapsible` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `command` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `context-menu` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `dialog` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `drawer` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `dropdown-menu` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `form` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `hover-card` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `input` | src/components/Documents.tsx | variant + className mix | Low | Prefer variant-driven tokens and avoid hardcoded palette utilities |
| `input-otp` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `label` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `menubar` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `navigation-menu` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `pagination` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `popover` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `progress` | src/components/StorageOverviewCard.tsx | variant + className mix | Low | Prefer variant-driven tokens and avoid hardcoded palette utilities |
| `radio-group` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `resizable` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `scroll-area` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `select` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `separator` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `sheet` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `sidebar` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `skeleton` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `slider` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `sonner` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `switch` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `table` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `tabs` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `textarea` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `toggle` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `toggle-group` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `tooltip` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `use-mobile` | Not currently consumed | n/a | Medium | Remove or defer-load unused primitive |
| `utils` | src/components/Sidebar.tsx | variant + className mix | Low | Prefer variant-driven tokens and avoid hardcoded palette utilities |
