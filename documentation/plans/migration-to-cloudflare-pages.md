# Migration Plan: GitHub Pages → Cloudflare Pages

## Overview

Migrate the store website from GitHub Pages to Cloudflare Pages for superior performance while maintaining all existing URLs. This plan removes GitHub Pages workarounds, implements native Cloudflare features, and configures automated deployment via Wrangler CLI and GitHub Actions.

## Critical Constraint

**ALL EXISTING URLs MUST REMAIN VALID** - No URL changes allowed.

## Key Changes Summary

1. **Remove client-side redirect workarounds** → Use Cloudflare `_redirects` file
2. **Remove 404.html workaround** → Use Cloudflare SPA fallback
3. **Add Cloudflare configuration files** → `_redirects`, `_headers`, `wrangler.toml`
4. **Update build scripts** → Remove generate-redirect-pages step
5. **Remove redirect React Router integration** → No longer needed
6. **Fix meta tag URL bug** → Correct product page URL
7. **Configure Wrangler** → Add wrangler.toml for Cloudflare Pages deployment
8. **Update GitHub Actions** → Replace GitHub Pages workflow with Cloudflare Pages deployment

---

## Part 1: Code Changes

### 1. Create: `public/_redirects`

**Purpose:** Native Cloudflare redirects (server-side, instant)

**Content:**

```
# Permanent redirects
/affiliates https://developassion.gumroad.com/affiliates 301

# SPA fallback - catch all non-file requests and serve index.html
/*  /index.html  200
```

**Notes:**

- First line handles the existing `/affiliates` redirect as 301
- Last line enables SPA routing (all non-matching routes serve index.html with 200 status)
- Cloudflare processes these at edge (faster than client-side)

### 2. Create: `public/_headers` (Optional but Recommended)

**Purpose:** Optimize caching and add security headers

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

**Location:** Project root (`/home/dsebastien/wks/store-website/wrangler.toml`)

**Content:**

```toml
name = "store-website"
compatibility_date = "2025-01-12"

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

**Notes:**

- `name`: Cloudflare Pages project name
- `compatibility_date`: Set to current date for latest features
- `pages_build_output_dir`: Points to `dist/` directory
- `build.command`: Executes the build script
- Routes configuration is optional (can be managed via Cloudflare dashboard)

### 4. Modify: `package.json`

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

### 5. Modify: `src/main.tsx`

**Remove redirect routes integration (lines 26, 27, 58-64):**

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

**Reason:** Cloudflare handles redirects at edge, React Router no longer needs to know about them

### 6. Fix: `src/pages/product.tsx` (Line 52)

**Bug fix (unrelated to migration but discovered during analysis):**

**Before:**

```typescript
const url = `https://store.dsebastien.net/products/${product.id}`
```

**After:**

```typescript
const url = `https://store.dsebastien.net/l/${product.id}`
```

**Reason:** Product URLs use `/l/` pattern, not `/products/`. This bug affects OG metadata URLs.

### 7. Optional: Delete or Archive

These files/components are no longer needed but can be kept for potential rollback:

- `scripts/utils/generate-redirect-pages.ts` - No longer executed
- `src/components/redirect/redirect-page.tsx` - No longer used
- `src/lib/redirects.ts` - No longer used
- `src/lib/redirects.spec.ts` - Tests for removed code

**Recommendation:** Keep files initially for easy rollback. Delete after successful migration.

### 8. Optional Enhancement: Standardize Meta Tag Updates

**Several pages use inconsistent patterns for updating meta tags:**

- ✅ `product.tsx`, `best-sellers.tsx` → Use `updateAllMetaTags()` (correct)
- ❌ `category.tsx`, others → Use manual `document.querySelector()` (outdated)

**Recommendation:** Refactor remaining pages to use `updateAllMetaTags()` utility for consistency. **Not critical for migration.**

Pages to refactor later:

- `src/pages/category.tsx` (lines 59-80)
- `src/pages/tag.tsx` (if it has similar pattern)
- `src/pages/featured.tsx`
- `src/pages/best-value.tsx`
- `src/pages/wishlist.tsx`
- `src/pages/tags.tsx`
- `src/pages/categories.tsx`
- `src/pages/faq.tsx`
- `src/pages/help.tsx`

---

## Part 2: GitHub Actions Configuration

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

**Key Features:**

- Runs on tag push (after release) or manual trigger
- Installs dependencies with Bun
- Runs full CI checks (tests, lint, type check) before deployment
- Builds the application
- Verifies build output integrity
- Deploys to Cloudflare Pages using Wrangler
- Uses GitHub Actions summary for deployment status

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

### 10. Keep: `.github/workflows/release.yml` (No Changes Needed)

**Current workflow remains unchanged** - it handles creating releases and tags, which is separate from deployment.

The deployment workflow (above) will automatically trigger after a tag is pushed by the release workflow.

### 11. Optional: `.github/workflows/preview.yml`

**Purpose:** Deploy preview deployments for pull requests

**Location:** `.github/workflows/preview.yml`

**Content:**

```yaml
name: Preview Deployment

on:
    pull_request:
        branches: [main]
        types: [opened, synchronize, reopened]

concurrency:
    group: 'cloudflare-preview-${{ github.ref }}'
    cancel-in-progress: true

jobs:
    preview:
        name: Deploy Preview
        runs-on: ubuntu-latest

        permissions:
            contents: read
            pull-requests: write
            deployments: write

        steps:
            - name: Checkout
              uses: actions/checkout@v4

            - name: Setup Bun
              uses: oven-sh/setup-bun@v2

            - name: Install dependencies
              run: bun install --frozen-lockfile

            - name: Build
              run: bun run build

            - name: Deploy Preview
              uses: cloudflare/wrangler-action@v3
              id: deploy
              with:
                  apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
                  accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
                  command: pages deploy dist --project-name=store-website --branch=${{ github.head_ref }}

            - name: Comment Preview URL
              uses: actions/github-script@v7
              with:
                  script: |
                      const output = `### 🔍 Preview Deployment Ready!

                      **Preview URL:** ${{ steps.deploy.outputs.deployment-url }}

                      This preview will be available until the PR is closed.`;

                      github.rest.issues.createComment({
                        issue_number: context.issue.number,
                        owner: context.repo.owner,
                        repo: context.repo.repo,
                        body: output
                      });
```

**Optional but recommended** - Deploys preview versions of the site for each PR.

---

## Part 3: Deployment Steps

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

**Required for GitHub Actions deployment:**

1. **Get Cloudflare API Token:**
    - Go to: https://dash.cloudflare.com/profile/api-tokens
    - Click "Create Token"
    - Use "Cloudflare Pages - Edit" template
    - Copy the generated token

2. **Get Cloudflare Account ID:**
    - Go to: https://dash.cloudflare.com/
    - Copy Account ID from right sidebar

3. **Add Secrets to GitHub:**
    - Go to: https://github.com/DeveloPassion/store-website/settings/secrets/actions
    - Click "New repository secret"
    - Add:
        - Name: `CLOUDFLARE_API_TOKEN`, Value: [your token]
        - Name: `CLOUDFLARE_ACCOUNT_ID`, Value: [your account ID]

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
git commit -m "feat: migrate to Cloudflare Pages with Wrangler"

# Install dependencies
bun install

# Run full CI locally
bun run ci:local

# Build the application
bun run build

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

    # Product page
    curl -I https://store.dsebastien.net/l/knowii-voice-ai

    # Category page
    curl -I https://store.dsebastien.net/categories/courses

    # Tag page
    curl -I https://store.dsebastien.net/tags/ai

    # Redirect (should be 301)
    curl -I https://store.dsebastien.net/affiliates
    ```

2. **Verify redirect works:**
    - Visit: https://store.dsebastien.net/affiliates
    - Should immediately redirect to Gumroad (301 status)
    - Check Chrome DevTools Network tab to confirm 301

3. **Test OG metadata:**
    - Use Facebook Debugger: https://developers.facebook.com/tools/debug/
    - Test product URLs to verify cover images appear correctly
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
    time curl -I https://store.dsebastien.net/affiliates
    ```

**Expected improvements:**

- TTFB: 40-60% faster
- Redirect latency: 10-100x faster (server vs client)
- Global CDN: Lower latency worldwide
- Build time: Similar or faster

---

## Part 4: URL Preservation Validation

**All existing URLs remain identical:**

✅ Homepage: `/`
✅ Products: `/products`
✅ Product detail: `/l/{productId}` (21 products)
✅ Categories: `/categories` and `/categories/{categoryId}` (23 categories)
✅ Tags: `/tags` and `/tags/{tagId}` (96 tags)
✅ Collections: `/best-value`, `/best-sellers`, `/featured`
✅ Other: `/help`, `/faq`, `/wishlist`, `/shared-wishlist`, `/testimonials`
✅ Redirects: `/affiliates` → Gumroad (still works, just faster)

**No URL changes. Zero breakage.**

---

## Part 5: Rollback Plan

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

## Part 6: Post-Migration Cleanup

**After 1-2 weeks of stable operation:**

### 1. Delete Unused Files

```bash
# Remove GitHub Pages specific files
rm scripts/utils/generate-redirect-pages.ts
rm -rf src/components/redirect/
rm src/lib/redirects.ts
rm src/lib/redirects.spec.ts

# Optional: Remove GitHub Pages workflow if not needed
rm .github/workflows/deploy.yml  # Only if using Cloudflare exclusively
```

### 2. Update Documentation

- Update `AGENTS.md` deployment section
- Update `README.md` with Cloudflare deployment instructions
- Document Wrangler CLI usage for team

### 3. Update Validation Scripts

- `scripts/validate-redirects.ts` can remain (validates `_redirects` format)
- Consider updating to validate Cloudflare-specific redirect syntax

---

## Part 7: Testing Checklist

**Before marking migration complete:**

### Code Changes

- [ ] `public/_redirects` file created
- [ ] `public/_headers` file created (optional)
- [ ] `wrangler.toml` file created and configured
- [ ] `package.json` updated (wrangler dependency + build script)
- [ ] `src/main.tsx` redirect routes removed
- [ ] `src/pages/product.tsx` URL bug fixed
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
- [ ] Wrangler CLI works: `wrangler pages dev dist`

### Cloudflare Setup

- [ ] Cloudflare Pages project created
- [ ] Custom domain `store.dsebastien.net` configured
- [ ] DNS CNAME record updated
- [ ] SSL certificate provisioned
- [ ] First manual deployment successful

### Production Verification

- [ ] All main routes load correctly (/, /products, /categories, /tags)
- [ ] Product pages load correctly (/l/{productId})
- [ ] `/affiliates` redirect works (301 status)
- [ ] OG metadata correct on product pages (cover images)
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

## Part 8: Wrangler CLI Reference

### Common Commands

```bash
# Login to Cloudflare
wrangler login

# Create new Pages project
wrangler pages project create <PROJECT_NAME>

# List all Pages projects
wrangler pages project list

# Deploy to production
wrangler pages deploy <DIRECTORY> --project-name=<PROJECT_NAME>

# Deploy to preview branch
wrangler pages deploy <DIRECTORY> --project-name=<PROJECT_NAME> --branch=<BRANCH_NAME>

# Start local development server
wrangler pages dev <DIRECTORY>

# View deployment logs
wrangler pages deployment list --project-name=<PROJECT_NAME>

# Tail live logs
wrangler pages deployment tail --project-name=<PROJECT_NAME>
```

### Local Development with Wrangler

```bash
# Build the application
bun run build

# Start Cloudflare Pages dev server (simulates production environment)
wrangler pages dev dist

# Or use npm script
bun run preview:cloudflare
```

**Benefits of `wrangler pages dev`:**

- Simulates Cloudflare Pages environment locally
- Tests `_redirects` and `_headers` files
- Validates deployment before pushing

---

## Part 9: Architecture Notes

### Why Cloudflare Pages Over Vercel/Netlify?

**Cloudflare Pages advantages:**

- Best-in-class CDN (270+ PoPs globally)
- Unlimited bandwidth (no 100GB cap)
- HTTP/3 support (faster connection establishment)
- Best raw performance for static sites
- Free tier is extremely generous
- DDoS protection included
- Native integration with Cloudflare ecosystem

**Vercel/Netlify are also excellent** but have bandwidth caps on free tier.

### Meta Tag Architecture (Unchanged)

**Two-layer approach (important to maintain):**

1. **Static HTML** (`generate-static-pages.ts`):
    - Pre-renders meta tags at build time
    - Ensures SEO crawlers see correct metadata
    - Critical for social media unfurling

2. **Runtime updates** (`updateAllMetaTags()`):
    - Updates meta tags during client-side navigation
    - Ensures correct metadata when users navigate within SPA
    - Uses React `useEffect` hooks

**Both layers required** because:

- Social crawlers don't execute JavaScript → need static HTML
- Client-side navigation doesn't reload HTML → need runtime updates

### Redirect Strategy Change

**Before (GitHub Pages):**

- Triple-layer client-side redirects:
    1. Static HTML page with meta refresh
    2. JavaScript `window.location.replace()`
    3. React Router route → RedirectPage component
- Slow (requires full page load + JS execution)
- Works without server-side support

**After (Cloudflare):**

- Single server-side redirect via `_redirects` file
- Processed at edge (before HTML even loads)
- 10-100x faster
- More reliable (works even if JS disabled)

**No React Router involvement needed** - Cloudflare handles it before request reaches React app.

### Wrangler vs Cloudflare Dashboard

**Wrangler CLI:**

- Automated deployments via CI/CD
- Local development environment
- Command-line control
- Version control for configuration (wrangler.toml)

**Cloudflare Dashboard:**

- Visual project management
- Real-time analytics
- Domain configuration
- Build logs and deployment history
- Environment variables management

**Recommendation:** Use both - Wrangler for automation, Dashboard for monitoring.

---

## Part 10: Success Criteria

Migration is successful when:

1. ✅ All existing URLs load correctly
2. ✅ Redirects work (301 status, instant)
3. ✅ OG metadata displays correctly in social shares
4. ✅ Lighthouse performance score improves or stays same
5. ✅ TTFB improves by 40%+ (measured via WebPageTest)
6. ✅ No 404 errors on hard refresh
7. ✅ SPA navigation works smoothly
8. ✅ GitHub Actions deployment works automatically on release
9. ✅ Build completes successfully on Cloudflare
10. ✅ SSL certificate provisioned automatically
11. ✅ No console errors in browser
12. ✅ Wrangler CLI commands work for manual deployment
13. ✅ Preview deployments work for PRs (if configured)

---

## Part 11: Timeline & Risk Assessment

**Estimated Time:**

- Code changes: 20-30 minutes
- Cloudflare setup: 15-20 minutes
- GitHub Actions configuration: 10-15 minutes
- DNS configuration: 5-10 minutes (+ propagation wait)
- Testing & verification: 30-45 minutes
- **Total: 1.5-2 hours**

**Risk Level: LOW**

**Risk Mitigation:**

- Easy rollback via DNS change (5 minutes)
- No URL changes means zero user-facing breakage
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
**Plan Version:** 1.0
**Last Updated:** 2026-01-12
**Status:** Ready for Implementation
