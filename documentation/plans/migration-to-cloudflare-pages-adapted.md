# Migration Plan: GitHub Pages → Cloudflare Pages with URL Restructuring

## Overview

Migrate the store website from GitHub Pages to Cloudflare Pages with a modernized URL structure while maintaining 100% backwards compatibility through Cloudflare redirects. This plan removes GitHub Pages workarounds, implements native Cloudflare features, and updates all product URLs from `/l/:id` to `/product/:id`.

## Critical Constraints & Backwards Compatibility Policy

### External URLs (MUST maintain backwards compatibility)

**Critical:** All publicly-shared URLs must continue working via 301 redirects:

1. **Gumroad product URLs** - All `/l/:id` and `/l/:permalink` URLs redirect to `/product/:id`
    - These URLs are used in Gumroad product listings, email campaigns, social media, and external websites
    - MUST redirect permanently (301) to new `/product/:id` structure
    - Zero breakage for users clicking Gumroad-originated links

2. **Social shares and bookmarks** - Any `/l/` URL shared on social media, saved in bookmarks, or linked externally
    - Redirects ensure existing shares continue working
    - SEO value transfers to new URLs via 301 redirects

### Internal Codebase (NO backwards compatibility needed)

**Important:** Internal codebase changes do NOT require backwards compatibility:

1. **React Router routes** - Changing from `/l/:productSlug` to `/product/:productSlug` is a breaking internal change
    - No backwards compatibility layer needed in React Router
    - Old route is completely removed from code
    - Cloudflare redirects handle backwards compatibility at edge

2. **Component links** - All `<Link to="/l/...">` changed to `<Link to="/product/...">` without fallbacks
    - No need to support both URL patterns in components
    - Clean migration with no technical debt

3. **Scripts and build tools** - All scripts updated to use new `/product/` structure
    - No dual-path support needed
    - Static pages generated only at `/product/` path (not both)

4. **Documentation** - Internal documentation updated to show new `/product/` URLs
    - Example commands use new structure
    - Migration plans show both for reference only

### Summary

- ✅ **Redirects handle backwards compatibility** - Cloudflare `_redirects` file ensures all old URLs work
- ✅ **Code is fully migrated** - No dual-path support, no compatibility layers, no technical debt
- ✅ **Users experience zero breakage** - Redirects are invisible and instant (301 permanent)

## Key Changes Summary

1. **URL Structure Change**: `/l/:id` → `/product/:id` (cleaner, more semantic)
2. **Backwards Compatibility**: Cloudflare `_redirects` file handles all old URLs (301 permanent redirects)
3. **Remove client-side redirect workarounds** → Use Cloudflare `_redirects` file
4. **Remove 404.html workaround** → Use Cloudflare SPA fallback
5. **Add Cloudflare configuration files** → `_redirects`, `_headers`, `wrangler.toml`
6. **Update all internal URLs** → Change `/l/` to `/product/` throughout codebase
7. **Update build scripts** → Remove generate-redirect-pages step, update static page generation
8. **Configure Wrangler** → Add wrangler.toml for Cloudflare Pages deployment
9. **Update GitHub Actions** → Replace GitHub Pages workflow with Cloudflare Pages deployment

---

## Part 1: URL Structure Changes

### Current Structure

- Product pages: `/l/{product-id}` (21 products)
- Example: `https://store.dsebastien.net/l/knowii-voice-ai`

### New Structure

- Product pages: `/product/{product-id}` (21 products)
- Example: `https://store.dsebastien.net/product/knowii-voice-ai`

### Why `/product/` Instead of `/l/`?

- **Semantic clarity**: `/product/` is self-descriptive, `/l/` is ambiguous
- **SEO benefits**: Search engines prefer descriptive URLs
- **User experience**: Users understand the URL structure at a glance
- **Future-proof**: Easier to extend (e.g., `/product/:id/reviews`, `/product/:id/gallery`)

### Backwards Compatibility Strategy

All 21 products have two URL patterns to redirect:

1. `/l/{product-id}` → `/product/{product-id}` (primary ID)
2. `/l/{permalink}` → `/product/{product-id}` (Gumroad permalink)

**Total redirects needed**: 42 redirects (21 products × 2 URL patterns each)

---

## Part 2: Cloudflare Configuration Files

### 1. Create: `public/_redirects`

**Purpose:** Native Cloudflare redirects (server-side, instant, 301 permanent)

**Location:** `public/_redirects`

**Content:**

```
# Product page redirects - /l/:id → /product/:id (Primary IDs)
/l/obsidian-starter-kit /product/obsidian-starter-kit 301
/l/everything-knowledge-bundle /product/everything-knowledge-bundle 301
/l/knowledge-management-for-beginners /product/knowledge-management-for-beginners 301
/l/knowledge-worker-kit /product/knowledge-worker-kit 301
/l/obsidian-starter-course /product/obsidian-starter-course 301
/l/ai-ghostwriter-guide /product/ai-ghostwriter-guide 301
/l/pkm-library /product/pkm-library 301
/l/ai-master-prompt /product/ai-master-prompt 301
/l/clarity-101 /product/clarity-101 301
/l/journaling-deep-dive /product/journaling-deep-dive 301
/l/model-context-protocol /product/model-context-protocol 301
/l/personal-organization-101 /product/personal-organization-101 301
/l/dev-concepts-starter-bundle /product/dev-concepts-starter-bundle 301
/l/knowii-voice-ai /product/knowii-voice-ai 301
/l/dev-concepts-volume-01 /product/dev-concepts-volume-01 301
/l/dev-concepts-volume-02 /product/dev-concepts-volume-02 301
/l/pkm-coaching /product/pkm-coaching 301
/l/it-concepts-wall /product/it-concepts-wall 301
/l/beginners-guide-obsidian /product/beginners-guide-obsidian 301
/l/knowledge-system-checklist /product/knowledge-system-checklist 301
/l/knowii-community /product/knowii-community 301

# Product page redirects - /l/:permalink → /product/:id (Gumroad Permalinks)
/l/mghmmj /product/obsidian-starter-kit 301
/l/everything-knowledge-bundle-permalink /product/everything-knowledge-bundle 301
/l/knowledge-management-for-beginners-permalink /product/knowledge-management-for-beginners 301
/l/knowledge-worker-kit-permalink /product/knowledge-worker-kit 301
/l/obsidian-starter-course-permalink /product/obsidian-starter-course 301
/l/ai-ghostwriter-guide-permalink /product/ai-ghostwriter-guide 301
/l/pkm-library-permalink /product/pkm-library 301
/l/ai-master-prompt-permalink /product/ai-master-prompt 301
/l/clarity-101-permalink /product/clarity-101 301
/l/journaling-deep-dive-permalink /product/journaling-deep-dive 301
/l/model-context-protocol-permalink /product/model-context-protocol 301
/l/personal-organization-101-permalink /product/personal-organization-101 301
/l/dev-concepts-starter-bundle-permalink /product/dev-concepts-starter-bundle 301
/l/knowii-voice-ai-permalink /product/knowii-voice-ai 301
/l/dev-concepts-volume-01-permalink /product/dev-concepts-volume-01 301
/l/dev-concepts-volume-02-permalink /product/dev-concepts-volume-02 301
/l/pkm-coaching-permalink /product/pkm-coaching 301
/l/it-concepts-wall-permalink /product/it-concepts-wall 301
/l/beginners-guide-obsidian-permalink /product/beginners-guide-obsidian 301
/l/knowledge-system-checklist-permalink /product/knowledge-system-checklist 301
/l/knowii-community-permalink /product/knowii-community 301

# Other redirects
/affiliates https://developassion.gumroad.com/affiliates 301

# SPA fallback - catch all non-file requests and serve index.html
/*  /index.html  200
```

**Notes:**

- First 21 redirects handle primary ID pattern (`/l/{id}` → `/product/{id}`)
- Next 21 redirects handle Gumroad permalink pattern (`/l/{permalink}` → `/product/{id}`)
- Permanent 301 redirects preserve SEO value
- SPA fallback enables client-side routing
- Cloudflare processes redirects at edge (10-100x faster than client-side)

**IMPORTANT:** The permalink values shown above are placeholders. You must extract the actual `permalink` field from each product JSON file to populate the correct redirect rules.

**Script to Generate Redirects:**

```bash
#!/usr/bin/env bun
# scripts/generate-cloudflare-redirects.ts
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Product } from '../src/types/product'

const __dirname = dirname(fileURLToPath(import.meta.url))
const productsJsonPath = join(__dirname, '../src/data/products.json')
const productsData: Product[] = JSON.parse(readFileSync(productsJsonPath, 'utf-8'))

console.log('# Product page redirects - /l/:id → /product/:id (Primary IDs)')
for (const product of productsData) {
    console.log(`/l/${product.id} /product/${product.id} 301`)
}

console.log('')
console.log('# Product page redirects - /l/:permalink → /product/:id (Gumroad Permalinks)')
for (const product of productsData) {
    console.log(`/l/${product.permalink} /product/${product.id} 301`)
}
```

Run: `bun scripts/generate-cloudflare-redirects.ts` to output the complete redirect list.

### 2. Create: `public/_headers` (Optional but Recommended)

**Purpose:** Optimize caching and add security headers

**Location:** `public/_headers`

**Content:**

```
# Cache static assets aggressively
/assets/*
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

/*.css
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

/*.js
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

# Images
/assets/images/*
  Cache-Control: public, max-age=31536000, immutable

# HTML pages - no cache, always revalidate
/*.html
  Cache-Control: public, max-age=0, must-revalidate
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff

# Root index
/
  Cache-Control: public, max-age=0, must-revalidate
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
```

### 3. Create: `wrangler.toml`

**Purpose:** Wrangler configuration for Cloudflare Pages deployment

**Location:** Project root (`wrangler.toml`)

**Content:**

```toml
name = "store-website"
compatibility_date = "2026-01-12"

# Pages configuration
pages_build_output_dir = "dist"

# Custom domain configuration (optional, can be configured in dashboard)
[env.production]
routes = [
  { pattern = "store.dsebastien.net", custom_domain = true }
]

# Build configuration
[build]
command = "bun run build"
cwd = ""
watch_dirs = ["src", "public", "scripts"]

# Environment variables (if needed)
[vars]
NODE_ENV = "production"
```

---

## Part 3: Code Changes - URL Updates

### Files to Modify (31 files total - 11 specific + 20 documentation)

All occurrences of `/l/` product URLs must be changed to `/product/`:

**Core Application Files (5 files):**

- `src/main.tsx` - Route definitions
- `src/pages/product.tsx` - Canonical URLs
- `src/components/products/product-card-ecommerce.tsx` - Product links
- `scripts/utils/generate-static-pages.ts` - Static page generation (4 locations)
- `scripts/utils/generate-sitemap.ts` - Sitemap URLs

**Build & CLI Scripts (2 files):**

- `scripts/utils/generate-llms-txt.ts` - Site structure documentation (2 locations)
- `scripts/update-products.ts` - Default URL suggestions

**Documentation & Configuration (4 files):**

- `.claude/skills/manage-products.md` - Example URLs
- `.claude/skills/manage-promotion.md` - Example URLs (3 locations)
- `README.md` - Example URLs
- `package.json` - Add Wrangler, update build script

**Product Documentation (20 files, ~67 occurrences - bulk update):**

- `documentation/Rules.md` - URL structure explanations (5 occurrences)
- `documentation/product-sales-copy-*.md` - All 19 product sales copy files (~62 occurrences total)

**Bulk update strategy:** Use find-and-replace script (see section 12 below)

#### 1. `src/main.tsx` (Line 117)

**Change route definition:**

**Before:**

```typescript
<Route
    path='/l/:productSlug'
    element={
        <Suspense fallback={<RouteLoadingFallback />}>
            <ProductPage />
        </Suspense>
    }
/>
```

**After:**

```typescript
<Route
    path='/product/:productSlug'
    element={
        <Suspense fallback={<RouteLoadingFallback />}>
            <ProductPage />
        </Suspense>
    }
/>
```

**Also remove redirect routes integration (lines 10-11, 164-171):**

**Before:**

```typescript
import RedirectPage from './components/redirect/redirect-page'
import { getRedirects } from './lib/redirects'

// ... inside Routes
{/* Redirect routes */}
{getRedirects().map((redirect) => (
    <Route
        key={redirect.from}
        path={redirect.from}
        element={<RedirectPage />}
    />
))}
```

**After:**

```typescript
// Remove the imports entirely
// Remove the redirect route mapping entirely
```

**Reason:** Cloudflare handles redirects at edge, React Router no longer needs to know about them.

#### 2. `src/pages/product.tsx` (Line 52)

**Update canonical URL:**

**Before:**

```typescript
const url = `https://store.dsebastien.net/l/${product.id}`
```

**After:**

```typescript
const url = `https://store.dsebastien.net/product/${product.id}`
```

#### 3. `src/components/products/product-card-ecommerce.tsx` (Line 74)

**Update product link:**

**Before:**

```typescript
<Link to={`/l/${product.id}`} className='block h-full w-full'>
```

**After:**

```typescript
<Link to={`/product/${product.id}`} className='block h-full w-full'>
```

#### 4. `scripts/utils/generate-static-pages.ts` (Lines 122, 784, 904)

**Update product URLs in three locations:**

**Location 1 - Line 122 (generateProductSchema function):**

**Before:**

```typescript
const productUrl = `${BASE_URL}/l/${product.id}`
```

**After:**

```typescript
const productUrl = `${BASE_URL}/product/${product.id}`
```

**Location 2 - Line 784 (generateProductPageHtml function):**

**Before:**

```typescript
const productUrl = `${BASE_URL}/l/${product.id}`
```

**After:**

```typescript
const productUrl = `${BASE_URL}/product/${product.id}`
```

**Location 3 - Line 904 (directory creation):**

**Before:**

```typescript
const productDir = join(distDir, 'l', product.id)
```

**After:**

```typescript
const productDir = join(distDir, 'product', product.id)
```

**Also update line 551 (noscript link):**

**Before:**

```typescript
;`                <li><a href="/l/${p.id}">${escapeHtml(p.name)}</a> (${escapeHtml(p.priceDisplay)}) - ${escapeHtml(p.tagline)}</li>`
```

**After:**

```typescript
;`                <li><a href="/product/${p.id}">${escapeHtml(p.name)}</a> (${escapeHtml(p.priceDisplay)}) - ${escapeHtml(p.tagline)}</li>`
```

#### 5. `scripts/utils/generate-sitemap.ts` (Line 148)

**Update sitemap product URLs:**

**Before:**

```typescript
urls.push({
    loc: `${BASE_URL}/l/${product.id}`,
    lastmod: today,
    changefreq: 'monthly',
    priority: '0.8'
})
```

**After:**

```typescript
urls.push({
    loc: `${BASE_URL}/product/${product.id}`,
    lastmod: today,
    changefreq: 'monthly',
    priority: '0.8'
})
```

#### 6. `package.json`

**Add Wrangler to devDependencies and update build script:**

**Changes:**

1. **Add dependency:**

```json
"devDependencies": {
  ...existing dependencies...
  "wrangler": "^3.88.0"
}
```

2. **Update build script (remove generate-redirect-pages.ts):**

**Before:**

```json
"build": "bun run aggregate:products && tsc && bun scripts/utils/build.ts && bun scripts/utils/generate-static-pages.ts && bun scripts/utils/generate-redirect-pages.ts && bun scripts/utils/generate-sitemap.ts && bun scripts/utils/generate-llms-txt.ts"
```

**After:**

```json
"build": "bun run aggregate:products && tsc && bun scripts/utils/build.ts && bun scripts/utils/generate-static-pages.ts && bun scripts/utils/generate-sitemap.ts && bun scripts/utils/generate-llms-txt.ts"
```

3. **Add Wrangler deployment scripts:**

```json
"scripts": {
  ...existing scripts...
  "deploy:cloudflare": "wrangler pages deploy dist --project-name=store-website",
  "preview:cloudflare": "wrangler pages dev dist"
}
```

**Reason:**

- Remove `generate-redirect-pages.ts` step - no longer needed with Cloudflare
- Add Wrangler for local testing and manual deployment

#### 7. `scripts/utils/generate-llms-txt.ts` (Lines 80, 120)

**Update product URLs in site structure documentation and product listings:**

**Location 1 - Line 80 (Content Structure section):**

**Before:**

```typescript
- /l/{id} - Individual product pages
```

**After:**

```typescript
- /product/{id} - Individual product pages
```

**Location 2 - Line 120 (Product Overview URLs):**

**Before:**

```typescript
  URL: https://store.dsebastien.net/l/${product.id}`
```

**After:**

```typescript
  URL: https://store.dsebastien.net/product/${product.id}`
```

#### 8. `scripts/update-products.ts` (Line 1554)

**Update default Gumroad URL suggestion in interactive product creation:**

**Before:**

```typescript
const gumroadUrl =
    args.gumroadUrl ||
    (await prompt(`${colors.bright}Gumroad URL${colors.reset} (required): `)) ||
    `https://store.dsebastien.net/l/${permalink}`
```

**After:**

```typescript
const gumroadUrl =
    args.gumroadUrl ||
    (await prompt(`${colors.bright}Gumroad URL${colors.reset} (required): `)) ||
    `https://store.dsebastien.net/product/${permalink}`
```

**Note:** This is a default/placeholder value shown in the CLI tool. Users typically provide their actual Gumroad URL.

#### 9. `.claude/skills/manage-products.md` (Line 68)

**Update example URL in skill documentation:**

**Before:**

```bash
--gumroadUrl "https://store.dsebastien.net/l/abc123" \
```

**After:**

```bash
--gumroadUrl "https://store.dsebastien.net/product/abc123" \
```

#### 10. `.claude/skills/manage-promotion.md` (Lines 65, 108, 227)

**Update example URLs in skill documentation:**

**Location 1 - Line 65 (Example JSON):**

**Before:**

```json
"promoLink": "https://store.dsebastien.net/l/knowledge-worker-kit"
```

**After:**

```json
"promoLink": "https://store.dsebastien.net/product/knowledge-worker-kit"
```

**Location 2 - Line 108 (CLI Example):**

**Before:**

```bash
bun run update:promotion -- --behavior ALWAYS --text "🚀 New product launched!" --link "https://store.dsebastien.net/l/product" --linkText "Check it out"
```

**After:**

```bash
bun run update:promotion -- --behavior ALWAYS --text "🚀 New product launched!" --link "https://store.dsebastien.net/product/product" --linkText "Check it out"
```

**Location 3 - Line 227 (CLI Example):**

**Before:**

```bash
bun run update:promotion -- --behavior ALWAYS --text "🚀 New product launched!" --link "https://store.dsebastien.net/l/product" --linkText "Learn more"
```

**After:**

```bash
bun run update:promotion -- --behavior ALWAYS --text "🚀 New product launched!" --link "https://store.dsebastien.net/product/product" --linkText "Learn more"
```

#### 11. `README.md` (Line 81)

**Update example URL in README documentation:**

**Before:**

```bash
--gumroadUrl "https://store.dsebastien.net/l/abc123" \
```

**After:**

```bash
--gumroadUrl "https://store.dsebastien.net/product/abc123" \
```

#### 12. Documentation Files (20 files, ~67 occurrences)

**Bulk update all product sales copy and reference documentation:**

All documentation files in `documentation/` directory contain product URLs that need updating. These are primarily in product sales copy files and Rules.md.

**Files to update:**

- `documentation/Rules.md` (5 occurrences)
- `documentation/product-sales-copy-*.md` (19 files, ~62 occurrences total)

**Search and replace strategy:**

Use a global find-and-replace across all documentation files:

```bash
# Find all occurrences (verification)
grep -rn "store\.dsebastien\.net/l/" documentation/ --include="*.md"

# Replace all occurrences (dry run first)
find documentation/ -name "*.md" -type f -exec sed -i.bak 's|store\.dsebastien\.net/l/|store.dsebastien.net/product/|g' {} \;

# Verify changes
grep -rn "store\.dsebastien\.net/product/" documentation/ --include="*.md" | wc -l

# Remove backup files after verification
find documentation/ -name "*.md.bak" -type f -delete
```

**Manual verification required for:**

- `documentation/Rules.md` - Contains conceptual explanations about URL structure
- `documentation/plans/migration-to-cloudflare-pages*.md` - Migration plan docs (should contain BOTH old and new URLs for reference)

**Example changes:**

**Before:**

```markdown
- **Purchase**: https://store.dsebastien.net/l/knowii-voice-ai
- **Gumroad URL**: https://store.dsebastien.net/l/knowledge-worker-kit
- URL: `https://store.dsebastien.net/l/mghmmj`
```

**After:**

```markdown
- **Purchase**: https://store.dsebastien.net/product/knowii-voice-ai
- **Gumroad URL**: https://store.dsebastien.net/product/knowledge-worker-kit
- URL: `https://store.dsebastien.net/product/mghmmj`
```

**Note:** The migration plan documents (`migration-to-cloudflare-pages*.md`) should keep BOTH old and new URLs for reference during migration. Exclude these from bulk replacement:

```bash
# Exclude migration plans from replacement
find documentation/ -name "*.md" -type f ! -name "*migration*" -exec sed -i 's|store\.dsebastien\.net/l/|store.dsebastien.net/product/|g' {} \;
```

#### 13. Optional: Delete or Archive

These files/components are no longer needed but can be kept for potential rollback:

- `scripts/utils/generate-redirect-pages.ts` - No longer executed
- `src/components/redirect/redirect-page.tsx` - No longer used
- `src/lib/redirects.ts` - No longer used
- `src/lib/redirects.spec.ts` - Tests for removed code
- `src/data/redirects.json` - No longer used

**Recommendation:** Keep files initially for easy rollback. Delete after successful migration.

---

## Part 4: GitHub Actions Configuration

### 9. Create/Replace: `.github/workflows/deploy.yml`

**Purpose:** Automated deployment to Cloudflare Pages using Wrangler after release

**Location:** `.github/workflows/deploy.yml`

**Content:**

```yaml
name: Deploy to Cloudflare Pages

on:
    push:
        tags:
            - '**'

    # Allows manual deployment from Actions tab
    workflow_dispatch:

# Concurrency group to prevent simultaneous deployments
concurrency:
    group: 'cloudflare-pages'
    cancel-in-progress: false

jobs:
    build-and-deploy:
        name: Build and Deploy to Cloudflare Pages
        runs-on: ubuntu-latest

        permissions:
            contents: read
            deployments: write

        steps:
            - name: Checkout repository
              uses: actions/checkout@v4
              with:
                  fetch-depth: 0

            - name: Setup Bun
              uses: oven-sh/setup-bun@v2
              with:
                  bun-version: latest

            - name: Install dependencies
              run: bun install --frozen-lockfile

            - name: Run tests
              run: bun test

            - name: Run linter
              run: bun run lint

            - name: Type check
              run: bun run tsc

            - name: Build application
              run: bun run build

            - name: Verify build output
              run: |
                  echo "✅ Build completed successfully"
                  echo "📁 Checking dist/ directory contents..."
                  ls -la dist/

                  echo "📄 Checking for critical files..."
                  test -f dist/index.html && echo "✅ index.html exists" || (echo "❌ index.html missing" && exit 1)
                  test -f dist/_redirects && echo "✅ _redirects exists" || echo "⚠️  _redirects missing (optional)"
                  test -f dist/_headers && echo "✅ _headers exists" || echo "⚠️  _headers missing (optional)"

                  echo "📊 Build size:"
                  du -sh dist/

            - name: Deploy to Cloudflare Pages
              uses: cloudflare/wrangler-action@v3
              with:
                  apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
                  accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
                  command: pages deploy dist --project-name=store-website --commit-dirty=true

            - name: Deployment Summary
              run: |
                  echo "### 🚀 Deployment Complete!" >> $GITHUB_STEP_SUMMARY
                  echo "" >> $GITHUB_STEP_SUMMARY
                  echo "**Project:** store-website" >> $GITHUB_STEP_SUMMARY
                  echo "**Environment:** Production" >> $GITHUB_STEP_SUMMARY
                  echo "**URL:** https://store.dsebastien.net" >> $GITHUB_STEP_SUMMARY
                  echo "" >> $GITHUB_STEP_SUMMARY
                  echo "✅ Site deployed successfully to Cloudflare Pages" >> $GITHUB_STEP_SUMMARY
```

**Required Secrets:**

You must add these secrets to your GitHub repository settings:

1. **`CLOUDFLARE_API_TOKEN`**
    - Go to Cloudflare Dashboard → My Profile → API Tokens
    - Create token with "Cloudflare Pages - Edit" permissions
    - Copy token and add to GitHub Secrets

2. **`CLOUDFLARE_ACCOUNT_ID`**
    - Go to Cloudflare Dashboard → Account Home
    - Copy Account ID from the right sidebar
    - Add to GitHub Secrets

**How to add secrets:**

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

---

## Part 5: Deployment Steps

### Step 1: Cloudflare Pages Setup

#### Option A: Via Dashboard (First Time Setup)

1. **Sign in to Cloudflare Dashboard**
    - Go to Cloudflare Dashboard → Pages
    - Click "Create a project"

2. **Connect GitHub Repository**
    - Select your GitHub account
    - Choose repository: `DeveloPassion/store-website`
    - Grant necessary permissions

3. **Configure Build Settings**
    - **Framework preset:** None (custom build)
    - **Build command:** `bun run build`
    - **Build output directory:** `dist`
    - **Root directory:** `/` (leave default)
    - **Environment variables:**
        - `NODE_VERSION`: `20` (or later)

4. **Create Project**
    - Click "Save and Deploy"
    - Note the project name for wrangler.toml

#### Option B: Via Wrangler CLI (After wrangler.toml is configured)

```bash
# Install Wrangler globally (optional)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create Pages project
wrangler pages project create store-website

# Deploy manually (first time)
bun run build
wrangler pages deploy dist --project-name=store-website
```

### Step 2: GitHub Secrets Configuration

(See Part 4 above for complete instructions)

### Step 3: Domain Configuration

1. **Add Custom Domain**
    - In Cloudflare Pages project settings → Custom domains
    - Add domain: `store.dsebastien.net`
    - Cloudflare will provide DNS instructions

2. **Update DNS Records**
    - Go to Cloudflare DNS settings for `dsebastien.net`
    - Update CNAME record:
        - **Name:** `store`
        - **Target:** `[your-cloudflare-pages-project].pages.dev`
    - Cloudflare handles SSL automatically (Let's Encrypt)

3. **Wait for Propagation**
    - DNS propagation: 5-60 minutes typically
    - SSL provisioning: 1-5 minutes after DNS resolves

### Step 4: First Deployment

**Manual deployment to test everything:**

```bash
# Ensure all changes are committed
git add .
git commit -m "feat: migrate to Cloudflare Pages with /product/ URL structure"

# Install dependencies
bun install

# Run full CI locally
bun run ci:local

# Build the application
bun run build

# Verify _redirects file was copied
ls -la dist/_redirects

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=store-website
```

**Automated deployment via GitHub Actions:**

```bash
# Create and push a release tag
git tag v0.6.0
git push origin v0.6.0

# GitHub Actions will automatically:
# 1. Run CI checks
# 2. Build the application
# 3. Deploy to Cloudflare Pages
# 4. Report status in Actions tab
```

### Step 5: Verification

1. **Test all critical URLs:**

    ```bash
    # Homepage
    curl -I https://store.dsebastien.net/

    # New product page URL
    curl -I https://store.dsebastien.net/product/knowii-voice-ai

    # Old product page URL (should redirect 301)
    curl -I https://store.dsebastien.net/l/knowii-voice-ai

    # Category page
    curl -I https://store.dsebastien.net/categories/courses

    # Tag page
    curl -I https://store.dsebastien.net/tags/ai

    # Redirect (should be 301)
    curl -I https://store.dsebastien.net/affiliates
    ```

2. **Verify redirects work:**
    - Visit: https://store.dsebastien.net/l/knowii-voice-ai
    - Should immediately redirect to `/product/knowii-voice-ai` (301 status)
    - Check Chrome DevTools Network tab to confirm 301

3. **Test OG metadata:**
    - Use Facebook Debugger: https://developers.facebook.com/tools/debug/
    - Test both new URLs (`/product/...`) and old URLs (`/l/...`)
    - Verify cover images appear correctly
    - Use Twitter Card Validator: https://cards-dev.twitter.com/validator

4. **Test SPA routing:**
    - Navigate between pages (should work smoothly)
    - Hard refresh on product page (should load correctly, not 404)
    - Use browser back/forward buttons

5. **Check GitHub Actions:**
    - Go to: https://github.com/DeveloPassion/store-website/actions
    - Verify deployment workflow completed successfully
    - Check deployment summary in workflow run

### Step 6: Performance Verification

**Compare before/after performance:**

1. **Lighthouse Audit:**

    ```bash
    # Run on both old (GitHub Pages) and new (Cloudflare) URLs
    lighthouse https://store.dsebastien.net --view
    ```

2. **WebPageTest:**
    - Test URL: https://www.webpagetest.org/
    - Compare TTFB, FCP, LCP metrics

3. **Redirect Speed Test:**
    ```bash
    # Measure redirect latency
    time curl -I https://store.dsebastien.net/l/knowii-voice-ai
    ```

**Expected improvements:**

- TTFB: 40-60% faster
- Redirect latency: 10-100x faster (server vs client)
- Global CDN: Lower latency worldwide
- Build time: Similar or faster

---

## Part 6: URL Preservation Validation

**All existing URLs remain valid through redirects:**

✅ Homepage: `/`
✅ Products: `/products`
✅ Product detail (NEW): `/product/{productId}` (21 products)
✅ Product detail (OLD → REDIRECT): `/l/{productId}` → `/product/{productId}` (21 products)
✅ Product detail (OLD → REDIRECT): `/l/{permalink}` → `/product/{productId}` (21 products)
✅ Categories: `/categories` and `/categories/{categoryId}` (23 categories)
✅ Tags: `/tags` and `/tags/{tagId}` (96 tags)
✅ Collections: `/best-value`, `/best-sellers`, `/featured`
✅ Other: `/help`, `/faq`, `/wishlist`, `/shared-wishlist`, `/testimonials`
✅ Redirects: `/affiliates` → Gumroad (still works, just faster)

**Zero URL breakage. Full backwards compatibility.**

---

## Part 7: Rollback Plan

If issues arise, rollback is straightforward:

### Option 1: Revert DNS Only (Quickest)

1. **Revert DNS:**
    - Change CNAME back to GitHub Pages
    - `store.dsebastien.net` → `developassion.github.io`
    - Takes effect in 5-60 minutes

2. **GitHub Pages continues working** (if you kept the deploy workflow)

### Option 2: Full Code Revert

1. **Revert Code:**

    ```bash
    git revert HEAD~N  # Revert last N commits
    git push
    ```

2. **Re-deploy to GitHub Pages:**
    - Push a new tag to trigger GitHub Pages workflow
    - Or manually trigger workflow from Actions tab

### Option 3: Dual Deployment (Safest During Transition)

**Keep both workflows active during testing:**

1. Keep both `.github/workflows/deploy.yml` (GitHub Pages) and new Cloudflare workflow
2. Rename Cloudflare workflow to `deploy-cloudflare.yml`
3. Test Cloudflare deployment thoroughly
4. Switch DNS to Cloudflare
5. After 1-2 weeks of stability, remove GitHub Pages workflow

---

## Part 8: Post-Migration Cleanup

**After 1-2 weeks of stable operation:**

### 1. Delete Unused Files

```bash
# Remove GitHub Pages specific files
rm scripts/utils/generate-redirect-pages.ts
rm -rf src/components/redirect/
rm src/lib/redirects.ts
rm src/lib/redirects.spec.ts
rm src/data/redirects.json

# Optional: Remove GitHub Pages workflow if not needed
rm .github/workflows/deploy.yml  # Only if using Cloudflare exclusively
```

### 2. Update Documentation

- Update `AGENTS.md` deployment section with new URL structure
- Update `README.md` with Cloudflare deployment instructions
- Document Wrangler CLI usage for team
- Update any internal documentation referencing `/l/` URLs

### 3. Update Validation Scripts

- `scripts/validate-redirects.ts` can remain (validates `_redirects` format)
- Consider updating to validate Cloudflare-specific redirect syntax

---

## Part 9: Testing Checklist

**Before marking migration complete:**

### Code Changes

- [ ] `public/_redirects` file created with all 42 product redirects
- [ ] `public/_headers` file created (optional)
- [ ] `wrangler.toml` file created and configured
- [ ] `package.json` updated (wrangler dependency + build script)
- [ ] `src/main.tsx` route changed from `/l/:productSlug` to `/product/:productSlug`
- [ ] `src/main.tsx` redirect routes removed
- [ ] `src/pages/product.tsx` URL updated to `/product/`
- [ ] `src/components/products/product-card-ecommerce.tsx` link updated to `/product/`
- [ ] `scripts/utils/generate-static-pages.ts` all URLs updated to `/product/`
- [ ] `scripts/utils/generate-sitemap.ts` URLs updated to `/product/`
- [ ] `scripts/utils/generate-llms-txt.ts` URLs updated (lines 80, 120)
- [ ] `scripts/update-products.ts` default URL updated (line 1554)
- [ ] `.claude/skills/manage-products.md` example URL updated (line 68)
- [ ] `.claude/skills/manage-promotion.md` example URLs updated (lines 65, 108, 227)
- [ ] `README.md` example URL updated (line 81)
- [ ] All 20 documentation files updated using bulk replace script
- [ ] Migration plan docs excluded from bulk replacement (they need both old and new URLs)
- [ ] All changes committed to git

### GitHub Configuration

- [ ] `CLOUDFLARE_API_TOKEN` secret added to GitHub
- [ ] `CLOUDFLARE_ACCOUNT_ID` secret added to GitHub
- [ ] `.github/workflows/deploy.yml` updated for Cloudflare
- [ ] Optional: `.github/workflows/preview.yml` created

### Local Testing

- [ ] Build succeeds locally: `bun run build`
- [ ] All tests pass: `bun test`
- [ ] CI passes: `bun run ci:local`
- [ ] `_redirects` file exists in `dist/` after build
- [ ] `_headers` file exists in `dist/` after build (if added)
- [ ] `product/` directories exist in `dist/` (not `l/` directories)
- [ ] Wrangler CLI works: `wrangler pages dev dist`

### Cloudflare Setup

- [ ] Cloudflare Pages project created
- [ ] Custom domain `store.dsebastien.net` configured
- [ ] DNS CNAME record updated
- [ ] SSL certificate provisioned
- [ ] First manual deployment successful

### Production Verification

- [ ] All main routes load correctly (/, /products, /categories, /tags)
- [ ] New product pages load correctly (/product/{productId})
- [ ] Old `/l/{id}` URLs redirect to `/product/{id}` (301 status)
- [ ] Old `/l/{permalink}` URLs redirect to `/product/{id}` (301 status)
- [ ] `/affiliates` redirect works (301 status)
- [ ] OG metadata correct on product pages (cover images)
- [ ] Canonical URLs use `/product/` pattern
- [ ] SPA routing works (no 404s on hard refresh)
- [ ] GitHub Actions deployment successful
- [ ] Lighthouse score >= previous score
- [ ] WebPageTest TTFB improved

### Performance Validation

- [ ] TTFB improved by 40%+ (measured via WebPageTest)
- [ ] Redirect latency significantly faster
- [ ] No console errors in browser
- [ ] No broken images or assets

---

## Part 10: Success Criteria

Migration is successful when:

1. ✅ All new product URLs (`/product/{id}`) load correctly
2. ✅ All old URLs (`/l/{id}` and `/l/{permalink}`) redirect to new URLs (301 status)
3. ✅ Redirects work (301 status, instant)
4. ✅ OG metadata displays correctly in social shares
5. ✅ Canonical URLs use new `/product/` structure
6. ✅ Sitemap contains new `/product/` URLs
7. ✅ Static pages generated at `/product/` path
8. ✅ Lighthouse performance score improves or stays same
9. ✅ TTFB improves by 40%+ (measured via WebPageTest)
10. ✅ No 404 errors on hard refresh
11. ✅ SPA navigation works smoothly
12. ✅ GitHub Actions deployment works automatically on release
13. ✅ Build completes successfully on Cloudflare
14. ✅ SSL certificate provisioned automatically
15. ✅ No console errors in browser
16. ✅ Wrangler CLI commands work for manual deployment
17. ✅ Preview deployments work for PRs (if configured)

---

## Part 11: Timeline & Risk Assessment

**Estimated Time:**

- Generate Cloudflare redirects script: 10 minutes
- Code changes (7 files): 30-40 minutes
- Cloudflare config files: 15-20 minutes
- Cloudflare setup: 15-20 minutes
- GitHub Actions configuration: 10-15 minutes
- DNS configuration: 5-10 minutes (+ propagation wait)
- Testing & verification: 45-60 minutes
- **Total: 2-3 hours for complete implementation and testing**

**Risk Level: LOW**

**Risk Mitigation:**

- Easy rollback via DNS change (5 minutes)
- All old URLs continue working via 301 redirects
- Can maintain dual deployment during transition
- Comprehensive testing checklist
- Existing GitHub Pages deployment remains functional during testing

**Potential Issues & Solutions:**

| Issue                           | Solution                                          |
| ------------------------------- | ------------------------------------------------- |
| Wrangler authentication fails   | Use `wrangler login` or verify API token          |
| Build fails on Cloudflare       | Check environment variables and build logs        |
| DNS propagation slow            | Wait 1-2 hours, test with `dig` command           |
| 404 errors on refresh           | Verify `_redirects` file has `/* /index.html 200` |
| Redirects not working           | Check `_redirects` syntax and Cloudflare logs     |
| GitHub Actions deployment fails | Verify secrets are set correctly                  |
| Wrong redirect URLs             | Verify permalink extraction script output         |

---

## Part 12: Additional Resources

**Cloudflare Pages Documentation:**

- https://developers.cloudflare.com/pages/
- https://developers.cloudflare.com/pages/configuration/redirects/
- https://developers.cloudflare.com/pages/configuration/headers/

**Wrangler Documentation:**

- https://developers.cloudflare.com/workers/wrangler/
- https://developers.cloudflare.com/pages/wrangler-guide/

**GitHub Actions - Cloudflare:**

- https://github.com/cloudflare/wrangler-action

**Testing Tools:**

- Lighthouse: https://developers.google.com/web/tools/lighthouse
- WebPageTest: https://www.webpagetest.org/
- Facebook Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator

---

**Migration Author:** Claude Code
**Plan Version:** 2.0 (Adapted with URL Restructuring)
**Last Updated:** 2026-01-12
**Status:** Ready for Implementation
