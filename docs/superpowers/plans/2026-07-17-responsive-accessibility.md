# Responsive and Accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every public, member, login, and administrator page usable from 320px upward without horizontal overflow while preserving the existing brand.

**Architecture:** Global responsive tokens establish spacing, focus, touch, and reduced-motion behavior. Navigation and modal primitives own interaction accessibility; individual pages then receive scoped layout corrections verified by Playwright viewports.

**Tech Stack:** React 18, TypeScript, CSS, Playwright Chromium, Vitest/Testing Library.

## Global Constraints

- Preserve existing colors, typography, content, and desktop functionality.
- Support widths 320, 360, 390, 430, 768, 820, 1024, and desktop.
- No page-level horizontal scrolling.
- Key touch controls are at least 44×44px.
- Keyboard focus remains visible.
- Respect `prefers-reduced-motion`.
- Do not use `overflow-x:hidden` as the sole fix for overflowing content.
- Commits follow Conventional Commits on `feat/security-responsive-admin`.

---

### Task 1: Playwright responsive test foundation

**Files:**
- Modify: `view/package.json`
- Modify: `view/package-lock.json`
- Create: `view/playwright.config.ts`
- Create: `view/tests/e2e/helpers.ts`
- Create: `view/tests/e2e/responsive.spec.ts`

- [ ] **Step 1: Install and configure Playwright**

```powershell
cd view
npm install -D @playwright/test
npx playwright install chromium
```

Add scripts:

```json
"test:e2e": "playwright test",
"test:e2e:responsive": "playwright test tests/e2e/responsive.spec.ts"
```

Use Vite preview/webServer and projects for 320×800, 390×844, 768×1024, 1024×768, and desktop.

- [ ] **Step 2: Write the failing overflow sweep**

For `/`, `/about`, `/services`, `/projects`, `/member`, `/contact`, `/admin/login`, `/admin/notifications`, `/admin/users`:

```ts
const sizes = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
}))
expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth)
```

Mock API routes for member/admin pages and seed admin token where required.

- [ ] **Step 3: Confirm RED and commit the test foundation**

```powershell
npm run test:e2e:responsive
git add view
git commit -m "test: add responsive browser regression suite"
```

The suite is expected to remain red until later tasks.

---

### Task 2: Global responsive and accessibility tokens

**Files:**
- Modify: `view/src/index.css`
- Modify: `view/src/App.css`
- Test: `view/tests/e2e/responsive.spec.ts`
- Test: `view/tests/e2e/touch-targets.spec.ts`
- Test: `view/tests/e2e/reduced-motion.spec.ts`

- [ ] **Step 1: Add failing token tests**

Assert mobile `.container` has 16–20px side padding, representative controls are at least 44px, focus-visible outline is nonzero, and reduced motion disables smooth scrolling/long animations.

- [ ] **Step 2: Implement global tokens**

Add:

```css
:root {
  --space-page-mobile: 18px;
  --touch-target: 44px;
  --focus-ring: 2px solid var(--color-gold);
}

@media (max-width: 768px) {
  .container { padding-inline: var(--space-page-mobile); }
}

:where(a, button, input, textarea, select):focus-visible {
  outline: var(--focus-ring);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

Use `min-width:0`, safe wrapping, and box sizing. Remove any global button outline suppression that lacks replacement.

- [ ] **Step 3: Verify and commit**

```powershell
npm test
npm run test:e2e -- tests/e2e/touch-targets.spec.ts tests/e2e/reduced-motion.spec.ts
git add view
git commit -m "style: add responsive accessibility baseline"
```

---

### Task 3: Mobile navigation

**Files:**
- Modify: `view/src/components/Header.tsx`
- Modify: `view/src/components/Header.css`
- Test: `view/src/components/Header.test.tsx`
- Test: `view/tests/e2e/navigation.spec.ts`

- [ ] **Step 1: Write failing interaction tests**

Cover `aria-expanded`, Escape close, route-change close, body scroll lock, focus movement into menu, focus restoration, backdrop click, low-height scrolling, and 44px menu button.

- [ ] **Step 2: Implement accessible navigation**

Switch to mobile layout at a calibrated tablet breakpoint near 1024px. Add backdrop, `overflow-y:auto`, `100dvh`, safe-area padding, and a dialog-like menu with focus management.

- [ ] **Step 3: Verify and commit**

```powershell
npm test -- src/components/Header.test.tsx
npm run test:e2e -- tests/e2e/navigation.spec.ts
git add view/src/components/Header.*
git commit -m "fix: improve mobile navigation"
```

---

### Task 4: Shared modal and lightbox accessibility

**Files:**
- Create: `view/src/components/Modal.tsx`
- Create: `view/src/components/Modal.css`
- Create: `view/src/components/Lightbox.tsx`
- Create: `view/src/hooks/useBodyScrollLock.ts`
- Create: `view/src/hooks/useSwipe.ts`
- Modify: `view/src/pages/Home.tsx`
- Modify: `view/src/pages/Home.css`
- Modify: `view/src/pages/Projects.tsx`
- Modify: `view/src/pages/Projects.css`
- Modify: `view/src/pages/About.tsx`
- Modify: `view/src/pages/About.css`
- Test: `view/src/components/Lightbox.test.tsx`
- Test: `view/tests/e2e/lightbox.spec.ts`

- [ ] **Step 1: Write failing modal tests**

Assert `role=dialog`, `aria-modal`, Escape, direction keys, backdrop close, scroll lock, focus trap/restoration, unmount cleanup, swipe direction, and 44px controls.

- [ ] **Step 2: Implement primitives**

`Modal` owns focus/scroll/backdrop. `Lightbox` accepts image items, current index, next/previous callbacks, and an optional caption. Use internal scrolling on short landscape viewports.

- [ ] **Step 3: Replace page-specific overlays**

Project cards become semantic buttons. Home, Projects, and About use the shared primitive; existing visual styling is translated into scoped classes.

- [ ] **Step 4: Verify and commit**

```powershell
npm test -- src/components/Lightbox.test.tsx
npm run test:e2e -- tests/e2e/lightbox.spec.ts
git add view/src
git commit -m "fix: make image lightboxes mobile accessible"
```

---

### Task 5: Public-page mobile layouts

**Files:**
- Modify: `view/src/pages/Home.css`
- Modify: `view/src/pages/About.css`
- Modify: `view/src/components/CompanyStory.css`
- Modify: `view/src/pages/Services.css`
- Modify: `view/src/components/ExpertiseContent.tsx`
- Modify: `view/src/components/ExpertiseContent.css`
- Modify: `view/src/pages/Projects.css`
- Modify: `view/src/pages/Contact.css`
- Modify: `view/src/components/Footer.css`
- Test: `view/tests/e2e/responsive.spec.ts`

- [ ] **Step 1: Capture failing routes and exact overflowing selectors**

Run only public routes at each viewport and save Playwright screenshots/traces for failures.

- [ ] **Step 2: Correct each layout**

Required corrections:

- Home hero text wraps; low-height landscape uses content-driven height; carousel dots expose 44px buttons; video uses `preload="metadata"` and a poster/fallback.
- About/CompanyStory reduces mobile indent and section gaps.
- Services/Expertise accordions expose `aria-expanded`/`aria-controls`; cards fit 320px.
- Projects grid/lightbox uses responsive media dimensions.
- Contact reduces 100px section spacing and 32px card padding on mobile.
- Footer adapts its reduced contact column without empty space.

- [ ] **Step 3: Verify and commit**

```powershell
npm run test:e2e:responsive
npm run build
git add view/src
git commit -m "style: optimize public pages for mobile"
```

---

### Task 6: Member and administrator mobile layouts

**Files:**
- Refactor: `view/src/pages/Member.css`
- Modify: `view/src/pages/Member.tsx`
- Modify: `view/src/pages/AdminLogin.css`
- Modify: `view/src/layouts/AdminLayout.css`
- Modify: `view/src/pages/admin/AdminNotifications.css`
- Modify: `view/src/pages/admin/AdminUsers.css`
- Test: `view/tests/e2e/admin.spec.ts`
- Test: `view/tests/e2e/responsive.spec.ts`

- [ ] **Step 1: Write page-specific mobile assertions**

At 320/390px assert:

- Member forms and cards do not overflow.
- password, copy, star, and submit controls meet touch size.
- AdminLogin card fits safe area.
- company name/header actions wrap without overlap.
- top tabs stay visible and equal width.
- notification actions are reachable.
- user cards are shown and desktop table is hidden.

- [ ] **Step 2: Refactor Member CSS**

Collapse repeated `.mem-form-wrapper--member` and conflicting breakpoint blocks into one source of truth. Preserve desktop layouts before adding mobile rules.

- [ ] **Step 3: Implement admin mobile layouts**

Use content-driven header rows, equal top tabs, single-column forms/cards, wrapped emails, and safe-area padding. Do not use a horizontally scrolling six-column table on mobile.

- [ ] **Step 4: Verify and commit**

```powershell
npm run test:e2e -- tests/e2e/admin.spec.ts tests/e2e/responsive.spec.ts
npm run build
git add view/src
git commit -m "style: optimize member and admin mobile layouts"
```

---

### Task 7: Final responsive regression and documentation

**Files:**
- Modify: `README.md`
- Modify: `view/tests/e2e/responsive.spec.ts`

- [ ] **Step 1: Run complete frontend verification**

```powershell
cd view
npm ci
npm test
npm run build
npm run test:e2e
```

Expected: all component and browser tests PASS at every configured viewport.

- [ ] **Step 2: Verify bundle splitting**

Inspect `dist/assets` and assert admin page code is emitted separately from the main chunk. Record this as a performance result, not a security boundary.

- [ ] **Step 3: Update README**

Document:

- mobile support baseline;
- component/e2e commands;
- Turnstile site key variable;
- admin routes;
- update record `2026-07-17 | 安全整改、后台拆页与全站手机端优化 | Si_Nan`.

- [ ] **Step 4: Commit**

```powershell
git add README.md view/tests
git commit -m "docs: record responsive security update"
```

