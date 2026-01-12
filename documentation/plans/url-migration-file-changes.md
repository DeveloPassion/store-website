# URL Migration File Changes - Quick Reference

This document provides a quick reference for all files that need to be modified during the URL migration from `/l/:id` to `/product/:id`.

## Summary

- **Total files to modify:** 31 files (11 specific + 20 documentation)
- **Files to create:** 4 files (Cloudflare config + helper script)
- **Files to delete (optional):** 5 files (after migration success)
- **URL pattern change:** `/l/{id}` → `/product/{id}`
- **Redirects needed:** 42 total (21 products × 2 URL patterns each)
- **Backwards compatibility:** ONLY via Cloudflare redirects (no code compatibility layers)

---

## Files to Create

### 1. `public/_redirects`

**Purpose:** Cloudflare redirect rules for backwards compatibility

**Content:** 42 redirect rules for all product URLs:

- 21 redirects: `/l/{id}` → `/product/{id}` (Primary IDs)
- 21 redirects: `/l/{permalink}` → `/product/{id}` (Gumroad Permalinks)
- 1 redirect: `/affiliates` → Gumroad
- SPA fallback: `/* /index.html 200`

**Action:** Create file with redirect rules (see migration plan Part 2.1)

---

### 2. `public/_headers`

**Purpose:** Cloudflare caching and security headers (optional but recommended)

**Action:** Create file with caching rules (see migration plan Part 2.2)

---

### 3. `wrangler.toml`

**Purpose:** Wrangler CLI configuration for Cloudflare Pages deployment

**Location:** Project root

**Action:** Create file with Cloudflare configuration (see migration plan Part 2.3)

---

### 4. `scripts/generate-cloudflare-redirects.ts` (Helper Script)

**Purpose:** Generate complete redirect list from products.json

**Action:** Create script to automate redirect generation (see migration plan Part 2.1)

**Usage:** `bun scripts/generate-cloudflare-redirects.ts` to output redirects

---

## Files to Modify

### 1. `src/main.tsx`

**Lines to change:** 117, 10-11, 164-171

**Changes:**

- Line 117: Change route from `/l/:productSlug` to `/product/:productSlug`
- Lines 10-11: Remove imports for `RedirectPage` and `getRedirects`
- Lines 164-171: Remove redirect route mapping (React Router no longer handles redirects)

**Search pattern:** `/l/`, `RedirectPage`, `getRedirects`

---

### 2. `src/pages/product.tsx`

**Lines to change:** 52

**Changes:**

- Line 52: Change URL from `/l/${product.id}` to `/product/${product.id}`

**Search pattern:** `/l/`

---

### 3. `src/components/products/product-card-ecommerce.tsx`

**Lines to change:** 74

**Changes:**

- Line 74: Change Link `to` prop from `/l/${product.id}` to `/product/${product.id}`

**Search pattern:** `/l/`

---

### 4. `scripts/utils/generate-static-pages.ts`

**Lines to change:** 122, 551, 784, 904

**Changes:**

- Line 122: Change `const productUrl = \`${BASE_URL}/l/${product.id}\``to`/product/`
- Line 551: Change noscript link from `/l/${p.id}` to `/product/${p.id}`
- Line 784: Change `const productUrl = \`${BASE_URL}/l/${product.id}\``to`/product/`
- Line 904: Change `const productDir = join(distDir, 'l', product.id)` to `'product'`

**Search pattern:** `/l/`, `'l'`

---

### 5. `scripts/utils/generate-sitemap.ts`

**Lines to change:** 148

**Changes:**

- Line 148: Change sitemap URL from `/l/${product.id}` to `/product/${product.id}`

**Search pattern:** `/l/`

---

### 6. `package.json`

**Lines to change:** devDependencies, scripts.build

**Changes:**

- Add `wrangler` to devDependencies: `"wrangler": "^3.88.0"`
- Update build script: Remove `generate-redirect-pages.ts` step
- Add scripts: `deploy:cloudflare` and `preview:cloudflare`

**Search pattern:** `generate-redirect-pages`, `build`

---

### 7. `scripts/utils/generate-llms-txt.ts`

**Lines to change:** 80, 120

**Changes:**

- Line 80: Change `- /l/{id} - Individual product pages` to `/product/{id}`
- Line 120: Change `URL: https://store.dsebastien.net/l/${product.id}` to `/product/`

**Search pattern:** `/l/`

---

### 8. `scripts/update-products.ts`

**Lines to change:** 1554

**Changes:**

- Line 1554: Change default Gumroad URL from `/l/${permalink}` to `/product/${permalink}`

**Search pattern:** `store.dsebastien.net/l/`

---

### 9. `.claude/skills/manage-products.md`

**Lines to change:** 68

**Changes:**

- Line 68: Change example URL from `/l/abc123` to `/product/abc123`

**Search pattern:** `/l/`

---

### 10. `.claude/skills/manage-promotion.md`

**Lines to change:** 65, 108, 227

**Changes:**

- Line 65: Change example JSON promoLink from `/l/knowledge-worker-kit` to `/product/knowledge-worker-kit`
- Line 108: Change example CLI command URL from `/l/product` to `/product/product`
- Line 227: Change example CLI command URL from `/l/product` to `/product/product`

**Search pattern:** `/l/`

---

### 11. `README.md`

**Lines to change:** 81

**Changes:**

- Line 81: Change example URL from `/l/abc123` to `/product/abc123`

**Search pattern:** `/l/`

---

### 12. Documentation Files (Bulk Update)

**Files affected:** 20 files in `documentation/` directory

**Files to update:**

- `documentation/Rules.md` (5 occurrences)
- `documentation/product-sales-copy-*.md` (19 files, ~62 occurrences)

**Bulk update command:**

```bash
# Find all occurrences
grep -rn "store\.dsebastien\.net/l/" documentation/ --include="*.md"

# Replace (excluding migration plans)
find documentation/ -name "*.md" -type f ! -name "*migration*" -exec sed -i 's|store\.dsebastien\.net/l/|store.dsebastien.net/product/|g' {} \;

# Verify
grep -rn "store\.dsebastien\.net/product/" documentation/ --include="*.md" | wc -l
```

**Note:** Migration plan documents are excluded to preserve reference to both old and new URLs.

---

## Files to Delete (Optional - After Migration Success)

These files are no longer needed after Cloudflare migration:

1. **`scripts/utils/generate-redirect-pages.ts`**
    - Purpose: Generated static HTML redirect pages for GitHub Pages
    - Status: No longer executed, can be deleted

2. **`src/components/redirect/redirect-page.tsx`**
    - Purpose: React component for client-side redirects
    - Status: No longer used, can be deleted

3. **`src/lib/redirects.ts`**
    - Purpose: Redirect data management utilities
    - Status: No longer used, can be deleted

4. **`src/lib/redirects.spec.ts`**
    - Purpose: Tests for redirect utilities
    - Status: Tests for removed code, can be deleted

5. **`src/data/redirects.json`**
    - Purpose: Redirect configuration for GitHub Pages
    - Status: Replaced by Cloudflare `_redirects` file, can be deleted

**Recommendation:** Keep these files for 1-2 weeks after migration for easy rollback. Delete after confirming stability.

---

## GitHub Actions Changes

### 1. `.github/workflows/deploy.yml`

**Action:** Replace or update with Cloudflare Pages deployment workflow

**Changes:**

- Update deployment target from GitHub Pages to Cloudflare Pages
- Add Cloudflare Wrangler action
- Configure secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

**See:** Migration plan Part 4

---

### 2. `.github/workflows/preview.yml` (Optional)

**Action:** Create new workflow for PR preview deployments

**See:** Original migration plan Part 2.11

---

## Quick Search Commands

Use these commands to find all occurrences:

```bash
# Find all /l/ references in code
grep -rn "/l/" src/ scripts/ --include="*.ts" --include="*.tsx"

# Find all product URL constructions
grep -rn "product.id" src/ scripts/ --include="*.ts" --include="*.tsx"

# Find all static imports of redirect-related code
grep -rn "redirect" src/ --include="*.ts" --include="*.tsx"

# Verify no /l/ references remain after changes
grep -rn "/l/" src/ scripts/ public/ --include="*.ts" --include="*.tsx" --include="*.json"
```

---

## Verification Checklist

After making all changes, verify:

### Code Changes

- [ ] All 5 core application files modified with new `/product/` URLs
- [ ] All 2 build & CLI scripts modified with new `/product/` URLs
- [ ] All 4 documentation & configuration files modified with new `/product/` URLs
- [ ] All 20 product documentation files updated using bulk replace script
- [ ] All 4 new Cloudflare config files created (+ helper script)
- [ ] `_redirects` file contains all 42 product redirects (21 IDs + 21 permalinks)
- [ ] Build script no longer calls `generate-redirect-pages.ts`

### Build Verification

- [ ] `bun run build` succeeds without errors
- [ ] `dist/product/` directories exist (21 products)
- [ ] No `dist/l/` directories exist (only `dist/product/`)
- [ ] `dist/_redirects` file exists after build
- [ ] `dist/_headers` file exists after build (if created)

### Code Cleanup

- [ ] No remaining `/l/` references in source code (use grep verification below)
- [ ] Migration plan docs still contain both old and new URLs for reference
- [ ] All backup files from bulk replacement removed (\*.md.bak)

---

## Build Output Structure

**Before Migration:**

```
dist/
├── index.html
├── 404.html
├── l/
│   ├── obsidian-starter-kit/
│   │   └── index.html
│   ├── knowii-voice-ai/
│   │   └── index.html
│   └── ... (19 more products)
├── categories/
├── tags/
└── assets/
```

**After Migration:**

```
dist/
├── index.html
├── 404.html (still needed for Cloudflare SPA fallback)
├── product/
│   ├── obsidian-starter-kit/
│   │   └── index.html
│   ├── knowii-voice-ai/
│   │   └── index.html
│   └── ... (19 more products)
├── categories/
├── tags/
├── _redirects (NEW - Cloudflare redirects)
├── _headers (NEW - Cloudflare headers)
└── assets/
```

**Note:** No more `l/` directory in dist - all product pages in `product/` directory.

---

## Testing After Changes

1. **Local Build Test:**

    ```bash
    bun run build
    ls -la dist/product/  # Should list all 21 products
    ls -la dist/l/        # Should NOT exist
    cat dist/_redirects   # Should contain all 42 redirects
    ```

2. **Local Preview Test:**

    ```bash
    wrangler pages dev dist
    # Visit http://localhost:8788/product/knowii-voice-ai (should work)
    # Visit http://localhost:8788/l/knowii-voice-ai (should redirect)
    ```

3. **Production Deployment Test:**
    ```bash
    wrangler pages deploy dist --project-name=store-website
    # Test URLs on Cloudflare deployment
    ```

---

**Document Version:** 1.0
**Last Updated:** 2026-01-12
**Related:** migration-to-cloudflare-pages-adapted.md
