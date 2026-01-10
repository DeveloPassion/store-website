# Code Quality Improvement Plan - January 2026

**Date:** 2026-01-10
**Status:** Draft
**Priority:** High
**Estimated Effort:** 3-4 weeks

## Executive Summary

Comprehensive code review identified 15 high-confidence issues (≥80% confidence) and 40+ files lacking test coverage. This plan addresses critical bugs in navigation, data validation, accessibility, and SEO, plus establishes testing requirements for untested components.

### Impact Summary

- **Critical Bugs:** 4 issues preventing core functionality (product creation CLI, navigation routes)
- **Important Issues:** 11 issues affecting accessibility, data integrity, and maintainability
- **Test Coverage:** ~17% (17/98 files) - need to reach 80%+ for critical paths

---

## Phase 1: Critical Bug Fixes (Week 1)

### Priority: IMMEDIATE

These bugs prevent core functionality from working correctly.

#### 1.1 Fix Product Creation CLI (Confidence: 95)

**Issue:** The `operationAdd` function in `update-products.ts` always fails because required schema fields are initialized with empty arrays.

**File:** `scripts/update-products.ts:902-939`

**Fields Affected:**

- `problemPoints` (requires min 1, initialized as `[]`)
- `agitatePoints` (requires min 1, initialized as `[]`)
- `solutionPoints` (requires min 1, initialized as `[]`)
- `features` (requires min 1, initialized as `[]`)
- `included` (requires min 1, initialized as `[]`)
- `benefits` (completely missing)

**Implementation:**

```typescript
// Add to operationAdd function after line 924
problemPoints: ['Placeholder - edit this product file to add real problem points'],
agitatePoints: ['Placeholder - edit this product file to add real agitate points'],
solutionPoints: ['Placeholder - edit this product file to add real solution points'],
features: ['Placeholder - edit this product file to add real features'],
included: ['Placeholder - edit this product file to add real included items'],
benefits: {
    immediate: ['Placeholder - edit this product file'],
    systematic: [],
    longTerm: []
}
```

**Alternative Approach:** Add interactive prompts for each required field (more user-friendly but more complex).

**Success Criteria:**

- Users can successfully create products via CLI
- Created products pass `bun run validate:products`
- Warning message displayed to edit placeholder values

**Testing:**

- Create new product via CLI
- Validate product passes schema validation
- Verify product appears in aggregated data

---

#### 1.2 Fix Command Palette Tag Navigation (Confidence: 100)

**Issue:** Tag navigation uses incorrect route `/tag/{tag}` instead of `/tags/:tagId`, causing 404 errors.

**File:** `src/components/products/command-palette.tsx:164-167`

**Current Code:**

```typescript
navigate(`/tag/${encodeURIComponent(tag)}`)
```

**Fix:**

```typescript
navigate(`/tags/${encodeURIComponent(tag)}`)
```

**Success Criteria:**

- Clicking tags in command palette navigates to correct tag page
- No 404 errors when navigating via tags

**Testing:**

- Open command palette (`/` or `Ctrl+K`)
- Search for and click on any tag
- Verify navigation to `/tags/{tagId}` works correctly

---

#### 1.3 Fix Command Palette Category Navigation (Confidence: 100)

**Issue:** Category navigation may be using incorrect pattern (needs verification).

**File:** `src/components/products/command-palette.tsx:148-151`

**Current Code:**

```typescript
navigate(`/?category=${encodeURIComponent(category.id)}`)
```

**Investigation Required:**

1. Check if home page handles `?category=` query parameter
2. Determine if dedicated category pages should be used instead
3. Align with routing structure in `main.tsx`

**Recommended Fix (if using dedicated pages):**

```typescript
navigate(`/categories/${encodeURIComponent(category.id)}`)
```

**Success Criteria:**

- Category navigation from command palette works consistently
- Navigation pattern matches other category links in app

**Testing:**

- Open command palette
- Click on category options
- Verify expected navigation behavior

---

#### 1.4 Fix Promotion Banner External Links (Confidence: 95)

**Issue:** Promotion banner uses `<Link>` for external URLs, which breaks with React Router.

**File:** `src/components/layout/promotion-banner.tsx:71`

**Current Code:**

```tsx
<Link to={config.promoLink} className='text-amber-600 underline hover:text-amber-700'>
    {config.promoLinkText}
</Link>
```

**Fix:**

```tsx
<a
    href={config.promoLink}
    className='text-amber-600 underline hover:text-amber-700'
    target='_blank'
    rel='noopener noreferrer'
>
    {config.promoLinkText}
</a>
```

**Success Criteria:**

- External promotion links open correctly
- Internal links (if any) also work
- No console errors related to navigation

**Testing:**

- Configure promotion with external URL
- Click promotion link
- Verify correct navigation behavior

---

## Phase 2: Data Integrity & Validation (Week 2)

### Priority: HIGH

Prevent data corruption and improve build reliability.

#### 2.1 Add Post-Mutation Validation (Confidence: 88)

**Issue:** Aggregation script mutates products by adding FAQs/testimonials without validating result.

**File:** `scripts/utils/aggregate-products.ts:154-158`

**Implementation:**

```typescript
// After line 156, add validation
product.faqs = faqs
product.testimonials = testimonials

// Validate mutated product
const validationResult = ProductSchema.safeParse(product)
if (!validationResult.success) {
    console.error(`Invalid product after adding FAQs/testimonials: ${productFile}`)
    validationResult.error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
    })
    errors.push(`Invalid product structure: ${productFile}`)
    continue
}
```

**Success Criteria:**

- Invalid products after mutation are caught during aggregation
- Build fails early if data corruption occurs
- Clear error messages indicate which products are invalid

**Testing:**

- Create malformed FAQ/testimonial files
- Run aggregation
- Verify validation catches issues

---

#### 2.2 Standardize Error Handling (Confidence: 83)

**Issue:** Inconsistent error handling - FAQs/testimonials fail silently, products fail loudly.

**File:** `scripts/utils/aggregate-products.ts:71-78, 90-97`

**Implementation:**

Add strict mode flag and consistent error reporting:

```typescript
// Add at top of file
const STRICT_MODE = process.env.STRICT_VALIDATION === 'true'

// In loadFAQs
if (!validFAQs.success) {
    const message = `Invalid FAQ file: ${faqFile} - ${validFAQs.error.message}`
    console.warn(message)
    if (STRICT_MODE) {
        throw new Error(message)
    }
    return []
}

// Similar for loadTestimonials
```

**CI/CD Integration:**

```bash
# In CI pipeline
STRICT_VALIDATION=true bun run build
```

**Success Criteria:**

- CI/CD fails on any data validation error
- Local development shows warnings but continues
- All parse errors are logged consistently

**Testing:**

- Run aggregation with malformed data in dev mode (warnings)
- Run aggregation with STRICT_VALIDATION=true (fails)

---

#### 2.3 Fix File System Race Conditions (Confidence: 85)

**Issue:** Product files read and mutated within loop without defensive copies.

**File:** `scripts/utils/aggregate-products.ts:139-167`

**Implementation:**

```typescript
// Replace mutation with defensive copy
const aggregatedProduct = {
    ...product,
    faqs,
    testimonials
}

// Validate the copy, not the original
const validationResult = ProductSchema.safeParse(aggregatedProduct)
if (!validationResult.success) {
    // error handling
}

validProducts.push(aggregatedProduct)
```

**Success Criteria:**

- Original product objects never mutated
- Concurrent file operations don't corrupt data
- Build process is more robust

**Testing:**

- Run aggregation during file modifications
- Verify data consistency

---

#### 2.4 Improve Type Safety in Validation Script (Confidence: 82)

**Issue:** `validate-products.ts` uses incomplete `Product` interface.

**File:** `scripts/validate-products.ts:37-39, 144-176`

**Current Code:**

```typescript
interface Product {
    id: string
}
```

**Fix:**

```typescript
import type { Product } from '@/types/product'
// Remove local incomplete interface
```

**Success Criteria:**

- TypeScript catches property access errors
- Code aligns with schema changes automatically
- Follows AGENTS.md TypeScript guidelines

**Testing:**

- Run TypeScript compiler
- Verify no type errors

---

## Phase 3: Accessibility Improvements (Week 2)

### Priority: HIGH

Address WCAG 2.1 Level A compliance issues.

#### 3.1 Add ARIA Attributes to Command Palette (Confidence: 85)

**Issue:** Missing `role="listbox"`, `aria-activedescendant`, proper ARIA structure.

**File:** `src/components/products/command-palette.tsx:334, 497-498`

**Implementation:**

```tsx
// Search input (line 316)
<input
    ref={inputRef}
    type='text'
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    onKeyDown={handleKeyDown}
    placeholder='Search products, categories, or tags...'
    className='...'
    aria-label='Search products, categories, and tags'
    aria-autocomplete='list'
    aria-controls='command-palette-results'
    aria-activedescendant={selectedIndex >= 0 ? `option-${selectedIndex}` : undefined}
    role='combobox'
    aria-expanded='true'
/>

// Results container (line 334)
<div
    className='...'
    role='listbox'
    id='command-palette-results'
    aria-label='Search results'
>
    {/* Results */}
</div>

// Individual options (line 497)
<button
    key={i}
    onClick={() => command.action()}
    className='...'
    role='option'
    id={`option-${i}`}
    aria-selected={i === selectedIndex}
>
    {/* Option content */}
</button>
```

**Success Criteria:**

- Screen readers announce search results correctly
- Keyboard navigation announces selected options
- Passes aXe accessibility audit

**Testing:**

- Test with screen reader (NVDA, JAWS, or VoiceOver)
- Run aXe DevTools audit
- Verify keyboard navigation

---

#### 3.2 Add Newsletter Form Label (Confidence: 85)

**Issue:** Email input lacks associated label element.

**File:** `src/components/layout/footer.tsx:62-80`

**Implementation:**

```tsx
<form
    onSubmit={handleNewsletterSubmit}
    className='mx-auto flex max-w-md flex-col gap-3 sm:flex-row'
>
    <label htmlFor='newsletter-email' className='sr-only'>
        Email address for newsletter subscription
    </label>
    <input
        id='newsletter-email'
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='Enter your email'
        required
        className='...'
        aria-describedby='newsletter-description'
    />
    <span id='newsletter-description' className='sr-only'>
        Subscribe to receive updates about new products and resources
    </span>
    <button type='submit' className='...'>
        Subscribe
    </button>
</form>
```

**Success Criteria:**

- Screen readers announce input purpose
- Form passes accessibility audit

**Testing:**

- Screen reader testing
- aXe DevTools validation

---

#### 3.3 Add Search Button ARIA Labels (Confidence: 85)

**Issue:** Search button in header lacks proper ARIA attributes.

**File:** `src/components/layout/header.tsx:208-215`

**Implementation:**

```tsx
<button
    onClick={onOpenCommandPalette}
    className='hidden max-w-lg flex-1 md:block lg:max-w-xl xl:max-w-2xl'
    title='Search products'
    aria-label='Open command palette to search products'
    aria-haspopup='dialog'
    aria-keyshortcuts='/ Control+K'
>
    {/* Button content */}
</button>
```

**Success Criteria:**

- Screen readers announce button purpose
- Keyboard shortcuts are discoverable

**Testing:**

- Screen reader validation
- Keyboard navigation testing

---

#### 3.4 Fix Command Palette Race Condition (Confidence: 80)

**Issue:** Keyboard handler may access undefined array element when results change.

**File:** `src/components/products/command-palette.tsx:240-270`

**Implementation:**

```typescript
case 'Enter':
    e.preventDefault()
    const selectedCommand = displayedCommandsForNav[selectedIndex]
    if (selectedCommand) {
        selectedCommand.action()
    } else {
        // Optional: provide feedback that no command is selected
        console.warn('No command selected or index out of bounds')
    }
    break
```

**Success Criteria:**

- No errors when pressing Enter during result changes
- Graceful handling of edge cases

**Testing:**

- Type query rapidly and press Enter during typing
- Filter to few results, press Enter multiple times

---

## Phase 4: SEO & Performance (Week 2-3)

### Priority: MEDIUM-HIGH

#### 4.1 Add Dynamic Meta Tags to Home Page (Confidence: 95)

**Issue:** Home page doesn't update meta tags when URL parameters change.

**File:** `src/pages/home.tsx`

**Implementation:**

```typescript
useEffect(() => {
    const baseTitle = 'Knowledge Forge - Digital Products Store'
    const baseDescription = 'Discover knowledge management tools, templates, and resources'
    const baseImage = 'https://store.dsebastien.net/assets/images/social-card.png'
    const baseUrl = 'https://store.dsebastien.net'

    if (decodedTagName) {
        document.title = `${decodedTagName} Products - Knowledge Forge`
        updateMetaTag('description', `Browse all products tagged with ${decodedTagName}`)
        updateMetaTag('og:title', `${decodedTagName} Products`)
        updateMetaTag('og:description', `Browse all products tagged with ${decodedTagName}`)
        updateMetaTag('og:url', `${baseUrl}/#/tags/${encodeURIComponent(decodedTagName)}`)
        updateMetaTag('og:image', baseImage)
    } else if (categoryFilter) {
        const categoryName = categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)
        document.title = `${categoryName} - Knowledge Forge`
        updateMetaTag('description', `Browse ${categoryName} products`)
        updateMetaTag('og:title', `${categoryName} Products`)
        updateMetaTag('og:description', `Browse ${categoryName} products`)
        updateMetaTag('og:url', `${baseUrl}/?category=${encodeURIComponent(categoryFilter)}`)
        updateMetaTag('og:image', baseImage)
    } else if (searchQuery) {
        document.title = `Search: ${searchQuery} - Knowledge Forge`
        updateMetaTag('description', `Search results for ${searchQuery}`)
        updateMetaTag('og:title', `Search: ${searchQuery}`)
        updateMetaTag('og:description', `Search results for ${searchQuery}`)
        updateMetaTag('og:url', `${baseUrl}/?q=${encodeURIComponent(searchQuery)}`)
        updateMetaTag('og:image', baseImage)
    } else {
        // Default home page meta tags
        document.title = baseTitle
        updateMetaTag('description', baseDescription)
        updateMetaTag('og:title', baseTitle)
        updateMetaTag('og:description', baseDescription)
        updateMetaTag('og:url', baseUrl)
        updateMetaTag('og:image', baseImage)
    }
}, [decodedTagName, categoryFilter, searchQuery])

// Helper function
function updateMetaTag(property: string, content: string) {
    const tag =
        document.querySelector(`meta[property="${property}"]`) ||
        document.querySelector(`meta[name="${property}"]`)
    if (tag) {
        tag.setAttribute('content', content)
    }
}
```

**Success Criteria:**

- Meta tags update when filters/search/tags change
- Social media previews show correct content
- SEO crawlers index filtered views correctly

**Testing:**

- Use Facebook/Twitter/LinkedIn sharing debuggers
- Verify meta tags with browser DevTools
- Test all filter/search/tag scenarios

---

#### 4.2 Make Category Filter Data-Driven (Confidence: 85)

**Issue:** Hardcoded category filter logic only handles 5 of 23 categories.

**File:** `src/pages/home.tsx:48-58`

**Implementation:**

```typescript
import categoriesData from '@/data/categories.json'

// In filteredProducts useMemo
if (categoryFilter) {
    const normalizedFilter = categoryFilter.toLowerCase().trim()

    // Handle special case for free resources
    if (normalizedFilter === 'free' || normalizedFilter === 'free resources') {
        products = products.filter((p) => p.priceTier === 'free' || p.price === 0)
    } else {
        // Find category by ID or name
        const category = categoriesData.find(
            (c) =>
                c.id.toLowerCase() === normalizedFilter || c.name.toLowerCase() === normalizedFilter
        )

        if (category) {
            products = products.filter(
                (p) =>
                    p.mainCategory === category.id ||
                    p.secondaryCategories?.some((sc) => sc.id === category.id)
            )
        } else {
            // Unknown category - show no results
            console.warn(`Unknown category filter: ${categoryFilter}`)
            products = []
        }
    }
}
```

**Success Criteria:**

- All 23 categories can be filtered
- No hardcoded category mappings
- Changes to category data don't require code changes

**Testing:**

- Test filtering by all categories
- Test category name vs ID filtering
- Test invalid category handling

---

#### 4.3 Validate Tag Type Assertions (Confidence: 80)

**Issue:** Tag name cast to `TagId` without validation.

**File:** `src/pages/home.tsx:44`

**Implementation:**

```typescript
import tagsData from '@/data/tags.json'

// In filteredProducts useMemo
if (decodedTagName) {
    // Validate tag exists
    const isValidTag = tagsData.some((t) => t.id === decodedTagName)

    if (isValidTag) {
        products = products.filter((p) => p.tags.includes(decodedTagName as TagId))
    } else {
        // Invalid tag - redirect to 404 or show error
        console.warn(`Invalid tag: ${decodedTagName}`)
        // Optional: navigate('/404')
        products = []
    }
}
```

**Success Criteria:**

- Invalid tags are caught and handled
- Type assertion is safe after validation
- User-friendly error handling

**Testing:**

- Navigate to `/tags/invalid-tag-name`
- Verify graceful error handling

---

## Phase 5: Test Coverage (Week 3-4)

### Priority: MEDIUM

Achieve 80%+ test coverage for critical paths.

#### 5.1 Critical Component Tests (Priority: Immediate)

**Target Files (525 lines):**

1. `src/components/products/command-palette.tsx`

**Test Requirements:**

- Keyboard navigation (Arrow keys, Enter, Escape)
- Search filtering (products, categories, tags)
- Navigation actions (all routes)
- Accessibility (ARIA attributes, focus management)
- Edge cases (empty results, rapid typing)

**Estimated Effort:** 3-4 days

---

#### 5.2 High-Priority Component Tests

**Target Files (1,500+ lines total):**

1. `src/pages/home.tsx` (377 lines)
2. `src/components/layout/header.tsx`
3. `src/components/layout/footer.tsx`
4. `src/components/products/product-hero.tsx` (237 lines)
5. `src/components/products/product-carousel.tsx` (189 lines)

**Test Requirements:**

- Props rendering
- User interactions
- Conditional rendering
- State management
- Integration with data

**Estimated Effort:** 1 week

---

#### 5.3 Medium-Priority Tests

**Target Files (2,000+ lines total):**

- All remaining page components (13 files)
- Product display components (10 files)
- Utility functions (3 files: icon-registry.ts, category-icons.ts, tag-icons.ts)

**Estimated Effort:** 1.5 weeks

---

#### 5.4 Test Infrastructure Improvements

**Enhancements:**

1. Add visual regression testing for critical UI components
2. Set up E2E testing for critical user flows
3. Add test coverage reporting to CI/CD
4. Create test utilities for common scenarios

**Tools to Consider:**

- Playwright for E2E testing
- Percy or Chromatic for visual regression
- Codecov for coverage reporting

**Estimated Effort:** 3-4 days

---

## Phase 6: Documentation & Refactoring (Week 4)

### Priority: MEDIUM

#### 6.1 Add Component Documentation

**Target:** 32 files without JSDoc

**Priority Order:**

1. Large components (>200 lines): command-palette, home, product-hero
2. Layout components: header, footer, app-layout
3. Product components: carousel, testimonials, features
4. UI utilities: lightbox, dynamic-icon

**Documentation Template:**

```typescript
/**
 * ComponentName
 *
 * Brief description of component purpose and key functionality.
 *
 * @param {Object} props - Component props
 * @param {string} props.propName - Description of prop
 *
 * Key features:
 * - Feature 1
 * - Feature 2
 *
 * @example
 * <ComponentName propName="value" />
 */
```

**Estimated Effort:** 2-3 days

---

#### 6.2 Refactor Duplicate Code (Optional)

**Target:** `src/lib/product-sort.ts`

**Issue:** Three similar sorting functions with repeated tier grouping logic.

**Approach:** Extract common tier-based grouping into reusable function.

**Priority:** Low (code works correctly, optimization not critical)

**Estimated Effort:** 1 day

---

## Implementation Timeline

### Week 1: Critical Fixes

- **Day 1-2:** Fix product creation CLI (Issues 1.1, 1.2)
- **Day 3:** Fix command palette navigation (Issues 1.3, 1.4)
- **Day 4:** Fix promotion banner links (Issue 1.5)
- **Day 5:** Testing and validation

### Week 2: Data & Accessibility

- **Day 1-2:** Data validation improvements (Issues 2.1-2.4)
- **Day 3-4:** Accessibility fixes (Issues 3.1-3.4)
- **Day 5:** Testing and validation

### Week 3: SEO & Testing (Part 1)

- **Day 1-2:** SEO improvements (Issues 4.1-4.3)
- **Day 3-5:** Critical component tests (Issue 5.1)

### Week 4: Testing (Part 2) & Documentation

- **Day 1-3:** High-priority component tests (Issue 5.2)
- **Day 4-5:** Documentation (Issue 6.1)

---

## Success Metrics

### Quantitative Goals

- **Test Coverage:** Increase from 17% to 80%+ for critical paths
- **Accessibility Score:** Pass all WCAG 2.1 Level A requirements
- **Bug Count:** Reduce critical bugs to 0
- **Build Success Rate:** 100% in CI/CD

### Qualitative Goals

- Users can successfully add products via CLI
- All navigation routes work correctly
- Screen reader users can navigate effectively
- SEO meta tags update dynamically
- Codebase is well-documented

---

## Risk Assessment

### High Risk

1. **Breaking changes in navigation:** Fix requires thorough testing across all routes
2. **Data corruption:** Validation changes must be tested extensively

### Medium Risk

1. **Test coverage:** Large effort required, may take longer than estimated
2. **Accessibility:** Complex ARIA patterns need expert review

### Low Risk

1. **Documentation:** Straightforward but time-consuming
2. **Code refactoring:** Optional optimization

---

## Dependencies

### External Dependencies

- None required

### Internal Dependencies

- All schema files must remain stable during Phase 1-2
- Navigation routes should not change during Phase 1
- Test infrastructure must be functional

---

## Rollback Plan

### Critical Fixes (Phase 1)

- Keep original implementations in git history
- Test fixes in development before merging
- Deploy fixes individually, not as a batch

### Data Changes (Phase 2)

- Maintain strict mode flag for gradual rollout
- Keep backup of all data files before validation changes
- CI/CD can be reverted to non-strict mode if issues arise

### Accessibility Changes (Phase 3)

- Changes are additive, easy to revert
- No breaking changes expected

---

## Monitoring & Validation

### During Implementation

- Run `bun run ci:local` before each commit
- Test all changed functionality manually
- Run accessibility audits after each change

### Post-Implementation

- Monitor build success rates in CI/CD
- Track user feedback on navigation and CLI tools
- Run periodic accessibility audits
- Monitor test coverage trends

---

## Next Steps

1. **Review Plan:** Share with team for feedback
2. **Prioritize:** Confirm priority order matches business needs
3. **Allocate Resources:** Assign developers to phases
4. **Start Implementation:** Begin with Phase 1 (Week 1)
5. **Track Progress:** Use GitHub issues/project board

---

## Appendix: Issue Reference

### Critical Issues (4)

1. Product creation CLI always fails (Confidence: 95)
2. Command palette tag navigation broken (Confidence: 100)
3. Command palette category navigation ambiguous (Confidence: 100)
4. Promotion banner external links broken (Confidence: 95)

### Important Issues (11)

5. Home page missing SEO meta tags (Confidence: 95)
6. No validation after product mutation (Confidence: 88)
7. Command palette missing ARIA attributes (Confidence: 85)
8. File system race condition in aggregation (Confidence: 85)
9. Newsletter form missing label (Confidence: 85)
10. Search button missing ARIA label (Confidence: 85)
11. Hardcoded category filter logic (Confidence: 85)
12. Inconsistent error handling (Confidence: 83)
13. Missing type safety in validation script (Confidence: 82)
14. Command palette keyboard race condition (Confidence: 80)
15. Unvalidated tag type assertion (Confidence: 80)

### Test Coverage Gaps (40+ files)

- 1 critical: command-palette.tsx (525 lines)
- 4 high-priority: home.tsx, header.tsx, footer.tsx, product-hero.tsx
- 23 components without tests
- 13 pages without tests
- 3 lib utilities without tests
- 1 hook without tests

---

**Document Version:** 1.0
**Last Updated:** 2026-01-10
**Author:** Claude Code Review Agent
