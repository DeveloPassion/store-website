---
skill: manage-promotion
description: Manage and validate promotion banner configuration with schema validation
triggerKeywords: [promotion, banner, promo, sale, discount, promotion.json, validate promotion, banner behavior]
---

# Promotion Banner Management Skill

This skill helps you manage the promotion banner configuration stored in `src/data/promotion.json` with automatic validation against the Zod schema.

## Configuration Location

- **Configuration File**: `src/data/promotion.json` (source of truth)
- **TypeScript Types**: `src/types/promotion.ts`
- **Zod Schema**: `src/schemas/promotion.schema.ts` (source of truth for validation)
- **Validation Script**: `scripts/validate-promotion.ts`
- **Banner Component**: `src/components/layout/promotion-banner.tsx`

## Schema Documentation

The promotion schema is defined in `src/schemas/promotion.schema.ts` using Zod. This is the **source of truth** for promotion configuration validation.

### Required Fields

**Banner Behavior** (enum):
- `ALWAYS` - Always show banner (ignores dates)
- `NEVER` - Never show banner (useful for disabling)
- `PROMOTIONS` - Show only during active promotion period

**Content:**
- `promoText` (string) - Main promotional text (required)
- `promoLink` (string, URL) - Link destination (required)

### Optional Fields

**Timing** (required when bannerBehavior is `PROMOTIONS`):
- `promotionStart` (string) - ISO 8601 timestamp (e.g., "2026-01-01T00:00:00Z")
- `promotionEnd` (string) - ISO 8601 timestamp

**Display:**
- `promoLinkText` (string) - Link anchor text (e.g., "Shop Now →")
- `discountCode` (string) - Discount code to display (e.g., "NY2026")

### Configuration Examples

**Active Promotion with Dates:**
```json
{
  "bannerBehavior": "PROMOTIONS",
  "promotionStart": "2026-01-01T00:00:00Z",
  "promotionEnd": "2026-01-31T23:59:59Z",
  "promoText": "🎉 New Year Sale! Get 20% off all courses and bundles",
  "promoLinkText": "Shop Now →",
  "promoLink": "https://store.dsebastien.net/",
  "discountCode": "NY2026"
}
```

**Always-On Banner:**
```json
{
  "bannerBehavior": "ALWAYS",
  "promoText": "🚀 New Knowledge Worker Kit just launched!",
  "promoLinkText": "Check it out",
  "promoLink": "https://store.dsebastien.net/l/knowledge-worker-kit"
}
```

**Disabled Banner:**
```json
{
  "bannerBehavior": "NEVER",
  "promoText": "",
  "promoLink": "https://store.dsebastien.net/"
}
```

## Workflow

### Quick Update with Interactive CLI (Recommended)

The easiest way to update promotion configuration is using the interactive CLI tool:

**Interactive Mode:**
```bash
npm run update:promotion
```

This launches an interactive wizard that:
- Shows current configuration
- Prompts for each field with defaults
- Automatically calculates end date from start date + duration (days)
- Validates the configuration
- Saves to promotion.json

**CLI Arguments Mode (Non-Interactive):**

For automation or quick updates without prompts:

```bash
# Create a new promotion
npm run update:promotion -- --behavior PROMOTIONS --text "🎉 Spring Sale! 30% off" --link "https://store.dsebastien.net/" --linkText "Shop Now →" --code "SPRING30" --start "2026-03-01" --duration 14

# Disable banner
npm run update:promotion -- --behavior NEVER --text "" --link "https://store.dsebastien.net/"

# Always-on announcement
npm run update:promotion -- --behavior ALWAYS --text "🚀 New product launched!" --link "https://store.dsebastien.net/l/product" --linkText "Check it out"
```

**Arguments:**
- `--behavior` (required) - ALWAYS, NEVER, or PROMOTIONS
- `--text` (required) - Promotion text
- `--link` (required) - Promotion link URL
- `--linkText` (optional) - Link text
- `--code` (optional) - Discount code
- `--start` (PROMOTIONS only) - Start date (YYYY-MM-DD or ISO 8601)
- `--duration` (PROMOTIONS only) - Duration in days (calculates end date)

**Date Handling:**
- Provide start date as `YYYY-MM-DD` (e.g., "2026-03-01") or ISO 8601
- Provide duration as number of days (e.g., 30)
- Script automatically calculates end date = start + duration
- Start time set to 00:00:00Z (beginning of day)
- End time set to 23:59:59Z (end of day)
- Outputs ISO 8601 format with UTC timezone

### Manual Editing

Alternatively, you can manually edit the config file:

1. **Open the config file** at `src/data/promotion.json`
2. **Edit the configuration** following the schema
3. **Run validation** using `npm run validate:promotion`
4. **Fix any errors** reported by the validation script
5. **Test locally** with `npm run dev`
6. **Commit changes** when validated

### Commands

**Update Promotion (Interactive):**
```bash
npm run update:promotion
```

**Update Promotion (CLI Arguments):**
```bash
npm run update:promotion -- --behavior <ALWAYS|NEVER|PROMOTIONS> --text "..." --link "..." [options]
```

**Validate Promotion:**
```bash
npm run validate:promotion
```

This command:
- ✅ Validates promotion.json against the Zod schema
- 📊 Shows a summary with dates and status
- ❌ Reports specific errors for invalid config
- 🚫 Exits with code 1 if validation fails

**Validate All:**
```bash
npm run validate:all
```

Validates promotion along with products, categories, tags, and relationships.

## Banner Behavior Logic

The promotion banner component (`src/components/layout/promotion-banner.tsx`) implements this logic:

1. **NEVER**: Returns `null` (no banner rendered)
2. **ALWAYS**: Always renders banner (ignores dates)
3. **PROMOTIONS**:
   - Checks current time against `promotionStart` and `promotionEnd`
   - Renders only if `now >= start AND now <= end`
   - Logs error if dates missing

## Validation Rules

The schema enforces:
- ✅ Valid banner behavior enum
- ✅ ISO 8601 datetime format for dates
- ✅ Valid URL for promoLink
- ✅ Dates required when behavior is PROMOTIONS
- ✅ End date must be after start date
- ✅ Non-empty promoText

## Common Tasks

### Enable a New Promotion

**Using CLI (Recommended):**
```bash
npm run update:promotion -- --behavior PROMOTIONS --text "🎉 Sale! 20% off" --link "https://store.dsebastien.net/" --linkText "Shop Now →" --code "SALE20" --start "2026-02-01" --duration 30
```

**Using Interactive Mode:**
```bash
npm run update:promotion
# Follow the prompts
```

**Manual Editing:**
1. Set `bannerBehavior` to `PROMOTIONS`
2. Set `promotionStart` and `promotionEnd` dates
3. Update `promoText` with your message
4. Set `promoLink` to destination
5. Optionally add `promoLinkText` and `discountCode`
6. Validate with `npm run validate:promotion`

### Disable the Banner

**Using CLI:**
```bash
npm run update:promotion -- --behavior NEVER --text "" --link "https://store.dsebastien.net/"
```

**Manual Editing:**
Set `bannerBehavior` to `NEVER` (keep other fields for reference)

### Create an Always-On Announcement

**Using CLI:**
```bash
npm run update:promotion -- --behavior ALWAYS --text "🚀 New product launched!" --link "https://store.dsebastien.net/l/product" --linkText "Learn more"
```

**Manual Editing:**
1. Set `bannerBehavior` to `ALWAYS`
2. Update `promoText` and `promoLink`
3. Remove or ignore date fields

## Display Format

The banner renders as:
```
<promoText> <promoLinkText as link> (<discountCode>)
```

Example output:
```
🎉 New Year Sale! Get 20% off all courses and bundles Shop Now → (NY2026)
                                                         ^^^^^^^   ^^^^^^
                                                         link      code
```

## Important Notes

- The Zod schema in `src/schemas/promotion.schema.ts` is the **source of truth**
- Keep TypeScript types in `src/types/promotion.ts` in sync with schema
- Dates must be in ISO 8601 format with timezone (use "Z" for UTC)
- Banner checks dates at runtime on every render (via useMemo)
- File is NOT gitignored (unlike products.json)
- Promotion history tracked via git commits

## Error Messages

The validation script provides detailed error messages:

```
❌ Validation failed!

Found the following errors:

  • bannerBehavior: promotionStart and promotionEnd are required when bannerBehavior is PROMOTIONS
  • promotionEnd: promotionEnd must be after promotionStart
  • promoLink: Promotion link must be a valid URL
```

## Schema Updates

When updating the promotion schema:

1. Update `src/schemas/promotion.schema.ts` (Zod schema)
2. Update `src/types/promotion.ts` (TypeScript types)
3. Update this skill documentation
4. Run validation on the current config
5. Fix config if newly invalid
