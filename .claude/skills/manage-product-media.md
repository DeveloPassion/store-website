---
skill: manage-product-media
description: Manage product media (screenshots, videos, cover images, banners) with automatic optimization, metadata collection, and CLI integration
keywords: [product, media, screenshot, video, image, cover, banner, optimize, youtube, photo, picture, visual]
dependencies: [update-products CLI, image optimization tools]
examples:
  - "Add screenshots to the knowii product"
  - "Add this YouTube video to the product media"
  - "Optimize and add cover images for personal-knowledge-base-kit"
  - "Find all media in /assets/images/knowii and add them to the product"
  - "Add media from this product page URL"
---

# Manage Product Media Skill

This skill helps you manage product media (screenshots, videos, cover images, banners) with automatic optimization, intelligent metadata collection, and seamless CLI integration.

## What This Skill Does

1. **Media Discovery**: Automatically find images and videos from:
   - Direct file paths or URLs
   - Folder paths (scans for images)
   - Product page URLs (extracts media)
   - YouTube video URLs

2. **Interactive Metadata Collection**: Uses AskUserQuestion to gather:
   - Product ID (which product this media belongs to)
   - Media type (image or video)
   - Media group (cover, banner, main, secondary, bonus)
   - Order/priority within the group
   - Title, description, alt text, caption
   - Special attributes (featured, etc.)

3. **Image Optimization** (for screenshots/images):
   - Downloads images from URLs
   - Optimizes for web (compression, format conversion)
   - Generates appropriate filenames: `{product-id}-media-{group}-{order}.{ext}`
   - Places optimized images in `/assets/images/{product-id}/`
   - Extracts image dimensions (width, height)

4. **Video Integration** (for YouTube):
   - Extracts YouTube video IDs from URLs
   - Auto-generates thumbnail URLs
   - Supports youtube.com/watch, youtu.be, and youtube.com/embed formats

5. **CLI Integration**: Uses `update-products` CLI to add media with proper validation

**Note**: Media is stored in separate `{product-id}-media.json` files and auto-loaded during product aggregation. In runtime/aggregated products, access media via `product.media` array. Individual product files do NOT contain media arrays.

## When to Use This Skill

Invoke this skill when the user mentions:
- Adding screenshots, images, or photos to products
- Adding videos or YouTube links to products
- Managing product media, visuals, or galleries
- Optimizing product images
- Setting up cover images or banners
- Organizing product media into groups

## How This Skill Works

### Step 1: Media Discovery

First, identify what media needs to be added:

**Case A: Direct URLs or paths provided**
```
User: "Add these screenshots to knowii: /path/image1.png, /path/image2.png"
```
- Parse the provided paths/URLs
- Determine if they're images or videos

**Case B: Folder path provided**
```
User: "Add all images from /assets/images/knowii to the product"
```
- Use Glob tool to find all images: `**/*.{png,jpg,jpeg,webp,gif}`
- List discovered files for user confirmation

**Case C: YouTube video URL**
```
User: "Add this YouTube video: https://youtube.com/watch?v=abc123"
```
- Extract video ID using regex: `/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/`
- Confirm with user

**Case D: Product page URL**
```
User: "Extract media from https://example.com/product-page"
```
- Use WebFetch to fetch page content
- Look for images (og:image, img tags, picture elements)
- Look for YouTube embeds
- Present findings to user for selection

### Step 2: Collect Metadata

Use AskUserQuestion to gather required information:

**Question 1: Product Selection**
```
{
  question: "Which product should this media be added to?",
  header: "Product",
  options: [
    { label: "Knowii", description: "Personal Knowledge Management Platform" },
    { label: "PKB Kit", description: "Personal Knowledge Base Starter Kit" },
    // ... dynamically load from products.json
    { label: "Other", description: "Specify product ID manually" }
  ]
}
```

**Question 2: Media Group** (if multiple items or unclear)
```
{
  question: "What type of media is this?",
  header: "Media Group",
  options: [
    { label: "Cover", description: "Product card thumbnails (16:9, optimized for cards)" },
    { label: "Banner", description: "Hero section images/videos (high visual impact)" },
    { label: "Main", description: "Primary showcase (above 'What's Included')" },
    { label: "Secondary", description: "Deep dive content (below 'Benefits')" },
    { label: "Bonus", description: "Additional resources (below 'Ready to Get Started')" }
  ]
}
```

**Question 3: Media Details** (per item or batch)
For each media item, gather:
- Title (descriptive name)
- Alt text (for accessibility)
- Description (optional, detailed context)
- Caption (optional, display text)
- Order within group (0, 1, 2, ...)

Use a conversational approach with AskUserQuestion for batch operations:
```
{
  question: "How should these images be ordered? (e.g., 'screenshot-1 first, then screenshot-2')",
  header: "Order",
  options: [
    { label: "Keep current order", description: "Use the order they were provided" },
    { label: "Reverse order", description: "Reverse the current sequence" },
    { label: "Specify manually", description: "I'll provide the exact order" }
  ]
}
```

For titles and alt text, you can either:
- Ask for each item individually (for 1-3 items)
- Use intelligent defaults and ask for batch confirmation (for 4+ items)

### Step 3: Image Processing (for images only)

**IMPORTANT**: Use the built-in image optimization utility at `scripts/utils/optimize-images.ts`.

For each image file:

1. **Download** (if URL):
   ```bash
   curl -o /tmp/temp-image.png "https://example.com/image.png"
   ```

2. **Optimize using the utility script**:
   ```bash
   # Optimize single image (converts to WebP, resizes if >1600px wide)
   bun run optimize:images image.png --output /path/to/output.webp

   # Optimize with custom max width (e.g., for cover images)
   bun run optimize:images image.png --max-width 800 --output cover.webp

   # Optimize all images in a folder
   bun run optimize:images ./input-folder/ --output ./output-folder/

   # Optimize in place (replaces originals)
   bun run optimize:images ./images/ --in-place

   # Keep original format instead of converting to WebP
   bun run optimize:images image.png --keep-format

   # Custom quality (default is 85)
   bun run optimize:images image.png --quality 90
   ```

   The utility automatically:
   - Converts to WebP format (better compression, ~60-70% smaller)
   - Strips metadata
   - Resizes if too large (default max 1600x1200)
   - Reports size savings for each file
   - Prints a summary with total savings

3. **Generate filename**:
   Use kebab-case naming: `{product-id}-{descriptive-name}.webp`
   Example: `osk-graph-view.webp`, `knowii-dashboard.webp`

4. **Move to product folder**:
   ```bash
   mkdir -p public/assets/images/products/{product-id}
   mv optimized-image.webp public/assets/images/products/{product-id}/
   ```

5. **Extract dimensions** (if needed):
   ```bash
   # Using imagemagick
   magick identify -format "%wx%h" image.webp
   # Returns: "1920x1080"
   ```

### Step 4: Video Processing (for videos only)

**IMPORTANT: Videos should NEVER be added to the "banner" group. Default to "cover" group for all videos.**

For YouTube videos:

1. **Extract video ID**:
   ```typescript
   const patterns = [
     /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
     /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
     /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
   ];
   ```

2. **Generate thumbnail URL**:
   ```
   https://img.youtube.com/vi/{videoId}/maxresdefault.jpg
   ```

3. **Store full URL**:
   Keep original YouTube URL in the `url` field

### Step 5: Add Media via CLI

For each media item, use the update-products CLI:

```bash
bun run update:products -- \
  --operation media:add \
  --id "{product-id}" \
  --media-type "{image|video}" \
  --media-url "{url}" \
  --media-title "{title}" \
  --media-altText "{altText}" \
  --media-group "{cover|banner|main|secondary|bonus}" \
  --media-order {order} \
  --media-description "{description}" \
  --media-caption "{caption}" \
  --media-width {width} \
  --media-height {height} \
  --media-youtubeId "{youtubeId}"
```

**Note**: Only include optional parameters if they have values.

### Step 6: Validation

After adding all media:

```bash
bun run validate:products
```

If validation fails, show errors to user and offer to fix.

### Step 7: Summary

Provide a clear summary:
```
✅ Added 3 media items to product 'knowii':

Cover Images (2):
  - knowii-media-cover-0.webp (Dashboard Overview)
  - knowii-media-cover-1.webp (Knowledge Graph)

Main Videos (1):
  - YouTube: Product Demo (https://youtube.com/watch?v=abc123)

All media has been optimized and validated successfully.
```

## Advanced Features

### Batch Processing

When adding multiple images from a folder:

1. Group by likely media group (based on folder structure or filenames)
2. Ask for confirmation of the grouping
3. Process all in sequence
4. Show progress for each file

### Auto-Detection

Smart detection of media properties:

- **Cover images**: Detect 16:9 aspect ratio, suggest as cover group
- **Banner images**: Detect large high-res images (>1200px wide), suggest as banner
- **Screenshots**: Detect UI elements, suggest as main/secondary
- **YouTube thumbnails**: If URL looks like a thumbnail, find the actual video

### Metadata Inference

Generate intelligent defaults:

- **Title**: Use filename without extension, convert kebab-case to Title Case
- **Alt Text**: Generate from title + product name
- **Description**: Leave empty unless user provides
- **Order**: Auto-increment within group (find highest existing order + 1)

### Media Group Guidance

Help users choose the right group:

| Group | Purpose | Best For | Aspect Ratio | Max Size |
|-------|---------|----------|--------------|----------|
| Cover | Product cards | Thumbnails, social cards, videos | 16:9 | 800x450 |
| Banner | Hero section | High-impact images ONLY (no videos) | Any | 1920x1080 |
| Main | Primary showcase | Key features, demos | Any | 1920x1080 |
| Secondary | Deep dive | Detailed screenshots | Any | 1920x1080 |
| Bonus | Extra resources | Tutorials, social proof | Any | 1920x1080 |

**IMPORTANT: Video placement rules:**
- **NEVER add videos to the "banner" group** - banner is for static images only
- **Videos should default to "cover" group** for product card display
- Videos can also be placed in "main", "secondary", or "bonus" groups
- If user requests a video in banner, redirect to cover or main and explain the rule

## Error Handling

### Common Issues

1. **Image download fails**:
   - Retry with different user agent
   - Ask user to manually download and provide local path

2. **Image optimization fails**:
   - Check if imagemagick is installed: `which convert`
   - Fall back to adding unoptimized image with warning
   - Suggest manual optimization

3. **Invalid YouTube URL**:
   - Show supported formats
   - Ask user to provide video ID manually

4. **Product not found**:
   - List available products from products.json
   - Ask user to confirm product ID

5. **Duplicate media**:
   - Check existing media in product
   - Ask if user wants to replace or add as new

## Example Workflows

### Example 1: Add YouTube Video

```
User: "Add this YouTube video to knowii: https://youtube.com/watch?v=abc123"

Skill Actions:
1. Extract video ID: "abc123"
2. Confirm product: "knowii"
3. Default to "cover" group for videos (never use "banner" for videos)
4. Ask for title, description, alt text
5. Generate thumbnail URL
6. Add via CLI: bun run update:products -- --operation media:add --id knowii --media-type video --media-url "https://youtube.com/watch?v=abc123" --media-title "Product Demo" --media-altText "Knowii product demonstration video" --media-group cover --media-order 0 --media-youtubeId "abc123"
7. Validate
8. Show summary
```

### Example 2: Add Screenshots from Folder

```
User: "Add all screenshots from /assets/images/knowii to the product"

Skill Actions:
1. Use Glob to find images: /assets/images/knowii/**/*.{png,jpg,jpeg,webp}
2. Show found files (e.g., 5 images)
3. Ask which product (suggest "knowii" based on path)
4. Ask for media group (suggest "main" for screenshots)
5. Ask for ordering preference
6. For each image:
   a. Extract filename-based title
   b. Generate alt text
   c. Get dimensions
   d. Decide if optimization needed
   e. If yes: optimize, rename, move to proper location
   f. Add via CLI
7. Validate all
8. Show summary with file paths
```

### Example 3: Optimize and Add Cover Image

```
User: "Optimize and add this as cover image for knowii: /tmp/cover.png"

Skill Actions:
1. Confirm product: "knowii"
2. Confirm media group: "cover"
3. Ask for title/alt text
4. Check current image dimensions
5. Optimize:
   - Resize to 800x450 (16:9)
   - Convert to WebP
   - Strip metadata
   - Quality 85
6. Generate filename: knowii-media-cover-0.webp
7. Move to: /assets/images/knowii/knowii-media-cover-0.webp
8. Get final dimensions
9. Add via CLI with all metadata
10. Validate
11. Show summary with before/after file sizes
```

### Example 4: Auto-Discover from Product Page

```
User: "Find and add media from https://example.com/products/knowii"

Skill Actions:
1. Use WebFetch to fetch page
2. Extract:
   - og:image meta tags
   - img src attributes
   - YouTube embeds
   - picture elements
3. Show found media (e.g., 3 images, 1 video)
4. Ask which ones to add
5. For each selected:
   a. Ask for media group
   b. Generate title/alt text from context
   c. Process (download, optimize if image)
   d. Add via CLI
6. Validate
7. Show summary
```

## Implementation Notes

### Image Optimization Script

A reusable image optimization utility exists at `scripts/utils/optimize-images.ts`.

**CLI Usage:**
```bash
# Show help
bun run optimize:images --help

# Optimize single image
bun run optimize:images image.png

# Optimize with custom output path
bun run optimize:images image.png --output optimized/image.webp

# Optimize entire folder
bun run optimize:images ./images/ --output ./optimized/

# Optimize in place (replaces originals)
bun run optimize:images ./images/ --in-place

# Custom settings
bun run optimize:images image.png --max-width 800 --quality 90 --keep-format
```

**Programmatic Usage (import as module):**
```typescript
import {
  optimizeImage,
  optimizeDirectory,
  optimizeInPlace,
  getImageDimensions,
  formatFileSize
} from './scripts/utils/optimize-images';

// Optimize single image
const result = await optimizeImage('input.png', 'output.webp', {
  maxWidth: 1600,
  maxHeight: 1200,
  quality: 85,
  format: 'webp'
});

console.log(`Saved ${result.savingsPercent}%`);
console.log(`Dimensions: ${result.width}x${result.height}`);

// Optimize entire directory
const results = await optimizeDirectory('./input/', './output/', {
  maxWidth: 1600,
  quality: 85
});

// Get dimensions only
const { width, height } = await getImageDimensions('image.webp');
```

### CLI Parameter Building

Helper function to build CLI command:

```typescript
function buildMediaAddCommand(params: {
  productId: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  altText: string;
  group: 'cover' | 'banner' | 'main' | 'secondary' | 'bonus';
  order: number;
  description?: string;
  caption?: string;
  width?: number;
  height?: number;
  youtubeId?: string;
}): string {
  const args = [
    'bun run update:products --',
    '--operation media:add',
    `--id "${params.productId}"`,
    `--media-type "${params.type}"`,
    `--media-url "${params.url}"`,
    `--media-title "${params.title}"`,
    `--media-altText "${params.altText}"`,
    `--media-group "${params.group}"`,
    `--media-order ${params.order}`
  ];

  if (params.description) args.push(`--media-description "${params.description}"`);
  if (params.caption) args.push(`--media-caption "${params.caption}"`);
  if (params.width) args.push(`--media-width ${params.width}`);
  if (params.height) args.push(`--media-height ${params.height}`);
  if (params.youtubeId) args.push(`--media-youtubeId "${params.youtubeId}"`);

  return args.join(' \\\n  ');
}
```

### YouTube ID Extraction

```typescript
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}
```

### Filename Sanitization

```typescript
function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9-_.]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function toTitleCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

## Best Practices

1. **Always validate** after adding media
2. **Optimize images** before adding (WebP preferred)
3. **Use descriptive titles** and alt text for accessibility
4. **Follow naming conventions**: `{product-id}-media-{group}-{order}.{ext}`
5. **Respect aspect ratios**: 16:9 for cover, flexible for others
6. **Keep file sizes small**: Compress, resize, strip metadata
7. **Use intelligent defaults**: Infer from filenames, context
8. **Batch operations**: Group similar items, show progress
9. **Error recovery**: Graceful fallbacks, helpful error messages
10. **Summary reports**: Show what was done, file locations

## Dependencies

This skill requires:
- `bun` runtime (for CLI and scripts)
- `imagemagick` (for image optimization via `scripts/utils/optimize-images.ts`)
- `update-products` CLI tool (project-specific)
- Access to `public/assets/images/products/` directory
- Access to `src/data/products/` directory

## Testing

Before using this skill, verify:

```bash
# Check optimization script works
bun run optimize:images --help

# Check ImageMagick is available
which magick

# Check folder permissions
ls -la public/assets/images/products/
ls -la src/data/products/
```

## Troubleshooting

### ImageMagick Not Available

If imagemagick is not installed:
```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick

# Fedora
sudo dnf install imagemagick

# Arch Linux
sudo pacman -S imagemagick
```

### Permission Denied

If file operations fail:
```bash
# Check permissions
ls -la public/assets/images/products/
ls -la src/data/products/

# Fix if needed
chmod -R u+w public/assets/images/products/
chmod -R u+w src/data/products/
```

---

**Remember**: This skill is designed to be invoked automatically when users mention media-related keywords. Follow the workflow steps carefully, use AskUserQuestion for metadata collection, and always validate after making changes.