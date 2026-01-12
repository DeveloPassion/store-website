# Implementation Plan: Multiple Videos & Screenshots with Three Media Groups

## Overview

Add support for multiple videos and screenshots organized into three groups (main, secondary, bonus), each displayed in a mixed-media carousel at strategic locations within product pages.

## Key Design Decisions

- **Breaking Change**: Remove old fields (`coverImage`, `screenshots`, `videoUrl`, `demoUrl`), replace with unified `media[]` array
- **Rich Metadata**: Each media item includes: type, url, title, description, altText, caption, order
- **Mixed Media Carousels**: Single carousel component handles both images AND videos
- **YouTube Only**: Videos use YouTube embeds with click-to-play (no autoplay)
- **Three Strategic Placements**:
    - **Main**: Above "What's Included" section - primary product showcase
    - **Secondary**: Below "Benefits You'll Experience" - deeper dive content
    - **Bonus**: Below "Ready to Get Started" - additional resources/social proof

## Schema Changes

### New Media Item Schema (`src/schemas/product.schema.ts`)

Replace lines 110-114 with:

```typescript
// Media type and group enums
export const MediaTypeSchema = z.enum(['image', 'video'])
export const MediaGroupSchema = z.enum(['main', 'secondary', 'bonus'])

// Media item with rich metadata
export const MediaItemSchema = z.object({
    id: z.string().min(1),
    type: MediaTypeSchema,
    url: z.string().url(),
    title: z.string().min(1),
    description: z.string().optional(),
    altText: z.string().min(1),
    caption: z.string().optional(),
    order: z.number().int().min(0),
    group: MediaGroupSchema,

    // Video-specific (YouTube)
    youtubeId: z.string().optional(),
    thumbnailUrl: z.string().url().optional(),

    // Image-specific
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional()
})

// Replace old media fields with:
media: z.array(MediaItemSchema).optional().default([])
```

Export types: `MediaType`, `MediaItem`, `MediaGroup`

## Component Architecture

### 1. MediaItem Component (`src/components/products/media-item.tsx`)

Renders individual image or video with proper aspect ratio.

**Key Features**:

- **Images**: Lazy loading, expand overlay on hover, click opens lightbox
- **Videos**: YouTube thumbnail + play button overlay, click loads iframe embed
- **Captions**: Optional caption display below media
- **Accessibility**: Alt text for images, ARIA labels for play buttons

**YouTube Pattern**:

- Extract ID from URL: `youtube.com/watch?v={ID}` or `youtu.be/{ID}`
- Thumbnail: `https://img.youtube.com/vi/{ID}/maxresdefault.jpg`
- Embed: `https://www.youtube-nocookie.com/embed/{ID}?autoplay=1&rel=0`

### 2. MediaCarousel Component (`src/components/products/media-carousel.tsx`)

Mixed-media carousel with Framer Motion animations.

**Key Features**:

- Reuse animation patterns from existing `ProductCarousel`
- Auto-rotation (7000ms default), pauses on hover
- Navigation arrows + dot indicators
- Keyboard navigation (Arrow keys, Escape)
- Responsive: Single item mobile, grouped desktop
- Mixed media support (images + videos in same carousel)

### 3. MediaLightbox Component (`src/components/products/media-lightbox.tsx`)

Extend existing `Lightbox` component to support videos.

**Changes**:

- Accept `MediaItem[]` instead of `string[]`
- Detect media type and render accordingly
- Video thumbnails in navigation strip show play icon
- YouTube iframe in full-screen lightbox

### 4. MediaCarouselSection Component (`src/components/products/media-carousel-section.tsx`)

Wrapper component providing section styling.

**Key Features**:

- Filters `product.media` by group
- Returns `null` if no media in group
- Section animations on scroll into view
- Consistent padding and responsive behavior

**Section Headings**:

- Main: "See It In Action"
- Secondary: "Dive Deeper"
- Bonus: "Bonus Content"

## Page Integration (`src/pages/product.tsx`)

Update product page layout:

1. **Remove** existing `<ProductScreenshots>` component (line ~128)
2. **Add** three `<MediaCarouselSection>` components:
    - After `<ProductFeatures>`: `<MediaCarouselSection product={product} group="main" heading="See It In Action" />`
    - After `<ProductBenefits>`: `<MediaCarouselSection product={product} group="secondary" heading="Dive Deeper" />`
    - After `<ProductCTA>`: `<MediaCarouselSection product={product} group="bonus" heading="Bonus Content" />`

3. **Update ProductHero** to use first main media item (lines ~282-297)
4. **Update og:image meta tag** to use first image from media array (lines ~58-65)

## CLI Tool Updates (`scripts/update-products.ts`)

Add media management operations:

```bash
# Add media
bun run update:products -- --operation add-media --id product-id \
  --media-type image --media-group main --url "..." --title "..." \
  --alt "..." --order 0

# Edit media
bun run update:products -- --operation edit-media --id product-id \
  --media-id main-1 --title "Updated"

# Remove media
bun run update:products -- --operation remove-media --id product-id \
  --media-id main-1

# List media
bun run update:products -- --operation list-media --id product-id \
  [--group main|secondary|bonus]

# Reorder media
bun run update:products -- --operation reorder-media --id product-id \
  --media-id main-1 --order 2
```

**Implementation**:

- Add functions: `addMedia`, `editMedia`, `removeMedia`, `listMedia`, `reorderMedia`
- YouTube URL validation and ID extraction
- Automatic order assignment (max order + 1)
- Interactive prompts for all fields

## Validation Updates (`scripts/validate-products.ts`)

Add media-specific validations:

- Media array conforms to schema
- No duplicate media IDs within product
- Order values sequential within groups (warn if gaps)
- YouTube URLs valid format
- All images have alt text
- Video items have YouTube IDs extracted

## Implementation Sequence

### Phase 1: Schema & Types (Critical Foundation)

1. Update `src/schemas/product.schema.ts` - Add media schemas, remove old fields
2. Update `src/types/product.ts` - Import new types
3. Update `scripts/validate-products.ts` - Add media validations
4. **Verify**: Run `bun run validate:products` with empty media arrays

### Phase 2: Core Components

5. Create `src/components/products/media-item.tsx` - Image + video rendering
6. Create `src/components/products/media-carousel.tsx` - Carousel with mixed media
7. Update `src/components/products/media-lightbox.tsx` - Extend existing Lightbox
8. Create `src/components/products/media-carousel-section.tsx` - Section wrapper
9. **Verify**: Write tests for each component, ensure they render correctly

### Phase 3: Page Integration

10. Update `src/pages/product.tsx` - Remove ProductScreenshots, add three MediaCarouselSection components
11. Update `src/components/products/product-hero.tsx` - Use first main media item
12. Update meta tag logic in `src/pages/product.tsx` - og:image from media array
13. **Verify**: Test product page with mock media data

### Phase 4: CLI Tools

14. Update `scripts/update-products.ts` - Add media management functions
15. Add interactive prompts for media operations
16. Implement YouTube URL validation and ID extraction
17. **Verify**: Test CLI operations (add, edit, remove, list, reorder)

### Phase 5: Testing & Documentation

18. Write component tests (media-item, media-carousel, media-lightbox, media-carousel-section)
19. Write schema tests (media validation)
20. Write integration tests (product page with carousels)
21. Update `AGENTS.md` - Document new media structure and CLI commands
22. Add example media to 2-3 flagship products
23. **Verify**: Run `bun run ci:local` - all tests, lint, tsc, validate, build

## Testing Strategy

### Unit Tests (90%+ coverage)

- **media-item.spec.tsx**: Image render, video render with thumbnail, click handlers, YouTube ID extraction
- **media-carousel.spec.tsx**: Navigation, auto-rotation, keyboard controls, indicators
- **media-lightbox.spec.tsx**: Modal behavior, media switching, video display
- **media-carousel-section.spec.tsx**: Rendering, null state, group filtering
- **product.schema.spec.ts**: Media item validation, required fields, URL validation

### Integration Tests

- **product.integration.spec.ts**: Full page with three carousels, empty state handling, lightbox integration

### Manual Testing Checklist

- [ ] Responsive: Mobile (320px), Tablet (600-960px), Desktop (960-1920px), Ultra-wide (1920px+)
- [ ] Images lazy load below fold
- [ ] Videos show thumbnail, click loads iframe
- [ ] Lightbox opens for images and videos
- [ ] Carousel navigation works (arrows, dots, keyboard)
- [ ] Auto-rotation functions correctly
- [ ] Accessibility: Keyboard nav, ARIA labels, alt text, focus visible
- [ ] Performance: No layout shift, smooth animations (60fps)

## Critical Files

1. **`src/schemas/product.schema.ts`** (lines 110-114) - Core schema, add MediaItemSchema and remove old fields
2. **`src/components/products/media-carousel.tsx`** (new) - Main carousel component with mixed media support
3. **`src/components/products/media-item.tsx`** (new) - Individual media renderer with YouTube click-to-play
4. **`src/pages/product.tsx`** (lines ~128) - Remove ProductScreenshots, add three MediaCarouselSection instances
5. **`scripts/update-products.ts`** - Add media management CLI operations

## Migration Notes

- **Low Risk**: Most products (56/56) have empty media fields currently
- **No Data Loss**: Removing unused fields
- **No Migration Script Needed**: Fields are empty
- **Deployment**: Schema → Components → Page → CLI → Example data

## Performance Considerations

- Images below fold: `loading="lazy"`
- Videos: Iframe loads only on user click
- YouTube: Use `youtube-nocookie.com` for privacy
- Carousel: Render current slide + adjacent only
- Thumbnails: Use `maxresdefault.jpg` (high quality)

## Accessibility Requirements

- All images must have meaningful alt text
- Video play buttons need ARIA labels
- Carousel navigation needs ARIA labels
- Full keyboard navigation support
- Focus visible on all interactive elements
- Screen reader announces slide changes

## Verification Steps

After implementation:

1. Run `bun run ci:local` - all checks must pass
2. Test product page with various media combinations
3. Test responsive behavior across breakpoints
4. Test keyboard navigation throughout
5. Verify lazy loading works correctly
6. Test lightbox for images and videos
7. Verify CLI operations work correctly
8. Add example media to flagship products (e.g., Knowii, PKM Kit)
9. Deploy and monitor for issues
