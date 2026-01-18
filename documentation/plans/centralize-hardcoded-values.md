# Plan: Centralize Hardcoded Business Metrics and UI Constants

## Overview

Centralize hardcoded business/marketing values into JSON data files with schemas and validation, and shared UI timing constants into a constants file.

---

## 1. Newsletter Stats

### Files to Create

- `src/data/newsletter-stats.json` - Newsletter subscriber count
- `src/schemas/newsletter-stats.schema.ts` - Zod schema
- `src/schemas/newsletter-stats.schema.spec.ts` - Schema tests
- `scripts/validate-newsletter-stats.ts` - Validation script

### Data Structure

```json
{
    "subscriberCount": 2300,
    "displayText": "2,300+",
    "lastUpdated": "2026-01-18"
}
```

### Files to Modify

- `src/components/layout/footer.tsx:104` - Import and use `displayText`
- `package.json` - Add `validate:newsletter-stats` script, update `validate:all`

---

## 2. My Experience

### Files to Create

- `src/data/my-experience.json` - Career start date and experience info
- `src/schemas/my-experience.schema.ts` - Zod schema
- `src/schemas/my-experience.schema.spec.ts` - Schema tests
- `scripts/validate-my-experience.ts` - Validation script

### Data Structure

```json
{
    "careerStartDate": "2004-01-01",
    "displayText": "20+ years experience",
    "description": "IT professional since 2004"
}
```

### Files to Modify

- `src/pages/home.tsx:343` - Import and use `displayText`
- `package.json` - Add `validate:my-experience` script, update `validate:all`

---

## 3. Refund Policy

### Files to Create

- `src/data/refund-policy.json` - Refund guarantee configuration
- `src/schemas/refund-policy.schema.ts` - Zod schema
- `src/schemas/refund-policy.schema.spec.ts` - Schema tests
- `scripts/validate-refund-policy.ts` - Validation script

### Data Structure

```json
{
    "guaranteeDays": 30,
    "displayText": "30-day",
    "fullDescription": "30-day money-back guarantee"
}
```

### Files to Modify

- `src/pages/help.tsx:81` - Import and use policy data
- `src/pages/home.tsx:328` - Import and use policy data
- `package.json` - Add `validate:refund-policy` script, update `validate:all`

---

## 4. UI Constants

### File to Create

- `src/constants.ts` - Shared UI timing constants

### Constants to Define

```typescript
// Carousel/rotation intervals
export const CAROUSEL_AUTO_ROTATE_INTERVAL_MS = 7000

// Success/feedback message display durations
export const SUCCESS_MESSAGE_DURATION_MS = 5000

// Redirect delays
export const REDIRECT_DELAY_MS = 2000

// Copy to clipboard feedback
export const COPY_FEEDBACK_DURATION_MS = 2000
```

### Files to Modify (use shared constants)

| Constant                           | Files                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `CAROUSEL_AUTO_ROTATE_INTERVAL_MS` | `product-carousel.tsx:18`, `media-carousel.tsx:22`, `product-hero.tsx:333`, `home.tsx:312`, `product-testimonials.tsx:127` |
| `SUCCESS_MESSAGE_DURATION_MS`      | `footer.tsx:80`, `compact-newsletter.tsx:55`                                                                               |
| `REDIRECT_DELAY_MS`                | `tag.tsx:106`, `category.tsx:74`                                                                                           |
| `COPY_FEEDBACK_DURATION_MS`        | `promotion-banner.tsx:30`                                                                                                  |

### Keep as Single-File Constants (not shared)

- `3000ms` in `wishlist.tsx:58` - Unique copy feedback duration
- `5000ms` in `all-testimonials.tsx:55` - Unique testimonial fade interval

---

## Implementation Order

1. Create `src/constants.ts` and update UI timing consumers
2. Create newsletter-stats (schema, data, validation) and update footer
3. Create my-experience (schema, data, validation) and update home page
4. Create refund-policy (schema, data, validation) and update help/home pages
5. Update `package.json` with all new validation scripts
6. Run `bun run validate:all` to verify
7. Run `bun run tsc` and `bun test` to ensure no regressions

---

## Verification

```bash
# Validate all new data files
bun run validate:newsletter-stats
bun run validate:my-experience
bun run validate:refund-policy

# Full validation suite
bun run validate:all

# Type check
bun run tsc

# Tests
bun test

# Build
bun run build
```
