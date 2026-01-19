# Promotion System Overhaul

## Summary

Transform the single-promotion system into a multi-promotion system synchronized with Gumroad's offer codes API. Supports universal/product-specific promotions, time-bound/ongoing promotions, quantity limits, countdown timers, and automatic discount code injection into Gumroad URLs.

## User Decisions (from clarification questions)

- **Source of truth**: Gumroad API (local file is synced cache)
- **Banner**: Priority-based single promotion (global > time-limited > product-specific)
- **Expired promos**: Remove on sync
- **Countdown expiry**: Hide silently
- **Subscriptions**: Show "(first month only)" qualifier when applicable
- **Product cards**: Badge + strikethrough price
- **Empty /promotions page**: Always accessible with friendly message
- **Sync frequency**: Manual CLI only
- **Countdown format**: Adaptive (days > h:m > m:s)
- **Command palette**: Conditional "Promotions" action
- **Non-Gumroad products**: Skip
- **Urgency tone**: Factual ("Offer ends January 20th at midnight UTC")
- **URL injection**: Auto-append discount code to ALL Gumroad links
- **Ignored codes**: Store in promotions.json as `ignoredCodes` array

---

## Phase 1: Schema & Data Structure

### 1.1 Create new schema: `src/schemas/promotions.schema.ts`

```typescript
// Key types:
DiscountTypeSchema: z.enum(['percentage', 'amount'])
PromotionScopeSchema: z.enum(['universal', 'product-specific'])
BannerBehaviorSchema: z.enum(['ALWAYS', 'NEVER', 'AUTO'])

PromotionSchema: z.object({
  gumroadOfferId: string,
  code: string,
  scope: 'universal' | 'product-specific',
  productIds: string[] | null,  // null for universal
  discountType: 'percentage' | 'amount',
  discountValue: number,
  name: string,
  description: string | null,
  startsAt: datetime | null,    // null = immediately active
  endsAt: datetime | null,      // null = ongoing
  maxUses: number | null,       // null = unlimited
  currentUses: number,
  firstPeriodOnly: boolean,     // for subscriptions
  priority: number,
  syncedAt: datetime
})

PromotionsConfigSchema: z.object({
  bannerBehavior: BannerBehavior,
  customBannerText: string | null,
  customBannerLinkText: string | null,
  promotions: Promotion[],
  ignoredCodes: string[],
  lastSyncAt: datetime | null
})
```

### 1.2 Create new data file: `src/data/promotions.json`

- Delete old `src/data/promotion.json`
- Initial structure with empty promotions array

---

## Phase 2: Gumroad API Integration

### 2.1 Add types: `scripts/utils/gumroad/types.ts`

```typescript
interface GumroadOfferCode {
    id: string
    name: string // The discount code
    amount_off: number | null
    percent_off: number | null
    max_purchase_count: number | null
    universal: boolean
    times_used: number
    valid_at: string | null
    expires_at: string | null
    first_period_only: boolean
}
```

### 2.2 Extend API client: `scripts/utils/gumroad/api-client.ts`

Add methods:

- `getOfferCodes(productId: string): Promise<GumroadOfferCode[]>`
- `getAllOfferCodes(): Promise<Map<string, GumroadOfferCode[]>>`

### 2.3 Update sync script: `scripts/sync-gumroad.ts`

Add promotion sync functionality:

- CLI flag: `--promotions` (sync offer codes only)
- Interactive menu option: "Sync Promotions"
- Filter out `ignoredCodes`
- Remove expired promotions
- Map Gumroad format to local schema
- Write to `promotions.json`

---

## Phase 3: CLI & Validation

### 3.1 Rename & update: `scripts/update-promotions.ts`

Interactive menu:

1. View all promotions
2. View active promotions
3. Add code to ignore list
4. Remove code from ignore list
5. Set banner behavior
6. Set custom banner text
7. Trigger sync from Gumroad

CLI args: `--behavior`, `--ignore`, `--unignore`, `--banner-text`, `--sync`

### 3.2 Update validation: `scripts/validate-promotions.ts`

- Validate against new schema
- Check productIds reference valid products
- Validate date logic
- Warn about expired promotions
- Display summary

---

## Phase 4: Runtime Library

### 4.1 Create: `src/lib/promotions.ts`

```typescript
getActivePromotions(): Promotion[]
getActivePromotionsForProduct(productId: string): Promotion[]
getBannerPromotion(): Promotion | null  // Priority-based selection
isPromotionActive(promotion: Promotion): boolean
hasActivePromotions(): boolean
calculateDiscountedPrice(price: number, promotion: Promotion): number
formatDiscount(promotion: Promotion): string  // "20% off" or "€10 off"
getTimeRemaining(promotion: Promotion): { days, hours, minutes, seconds, total } | null
formatCountdown(remaining): string  // Adaptive format
```

### 4.2 Update: `src/lib/gumroad-url.ts`

- Import `getActivePromotionsForProduct`
- Auto-inject discount code when promotion exists for product
- New helper: `buildGumroadUrlWithPromotion(product, variant?, frequency?)`

---

## Phase 5: UI Components

### 5.1 Update: `src/components/layout/promotion-banner.tsx`

- Add countdown timer with 1-second interval
- Priority-based promotion selection via `getBannerPromotion()`
- Auto-hide when countdown reaches zero (silently)
- Hover tooltip: "Offer ends January 20th at midnight UTC"
- Link to /promotions when product-specific promos only
- Banner text: "{name}: {discount} on {ALL products|select products}!"

### 5.2 Create: `src/components/layout/countdown-timer.tsx`

Reusable component:

- Props: `endsAt: string`, `onExpire?: () => void`, `className?: string`
- Adaptive format display

### 5.3 Update: `src/components/products/product-card-ecommerce.tsx`

- Check for active promotions on product
- Add discount badge (red, e.g., "-20%")
- Show original price struck through + discounted price in red
- Update Buy button URL to include discount code

### 5.4 Update: `src/components/products/product-hero.tsx`

- Discount badge next to price
- Strikethrough original price
- "(first month only)" qualifier for subscription discounts
- Update CTA URL with discount code

### 5.5 Update: `src/components/products/product-cta.tsx`

Same as product-hero.tsx

### 5.6 Update: `src/components/products/sticky-buy-button.tsx`

Same updates for discount display + URL

---

## Phase 6: Promotions Page

### 6.1 Create: `src/pages/promotions.tsx`

- Meta tags with `updateAllMetaTags()`
- Breadcrumbs
- Header section with title/description
- List of promotion cards (or empty state message)
- Products on sale section (product cards)
- QuickNavigation component at bottom

### 6.2 Create: `src/components/promotions/promotion-card.tsx`

Display:

- Promotion name & description
- Discount amount/percentage
- Valid dates (if time-bound)
- Countdown timer (if ending soon)
- Usage remaining (if limited)
- Applicable products (with links)
- Copy code button

### 6.3 Add route: `src/main.tsx`

```tsx
<Route path='/promotions' element={<PromotionsPage />} />
```

---

## Phase 7: Navigation & SEO

### 7.1 Update: `src/components/layout/header.tsx`

Add conditional "Sale" / "Promotions" link to mobile menu when `hasActivePromotions()`

### 7.2 Update: `src/components/layout/footer.tsx`

Add conditional "Promotions" link in Shop section when `hasActivePromotions()`

### 7.3 Update: `src/components/products/command-palette.tsx`

Add conditional "Current Promotions" action when `hasActivePromotions()`

### 7.4 Update: `scripts/utils/generate-sitemap.ts`

Add `/promotions` page with priority 0.8, changefreq 'daily'

### 7.5 Update: `scripts/utils/generate-llms-txt.ts`

Add `/promotions` route and active promotions section

### 7.6 Update: `scripts/utils/generate-static-pages.ts`

Add static HTML for /promotions with proper meta tags

---

## Phase 8: Cleanup & Documentation

### 8.1 Delete old files

- `src/data/promotion.json`
- `src/schemas/promotion.schema.ts`
- `scripts/update-promotion.ts`
- `scripts/validate-promotion.ts`

### 8.2 Update package.json scripts

- `update:promotion` -> `update:promotions`
- `validate:promotion` -> `validate:promotions`

### 8.3 Update AGENTS.md

Document new promotion system, CLI commands, schema

---

## Files to Modify/Create

| Action | File                                                 |
| ------ | ---------------------------------------------------- |
| CREATE | `src/schemas/promotions.schema.ts`                   |
| CREATE | `src/data/promotions.json`                           |
| CREATE | `src/lib/promotions.ts`                              |
| CREATE | `src/pages/promotions.tsx`                           |
| CREATE | `src/components/promotions/promotion-card.tsx`       |
| CREATE | `src/components/layout/countdown-timer.tsx`          |
| CREATE | `scripts/update-promotions.ts`                       |
| CREATE | `scripts/validate-promotions.ts`                     |
| MODIFY | `scripts/utils/gumroad/types.ts`                     |
| MODIFY | `scripts/utils/gumroad/api-client.ts`                |
| MODIFY | `scripts/sync-gumroad.ts`                            |
| MODIFY | `src/lib/gumroad-url.ts`                             |
| MODIFY | `src/components/layout/promotion-banner.tsx`         |
| MODIFY | `src/components/products/product-card-ecommerce.tsx` |
| MODIFY | `src/components/products/product-hero.tsx`           |
| MODIFY | `src/components/products/product-cta.tsx`            |
| MODIFY | `src/components/products/sticky-buy-button.tsx`      |
| MODIFY | `src/components/layout/header.tsx`                   |
| MODIFY | `src/components/layout/footer.tsx`                   |
| MODIFY | `src/components/products/command-palette.tsx`        |
| MODIFY | `src/main.tsx`                                       |
| MODIFY | `scripts/utils/generate-sitemap.ts`                  |
| MODIFY | `scripts/utils/generate-llms-txt.ts`                 |
| MODIFY | `scripts/utils/generate-static-pages.ts`             |
| MODIFY | `package.json`                                       |
| MODIFY | `AGENTS.md`                                          |
| DELETE | `src/data/promotion.json`                            |
| DELETE | `src/schemas/promotion.schema.ts`                    |
| DELETE | `scripts/update-promotion.ts`                        |
| DELETE | `scripts/validate-promotion.ts`                      |

---

## Verification Plan

### Unit Tests

1. `src/schemas/promotions.schema.spec.ts` - Schema validation
2. `src/lib/promotions.spec.ts` - All utility functions
3. `src/lib/gumroad-url.spec.ts` - URL building with discounts

### Manual Testing Checklist

- [ ] Run `bun run sync:gumroad --promotions` to fetch from Gumroad
- [ ] Verify `promotions.json` is populated correctly
- [ ] Check promotion banner displays with countdown
- [ ] Verify banner hides silently when countdown expires
- [ ] Check product card shows discount badge + strikethrough price
- [ ] Verify discounted price calculation is correct
- [ ] Click Buy button, verify URL includes `offer_code` parameter
- [ ] Test Gumroad checkout applies discount correctly
- [ ] Navigate to `/promotions` page, verify layout
- [ ] Test empty state when no promotions
- [ ] Check header/footer show "Promotions" link conditionally
- [ ] Check command palette shows "Promotions" action conditionally
- [ ] Run `bun run build` - no errors
- [ ] Run `bun run tsc` - no type errors
- [ ] Run `bun run lint` - no lint errors
- [ ] Run `bun run test:run` - all tests pass
- [ ] Run `bun run ci:local` - full CI passes
