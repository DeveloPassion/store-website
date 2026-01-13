# Sales Copy Extraction & Storytelling Implementation Plan

## Overview

Extract all marketing copy from product JSON into versioned `-sales-copy-{variant}.json` files, add optional storytelling sections (origin story, creator journey, transformation arc, success stories, methodology, vision), and integrate seamlessly into product pages. Supports multiple sales copy variants per product (A/B testing) with CLI management.

## Architecture Summary

**File Structure:**

- Sales copy files: `{product-id}-sales-copy-{variant-name}.json` (e.g., `-sales-copy-default.json`)
- Each file contains: metadata (id) + salesCopy data
- The name of the variant is inferred from the file name
- Product JSON references active variant via `activeSalesCopyId` field
- Storytelling sections nested within sales copy (all optional)

**Extracted Fields from Product JSON:**

- Identity: tagline, secondaryTagline
- PAS: problem, problemPoints, agitate, agitatePoints, solution, solutionPoints
- Content: description, features, benefits
- Trust: trustBadges, guarantees
- SEO: metaTitle, metaDescription, keywords
- Audience: perfectFor, notForYou, targetAudience
- Storytelling: originStory, creatorJourney, transformationArc, successStories, methodology, vision

**Storytelling Sections (all optional):**

1. **Origin Story** - Why product exists, genesis moment, inspiration
2. **Creator Journey** - Personal story, struggles, credibility, achievements
3. **Transformation Arc** - Before/during/after customer journey with timeline
4. **Success Stories** - Detailed case studies with metrics, customer results
5. **Methodology** - Step-by-step process, philosophy, differentiation
6. **Vision** - Mission statement, bigger picture, values, future goals

## Critical Files

### New Files

1. `/src/schemas/storytelling.schema.ts` - All storytelling section schemas (OriginStory, CreatorJourney, TransformationArc, SuccessStories, Methodology, Vision, Storytelling)
2. `/src/schemas/sales-copy.schema.ts` - SalesCopyData and SalesCopyFile schemas
3. `/src/types/storytelling.ts` - TypeScript types exported from schemas
4. `/src/types/sales-copy.ts` - TypeScript types exported from schemas
5. `/src/components/products/product-origin-story.tsx` - Origin story component
6. `/src/components/products/product-creator-journey.tsx` - Creator journey component
7. `/src/components/products/product-transformation-arc.tsx` - Transformation arc component (3-column: before/during/after)
8. `/src/components/products/product-success-stories.tsx` - Success stories grid component
9. `/src/components/products/product-methodology.tsx` - Methodology steps component
10. `/src/components/products/product-vision.tsx` - Vision statement component
11. `/scripts/migrate-to-sales-copy.ts` - Migration script with dry-run support

If relevant, limit the number of new components (possibly reusing existing ones) to limit dumb code duplication

### Modified Files

1. `/src/schemas/product.schema.ts` - Remove sales copy fields, add `activeSalesCopyId`
2. `/scripts/utils/aggregate-products.ts` - Add `loadActiveSalesCopy()`, `discoverSalesCopyFiles()`, merge logic
3. `/scripts/update-products.ts` - Add sales-copy:\* operations (list, add, edit, enable, duplicate, remove)
4. `/src/pages/product.tsx` - Add conditional storytelling component rendering

### Test Files (New)

1. `/src/schemas/storytelling.schema.spec.ts`
2. `/src/schemas/sales-copy.schema.spec.ts`
3. `/src/components/products/product-origin-story.spec.tsx`
4. `/src/components/products/product-creator-journey.spec.tsx`
5. `/src/components/products/product-transformation-arc.spec.tsx`
6. `/src/components/products/product-success-stories.spec.tsx`
7. `/src/components/products/product-methodology.spec.tsx`
8. `/src/components/products/product-vision.spec.tsx`

## Implementation Phases

### Phase 1: Schemas & Types

1. Create `storytelling.schema.ts` with 6 section schemas (all fields optional/nullable)
2. Create `sales-copy.schema.ts` with SalesCopyData + SalesCopyFile schemas
3. Update `product.schema.ts` - remove marketing fields, add `activeSalesCopyId: z.string().optional()`
4. Export types from schemas
5. Write comprehensive schema tests (100% coverage)

**Storytelling Schema Structure:**

```typescript
// Each section is optional/nullable at top level
StorytellingSchema = z.object({
  originStory: OriginStorySchema.nullable(),
  creatorJourney: CreatorJourneySchema.nullable(),
  transformationArc: TransformationArcSchema.nullable(),
  successStories: SuccessStoriesSchema.nullable(),
  methodology: MethodologySchema.nullable(),
  vision: VisionSchema.nullable()
})

// Nested in SalesCopyDataSchema
salesCopy: { ..., storytelling: StorytellingSchema }
```

### Phase 2: Aggregation

1. Add `discoverSalesCopyFiles(productId)` - returns array of variant IDs
2. Add `loadActiveSalesCopy(productId, activeSalesCopyId?)` - loads and validates sales copy file
3. Update main aggregation loop to load and merge sales copy into product object
4. Handle null gracefully for backwards compatibility (products without sales copy)
5. Write aggregation tests with strict mode validation

**Aggregation Logic:**

```typescript
const salesCopy = loadActiveSalesCopy(product.id, product.activeSalesCopyId)
const aggregatedProduct = {
    ...product,
    faqs,
    testimonials,
    media,
    ...(salesCopy
        ? {
              /* spread all sales copy fields */
          }
        : {})
}
```

### Phase 3: CLI Operations

1. Add `sales-copy:list` - Show all variants with metadata (id, name, enabled, version)
2. Add `sales-copy:add` - Create new variant with prompts for id, name, initial data
3. Add `sales-copy:edit` - Interactive editing with storytelling section menus
4. Add `sales-copy:enable` - Switch active variant (updates product.activeSalesCopyId)
5. Add `sales-copy:duplicate` - Copy variant for A/B testing
6. Add `sales-copy:remove` - Delete variant with confirmation
7. Add interactive menu option "📝 Manage Sales Copy" to product edit flow
8. Write CLI operation tests

**CLI Arguments:**

```bash
bun run update:products -- --operation sales-copy:list --id knowii-voice-ai
bun run update:products -- --operation sales-copy:add --id knowii-voice-ai --sales-copy-id holiday-2026
bun run update:products -- --operation sales-copy:edit --id knowii-voice-ai --sales-copy-id default
bun run update:products -- --operation sales-copy:enable --id knowii-voice-ai --sales-copy-id holiday-2026
bun run update:products -- --operation sales-copy:duplicate --id knowii-voice-ai --sales-copy-id default --new-id variant-a
bun run update:products -- --operation sales-copy:remove --id knowii-voice-ai --sales-copy-id old-variant
```

### Phase 4: Storytelling Components

1. Create 6 components following existing patterns (Section, SectionHeader, useAnimationVariants)
2. Each component accepts data prop (typed to specific storytelling section)
3. Implement responsive layouts with existing breakpoints
4. Use consistent styling (primary/secondary colors, bg-secondary/10 icon containers)
5. Add Framer Motion animations (whileInView, stagger)
6. Write component tests (80%+ coverage) with accessibility checks

**Component Patterns:**

- Wrap in `<Section>` with appropriate background
- Use `<SectionHeader title={data.title} subtitle={data.subtitle} />`
- Apply `useAnimationVariants()` for staggered animations
- Responsive grids: `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`
- Icon containers: `bg-secondary/10 rounded-lg p-3`

### Phase 5: Product Page Integration

1. Update `/src/pages/product.tsx` to conditionally render storytelling sections
2. Place sections strategically in page flow based on marketing best practices:
    - OriginStory: After ProductHero, before ProductPAS
    - CreatorJourney: After ProductPAS, before ProductFeatures
    - TransformationArc: After main media, before ProductBenefits
    - Methodology: After secondary media, before SuccessStories
    - SuccessStories: After Methodology, before ProductTestimonials
    - Vision: After ProductFAQ, before ProductCTA
3. Verify meta tags update correctly
4. Test responsive layout on all breakpoints

**Conditional Rendering:**

```tsx
{
    product.storytelling?.originStory && (
        <ProductOriginStory data={product.storytelling.originStory} />
    )
}
```

### Phase 6: Migration Script

1. Create `/scripts/migrate-to-sales-copy.ts` with dry-run support
2. For each product:
    - Extract sales copy fields from product JSON
    - Create `{product-id}-sales-copy-default.json` with extracted data
    - Update product JSON: add `activeSalesCopyId: 'default'`, remove sales copy fields
    - Validate with schema
3. Add `--dry-run` flag to preview changes
4. Add `--product` flag to migrate single product
5. Create backup before migration
6. Write migration tests

**Migration Commands:**

```bash
bun run migrate:sales-copy --dry-run           # Preview changes
bun run migrate:sales-copy --product knowii    # Migrate one product
bun run migrate:sales-copy                     # Migrate all products
```

### Phase 7: Testing & Validation

1. Run full test suite: `bun test:coverage` (90%+ coverage target)
2. Test all CLI operations manually
3. Verify backwards compatibility (products without sales copy)
4. Test storytelling section rendering (with/without data)
5. Run `bun run ci:local` (lint, tsc, validate:all, build)
6. Test migration on sample products
7. Accessibility audit (keyboard navigation, ARIA labels, screen readers)

### Phase 8: Documentation & Deployment

1. Update `/AGENTS.md` with sales copy management instructions
2. Add storytelling section documentation with examples
3. Document CLI commands and workflows
4. Add migration guide
5. Run migration on production data
6. Deploy to GitHub Pages
7. Monitor for issues

## Validation Checklist

**Pre-Deployment:**

- [ ] All schema tests pass (100% coverage)
- [ ] Aggregation tests pass with strict mode
- [ ] CLI operations tested (list, add, edit, enable, duplicate, remove)
- [ ] Component tests pass (80%+ coverage)
- [ ] Product page renders with all storytelling sections
- [ ] Product page handles missing storytelling sections
- [ ] Backwards compatibility verified (products without sales copy)
- [ ] Migration script tested with --dry-run
- [ ] `bun run ci:local` passes
- [ ] Accessibility audit passed (keyboard, ARIA, screen readers)

**Post-Deployment:**

- [ ] Verify aggregation performance (monitor build times)
- [ ] Check for schema validation errors in logs
- [ ] Test storytelling sections on real products
- [ ] Verify meta tags update correctly
- [ ] Monitor user feedback

## Backwards Compatibility

**Key Guarantees:**

1. Products without sales copy files must be fixed (ask questions)
2. Aggregation merges sales copy fields conditionally
3. Product pages render without storytelling sections if data is null/undefined
4. Migration is MANDATORY (NO backwards compatibility needed!!)
5. Rollback strategy: restore from backup before migration

## Performance Considerations

**Aggregation Impact:**

- Adds 1 file load per product (sales copy)
- Mitigation: Use caching/memoization if needed

**Bundle Size:**

- 6 new components (~20-30KB minified+gzipped)
- Components lazy-loaded per product page
- Conditional rendering reduces runtime impact

**Runtime Performance:**

- Framer Motion animations use GPU acceleration
- Lazy-load images in storytelling sections
- Monitor and optimize if needed

## Risk Mitigation

1. **Breaking Changes**: Dry-run mode, backup, validation, rollback
2. **Schema Complexity**: Tests, interactive CLI, clear errors
3. **Adoption Friction**: Optional sections, backwards compatibility
4. **Performance**: Benchmarks, caching, lazy loading

## Cleanup

Make a clean transition: don't leave backup files, temporary stuff, migration scripts etc.

## Success Metrics

1. All products successfully migrated to new structure
2. CLI operations work seamlessly for sales copy management
3. Storytelling sections render correctly on product pages (if defined)
4. No performance degradation in aggregation or page load
5. NO Backwards compatibility
6. Test coverage >90% for new code
