# Store Website Implementation Plan

**Status**: 🔄 In Progress - Phase 0 (Content Extraction)
**Last Updated**: 2026-01-05

**Goal:** Build a high-converting e-commerce store at store.dsebastien.net that replaces Gumroad as the primary storefront while maintaining exact URL compatibility, increasing conversions through superior UI/UX, SEO, and AI SEO optimization.

**Repository:** ~/wks/store-website
**Tech Stack:** Vite + React 19 + TypeScript + Tailwind CSS 4 (clone tools-website architecture)
**Hosting:** GitHub Pages
**Domain:** store.dsebastien.net (immediate cutover from Gumroad)

---

## 📊 Current Implementation Status

### Phase 0: Content Extraction ⏳ IN PROGRESS
**Objective**: Extract all product sales copy from Obsidian notes into structured documentation.

**Progress: 2/21 products (9.5%)**

#### ✅ Completed Products:
1. **Obsidian Starter Kit** (mghmmj) - €49.99/€118.99
   - Full PAS framework copy
   - 194 assets copied
   - 3 hero testimonials selected
   - Cross-sell strategy defined

2. **Knowii Voice AI** (tbdlrt) - €49
   - Full PAS framework copy
   - Demo video linked (YouTube)
   - Assets hosted externally
   - Cross-sell strategy defined

#### 🔲 Remaining Products: 19
- Knowledge Management for Beginners
- Knowledge Worker Kit
- Knowii Complete System
- Obsidian Starter Course
- 5 Workshops (Journaling, Personal Org, Clarity, AI Prompt, MCP)
- AI Ghostwriter Guide
- Dev Concepts (3 items)
- PKM Library
- IT Concepts Wall
- PKM Coaching
- 2 Free Resources
- Everything Bundle
- Buy Me Coffee

**Estimated Time**: ~14 hours remaining at current pace (~45 min/product)

---

### Phase 1: OSK Landing Page Template ⏸️ PENDING
**Status**: Waiting for Phase 0 completion (OSK sales copy ready)

**Next Steps**:
1. Clone tools-website structure (excluding .git)
2. Configure project with identical branding
3. Build OSK page as perfect template
4. Test Gumroad overlay integration

---

### Phase 2-5: Not Started
All subsequent phases pending Phase 1 completion.

---

## Executive Summary

### What We're Building
A static, highly-optimized product showcase website with:
- 21 product pages (16 paid + 2 free + 3 special items) matching exact Gumroad URLs
- Conversion-optimized landing pages with PAS copywriting
- Multi-dimensional product filtering (type, pillar, price tier)
- Product comparison tool
- Product recommendation quiz
- Ghost newsletter integration
- Gumroad overlay checkout integration

### Launch Strategy
**Progressive Implementation:**
1. **Phase 1:** Obsidian Starter Kit (OSK) as perfect template
2. **Phase 2:** Homepage + 5 featured products
3. **Phase 3:** All 21 products + category/tag pages
4. **Phase 4:** Comparison tool + quiz
5. **Phase 5:** Domain cutover

---

## 1. Product Inventory

### Paid Products (16)
| Product | Gumroad Permalink | Price | Type | Sales Copy Status |
|---------|------------------|-------|------|-------------------|
| Knowii Voice AI | tbdlrt | €49 | Tool | ✅ Complete |
| OSK Essentials/Premium | mghmmj | €49.99/€118.99 | Kit | ✅ Complete |
| OSK Course | nolle | €69.99 | Course | 🔲 Pending |
| Knowledge Worker Kit | pyjrr | €149.99 | Kit |
| KM for Beginners | wazqkq | €69.99 | Course |
| Knowii System | xjpgo | €4.99-999.99 | Community |
| Journaling Deep Dive | cdwol | €29.99 | Workshop |
| Personal Org 101 | zyuwjd | €19.99 | Workshop |
| Clarity 101 | uysik | €19.99 | Workshop |
| IT Concepts Wall | mwdbm | €9.99 | Resource |
| Dev Concepts Starter | AwJYP | €14.99 | Bundle |
| Dev Concepts Vol 1 | lnPaD | €9.99 | Book |
| Dev Concepts Vol 2 | aQRvz | €9.99 | Book |
| AI Ghostwriter | vsrnk | €49.99 | Guide |
| AI Master Prompt | pabtlh | €19.99 | Workshop |
| MCP Guide | ilwexl | €19.99 | Workshop |

### Free Resources (2)
| Product | Gumroad Permalink | Type |
|---------|------------------|------|
| Knowledge System Checklist | qctpj | Lead Magnet |
| Beginner's Guide to Obsidian | imkjic | Lead Magnet |

### Special (3)
| Product | Gumroad Permalink | Price | Type |
|---------|------------------|-------|------|
| PKM Coaching | mwldmd | €99.99/session | Service |
| Buy me a coffee | cbqxvp | €5+ | Donation |
| Everything Bundle | lbocum | €299.99 | Bundle |

**Total: 21 products requiring exact URL preservation**

---

## 2. Project Structure

```
~/wks/store-website/
├── public/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── products/              # Product covers, screenshots
│   │   │   ├── testimonials/          # Customer photos
│   │   │   └── badges/                # Trust badges (30-day guarantee, etc.)
│   │   └── icons/
│   ├── robots.txt
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── app-layout.tsx
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx             # Newsletter signup here
│   │   │   └── breadcrumbs.tsx
│   │   ├── ui/
│   │   │   ├── section.tsx
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── video-embed.tsx        # YouTube embeds
│   │   │   └── newsletter-form.tsx    # Ghost integration
│   │   ├── products/
│   │   │   ├── product-card.tsx
│   │   │   ├── product-hero.tsx       # Above-fold with CTA
│   │   │   ├── product-features.tsx
│   │   │   ├── product-benefits.tsx   # Before/after, PAS
│   │   │   ├── product-testimonials.tsx
│   │   │   ├── product-faq.tsx
│   │   │   ├── product-cta.tsx        # Gumroad button
│   │   │   ├── product-filter.tsx
│   │   │   ├── product-comparison.tsx # Side-by-side tool
│   │   │   └── product-quiz.tsx       # Recommendation engine
│   │   └── home/
│   │       ├── featured-product.tsx
│   │       └── product-grid.tsx
│   ├── data/
│   │   ├── products.json              # All 21 products (extracted from Obsidian)
│   │   ├── testimonials.json
│   │   ├── faqs.json
│   │   └── comparison-matrix.json
│   ├── lib/
│   │   ├── utils.ts                   # cn() helper from tools-website
│   │   ├── gumroad.ts                 # Overlay integration
│   │   ├── ghost-subscribe.ts         # Newsletter API
│   │   └── analytics.ts               # Plausible tracking
│   ├── pages/
│   │   ├── home.tsx
│   │   ├── product-detail.tsx         # /l/{permalink}
│   │   ├── category.tsx               # /category/{type}
│   │   ├── tag.tsx                    # /tag/{name}
│   │   ├── compare.tsx                # Product comparison
│   │   ├── quiz.tsx                   # Product recommender
│   │   └── newsletter.tsx             # Dedicated newsletter page
│   ├── styles/
│   │   └── index.css                  # Tailwind + custom variables
│   ├── types/
│   │   ├── product.ts
│   │   ├── testimonial.ts
│   │   └── faq.ts
│   ├── index.html
│   ├── main.tsx
│   └── vite-env.d.ts
├── scripts/
│   ├── generate-static-pages.ts       # Pre-render all routes
│   ├── generate-sitemap.ts            # SEO sitemap
│   ├── generate-llms-txt.ts           # AI crawler file
│   └── extract-product-data.ts        # Parse Obsidian notes
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Actions → GitHub Pages
├── dist/                              # Build output (gitignored)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

---

## 3. Data Architecture

### Product Schema (`src/types/product.ts`)

```typescript
export type ProductType =
  | 'course' | 'kit' | 'community' | 'guide'
  | 'workshop' | 'coaching' | 'bundle' | 'tool' | 'resource' | 'book'

export type PriceTier = 'free' | 'budget' | 'standard' | 'premium' | 'enterprise'

export type ProductPillar =
  | 'knowledge-management' | 'content-creation'
  | 'productivity' | 'ai-tools' | 'development'

export interface Product {
  // Identity
  id: string                            // Slug (e.g., 'obsidian-starter-kit')
  permalink: string                     // Gumroad /l/{code} - MUST be exact
  name: string
  tagline: string

  // Pricing
  price: number                         // Base price in EUR
  priceDisplay: string                  // e.g., '€49.99' or '€4.99+/month'
  priceTier: PriceTier
  gumroadUrl: string

  // Taxonomy (multi-dimensional filtering)
  type: ProductType
  pillars: ProductPillar[]
  tags: string[]

  // Marketing Copy (PAS Framework)
  problem: string                       // Pain point user faces
  agitate: string                       // Make problem worse
  solution: string                      // How product solves it

  // Features & Benefits
  description: string
  features: string[]
  benefits: string[]
  included: string[]                    // What you get

  // Social Proof
  testimonials: string[]                // IDs from testimonials.json
  statsProof?: {
    userCount?: string                  // '10,000+ users'
    timeSaved?: string
    rating?: string
  }

  // Media
  coverImage?: string
  screenshots?: string[]
  videoUrl?: string                     // YouTube embed
  demoUrl?: string

  // Content
  faqIds: string[]
  targetAudience: string[]
  notForYou?: string[]                  // Anti-pitch

  // Links
  landingPageUrl?: string               // e.g., obsidianstarterkit.com
  dsebastienUrl?: string                // Article on dsebastien.net

  // Meta
  featured: boolean
  status: 'active' | 'coming-soon' | 'archived'

  // SEO
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
}
```

### Extraction Script (`scripts/extract-product-data.ts`)

**Purpose:** Parse Obsidian notes and generate initial products.json

**Data Sources:**
1. `/home/dsebastien/notesSeb/10 Meta/16 DeveloPassion/DeveloPassion - Products and Services.md`
2. `/home/dsebastien/notesSeb/10 Meta/16 DeveloPassion/DeveloPassion - Free Resources.md`
3. Individual product notes (e.g., [[Obsidian Starter Kit]], [[Knowledge Management for Beginners]])

**Process:**
1. Read markdown files
2. Extract product metadata (name, price, description, links)
3. Map Gumroad store links to permalinks
4. Generate products.json with complete schema
5. User reviews and fills in missing fields (testimonials, screenshots, etc.)

---

## 4. Routing Strategy

### React Router Configuration (`src/main.tsx`)

```typescript
<BrowserRouter>
  <Routes>
    <Route element={<AppLayout />}>
      {/* Homepage */}
      <Route path="/" element={<HomePage />} />

      {/* Product detail pages - CRITICAL: Match Gumroad URLs */}
      <Route path="/l/:permalink" element={<ProductDetailPage />} />

      {/* Category pages */}
      <Route path="/category/:type" element={<CategoryPage />} />

      {/* Tag/Pillar pages */}
      <Route path="/tag/:tag" element={<TagPage />} />

      {/* Special pages */}
      <Route path="/compare" element={<ComparePage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/newsletter" element={<NewsletterPage />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### Static Output Structure

```
dist/
├── index.html                          # Homepage
├── l/
│   ├── tbdlrt/index.html              # Knowii Voice AI
│   ├── mghmmj/index.html              # OSK + community
│   ├── nolle/index.html               # OSK Course
│   └── ... (18 more products)
├── category/
│   ├── courses/index.html
│   ├── kits/index.html
│   ├── workshops/index.html
│   └── ...
├── tag/
│   ├── obsidian/index.html
│   ├── pkm/index.html
│   └── ...
├── compare/index.html
├── quiz/index.html
├── newsletter/index.html
├── sitemap.xml
├── llms.txt
└── robots.txt
```

---

## 5. Key Component Implementations

### 5.1 ProductHero (`src/components/products/product-hero.tsx`)

**Purpose:** Conversion-optimized above-the-fold section

**Elements:**
- Product name + tagline
- Stats proof badges (10,000+ users, 4.9/5 rating, Save 100+ hours)
- Primary CTA (Gumroad overlay button)
- Secondary CTA (Watch demo video - if videoUrl exists)
- Trust badges (30-day guarantee, lifetime updates, secure checkout)
- Cover image or hero screenshot
- Price display

**Inspired by:** Ghost theme homepage hero section

### 5.2 ProductCTA (`src/components/products/product-cta.tsx`)

**Gumroad Overlay Integration:**

```tsx
interface ProductCTAProps {
  gumroadUrl: string
  productName: string
  price: string
}

export function ProductCTA({ gumroadUrl, productName, price }: ProductCTAProps) {
  const handleClick = () => {
    trackEvent('Purchase Intent', { product: productName, price })
  }

  return (
    <a
      href={gumroadUrl}
      className="gumroad-button inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-secondary to-pink-600 rounded-lg hover:scale-105 transition-transform"
      data-gumroad-single-product="true"
      data-gumroad-overlay="true"
      onClick={handleClick}
    >
      Buy Now - {price}
    </a>
  )
}
```

**index.html integration:**
```html
<script src="https://gumroad.com/js/gumroad.js"></script>
```

### 5.3 NewsletterForm (`src/components/ui/newsletter-form.tsx`)

**Ghost Integration using ghost-subscribe.js:**

```tsx
import { ghostSubscribe } from '@/lib/ghost-subscribe'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      await ghostSubscribe(email, 'https://dsebastien.net')
      setStatus('success')
      trackEvent('Newsletter Signup', { location: 'footer' })
    } catch (error) {
      console.error('Newsletter signup failed:', error)
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center p-4 bg-green-100 rounded-lg">
        <p>✓ Check your email to confirm your subscription!</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="flex-1 px-4 py-2 rounded-lg border"
        required
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-2 bg-secondary text-white rounded-lg hover:opacity-90"
      >
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  )
}
```

**Placement:**
1. Footer on every page
2. After product description (before testimonials)
3. Dedicated /newsletter page with full pitch

### 5.4 ProductComparison (`src/components/products/product-comparison.tsx`)

**Use Case:** Help users choose between OSK, Knowledge Worker Kit, Everything Bundle

**Features:**
- Side-by-side comparison (2-3 products)
- Feature matrix checkmarks
- Price comparison
- "Best for" recommendations
- Highlight differences

**Data Source:** `comparison-matrix.json`

### 5.5 ProductQuiz (`src/components/products/product-quiz.tsx`)

**Logic Flow:**
1. Experience level? (Beginner / Intermediate / Advanced)
2. Primary goal? (Learn PKM / Organize notes / Create content / Manage projects)
3. Preferred format? (Course / Template/Kit / Community / 1-on-1 coaching)
4. Budget? (<€25 / €25-75 / €75-150 / €150+)
5. Tool preference? (Obsidian / Tool-agnostic / Looking for software)

**Result:** Recommend 1-3 products with explanation

---

## 6. Build Pipeline

### Build Scripts (`package.json`)

```json
{
  "scripts": {
    "dev": "vite",
    "extract": "tsx scripts/extract-product-data.ts",
    "build": "tsc && vite build && npm run generate",
    "generate": "tsx scripts/generate-static-pages.ts && tsx scripts/generate-sitemap.ts && tsx scripts/generate-llms-txt.ts",
    "preview": "vite preview",
    "deploy": "npm run build && git add dist && git commit -m 'Deploy' && git push"
  }
}
```

### Static Page Generation (`scripts/generate-static-pages.ts`)

**Critical Requirements:**
1. Preserve exact Gumroad permalinks in URLs
2. Generate SEO-optimized HTML with meta tags
3. Inject JSON-LD product schema
4. Pre-render React components to HTML
5. Include Gumroad overlay script

**Process:**
```typescript
// For each product in products.json
for (const product of products) {
  const html = renderToString(<ProductDetailPage product={product} />)
  const seoHtml = injectSEOTags(html, product)
  const schemaHtml = injectJSONLD(seoHtml, product)

  writeFileSync(`dist/l/${product.permalink}/index.html`, schemaHtml)
}
```

### Sitemap Generation (`scripts/generate-sitemap.ts`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://store.dsebastien.net/</loc>
    <priority>1.0</priority>
  </url>
  <!-- All 21 product pages -->
  <url>
    <loc>https://store.dsebastien.net/l/mghmmj</loc>
    <priority>0.9</priority>
  </url>
  <!-- Category pages -->
  <!-- Tag pages -->
</urlset>
```

### LLMs.txt Generation (`scripts/generate-llms-txt.ts`)

**AI-Crawler Optimized:**

```
# dSebastien's Knowledge Store

> 21 products for knowledge workers, creators, and lifelong learners

## About
This store offers comprehensive knowledge management, productivity, and personal organization solutions created by Sébastien Dubois, including courses, templates, tools, and community access.

## Product Categories

### Courses (3)
- Knowledge Management for Beginners: €69.99 - Comprehensive PKM course for newcomers
- Obsidian Starter Course: $69.99 - Video course mastering Obsidian in 2+ hours
- (List all with prices and descriptions)

### Kits & Templates (2)
- Obsidian Starter Kit: €49.99 - Battle-tested vault with 40+ templates
- Knowledge Worker Kit: €149.99 - All-in-one productivity boost

### Community (1)
- Knowii Complete Knowledge System: €4.99-999.99 - Central hub with courses and community

(Continue for all categories)

## Featured Products
1. Obsidian Starter Kit - Most popular, 10,000+ users
2. Knowledge Management for Beginners - Complete PKM mastery
3. Knowii Complete System - All-access membership

## Free Resources
- Beginner's Guide to Obsidian
- Knowledge System Checklist

## Links
- Main website: https://dsebastien.net
- Newsletter: https://dsebastien.net/newsletter
- Public notes: https://notes.dsebastien.net
```

---

## 7. SEO & AI SEO Implementation

### JSON-LD Product Schema

```typescript
function generateProductSchema(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    'image': product.coverImage,
    'brand': {
      '@type': 'Brand',
      'name': 'dSebastien'
    },
    'offers': {
      '@type': 'Offer',
      'price': product.price,
      'priceCurrency': product.priceDisplay.includes('€') ? 'EUR' : 'USD',
      'availability': 'https://schema.org/InStock',
      'url': `https://store.dsebastien.net/l/${product.permalink}`
    },
    'aggregateRating': product.statsProof?.rating ? {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'reviewCount': '200'
    } : undefined,
    'author': {
      '@type': 'Person',
      'name': 'Sébastien Dubois',
      'url': 'https://www.dsebastien.net'
    }
  }
}
```

### Meta Tags Template

```html
<!-- Primary Meta Tags -->
<title>{product.metaTitle || product.name} | dSebastien Store</title>
<meta name="title" content="{product.name}" />
<meta name="description" content="{product.metaDescription || product.tagline}" />
<meta name="keywords" content="{product.keywords.join(', ')}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="product" />
<meta property="og:url" content="https://store.dsebastien.net/l/{product.permalink}" />
<meta property="og:title" content="{product.name}" />
<meta property="og:description" content="{product.tagline}" />
<meta property="og:image" content="{product.coverImage}" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="https://store.dsebastien.net/l/{product.permalink}" />
<meta name="twitter:title" content="{product.name}" />
<meta name="twitter:description" content="{product.tagline}" />
<meta name="twitter:image" content="{product.coverImage}" />

<!-- JSON-LD -->
<script type="application/ld+json">
{JSON.stringify(generateProductSchema(product))}
</script>
```

---

## 8. Analytics Strategy

### Plausible Analytics Integration

**Setup:**
```html
<!-- index.html -->
<script defer data-domain="store.dsebastien.net" src="https://plausible.io/js/script.js"></script>
```

### Events to Track

```typescript
// Homepage
- 'Homepage View'
- 'Featured Product Click' (props: product_id)
- 'Category Filter' (props: category)

// Product Pages
- 'Product View' (props: product_id, product_name, price)
- 'Video Play' (props: product_id)
- 'Purchase Intent' (props: product_id, price)
- 'Gumroad Overlay Open' (props: product_id)
- 'FAQ Expand' (props: product_id, question_id)
- 'Newsletter CTA Click' (props: product_id, location)

// Comparison & Quiz
- 'Comparison Tool View'
- 'Comparison Selected' (props: product_ids)
- 'Quiz Started'
- 'Quiz Completed' (props: recommended_product)

// Newsletter
- 'Newsletter Signup' (props: location)
- 'Newsletter Success' (props: location)
```

**Implementation (`lib/analytics.ts`):**

```typescript
declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void
  }
}

export function trackEvent(event: string, props?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(event, { props })
  }
}
```

---

## 9. Design & Styling

### Tailwind Configuration

**Replicate tools-website aesthetic:**

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        background: '#37404c',        // Dark blue-gray
        primary: '#ffffff',           // White text
        secondary: '#e5007d',         // Pink accent (CTAs)
        'secondary-text': '#ff1493', // Deep pink
      },
      fontFamily: {
        sans: ['Noto Sans', 'sans-serif'],
      },
    }
  }
}
```

### Conversion-Optimized Components

**From Ghost Theme Patterns:**
1. **PAS Copywriting Structure** - Problem → Agitate → Solution
2. **Value Stacks** - Checkmark lists of features/benefits
3. **Social Proof Placement** - Testimonials after features, before FAQ
4. **Risk Reversal** - 30-day money-back guarantee badge
5. **Urgency Indicators** - "Lifetime updates" (evergreen)
6. **Trust Badges** - Secure checkout, 10,000+ users, 4.9/5 rating

### Mobile-First Priorities
- Touch-friendly buttons (min 48px height)
- Sticky "Buy Now" footer on mobile
- Collapsible FAQ accordion
- Responsive product grid (1 col mobile → 3 cols desktop)
- Lazy-loaded images below fold

---

## 10. Progressive Launch Plan

### Phase 1: OSK Landing Page (Week 1-2)

**Goal:** Build perfect template for all products

**Tasks:**
1. Initialize project (clone tools-website structure)
2. Extract OSK data from Obsidian notes
3. Create complete OSK product entry in products.json
4. Build all product detail components:
   - ProductHero with stats proof
   - ProductFeatures with value stack
   - ProductTestimonials with carousel
   - ProductFAQ accordion
   - ProductCTA with Gumroad overlay
   - Newsletter signup after description
5. Add YouTube video embed (if available)
6. Implement analytics tracking
7. Generate static HTML for `/l/mghmmj`
8. Deploy to GitHub Pages staging
9. **Validation:** Compare against obsidianstarterkit.com, verify all conversion elements present

**Critical Files:**
- `/home/dsebastien/notesSeb/30 Areas/33 Permanent notes/33.04 Creations/Products/Obsidian Starter Kit/Obsidian Starter Kit.md`
- `~/wks/store-website/src/data/products.json` (OSK entry)
- `~/wks/store-website/src/pages/product-detail.tsx`
- `~/wks/store-website/src/components/products/*`

### Phase 2: Homepage + 5 Featured Products (Week 3)

**Products to Add:**
1. Obsidian Starter Kit (done)
2. Knowii Voice AI
3. Knowledge Management for Beginners
4. Knowledge Worker Kit
5. Everything Knowledge Bundle

**Homepage Components:**
- Hero section with featured product carousel
- Product grid with filtering
- Stats section (2,300+ newsletter members, 20+ years expertise, 340+ community members)
- Newsletter signup CTA
- Footer with links

**New Pages:**
- Homepage (`/`)
- 4 additional product pages

### Phase 3: All 21 Products + Category/Tag Pages (Week 4-5)

**Batch Processing:**
1. Run extraction script on all product notes
2. Fill in missing data (testimonials, screenshots)
3. Generate all 21 `/l/{permalink}` pages
4. Create category pages:
   - /category/courses
   - /category/kits
   - /category/workshops
   - /category/community
   - /category/guides
   - /category/bundles
5. Create tag/pillar pages:
   - /tag/obsidian
   - /tag/pkm
   - /tag/productivity
   - /tag/ai-tools

### Phase 4: Special Features (Week 6)

**Comparison Tool:**
- Pre-built comparisons:
  - OSK vs KWK vs Everything Bundle
  - KM for Beginners vs OSK Course
  - Free resources vs paid products
- Custom comparison builder (select 2-3 products)

**Product Quiz:**
- 5-question recommendation engine
- Results page with 1-3 product recommendations
- "Why we recommend this" explanations
- Direct CTA to recommended products

**Newsletter Page:**
- Dedicated /newsletter landing page
- Full value proposition
- Past issue highlights
- Ghost newsletter signup form

### Phase 5: Domain Cutover (Week 7)

**Pre-Cutover Checklist:**
- [ ] All 21 product pages deployed and tested
- [ ] Gumroad overlay tested on each product
- [ ] Analytics configured and firing correctly
- [ ] Sitemap generated and submitted to Google Search Console
- [ ] SSL certificate verified (GitHub Pages auto-provides)
- [ ] 404 page styled and functional
- [ ] Mobile responsiveness verified on real devices
- [ ] Performance: Lighthouse score > 90
- [ ] SEO: All meta tags and JSON-LD validated

**DNS Configuration:**
```
Type: CNAME
Name: store
Value: dsebastien.github.io (or your GitHub username)
TTL: 3600
```

**GitHub Pages Settings:**
```
Repository: store-website
Branch: main
Folder: /dist (after build)
Custom domain: store.dsebastien.net
Enforce HTTPS: ✓
```

**Gumroad Configuration:**
1. **Keep Gumroad custom domain** for now (backup)
2. Point store.dsebastien.net to GitHub Pages
3. Update Gumroad product URLs to reference new site
4. Monitor purchases attribution
5. After 2 weeks of stable operation, consider removing Gumroad custom domain

**Post-Cutover Monitoring:**
- Monitor 404 errors in Plausible (first 48 hours)
- Verify Gumroad sales still processing correctly
- Check social media preview cards (Twitter, LinkedIn, Facebook)
- Test all 21 product URLs manually
- Monitor conversion rates vs. baseline (if available)

---

## 11. Content Migration Process

### Step-by-Step Data Extraction

**1. Run Extraction Script:**
```bash
cd ~/wks/store-website
npm run extract
```

**Script Logic (`scripts/extract-product-data.ts`):**
- Read `/home/dsebastien/notesSeb/10 Meta/16 DeveloPassion/DeveloPassion - Products and Services.md`
- Read `/home/dsebastien/notesSeb/10 Meta/16 DeveloPassion/DeveloPassion - Free Resources.md`
- Parse product names, prices, descriptions, Gumroad links
- Map store URLs to permalinks (e.g., `/l/mghmmj` → `mghmmj`)
- Generate initial `products.json` with schema

**2. Manual Enrichment:**

For each product, add:
- **Problem/Agitate/Solution** (PAS copywriting)
- **Features, benefits, included items**
- **Testimonial IDs** (create testimonials.json)
- **FAQ IDs** (create faqs.json)
- **Cover image path** (add to public/assets/images/products/)
- **Screenshots** (if available)
- **Video URL** (YouTube embed)
- **Target audience** and **not-for-you** anti-pitch

**3. Asset Organization:**

```bash
public/assets/images/products/
├── osk/
│   ├── cover.png
│   ├── screenshot-daily-note.png
│   ├── screenshot-templates.png
│   └── screenshot-graph.png
├── kwk/
│   └── cover.png
├── knowii-voice-ai/
│   └── cover.png
└── testimonials/
    ├── customer-1.jpg
    ├── customer-2.jpg
    └── ...
```

**4. Content Review:**
- Verify all 21 products have complete data
- Check that prices match Gumroad
- Validate all permalinks are correct
- Ensure testimonials are accurate and attributed

---

## 12. Deployment Pipeline

### GitHub Actions Workflow (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
    tags:
      - '**'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Deployment Triggers:**
- Push to main branch
- Push tags (e.g., `v1.0.0`)
- Manual workflow dispatch

---

## 13. Critical Implementation Details

### URL Mapping (MUST BE EXACT)

**Permalink to Product ID Mapping:**
```typescript
const PERMALINK_MAP = {
  'tbdlrt': 'knowii-voice-ai',
  'mghmmj': 'obsidian-starter-kit',
  'nolle': 'obsidian-starter-course',
  'pyjrr': 'knowledge-worker-kit',
  'wazqkq': 'knowledge-management-for-beginners',
  'xjpgo': 'knowii-complete-system',
  'cdwol': 'journaling-deep-dive',
  'zyuwjd': 'personal-organization-101',
  'uysik': 'clarity-101',
  'mwdbm': 'it-concepts-wall',
  'AwJYP': 'dev-concepts-starter-bundle',
  'lnPaD': 'dev-concepts-volume-1',
  'aQRvz': 'dev-concepts-volume-2',
  'vsrnk': 'ai-ghostwriter-guide',
  'pabtlh': 'ai-master-prompt',
  'ilwexl': 'mcp-guide',
  'mwldmd': 'pkm-coaching',
  'qctpj': 'knowledge-system-checklist',
  'imkjic': 'beginners-guide-to-obsidian',
  'cbqxvp': 'buy-me-coffee',
  'lbocum': 'everything-knowledge-bundle'
}
```

**Critical:** All `/l/{permalink}` routes MUST work identically to current Gumroad URLs.

### Newsletter Integration Details

**Ghost API Endpoint:**
```
POST https://dsebastien.net/members/api/send-magic-link/
Content-Type: application/json

{
  "email": "user@example.com",
  "emailType": "subscribe"
}
```

**Ghost Subscribe Function (`lib/ghost-subscribe.ts`):**
```typescript
export async function ghostSubscribe(email: string, ghostSiteBaseUrl: string) {
  const response = await fetch(`${ghostSiteBaseUrl}/members/api/send-magic-link/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      email,
      emailType: 'subscribe'
    })
  })

  if (!response.ok) {
    throw new Error('Newsletter subscription failed')
  }

  return response.json()
}
```

### Taxonomy Structure

**Product Categorization (multi-dimensional):**

1. **By Type:**
   - Courses (3): KM for Beginners, OSK Course, (+ free workshop)
   - Kits (2): OSK, KWK
   - Community (1): Knowii
   - Workshops (5): AI Master Prompt, MCP, Clarity 101, Personal Org 101, Journaling
   - Guides (1): AI Ghostwriter
   - Books (3): Dev Concepts Vol 1, 2, + Starter Bundle
   - Bundles (1): Everything Knowledge
   - Tools (1): Knowii Voice AI
   - Services (1): PKM Coaching
   - Resources (2): Free checklist, free Obsidian guide

2. **By Pillar (Content Strategy):**
   - Knowledge Management (12 products)
   - Content Creation (2 products)
   - Productivity (8 products)
   - AI Tools (4 products)
   - Development (3 products - Dev Concepts)

3. **By Price Tier:**
   - Free (2)
   - Budget €1-25 (5)
   - Standard €25-75 (7)
   - Premium €75-150 (5)
   - Enterprise €150+ (2)

---

## 14. Testing Strategy

### Pre-Launch Tests

**Functionality:**
- [ ] All 21 product URLs load correctly
- [ ] Gumroad overlay opens on CTA click
- [ ] Newsletter form submits successfully
- [ ] Video embeds play (where applicable)
- [ ] FAQ accordions expand/collapse
- [ ] Product filtering works (category, tag, price)
- [ ] Comparison tool compares correctly
- [ ] Quiz recommends appropriate products
- [ ] Mobile navigation works
- [ ] Search (if implemented) returns results

**Performance:**
- [ ] Lighthouse score > 90 (all categories)
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Images lazy-load correctly

**SEO:**
- [ ] All meta tags present and unique per page
- [ ] JSON-LD validates (Google Rich Results Test)
- [ ] Sitemap accessible at /sitemap.xml
- [ ] Robots.txt configured correctly
- [ ] Canonical URLs set properly
- [ ] Social preview cards render correctly (Twitter, LinkedIn, Facebook)

**Cross-Browser:**
- [ ] Chrome (desktop + mobile)
- [ ] Firefox
- [ ] Safari (desktop + mobile)
- [ ] Edge

**Analytics:**
- [ ] Plausible script loads
- [ ] Events fire correctly (test in Plausible dashboard)
- [ ] Custom props captured (product_id, price, etc.)

### Post-Launch Monitoring

**Week 1:**
- Daily check: 404 errors, conversion events, newsletter signups
- Monitor Gumroad sales attribution
- Check social media traffic and preview rendering

**Week 2-4:**
- Weekly analytics review
- Identify top-performing products
- Analyze drop-off points (where users leave)
- A/B test CTA button copy (if traffic sufficient)

---

## 15. Success Metrics

### Primary KPIs
1. **Conversion Rate:** % of visitors who purchase (target: >2%)
2. **Newsletter Signups:** Email captures per week (target: 50+)
3. **Product Page Engagement:** Time on page, scroll depth
4. **Gumroad Overlay Completion:** % who open overlay and complete purchase

### Secondary KPIs
1. **Comparison Tool Usage:** How many visitors use it
2. **Quiz Completion Rate:** % who finish quiz
3. **Video Play Rate:** % who watch product demos
4. **Mobile vs Desktop Conversion:** Optimize lower performer

### Tracking Setup
- Set up Plausible goals for each KPI
- Weekly reports exported to dashboard
- Monthly deep-dive analysis with actionable insights

---

## 16. Risk Mitigation

### Potential Issues & Solutions

**Issue: Gumroad overlay doesn't work on new domain**
- Solution: Test extensively in staging; have fallback to redirect if overlay fails

**Issue: DNS propagation delays (store.dsebastien.net not resolving)**
- Solution: Cutover during low-traffic hours (weekend); keep Gumroad as backup for 48 hours

**Issue: Broken product links from external sources (newsletter, social media)**
- Solution: 301 redirects from old Gumroad URLs to new site (if possible via Gumroad settings)

**Issue: Analytics not tracking purchases (Gumroad completes on their domain)**
- Solution: Track "Purchase Intent" (CTA clicks) as proxy; compare against Gumroad sales reports

**Issue: User manually edits dist/ HTML, but rebuild overwrites changes**
- Solution: Implement "manual overrides" system where user can mark sections in products.json as "custom HTML" that gets injected during build without being overwritten

---

## 17. Future Enhancements (Post-Launch)

### Phase 6: Optimization (Month 2+)

**Conversion Optimization:**
- A/B test CTA button colors, copy, placement
- Heatmap analysis (Hotjar or Microsoft Clarity)
- Session recording to identify UX friction
- Exit-intent popups for newsletter signup

**Content Enhancements:**
- Customer review submission form
- Live testimonial feed
- Product update changelog
- FAQ search functionality

**Marketing Integrations:**
- Affiliate link tracking
- Discount code system
- Bundle builder (dynamic pricing)
- Product recommendation engine (ML-based)

**Technical Improvements:**
- Implement search functionality (Algolia or Pagefind)
- Add breadcrumb navigation
- Improve image optimization (WebP, srcset)
- Implement service worker for offline support

---

## 18. Content Updates Workflow

### Ongoing Maintenance

**Option 1: Update Source Data (Recommended)**
```bash
# Edit products.json or Obsidian notes
vim ~/wks/store-website/src/data/products.json

# Rebuild and deploy
npm run build
git add .
git commit -m "Update: OSK pricing change"
git push origin main
# GitHub Actions auto-deploys
```

**Option 2: Direct HTML Edit (Quick Fixes Only)**
```bash
# Edit generated HTML directly
vim ~/wks/store-website/dist/l/mghmmj/index.html

# Manual push to gh-pages branch
git add dist/
git commit -m "Hotfix: OSK testimonial typo"
git push origin main
```

**Warning:** Direct HTML edits will be overwritten on next full build. Only use for urgent hotfixes; then update source data.

---

## 19. Critical Files Summary

### Files to Create (Priority Order)

**Phase 1 (OSK Template):**
1. `~/wks/store-website/src/types/product.ts` - TypeScript interfaces
2. `~/wks/store-website/src/data/products.json` - Product data (start with OSK only)
3. `~/wks/store-website/src/components/products/product-hero.tsx` - Hero section
4. `~/wks/store-website/src/components/products/product-cta.tsx` - Gumroad button
5. `~/wks/store-website/src/pages/product-detail.tsx` - Main product page
6. `~/wks/store-website/scripts/generate-static-pages.ts` - Static HTML generation
7. `~/wks/store-website/vite.config.ts` - Build configuration

**Phase 2 (Homepage + 5 Products):**
8. `~/wks/store-website/src/pages/home.tsx` - Homepage
9. `~/wks/store-website/src/components/home/featured-product.tsx` - Featured carousel
10. `~/wks/store-website/src/components/products/product-card.tsx` - Grid view card
11. `~/wks/store-website/src/lib/ghost-subscribe.ts` - Newsletter API
12. `~/wks/store-website/src/components/ui/newsletter-form.tsx` - Newsletter form

**Phase 3 (All Products + Categories):**
13. `~/wks/store-website/scripts/extract-product-data.ts` - Obsidian data extraction
14. `~/wks/store-website/src/pages/category.tsx` - Category pages
15. `~/wks/store-website/src/pages/tag.tsx` - Tag pages
16. `~/wks/store-website/src/data/testimonials.json` - Customer reviews
17. `~/wks/store-website/src/data/faqs.json` - Product FAQs

**Phase 4 (Special Features):**
18. `~/wks/store-website/src/components/products/product-comparison.tsx` - Comparison tool
19. `~/wks/store-website/src/components/products/product-quiz.tsx` - Recommendation quiz
20. `~/wks/store-website/src/pages/newsletter.tsx` - Newsletter landing page

**Phase 5 (Deployment):**
21. `~/wks/store-website/.github/workflows/deploy.yml` - GitHub Actions
22. `~/wks/store-website/scripts/generate-sitemap.ts` - Sitemap generator
23. `~/wks/store-website/scripts/generate-llms-txt.ts` - AI crawler file

---

## 20. Next Steps

### Immediate Actions

1. **Initialize Repository:**
   ```bash
   cd ~/wks
   git clone ~/wks/tools-website ~/wks/store-website
   cd store-website
   rm -rf .git
   git init
   # Update package.json name, description
   ```

2. **Extract Product Data:**
   - Read DeveloPassion product notes
   - Create initial products.json with OSK
   - Gather OSK assets (images, screenshots)

3. **Build OSK Page:**
   - Implement ProductHero component
   - Implement ProductCTA with Gumroad overlay
   - Add newsletter signup
   - Generate static HTML

4. **Test Locally:**
   ```bash
   npm run dev
   # Visit http://localhost:5173/l/mghmmj
   ```

5. **Deploy to GitHub Pages:**
   - Push to GitHub
   - Enable GitHub Pages
   - Test on public URL

---

## Conclusion

This plan provides a complete roadmap to build a high-converting store website that:
- Replaces Gumroad as your primary storefront
- Preserves all 21 product URLs exactly
- Implements conversion-optimized design patterns
- Integrates Gumroad checkout seamlessly
- Includes Ghost newsletter signup
- Provides product comparison and recommendation tools
- Optimizes for SEO and AI discoverability
- Deploys automatically via GitHub Actions

The progressive launch strategy ensures you can validate the OSK page first, then expand systematically to all products, minimizing risk while maximizing learning.