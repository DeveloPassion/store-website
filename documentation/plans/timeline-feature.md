# Timeline Feature for Product Sales Copy

## Overview

Add a "transformation timeline" feature to sales copy that shows benefits users gain over time (e.g., "Week 1: ...", "Month 1: ..."). This complements the existing benefits structure by showing progression rather than just categorization.

**Note**: This is distinct from the existing `storytelling.transformationArc` which shows before/during/after phases. The new timeline is more granular, showing specific time-based milestones.

## Schema Design

### New Timeline Schema (`/src/schemas/timeline.schema.ts`)

Following the pattern from `storytelling.schema.ts`:

```typescript
import { z } from 'zod'

/**
 * Individual milestone in the transformation timeline
 * Represents what the user achieves at a specific point in time
 */
export const TimelineMilestoneSchema = z.object({
    id: z.string().min(1, 'Milestone ID is required'),
    timeframe: z.string().min(1, 'Timeframe is required'), // "Week 1", "Month 1", "Day 1"
    title: z.string().min(1, 'Title is required'), // "Foundation Built"
    description: z.string().min(10, 'Description must be at least 10 characters'),
    highlights: z.array(z.string()).optional(), // Optional bullet points
    icon: z.string().optional() // Optional icon name
})

/**
 * Full transformation timeline structure
 * Shows the progression of benefits over time
 */
export const TimelineSchema = z.object({
    title: z.string().optional(), // Defaults to "Your Transformation Journey"
    subtitle: z.string().optional(), // Defaults to "See what you'll achieve over time"
    milestones: z.array(TimelineMilestoneSchema).min(1, 'At least one milestone is required')
})

// Export TypeScript types
export type TimelineMilestone = z.infer<typeof TimelineMilestoneSchema>
export type Timeline = z.infer<typeof TimelineSchema>
```

### Update Sales Copy Schema (`/src/schemas/sales-copy.schema.ts`)

Add import and field to `SalesCopyDataSchema`:

```typescript
import { TimelineSchema } from './timeline.schema'

// In SalesCopyDataSchema:
timeline: TimelineSchema.nullish() // Required field, nullable value (like storytelling)
```

## Files to Modify

### 1. Schema Files

- **CREATE** `/src/schemas/timeline.schema.ts` - New timeline schema with types exported
- **UPDATE** `/src/schemas/sales-copy.schema.ts` - Import TimelineSchema, add `timeline: TimelineSchema.nullish()`

### 2. Product Page Components

- **CREATE** `/src/components/products/product-timeline.tsx` - New timeline component
- **UPDATE** `/src/pages/product.tsx` - Import and add `<ProductTimeline product={product} />` after ProductBenefits

### 3. CLI Scripts

- **UPDATE** `/scripts/update-products.ts`:
    - Add `editTimeline()` async function (CRUD for milestones)
    - Add "⏱️ Edit Timeline" to `editSalesCopyVariant()` menu
    - Add `timeline: undefined` to template in `addSalesCopyVariant()`

### 4. Documentation

- **UPDATE** `/AGENTS.md` - Document timeline field, schema, component placement
- **UPDATE** `/.claude/skills/manage-products.md` - Add timeline CLI management instructions

### 5. Tests

- **CREATE** `/src/schemas/timeline.schema.spec.ts` - Schema validation tests
- **CREATE** `/src/components/products/product-timeline.spec.tsx` - Component render tests

## Component Design

### ProductTimeline Component

**Location**: After ProductBenefits, before CoverVideoSpot (position 2)

**Rationale**:

- Benefits show WHAT you get (categorized by timing)
- Timeline shows WHEN/HOW you progress (sequential journey)
- Natural flow from outcomes → implementation timeline

**Visual Design** (vertical timeline):

- Each milestone as a card with connecting line
- Timeframe badge (styled prominently, e.g., "Week 1")
- Title + description + optional highlights as bullet points
- Optional icon support (using DynamicIcon)
- Alternating layout on larger screens (left/right)
- Staggered animations on scroll (matching existing patterns)
- Background: `bg-solution/[0.03]` (matches ProductBenefits)

**Component Structure**:

```typescript
import Section from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import { motion } from 'framer-motion'
import type { Product } from '@/schemas/product.schema'

const ProductTimeline: React.FC<{ product: Product }> = ({ product }) => {
    const timeline = product.salesCopy?.timeline

    // Conditional render - return null if no timeline data
    if (!timeline?.milestones?.length) return null

    const title = timeline.title || 'Your Transformation Journey'
    const subtitle = timeline.subtitle || 'See what you\'ll achieve over time'

    return (
        <Section className='bg-solution/[0.03]'>
            <div className='mx-auto max-w-4xl'>
                <SectionHeader title={title} subtitle={subtitle} />
                {/* Vertical timeline with milestone cards */}
            </div>
        </Section>
    )
}
```

**Responsive Behavior**:

- Mobile: Single column, all milestones on one side
- Desktop (lg+): Alternating left/right layout for visual interest

## Implementation Sequence

### Phase 1: Schema & Types

1. Create `/src/schemas/timeline.schema.ts` (with types exported via `z.infer`)
2. Update `/src/schemas/sales-copy.schema.ts` to import and add timeline field
3. Create schema tests (`/src/schemas/timeline.schema.spec.ts`)

### Phase 2: Component

1. Create `ProductTimeline` component with:
    - Vertical timeline layout
    - Milestone cards with timeframe, title, description
    - Framer Motion animations
    - Conditional rendering for null/empty
2. Create component tests
3. Add to product page after ProductBenefits

### Phase 3: CLI & Scripts

1. Add `editTimeline()` function to update-products.ts:
    - List existing milestones
    - Add new milestone (prompt for timeframe, title, description, highlights)
    - Edit existing milestone
    - Remove milestone
    - Reorder milestones
2. Add "⏱️ Edit Timeline" menu option to `editSalesCopyVariant()`
3. Add `timeline: undefined` to template creation defaults in `addSalesCopyVariant()`

### Phase 4: Documentation

1. Update AGENTS.md:
    - Add `timeline` to SalesCopyDataSchema required fields table
    - Add timeline schema documentation in "Managing Sales Copy" section
    - Document ProductTimeline component in product page section
2. Update `.claude/skills/manage-products.md`:
    - Add timeline management instructions
    - Document CLI commands for timeline editing

## Example Timeline Data

```json
{
    "timeline": {
        "title": "Your Transformation Journey",
        "subtitle": "Here's what you'll achieve over the coming weeks",
        "milestones": [
            {
                "id": "week-1",
                "timeframe": "Week 1",
                "title": "Foundation",
                "description": "Set up your knowledge management system and capture your first 50 notes",
                "highlights": [
                    "System configured",
                    "Initial capture workflow",
                    "First connections made"
                ]
            },
            {
                "id": "month-1",
                "timeframe": "Month 1",
                "title": "Building Momentum",
                "description": "Develop consistent capture habits and see your knowledge graph emerge",
                "highlights": [
                    "Daily review routine",
                    "200+ notes captured",
                    "First insights surface"
                ]
            },
            {
                "id": "month-3",
                "timeframe": "Month 3",
                "title": "Compound Growth",
                "description": "Experience the compound effect as connections multiply and insights accelerate",
                "highlights": [
                    "Knowledge compounds",
                    "Original ideas emerge",
                    "Productivity doubles"
                ]
            }
        ]
    }
}
```

## Verification Plan

### Schema Validation

```bash
bun run validate:products  # Should pass with existing products (timeline: null)
```

### Component Testing

```bash
bun test src/components/products/product-timeline.spec.tsx
```

### Visual Testing

1. Add sample timeline to a test product's sales copy
2. Run `bun dev`
3. Navigate to product page
4. Verify timeline renders correctly after benefits section
5. Test responsive design at mobile/tablet/desktop breakpoints
6. Verify animation triggers on scroll

### Full CI

```bash
bun run ci:local  # All tests, lint, tsc, validate, build
```
