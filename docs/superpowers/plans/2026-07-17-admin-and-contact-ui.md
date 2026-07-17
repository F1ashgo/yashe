# Admin and Contact UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the administrator dashboard into notification and user pages, centralize API/social behavior, add Turnstile to public forms, and preserve the existing brand and functionality.

**Architecture:** Typed service modules own API envelopes, authentication, and errors. An `AdminLayout` provides the company header and top tabs; lazy-loaded pages own notification or user state. Shared social and Turnstile components remove repeated integration logic.

**Tech Stack:** React 18, TypeScript 5.6, React Router 6, Vite 5, Vitest 2.1.9, Testing Library, jsdom 25.

## Global Constraints

- Preserve the black, gold, and cream visual language.
- Use top tabs labelled `通知推送` and `用户管理`.
- Header text order is `广州雅舍室内设计有限公司` then `管理后台`.
- Keep current in-app notification and user-management functionality.
- Footer removes phone/email; Contact page keeps them.
- Social links are centralized and used by Footer, Sidebar, and Contact.
- Admin pages are lazy-loaded for performance, not security.
- API errors use the existing `{code, message, data}` envelope.
- Commits follow Conventional Commits on `feat/security-responsive-admin`.

---

### Task 1: Frontend test foundation

**Files:**
- Modify: `view/package.json`
- Modify: `view/package-lock.json`
- Modify: `view/tsconfig.app.json`
- Modify: `view/vite.config.ts`
- Create: `view/src/test/setup.ts`
- Create: `view/src/test/renderWithRouter.tsx`

- [ ] **Step 1: Install compatible dependencies**

```powershell
cd view
npm install -D vitest@2.1.9 jsdom@25.0.1 @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Configure jsdom**

Add Vitest config to `vite.config.ts`, `vitest/globals` to TypeScript types, and setup:

```ts
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
})
```

- [ ] **Step 3: Verify baseline**

Create a smoke test rendering `App` in `MemoryRouter`, run `npm test`, then `npm run build`.

- [ ] **Step 4: Commit**

```powershell
git add view
git commit -m "test: add frontend component test foundation"
```

---

### Task 2: Typed API client

**Files:**
- Create: `view/src/types/api.ts`
- Create: `view/src/types/admin.ts`
- Create: `view/src/services/apiClient.ts`
- Create: `view/src/services/authApi.ts`
- Create: `view/src/services/adminApi.ts`
- Create: `view/src/services/notificationApi.ts`
- Create: `view/src/services/contactApi.ts`
- Test: `view/src/services/apiClient.test.ts`

**Interfaces:**

```ts
export interface ApiResponse<T> { code: number; message: string; data: T }
export class ApiError extends Error {
  constructor(public status: number, message: string, public retryAfter?: number)
}
export function requestJson<T>(path: string, init?: RequestInit, token?: string): Promise<ApiResponse<T>>
```

- [ ] **Step 1: Write failing client tests**

Cover base URL, JSON body, Bearer header, malformed JSON, backend message, 401/403, and 429 `Retry-After`.

- [ ] **Step 2: Confirm RED**

```powershell
npm test -- src/services/apiClient.test.ts
```

- [ ] **Step 3: Implement minimal typed services**

Keep token keys `access_token` and `admin_token` for compatibility. Admin member response adapter temporarily handles both `data.list` and historical `data.data.list`.

- [ ] **Step 4: Verify and commit**

```powershell
npm test -- src/services/apiClient.test.ts
npm run build
git add view/src/services view/src/types
git commit -m "refactor: centralize frontend API requests"
```

---

### Task 3: Admin layout, guard, routes, and lazy loading

**Files:**
- Create: `view/src/layouts/AdminLayout.tsx`
- Create: `view/src/layouts/AdminLayout.css`
- Create: `view/src/components/RequireAdmin.tsx`
- Create: `view/src/components/admin/AdminHeader.tsx`
- Create: `view/src/components/admin/AdminTabs.tsx`
- Modify: `view/src/App.tsx`
- Test: `view/src/App.test.tsx`
- Test: `view/src/components/RequireAdmin.test.tsx`

- [ ] **Step 1: Write route and guard tests**

Verify:

```text
/admin -> /admin/notifications
/admin/dashboard -> /admin/notifications
/admin/unknown -> /admin/notifications
no admin token -> /admin/login
member /auth/me -> /admin/login with permission message
admin -> protected page
```

Also assert company text appears before `管理后台` and both tabs have correct active states.

- [ ] **Step 2: Confirm RED**

Current app has only `/admin/login` and `/admin/dashboard`.

- [ ] **Step 3: Implement layout and lazy routes**

Use:

```tsx
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
```

`RequireAdmin` validates `/auth/me`; 401/403 clears `admin_token`. `AdminLayout` renders `<Outlet />` and the top tabs.

- [ ] **Step 4: Verify and commit**

```powershell
npm test -- src/App.test.tsx src/components/RequireAdmin.test.tsx
npm run build
git add view/src
git commit -m "feat: add split administrator routes"
```

---

### Task 4: Notification management page

**Files:**
- Create: `view/src/pages/admin/AdminNotifications.tsx`
- Create: `view/src/pages/admin/AdminNotifications.css`
- Test: `view/src/pages/admin/AdminNotifications.test.tsx`
- Modify/Delete: notification portions of `view/src/pages/Dashboard.tsx`

- [ ] **Step 1: Write CRUD tests**

Cover list, create, publish/hide, delete confirmation, missing resource, network failure, and auth expiry. Each test asserts visible user feedback.

- [ ] **Step 2: Confirm RED**

The page does not exist.

- [ ] **Step 3: Move notification behavior**

Use `adminApi` only. Preserve fields title/content/type/status. Desktop may use a compact list; mobile markup uses cards. Buttons have explicit labels and minimum 44px hit areas.

- [ ] **Step 4: Verify and commit**

```powershell
npm test -- src/pages/admin/AdminNotifications.test.tsx
npm run build
git add view/src/pages/admin view/src/pages/Dashboard.tsx
git commit -m "feat: add administrator notification page"
```

---

### Task 5: User management page

**Files:**
- Create: `view/src/pages/admin/AdminUsers.tsx`
- Create: `view/src/pages/admin/AdminUsers.css`
- Create: `view/src/components/admin/UserCard.tsx`
- Create: `view/src/components/admin/UserDetails.tsx`
- Test: `view/src/pages/admin/AdminUsers.test.tsx`
- Delete: `view/src/pages/Dashboard.tsx`
- Delete/replace: `view/src/pages/Dashboard.css`

- [ ] **Step 1: Write user-page tests**

Cover stats, search encoding/debounce, pagination, errors, retry, stale-response cancellation, desktop table, mobile card markup, and keyboard-accessible details toggle.

- [ ] **Step 2: Confirm RED**

- [ ] **Step 3: Move user behavior**

Preserve total/today, email search, pagination, and details. Use semantic buttons instead of row-level `onClick`. Render desktop table and mobile cards from the same typed data.

- [ ] **Step 4: Verify and commit**

```powershell
npm test -- src/pages/admin/AdminUsers.test.tsx
npm run build
git add -A view/src
git commit -m "feat: add administrator user page"
```

---

### Task 6: Social links and Footer contact changes

**Files:**
- Create: `view/src/config/social.ts`
- Modify: `view/src/components/Footer.tsx`
- Modify: `view/src/components/Footer.css`
- Modify: `view/src/components/Sidebar.tsx`
- Modify: `view/src/pages/Contact.tsx`
- Test: `view/src/components/Footer.test.tsx`
- Test: `view/src/config/social.test.ts`

**Interfaces:**

```ts
export const SOCIAL_LINKS = {
  xiaohongshu: 'https://www.xiaohongshu.com/user/profile/63e98de00000000026005afc?xsec_token=YBaFN7pmOmDwybO_l6QU0P-J6XnHyFFI9CEaLDV3h7kac=&xsec_source=app_share&xhsshare=WeixinSession&appuid=5f1d06d70000000001006c3c&apptime=1784281180&share_id=385d5de9ad714c6fbdd024fee6e203a4',
  douyin: 'https://v.douyin.com/k43Gt3WVPC0/',
} as const
```

- [ ] **Step 1: Write failing content tests**

Assert Footer has no telephone/email text or links, still has address and QR code, and all three consumers use the exact shared Xiaohongshu/Douyin URLs.

- [ ] **Step 2: Confirm RED**

- [ ] **Step 3: Centralize and update**

Remove `Phone`/`Mail` Footer imports and list items. Keep Contact page contact information and Sidebar phone button. Update Footer columns without changing brand styles.

- [ ] **Step 4: Verify and commit**

```powershell
npm test -- src/components/Footer.test.tsx src/config/social.test.ts
npm run build
git add view/src
git commit -m "fix: update footer and social links"
```

---

### Task 7: Turnstile component and form integration

**Files:**
- Create: `view/src/components/TurnstileWidget.tsx`
- Create: `view/src/components/TurnstileWidget.css`
- Create: `view/src/types/turnstile.d.ts`
- Modify: `view/src/pages/Member.tsx`
- Modify: `view/src/pages/Contact.tsx`
- Modify: `view/.env.example`
- Modify: `view/public/_headers`
- Test: `view/src/components/TurnstileWidget.test.tsx`
- Test: `view/src/pages/Member.test.tsx`
- Test: `view/src/pages/Contact.test.tsx`

**Interfaces:**

```ts
interface TurnstileWidgetProps {
  action: 'register' | 'contact'
  onTokenChange(token: string | null): void
  resetKey: number
}
```

- [ ] **Step 1: Write widget and form tests**

Mock `window.turnstile`. Test script success/failure, callback, expiry, reset, registration-only rendering, form blocking without token, token body field, and reset after success.

- [ ] **Step 2: Confirm RED**

- [ ] **Step 3: Implement fail-closed UI**

Read only `VITE_TURNSTILE_SITE_KEY`; never expose the secret. Show a clear error if the script or key is unavailable. Add `turnstileToken` to register/contact service requests.

Update CSP to allow only required Cloudflare Turnstile `script-src`, `frame-src`, and `connect-src` in addition to existing origins.

- [ ] **Step 4: Verify and commit**

```powershell
npm test -- src/components/TurnstileWidget.test.tsx src/pages/Member.test.tsx src/pages/Contact.test.tsx
npm run build
git add view
git commit -m "feat: add Turnstile to public forms"
```

---

### Task 8: Member notification refresh and authorization

**Files:**
- Modify: `view/src/pages/Member.tsx`
- Modify: `view/src/services/notificationApi.ts`
- Test: `view/src/pages/Member.test.tsx`

- [ ] **Step 1: Add failing tests**

Assert latest notifications carry the member Bearer token; anonymous users do not request them; successful login and registration immediately request them; 401 clears `access_token`.

- [ ] **Step 2: Implement refresh after authentication**

Extract `loadNotifications(token)` and call it after token persistence in both flows. Render only response DTO fields.

- [ ] **Step 3: Verify and commit**

```powershell
npm test -- src/pages/Member.test.tsx
npm run build
git add view/src/pages/Member.tsx view/src/services/notificationApi.ts
git commit -m "fix: refresh authenticated member notifications"
```

