# Comprehensive Accessibility (a11y) Improvement Plan

## Implementation Progress

**Overall Status**: 🟡 In Progress (16% complete)

**Phase 1 (Critical Foundation)**: 🟡 In Progress

- ✅ 1.1 Skip Links & Landmark Regions - COMPLETED
- 🟡 1.2 Live Regions - Hook/Component COMPLETED, Integration Pending
- ⏳ 1.3 Focus Trap - Pending

**Phase 2 (Forms & Interactive)**: ⏳ Pending
**Phase 3 (Testing & Semantic)**: ⏳ Pending
**Phase 4 (Contrast & Polish)**: ⏳ Pending

**Tests**: 31 passing (10 skip-links + 21 live-region)
**TypeScript**: ✅ Compiles successfully

---

## Goal

Achieve WCAG 2.1 AA compliance across all pages of the store website (including the testimonials page) through comprehensive accessibility improvements.

## Current State

- **A11y Maturity**: 6/10 (Intermediate)
- **Strengths**: Good ARIA usage in key components, solid keyboard navigation, proper semantic HTML
- **Critical Gaps**: No skip links, missing live regions, incomplete focus traps, no automated a11y testing

## Target Compliance

- **Standard**: WCAG 2.1 AA
- **Focus Areas**: Screen reader support, keyboard-only navigation, color contrast, automated testing

---

## Phase 1: Critical Foundation

### ✅ 1.1 Skip Links & Landmark Regions - COMPLETED

**Impact**: Every page load for keyboard/screen reader users

**New Components**:

- `/src/components/layout/skip-links.tsx` - Skip navigation component
- `/src/components/layout/skip-links.spec.tsx` - Tests

**Modifications**:

- `/src/components/layout/app-layout.tsx`:
    - Add `<SkipLinks />` as first element in return
    - Add `id="main-content"` to `<main>` element (line 41)
- `/src/components/layout/header.tsx`:
    - Add `role="banner"` to `<header>` tag (line 184)
    - Add `id="navigation"` to nav or header
- `/src/components/layout/footer.tsx`:
    - Add `role="contentinfo"` to `<footer>` tag (line 42)
    - Add `id="footer"` to footer

**SkipLinks Structure**:

```typescript
// Hidden by default, visible on focus
// Links: Skip to main content (#main-content), Skip to navigation (#navigation),
//        Skip to footer (#footer), Open command palette (triggers keyboard shortcut)
```

### ✅ 1.2 Live Regions for Dynamic Content - COMPLETED (Partial)

**Impact**: Users don't know when search results or filters change

**Status**: Hook and component created ✅, integration pending

**New Files**:

- `/src/hooks/use-live-region.ts` - Custom hook for announcements
- `/src/hooks/use-live-region.spec.ts` - Tests
- `/src/components/ui/live-region.tsx` - ARIA live region component
- `/src/components/ui/live-region.spec.tsx` - Tests

**Modifications**:

- `/src/components/products/command-palette.tsx`:
    - Add result count announcements: "{count} results found"
    - Announce navigation: "{index} of {total}"
    - Announce selection: "Selected {title}"
- `/src/components/tools/tools-filter.tsx`:
    - Announce filter result changes

**LiveRegion Component**:

```typescript
// Props: message: string, politeness: 'polite' | 'assertive' | 'off'
// <div role="status" aria-live={politeness} aria-atomic="true" className="sr-only">
// Auto-clears message after announcement to prevent duplication
```

### 1.3 Focus Trap for Modals

**Impact**: Users can tab outside modals, breaking interaction flow

**New Files**:

- `/src/hooks/use-focus-trap.ts` - Modal focus management hook
- `/src/hooks/use-focus-trap.spec.ts` - Tests

**Modifications**:

- `/src/components/tools/tool-detail-modal.tsx`:
    - Implement focus trap using useFocusTrap hook
    - Track trigger element for focus restoration
    - Ensure Tab/Shift+Tab cycles within modal only
- `/src/components/products/command-palette.tsx`:
    - Verify existing focus trap is robust

**useFocusTrap Hook**:

```typescript
// Parameters: containerRef: RefObject<HTMLElement>, isActive: boolean
// Logic: Find focusable elements, handle Tab/Shift+Tab, wrap focus, restore on close
```

---

## Phase 2: Forms & Interactive Elements

### 2.1 Form Field Error Handling

**Impact**: Users can't identify or fix form validation errors

**New Components**:

- `/src/components/ui/form-error.tsx` - Accessible error message component
- `/src/components/ui/form-error.spec.tsx` - Tests
- `/src/components/ui/form-field.tsx` - Reusable field wrapper with labels/errors
- `/src/components/ui/form-field.spec.tsx` - Tests

**Modifications**:

- `/src/components/layout/footer.tsx`:
    - Newsletter form already has good labels (line 66-68)
    - Add `aria-invalid` state on validation error
    - Add visible error message with `role="alert"`
    - Ensure error is connected via `aria-describedby`

**FormField Component**:

```typescript
// Props: label, id, error?, required?, children
// Connects: aria-describedby to error, aria-invalid when error, aria-required
```

### 2.2 Carousel Accessibility

**Impact**: Carousels auto-play without pause, lack keyboard nav

**Modifications**:

- `/src/components/products/product-carousel.tsx`:
    - Add pause/play button (Space key pauses)
    - Add `role="region"` with `aria-label="Featured products carousel"`
    - Add `aria-live="polite"` for **manual navigation only** (not auto-rotation)
    - Add Left/Right arrow key navigation
    - Improve button labels: "Go to slide {X} of {Y}"
    - Add `aria-current="true"` to active dot indicator

- `/src/pages/all-testimonials.tsx`:
    - **ProductTestimonialsCarousel** component (lines 27-155):
        - Add pause/play button (Space key pauses)
        - Add `role="region"` with `aria-label="Testimonials for {productName}"`
        - Add `aria-live="polite"` for **manual navigation only**
        - Add Left/Right arrow key navigation
        - Current buttons have aria-labels ✓ (lines 111, 118)
        - Add keyboard handler for arrow keys anywhere in carousel region

- `/src/components/products/product-testimonials.tsx`:
    - Mobile carousel component (lines 162-232):
        - Add pause/play button (Space key pauses)
        - Add `role="region"` with `aria-label="Customer testimonials"`
        - Add `aria-live="polite"` for **manual navigation only**
        - Add Left/Right arrow key navigation
        - Current buttons have aria-labels ✓ (lines 191, 199)

**ARIA Structure**:

```typescript
<div role="region" aria-label="Featured products carousel" aria-live="off">
  <button aria-label="Pause carousel">Pause</button>
  <div role="group" aria-label="Slide 1 of 5">{/* products */}</div>
  <button aria-label="Previous slide">...</button>
  <button aria-label="Next slide">...</button>
  <div role="tablist">
    <button role="tab" aria-selected={current} aria-label="Slide 1">...</button>
  </div>
  {/* Live region announces ONLY on manual navigation */}
  <div role="status" aria-live="polite" className="sr-only">
    Showing slide {current + 1} of {total}
  </div>
</div>
```

**Note**: aria-live announcements trigger only when user clicks prev/next/dots, NOT on auto-rotation (per user preference).

### 2.3 Testimonial Card Keyboard Accessibility

**Impact**: Clickable testimonial cards not keyboard accessible

**Modifications**:

- `/src/components/testimonials/testimonial-card-linked.tsx`:
    - Line 58: Currently `onClick={handleCardClick}` on div
    - Add `tabIndex={0}` to make div focusable
    - Add `role="link"` (navigates to product page)
    - Add `onKeyDown` handler for Enter/Space keys
    - Prevent default on Enter to avoid double-navigation
    - Add focus styles: `focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:outline-none`

**Implementation Pattern**:

```typescript
<Component
  onClick={handleCardClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCardClick()
    }
  }}
  tabIndex={0}
  role="link"
  aria-label={`Read testimonial from ${testimonial.author} for ${productName}`}
  className="...cursor-pointer focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:outline-none"
>
```

---

## Phase 3: Automated Testing & Semantic Improvements

### 3.1 Axe-Core Integration

**Impact**: Prevents future a11y regressions, catches violations automatically

**Package Changes**:

- `/package.json`:
    - Add `"axe-core": "^4.10.0"`
    - Add `"jest-axe": "^9.0.0"` (verify Bun compatibility, may need `@axe-core/react`)

**New Files**:

- `/src/test/a11y-test-utils.ts` - Axe configuration and helper functions
- `/src/test/a11y-test-utils.spec.ts` - Tests for helpers

**Modifications to ALL Component Tests**:

- Add `await checkA11y(container)` test to every `.spec.tsx` file
- Example pattern (from breadcrumb.spec.tsx as template):

```typescript
it('should have no accessibility violations', async () => {
  const { container } = render(<Component {...props} />)
  await checkA11y(container)
})
```

**Priority Components to Test First**:

1. `/src/components/products/product-card-ecommerce.spec.tsx`
2. `/src/components/products/command-palette.spec.tsx`
3. `/src/components/layout/header.spec.tsx` (create if missing)
4. `/src/components/products/product-carousel.spec.tsx`
5. `/src/components/tools/tool-detail-modal.spec.tsx`

### 3.2 Icon Accessibility

**Impact**: Decorative icons announced unnecessarily by screen readers

**Modifications**:

- `/src/components/tools/tool-icon.tsx`:
    - Add `decorative?: boolean` prop (default: true when next to text)
    - Add `label?: string` prop for standalone icons
    - Render: `aria-hidden="true"` when decorative, `aria-label` when meaningful
- `/src/components/ui/dynamic-icon.tsx`:
    - Same pattern as tool-icon
- `/src/components/products/product-card-ecommerce.tsx`:
    - Review all icons, add `aria-hidden="true"` to decorative icons
    - Ensure wishlist button has icon with `aria-hidden="true"`, label on button

**Star Rating Accessibility**:

- `/src/components/testimonials/testimonial-card-linked.tsx`:
    - Lines 70-79: Star rating display
    - Add `aria-label="Rated {rating} out of 5 stars"` to rating container div
    - Add `aria-hidden="true"` to each individual star icon
- `/src/components/products/product-testimonials.tsx`:
    - Lines 29-38: Star rating display
    - Same pattern: aria-label on container, aria-hidden on icons
- `/src/pages/all-testimonials.tsx`:
    - Line 300: Decorative star icon should have `aria-hidden="true"`

**Pattern Decision Tree**:

```typescript
// Decorative (next to text): <Icon aria-hidden="true" /> Label text
// Standalone meaningful: <Icon aria-label="Add to wishlist" />
// Button with icon: <button aria-label="Close"><Icon aria-hidden="true" /></button>
// Star rating pattern:
<div aria-label={`Rated ${rating} out of 5 stars`} className="flex gap-1">
  {Array.from({ length: 5 }).map((_, i) => (
    <FaStar key={i} aria-hidden="true" className={...} />
  ))}
</div>
```

### 3.3 Semantic HTML Enhancements

**Impact**: Improves screen reader navigation with landmarks

**Modifications**:

- `/src/components/layout/header.tsx`:
    - Line 188 already has `<nav>`, add `role="navigation"` and `aria-label="Main navigation"`
    - Line 184 `<header>` already correct, just add `role="banner"` (Phase 1)
- `/src/components/layout/footer.tsx`:
    - Wrap footer links in `<nav aria-label="Footer navigation">`
    - Already uses `<footer>` tag (line 42), add `role="contentinfo"` (Phase 1)
- `/src/pages/home.tsx` (and similar pages with filters):
    - Use `<aside aria-label="Product filters">` for filter sections
    - Use `<section aria-label="Product list">` for product grids

---

## Phase 4: Color Contrast & Polish

### 4.1 Color Contrast Audit

**Impact**: Some users can't read low-contrast text (WCAG AA requires 4.5:1)

**New Files**:

- `/scripts/utils/check-color-contrast.ts` - Automated contrast checker
- `/docs/color-contrast-report.md` - Generated report (add to .gitignore)

**Modifications**:

- `/src/styles/index.css`:
    - Audit all CSS custom properties against WCAG AA standards
    - Current colors to verify:
        - `--color-primary: #ffffff` on `--color-background: #37404c`
        - `--color-secondary: #e5007d` on various backgrounds
        - `--color-secondary-text: #ff1493` on hover states
    - Check opacity classes: `text-primary/40`, `text-primary/60`, `text-primary/70`
    - Adjust values if contrast ratios fail (minimum 4.5:1 for normal text, 3:1 for large text)

**Automated Contrast Checker**:

```typescript
// Use chroma-js or color-contrast-checker library
// Scan all CSS custom properties
// Check text-primary on bg-background, text-secondary on backgrounds
// Generate report: PASS/FAIL with contrast ratios and recommendations
```

**Commands**:

```bash
bun scripts/utils/check-color-contrast.ts  # Run contrast audit
# Review output in docs/color-contrast-report.md
```

### 4.2 Focus Indicators Enhancement

**Impact**: Ensure all focus states meet 3:1 contrast (WCAG 2.1 Level AA requirement)

**Modifications**:

- `/src/styles/index.css`:
    - Global focus style already exists, verify 2px outline meets contrast
    - Ensure `focus-visible:ring-2 focus-visible:ring-secondary/50` meets 3:1 contrast
    - Add high-contrast mode support for dark backgrounds

**Pattern**:

```css
*:focus-visible {
    outline: 2px solid var(--color-secondary);
    outline-offset: 2px;
}

/* For dark backgrounds */
.bg-secondary *:focus-visible,
.bg-primary *:focus-visible {
    outline-color: white;
}
```

**Manual Checks**:

- CommandPalette selected item contrast
- ProductCard focus states on all interactive elements
- Carousel navigation button focus
- Modal close button focus against backdrop

### 4.3 Responsive Focus Management

**Impact**: Focus jumps unexpectedly on mobile menu interactions

**New Files**:

- `/src/hooks/use-focus-return.ts` - Hook for saving/restoring focus
- `/src/hooks/use-focus-return.spec.ts` - Tests

**Modifications**:

- `/src/components/layout/header.tsx`:
    - Save focus on hamburger button before opening menu (line 287)
    - Return focus to hamburger when closing menu
    - When navigating via menu link, focus destination, close menu
    - ESC key already closes menu (line 171), ensure focus returns

**useFocusReturn Hook**:

```typescript
// Returns: { saveFocus: () => void, returnFocus: () => void }
// Saves document.activeElement, restores on return
```

---

## Critical Files Summary

**Create (15 new files)**:

- Skip links: `skip-links.tsx`, `skip-links.spec.tsx`
- Live regions: `use-live-region.ts`, `use-live-region.spec.ts`, `live-region.tsx`, `live-region.spec.tsx`
- Focus management: `use-focus-trap.ts`, `use-focus-trap.spec.ts`, `use-focus-return.ts`, `use-focus-return.spec.ts`
- Forms: `form-error.tsx`, `form-error.spec.tsx`, `form-field.tsx`, `form-field.spec.tsx`
- Testing: `a11y-test-utils.ts`
- Script: `check-color-contrast.ts`

**Modify (16 files)**:

- Layout: `app-layout.tsx`, `header.tsx`, `footer.tsx`
- Components: `command-palette.tsx`, `product-carousel.tsx`, `tool-detail-modal.tsx`, `product-card-ecommerce.tsx`
- Testimonials: `testimonial-card-linked.tsx`, `product-testimonials.tsx`
- Icons: `tool-icon.tsx`, `dynamic-icon.tsx`
- Styles: `index.css`
- Pages: `home.tsx` (and other pages with filters), `all-testimonials.tsx`
- Config: `package.json`
- Routes: `main.tsx` (verify route is `/testimonials`, not `/all-testimonials`)

**Test Updates**:

- ALL existing `.spec.tsx` files - Add axe checks

---

## Verification & Testing

### Automated Testing

```bash
bun test                     # All tests including new a11y tests
bun test:coverage            # Verify 80%+ coverage on a11y code
bun scripts/utils/check-color-contrast.ts  # Color contrast audit
bun run ci:local             # Full CI check with all tests
```

### Manual Testing Checklist

**Keyboard Navigation** (Test on every page):

- [ ] Tab reaches all interactive elements in logical order
- [ ] Skip links appear on first Tab and work correctly
- [ ] Focus indicators always visible (min 2px, 3:1 contrast)
- [ ] Esc closes modals/overlays and returns focus
- [ ] Enter/Space activate buttons
- [ ] Arrow keys navigate carousels
- [ ] No keyboard traps (except intentional in modals)
- [ ] Command palette opens with `/` or `Ctrl+K`

**Screen Reader Testing** (NVDA on Windows, VoiceOver on Mac):

- [ ] All landmarks announced (banner, navigation, main, contentinfo)
- [ ] Skip links announced and functional
- [ ] Headings structure logical (h1 > h2 > h3)
- [ ] Links have descriptive text
- [ ] Images have alt text or aria-hidden
- [ ] Form fields have labels
- [ ] Errors announced on form submission
- [ ] Dynamic content changes announced (live regions)
- [ ] Carousel announces current slide number
- [ ] Modals announced and focused correctly
- [ ] Product count updates announced on filter change

**Color & Contrast** (DevTools + Visual):

- [ ] All text meets 4.5:1 contrast (normal), 3:1 (large text)
- [ ] Focus indicators meet 3:1 contrast with adjacent colors
- [ ] UI components (buttons, inputs) meet 3:1 contrast
- [ ] Hover/active states maintain proper contrast
- [ ] Test in Windows High Contrast mode
- [ ] Run automated contrast checker passes

**Zoom & Reflow**:

- [ ] 200% zoom: All content accessible, no horizontal scroll
- [ ] 400% zoom: Content reflows acceptably
- [ ] Text spacing: Can increase without overlap
- [ ] No content lost at different zoom levels

**Mobile Accessibility**:

- [ ] Touch targets minimum 44×44 CSS pixels
- [ ] Focus visible on touch devices with keyboard
- [ ] Mobile menu accessible via keyboard
- [ ] Pinch-to-zoom enabled (no user-scalable=no)

**Testimonials Page Specific** (`/testimonials`):

- [ ] Testimonial cards focusable and activatable via keyboard (Enter/Space)
- [ ] Cards have proper `role="link"` and aria-label
- [ ] Star ratings announced correctly ("Rated X out of 5 stars")
- [ ] Carousel pause button works (Space key pauses)
- [ ] Arrow keys navigate carousel slides
- [ ] Announcements only on manual navigation (not auto-rotation)
- [ ] Product badges on testimonial cards readable by screen readers

### Screen Reader Compatibility Testing

**Minimum Coverage**:

- Chrome + NVDA (Windows)
- Firefox + NVDA (Windows)
- Safari + VoiceOver (macOS)
- Safari + VoiceOver (iOS)
- Chrome + TalkBack (Android)

---

## Success Metrics

**Quantitative**:

- [ ] 0 axe violations in automated tests
- [ ] 0 WCAG 2.1 AA violations in manual audit
- [ ] 100% of interactive elements keyboard accessible
- [ ] 100% of forms have proper labels and error handling
- [ ] All text meets 4.5:1 contrast (normal), 3:1 (large)
- [ ] 80%+ test coverage for accessibility code

**Qualitative**:

- [ ] Screen reader users can browse products, search, and navigate
- [ ] Keyboard-only users can complete all tasks
- [ ] Site passes WAVE browser extension audit
- [ ] Site passes axe DevTools browser extension audit

---

## Implementation Order

1. **Phase 1 (Critical Foundation)** - Skip links, live regions, focus traps
2. **Phase 3.1 (Automated Testing First)** - Set up axe-core to catch regressions early
3. **Phase 2 (Forms & Interactive)** - Carousels (products & testimonials), testimonial cards, form errors
4. **Phase 3.2-3.3 (Semantic & Icons)** - Icon improvements (including star ratings), semantic HTML
5. **Phase 4 (Contrast & Polish)** - Color audit, focus indicators, focus management

**Note**: Route `/testimonials` is already correctly configured in `main.tsx` (line 56). File is named `all-testimonials.tsx` which is fine.

## Post-Implementation

- Run full manual testing checklist
- Test with actual screen readers (NVDA, VoiceOver)
- Run automated tests: `bun run ci:local`
- Document any remaining known issues
- Consider quarterly accessibility audits going forward
