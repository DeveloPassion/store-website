# Store Transformation Implementation Plan

**Date:** 2026-01-06
**Status:** Planning Phase
**Approach:** Rebuild from scratch, keeping color scheme, header, and footer

---

## Store Branding

**Name:** **Knowledge Forge**
**Full Name:** Sébastien's Knowledge Forge (or "Knowledge Forge by Sébastien Dubois")
**Tagline:** "Tools & systems for knowledge workers"

**Brand Rationale:**

- Combines personal brand (Sébastien) with mission (knowledge/systems)
- "Forge" metaphor conveys crafting, building, transforming
- Aligns with core message: turning chaos into clarity through built systems
- Modern, memorable, action-oriented
- Reflects the maker/creator aspect of the products

**Usage:**

- Site title: "Knowledge Forge"
- Header logo: "Knowledge Forge" or "KF" with icon
- Meta tags: "Knowledge Forge - Sébastien Dubois"
- Footer: "Knowledge Forge by Sébastien Dubois"

---

## Vision

Transform this into a professional e-commerce product store with:

- Product catalog homepage with hero, featured products, and advanced filtering
- Dedicated category pages for each product type
- Tag/pillar pages for topic-based browsing
- Curated collection pages for product bundles
- Direct Gumroad integration for checkout
- Comprehensive navigation structure

---

## What We Keep

**Design System:**

- Color scheme: Pink accent (#e5007d), dark background (#37404c), white text
- Tailwind CSS v4 configuration
- Typography (Noto Sans)
- Responsive breakpoints
- Glass-morphism and shadow effects

**Layout Components:**

- Header structure and styling
- Footer structure and styling
- AppLayout wrapper
- Responsive patterns

**Product System:**

- Individual product pages (`/l/:productSlug`) - already excellent
- Product data structure in `/src/data/products.json`
- Product detail components (Hero, PAS, Features, Benefits, Testimonials, FAQ, CTA)

---

## What We Rebuild

**Homepage:** Complete rebuild as product catalog
**Filtering:** New filtering system designed for products
**Navigation:** New category/tag/collection navigation
**Card Components:** Fresh product card design
**Pages:** New category, tag, and collection page templates

---

## URL Structure

### Core Pages

```
/                           → Product catalog homepage
/l/:productSlug             → Individual product page (KEEP EXACT)
/changelog                  → Changelog (keep existing)
```

### Category Pages (by product type)

```
/category/courses           → All courses
/category/kits              → All starter kits
/category/workshops         → All workshops
/category/guides            → All guides
/category/community         → Community products
/category/tools             → Software tools
/category/bundles           → Product bundles
/category/resources         → Free resources
/category/coaching          → Coaching services
/category/books             → Books
```

### Tag Pages (by topic)

```
/tag/obsidian               → Obsidian-related products
/tag/pkm                    → PKM products
/tag/productivity           → Productivity products
/tag/ai-tools               → AI-related products
/tag/:tagSlug               → Dynamic tag pages
```

### Pillar Pages (by strategic theme)

```
/pillar/knowledge-management
/pillar/content-creation
/pillar/productivity
/pillar/ai-tools
/pillar/development
```

### Collection Pages (curated bundles)

```
/collection/obsidian-essentials     → OSK + Course + Guide
/collection/knowledge-starter       → Beginner bundle
/collection/ai-powered              → All AI products
```

### Utility Pages

```
/compare                    → Product comparison tool
/quiz                       → Product recommendation quiz (optional)
/404                        → Not found page
```

### Redirects (backward compatibility)

```
/products                   → Redirect to /
/tool/:toolId               → Redirect to /?q={name} or 404
/label/:labelName           → Redirect to /tag/{labelName}
```

---

## Routing Configuration

**File:** `/src/main.tsx`

```tsx
<BrowserRouter>
    <Routes>
        <Route element={<AppLayout />}>
            {/* Core Pages */}
            <Route path='/' element={<HomePage />} />
            <Route path='/l/:productSlug' element={<ProductPage />} />
            <Route path='/changelog' element={<ChangelogPage />} />

            {/* Category Pages */}
            <Route path='/category/:categorySlug' element={<CategoryPage />} />

            {/* Tag/Pillar Pages */}
            <Route path='/tag/:tagSlug' element={<TagPage />} />
            <Route path='/pillar/:pillarSlug' element={<PillarPage />} />

            {/* Collection Pages */}
            <Route path='/collection/:collectionSlug' element={<CollectionPage />} />

            {/* Utility Pages */}
            <Route path='/compare' element={<ComparePage />} />

            {/* Redirects */}
            <Route path='/products' element={<Navigate to='/' replace />} />
            <Route path='*' element={<NotFoundPage />} />
        </Route>
    </Routes>
</BrowserRouter>
```

---

## Data Structure

### Products (existing - keep)

**File:** `/src/data/products.json`
Already has comprehensive data structure with pricing, marketing copy, testimonials, FAQs.

### Categories (new)

**File:** `/src/data/categories.json`

```json
{
    "courses": {
        "name": "Courses",
        "slug": "courses",
        "description": "Comprehensive video courses and structured learning programs",
        "icon": "FaGraduationCap",
        "metaDescription": "In-depth courses on knowledge management, Obsidian, and productivity",
        "featured": true
    },
    "kits": {
        "name": "Starter Kits",
        "slug": "kits",
        "description": "Ready-to-use templates, vaults, and complete systems",
        "icon": "FaBoxOpen",
        "metaDescription": "Battle-tested templates and starter kits",
        "featured": true
    }
    // ... more categories
}
```

### Collections (new)

**File:** `/src/data/collections.json`

```json
[
    {
        "id": "obsidian-essentials",
        "slug": "obsidian-essentials",
        "name": "Obsidian Essentials",
        "tagline": "From beginner to expert in one bundle",
        "description": "Everything you need to master Obsidian",
        "productIds": [
            "obsidian-starter-kit",
            "obsidian-starter-course",
            "beginners-guide-obsidian"
        ],
        "coverImage": "/assets/images/collections/obsidian-essentials.png",
        "featured": true,
        "benefits": ["Save 20% vs buying separately", "Complete learning path", "Lifetime updates"]
    }
]
```

### Tags/Pillars (optional)

**File:** `/src/data/tags.json`

```json
{
    "obsidian": {
        "name": "Obsidian",
        "slug": "obsidian",
        "description": "Products specifically for Obsidian users",
        "color": "#7C3AED",
        "featured": true
    }
}
```

---

## Component Architecture

### New Components to Create

```
src/components/
├── store/                              # NEW - Store-specific components
│   ├── hero-section.tsx               # Homepage hero with value prop
│   ├── featured-products.tsx          # Featured products carousel
│   ├── stats-section.tsx              # Social proof numbers
│   ├── product-filter.tsx             # Advanced filtering UI
│   ├── product-grid.tsx               # Product listing grid
│   ├── product-card.tsx               # Individual product card
│   ├── category-header.tsx            # Category page hero
│   ├── tag-header.tsx                 # Tag page hero
│   ├── collection-header.tsx          # Collection page hero
│   ├── collection-products.tsx        # Collection product list
│   ├── related-products.tsx           # Related products section
│   ├── related-tags.tsx               # Related tags navigation
│   ├── breadcrumbs.tsx                # Breadcrumb navigation
│   └── category-quick-links.tsx       # Category navigation grid
│
├── comparison/                         # NEW - Product comparison
│   ├── comparison-selector.tsx        # Select products to compare
│   └── comparison-table.tsx           # Comparison matrix
│
└── layout/                            # MODIFY EXISTING
    ├── header.tsx                     # Add category/collection nav
    ├── footer.tsx                     # Add category sitemap
    └── app-layout.tsx                 # Keep as-is
```

### Components to Keep (No Changes)

```
src/components/
├── products/                          # Product detail page components
│   ├── product-hero.tsx              # Already excellent
│   ├── product-pas.tsx               # Already excellent
│   ├── product-features.tsx          # Already excellent
│   ├── product-benefits.tsx          # Already excellent
│   ├── product-testimonials.tsx      # Already excellent
│   ├── product-faq.tsx               # Already excellent
│   ├── product-cta.tsx               # Already excellent
│   └── product-screenshots.tsx       # Already excellent
│
└── ui/
    └── section.tsx                    # Reusable container
```

---

## Page Implementations

### 1. Homepage (Product Catalog)

**File:** `/src/pages/home.tsx` (complete rebuild)

**Layout:**

```
┌─────────────────────────────────────────┐
│ HERO SECTION                            │
│ • Headline: "Knowledge Products"        │
│ • Tagline: "Courses, kits, tools..."   │
│ • CTAs: "Browse All" + "Take Quiz"     │
│ • Stats: 18 products, 10k+ users       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ FEATURED PRODUCTS CAROUSEL              │
│ • 3-5 featured products with images     │
│ • Auto-scroll or manual navigation      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ CATEGORY QUICK LINKS                    │
│ • Visual grid of category cards         │
│ • Icons + names + product counts        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ PRODUCT FILTER                          │
│ • Search box                            │
│ • Type filter (All, Courses, Kits...)  │
│ • Advanced filters (pillar, price)      │
│ • View toggle (grid/list)               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ PRODUCT GRID                            │
│ • Responsive grid (2-6 columns)         │
│ • Product cards with image, title,      │
│   tagline, price, pillars               │
│ • Click → /l/:productSlug               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ NEWSLETTER CTA                          │
│ • Email signup form                     │
│ • Social proof: "Join 2,300+ readers"   │
└─────────────────────────────────────────┘
```

**State Management:**

- URL search params for filters: `?q=obsidian&type=kit&pillar=pkm&view=grid`
- Bookmarkable filtered views
- Browser back/forward support

**Key Features:**

- Full-text search across name, tagline, description, tags
- Multi-select filtering (type, pillar, price tier, tags)
- Sort: featured first, then alphabetical
- Grid/list view toggle
- Results count display

---

### 2. Category Page

**File:** `/src/pages/category.tsx` (new)

**URL:** `/category/:categorySlug`

**Layout:**

```
┌─────────────────────────────────────────┐
│ BREADCRUMBS: Home > Courses             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ CATEGORY HERO                           │
│ • Icon (large, centered)                │
│ • Title: "Courses"                      │
│ • Description paragraph                 │
│ • Product count: "3 courses available"  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ FILTER BAR (simplified)                 │
│ • Search within category                │
│ • Sort by (price, name, newest)         │
│ • Pillar filter (multi-select)          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ PRODUCT GRID                            │
│ • Products filtered to this category    │
│ • Same ProductCard component            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ RELATED CATEGORIES                      │
│ • "You might also like: [Kits] [...]"   │
└─────────────────────────────────────────┘
```

**Dynamic Data:**

- Read category metadata from `categories.json`
- Filter products where `product.type === categorySlug`
- Generate breadcrumbs dynamically

---

### 3. Tag Page

**File:** `/src/pages/tag.tsx` (new)

**URL:** `/tag/:tagSlug`

**Layout:**

```
┌─────────────────────────────────────────┐
│ BREADCRUMBS: Home > Tags > Obsidian     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ TAG HERO                                │
│ • Title: "Obsidian Products"            │
│ • Description                           │
│ • Product count                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ PRODUCTS BY TYPE (grouped sections)     │
│                                         │
│ ┌─ Kits (2) ─────────────────────────┐ │
│ │ • Obsidian Starter Kit              │ │
│ │ • Knowledge Worker Kit              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─ Courses (1) ──────────────────────┐ │
│ │ • Obsidian Starter Course           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─ Free Resources (1) ───────────────┐ │
│ │ • Beginner's Guide to Obsidian      │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ RELATED TAGS                            │
│ • [PKM] [Productivity] [Templates]      │
└─────────────────────────────────────────┘
```

**Logic:**

- Filter products where `product.tags.includes(tagSlug)`
- Group by `product.type`
- Collapsible sections for each type

---

### 4. Collection Page

**File:** `/src/pages/collection.tsx` (new)

**URL:** `/collection/:collectionSlug`

**Layout:**

```
┌─────────────────────────────────────────┐
│ BREADCRUMBS: Home > Collections > ...   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ COLLECTION HERO                         │
│ • Cover image/illustration              │
│ • Title: "Obsidian Essentials"          │
│ • Tagline: "From beginner to expert"    │
│ • Value prop with benefits              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ WHAT'S INCLUDED                         │
│                                         │
│ ┌─ 1. Obsidian Starter Kit (€49.99) ─┐ │
│ │   • Description                      │ │
│ │   • Key features                     │ │
│ │   [View Details] [Add to Gumroad]   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─ 2. Obsidian Starter Course ───────┐ │
│ │   ...                                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ BUNDLE VALUE: Save 20%                  │
│ [Buy All on Gumroad]                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ WHO THIS IS FOR                         │
│ • Bullet list of target audience        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ TESTIMONIALS (optional)                 │
│ • Pull from individual products         │
└─────────────────────────────────────────┘
```

**Data Flow:**

- Read collection from `collections.json` by slug
- Load products by `productIds` array
- Calculate bundle pricing if applicable

---

### 5. Comparison Page (Optional)

**File:** `/src/pages/compare.tsx` (new)

**URL:** `/compare`

**Features:**

- Dropdown selectors to choose 2-3 products
- Side-by-side comparison table
- Compare: price, features, included items, best for
- CTA buttons to buy each product

---

## Header Navigation

**File:** `/src/components/layout/header.tsx` (modify)

**Structure:**

```
┌────────────────────────────────────────────────────┐
│ [Logo] [Categories▼] [Collections▼] [Compare]     │
│                              [Search🔍] [Theme]     │
└────────────────────────────────────────────────────┘
```

**Categories Dropdown:**

```
Categories ▼
├─ Courses
├─ Starter Kits
├─ Workshops
├─ Community
├─ Bundles
├─ ───────────
└─ All Products (→ /)
```

**Collections Dropdown:**

```
Collections ▼
├─ Obsidian Essentials
├─ Knowledge Starter
├─ AI-Powered
└─ ───────────
   View All Collections
```

**Keep Existing:**

- Logo and branding
- External website link
- Theme switcher (if exists)
- Sticky header behavior
- Glass-morphism effect

---

## Footer Navigation

**File:** `/src/components/layout/footer.tsx` (modify)

**Structure:**

```
┌──────────────────────────────────────────────────┐
│ [Logo + Description]                             │
│                                                  │
│ Categories          Popular Tags      Resources │
│ • Courses           • Obsidian        • Compare │
│ • Kits              • PKM             • Quiz    │
│ • Workshops         • Productivity    • Blog    │
│ • Community         • AI Tools        • Changelog│
│ • All Products                                   │
│                                                  │
│ Connect                                          │
│ • GitHub • Twitter • LinkedIn • Newsletter      │
│                                                  │
│ © 2026 dSebastien • Built with ❤️               │
└──────────────────────────────────────────────────┘
```

**Keep Existing:**

- Footer layout and styling
- Social media links
- Newsletter signup
- Copyright section

**Add:**

- Categories column with dynamic links
- Popular tags section
- Link to comparison page

---

## Implementation Phases

### Phase 1: Data Setup (1-2 days)

- [ ] Create `/src/data/categories.json`
- [ ] Create `/src/data/collections.json`
- [ ] Define 3-5 initial collections
- [ ] Optional: Create `/src/data/tags.json`

### Phase 2: Core Components (3-4 days)

- [ ] Build `ProductCard` component (grid + list views)
- [ ] Build `ProductFilter` component (search, type, pillar, price filters)
- [ ] Build `ProductGrid` component (responsive grid wrapper)
- [ ] Build `HeroSection` component
- [ ] Build `FeaturedProducts` component
- [ ] Build `StatsSection` component
- [ ] Build `Breadcrumbs` component

### Phase 3: Homepage (2-3 days)

- [ ] Rebuild `/src/pages/home.tsx` as product catalog
- [ ] Implement URL-based filtering state
- [ ] Add featured products carousel
- [ ] Add category quick links
- [ ] Add newsletter CTA
- [ ] Test responsive design

### Phase 4: Category Pages (2-3 days)

- [ ] Create `/src/pages/category.tsx`
- [ ] Create `CategoryHeader` component
- [ ] Implement category filtering logic
- [ ] Add related categories section
- [ ] Create routes for all categories
- [ ] Test dynamic routing

### Phase 5: Tag/Pillar Pages (2-3 days)

- [ ] Create `/src/pages/tag.tsx`
- [ ] Create `/src/pages/pillar.tsx` (or reuse tag page)
- [ ] Create `TagHeader` component
- [ ] Implement tag grouping by type
- [ ] Add related tags navigation
- [ ] Create routes

### Phase 6: Collection Pages (2-3 days)

- [ ] Create `/src/pages/collection.tsx`
- [ ] Create `CollectionHeader` component
- [ ] Create `CollectionProducts` component
- [ ] Implement bundle pricing logic
- [ ] Add routes for all collections
- [ ] Create collection cover images

### Phase 7: Navigation (2 days)

- [ ] Update header with category/collection dropdowns
- [ ] Update footer with category sitemap
- [ ] Add breadcrumbs to all pages
- [ ] Test navigation flow

### Phase 8: Polish & Optimization (3-4 days)

- [ ] Add related products to product detail pages
- [ ] Create 404 page
- [ ] Add redirects for old URLs
- [ ] SEO optimization (meta tags, Open Graph)
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Accessibility audit
- [ ] Mobile testing
- [ ] Cross-browser testing

### Phase 9: Optional Enhancements

- [ ] Product comparison page
- [ ] Product recommendation quiz
- [ ] Search/command palette for products
- [ ] Analytics integration
- [ ] Sitemap generation

**Total Estimated Time:** 3-4 weeks

---

## Design Principles

**Consistency:**

- Reuse existing color scheme and Tailwind configuration
- Maintain typography hierarchy
- Keep responsive breakpoint strategy
- Use existing button and card patterns

**User Experience:**

- Fast, responsive interface
- Intuitive navigation (breadcrumbs, clear CTAs)
- Bookmarkable filtered views (URL state)
- Mobile-first responsive design
- Accessible (ARIA labels, keyboard navigation)

**Performance:**

- Code splitting for routes
- Lazy loading for images
- Minimal bundle size
- Fast page loads

**SEO:**

- Semantic HTML
- Meta tags for all pages
- Open Graph tags
- Structured data (JSON-LD)
- Sitemap

---

## Migration Strategy

**Archive Old System:**

```bash
mkdir -p archive/
mv src/data/tools.json archive/
mv src/components/tools/ archive/components/
mv src/pages/home.tsx archive/pages/home-old.tsx
```

**Backward Compatibility:**

- Add redirects in `main.tsx` for `/products`, `/tool/*`, `/label/*`
- Preserve `/l/:productSlug` URLs (CRITICAL - don't change)
- Keep `/changelog` route as-is

**Deployment:**

- Test on staging environment first
- Deploy incrementally (homepage → categories → tags → collections)
- Monitor analytics for broken links

---

## Success Metrics

✅ **Functional:**

- Homepage shows products with working filters
- All category pages accessible and filtered correctly
- All tag/pillar pages work
- Collections display correctly with product links
- Navigation menus functional
- Redirects work for old URLs
- Mobile responsive across all pages

✅ **Quality:**

- Page load time < 2s
- Lighthouse score > 90
- No console errors
- Accessible (WCAG AA compliance)
- Cross-browser compatible

✅ **Business:**

- Clear product catalog
- Easy navigation by category/tag
- Gumroad CTAs on all products
- Featured products highlighted
- Newsletter signup visible

---

## Open Questions

1. **Collections:** How many initial collections should we create? (Recommend 3-5)
2. **Comparison:** Should we build the comparison page in Phase 1 or defer?
3. **Quiz:** Is the product recommendation quiz a priority?
4. **Images:** Do we need new cover images for collections?
5. **Analytics:** Which analytics events should we track?

---

## Next Steps

1. ✅ Review and approve this plan
2. Create initial collections list (3-5 bundles)
3. Start Phase 1: Data setup
4. Build core components (Phase 2)
5. Implement homepage (Phase 3)
6. Continue with remaining phases

---

**Document Version:** 1.0
**Last Updated:** 2026-01-06
