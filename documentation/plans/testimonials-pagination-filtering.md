# Testimonials Pagination & Product Filtering Plan

## Overview

Three features to implement:

1. **Product Page Testimonials**: Limit to 20, with "Show More" button for pagination (ONLY on product pages)
2. **All Testimonials Page**: Accept product ID query parameter for filtering (shows ALL testimonials, no limit)
3. **Featured First**: Ensure featured testimonials are shown first on both product page and testimonials page

## Files to Modify

### 1. Product Page Testimonials Pagination

**File:** `src/components/products/product-testimonials.tsx`

Note: This file already sorts testimonials with featured first (lines 75-79).

Changes:

- Add `TESTIMONIALS_PER_PAGE` constant (20)
- Add state for `displayCount` to track how many to show
- Show first 20 testimonials by default
- Add "Show More Testimonials" button when `displayCount < total`
- Button loads next batch (20 more) on click
- Update both mobile carousel and desktop grid views

Implementation details:

- Desktop grid: Slice `sortedTestimonials` to show only `displayCount` items
- Mobile carousel: Show all loaded testimonials in carousel (up to `displayCount`)
- "Show More" button styled consistently with site design (secondary button style)
- Include count info: "Showing X of Y testimonials"

### 2. Testimonials Page Product Filtering

**File:** `src/pages/all-testimonials.tsx`

Changes:

- Import `useSearchParams` from `react-router`
- Extract `product` query parameter
- Add validation: check if product ID exists in products data
- **Sort testimonials with featured first** (currently shuffled randomly - need to change)
- Three display modes:
    1. **No product param**: Current behavior (all testimonials, grouped by product)
    2. **Valid product param**: Show product card + all testimonials for that product
    3. **Invalid product param**: Show error message + QuickNavigation

Implementation details for valid product with testimonials:

- Use `ProductCardEcommerce` component for the product card
- Show product testimonials below the card (not grouped, single product)
- Update breadcrumbs: Home > Testimonials > Product Name
- Update meta tags for the specific product
- Show stats for this product only (count, rating)

Implementation details for valid product with 0 testimonials:

- Show "No testimonials yet" message
- Include QuickNavigation component
- Do NOT show product card

Implementation details for invalid product:

- Display friendly error message
- Show QuickNavigation component
- Update breadcrumbs: Home > Testimonials
- Simple centered layout

## Detailed Implementation

### product-testimonials.tsx Changes

```tsx
// Constants
const TESTIMONIALS_PER_PAGE = 20

// New state
const [displayCount, setDisplayCount] = useState(TESTIMONIALS_PER_PAGE)

// Handler
const handleShowMore = () => {
    setDisplayCount((prev) => Math.min(prev + TESTIMONIALS_PER_PAGE, sortedTestimonials.length))
}

// Derived state
const visibleTestimonials = sortedTestimonials.slice(0, displayCount)
const hasMoreTestimonials = displayCount < sortedTestimonials.length
```

Button placement: After the desktop grid and mobile carousel, before the section closing tag.

### all-testimonials.tsx Changes

```tsx
// Add import
import { useSearchParams } from 'react-router'
import ProductCardEcommerce from '@/components/products/product-card-ecommerce'

// Extract param
const [searchParams] = useSearchParams()
const productIdParam = searchParams.get('product')

// Validate and find product
const filteredProduct = useMemo(() => {
    if (!productIdParam) return null
    return products.find((p) => p.id === productIdParam) || undefined
}, [products, productIdParam])

// Mode determination
const isProductMode = productIdParam !== null
const isValidProduct = filteredProduct !== undefined
```

Layout for valid product:

- Header with product name
- ProductCardEcommerce (centered, max-width)
- ALL testimonials grid below - no pagination limit (single product view shows everything)

Layout for invalid product:

- Error icon (e.g., emoji or icon)
- "Product Not Found" heading
- Descriptive message
- QuickNavigation component

## URL Pattern

- All testimonials: `/testimonials`
- Product testimonials: `/testimonials?product=obsidian-starter-course`

## Testing Strategy

1. **Manual testing:**
    - Product page with < 20 testimonials: no button shown
    - Product page with > 20 testimonials: button shown, loads more on click
    - Product page with exactly 20: no button shown
    - `/testimonials` (no param): current behavior unchanged (all products, all testimonials)
    - `/testimonials?product=valid-id`: shows product card + ALL testimonials (no limit)
    - `/testimonials?product=invalid-id`: shows error + QuickNavigation

2. **Run existing tests:**
    - `bun test src/components/products/product-testimonials.spec.tsx`
    - `bun test src/pages/all-testimonials.spec.tsx`

3. **Build verification:**
    - `bun run build` - ensure no TypeScript errors
    - `bun run lint` - ensure no linting issues

## Edge Cases

- Product with 0 testimonials + valid ID: Show "No testimonials yet" message only (no product card)
- Exactly 20 testimonials on product page: No "Show More" button (nothing more to show)
- 21 testimonials on product page: Show button, clicking loads 1 more
