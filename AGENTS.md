# AGENTS.md - Store Website Maintenance Guide

This document provides instructions for AI agents and developers on how to maintain and extend this store website.

## Project Overview

This is a static website built with:

- **React 19+** with TypeScript
- **Vite** for building and development
- **Tailwind CSS v4** for styling
- **React Router** for client-side routing (HashRouter for GitHub Pages compatibility)
- **React Icons** for iconography

The website is the store of dSebastien:

- Showcasing products, tools, courses, etc with the sales copy
- Providing easy ways to explore those
- Category and tag filtering
- Command palette (press `/` or `Ctrl+K`)
- Fully responsive design
- ...

## Project Structure

TODO document

## Icons

Tools can have custom icons specified via the `icon` field. The icon can be:

1. **React-icon name** - A component name from `react-icons` library (e.g., `"FaCalendarAlt"`, `"SiObsidian"`)
2. **URL** - An absolute URL or path to an image (e.g., `"https://example.com/icon.svg"` or `"/assets/images/icon.png"`)

### Available React Icons

**Font Awesome (Fa\*):**

- `FaCalendarAlt` - Calendar
- `FaMicrophone` - Microphone
- `FaGhost` - Ghost
- `FaYoutube` - YouTube
- `FaTerminal` - Terminal/CLI
- `FaLightbulb` - Lightbulb/Ideas
- `FaTools` - Tools
- `FaRobot` - Robot/AI
- `FaCode` - Code
- `FaGlobe` - Globe/Web
- `FaWrench` - Wrench
- `FaVideo` - Video
- `FaGraduationCap` - Graduation Cap/Courses
- `FaBook` - Book
- `FaBookOpen` - Open Book/Library
- `FaDatabase` - Database
- `FaNewspaper` - Newspaper/Publications
- `FaUsers` - Users/Community
- `FaFileAlt` - File/Document
- `FaBrain` - Brain/Knowledge
- `FaPen` - Pen/Writing
- `FaChalkboardTeacher` - Teacher/Coaching
- `FaBoxOpen` - Box/Bundle
- `FaCheckSquare` - Checkbox/Checklist
- `FaReddit` - Reddit

**Simple Icons (Si\*):**

- `SiObsidian` - Obsidian logo
- `SiAngular` - Angular logo
- `SiNotion` - Notion logo
- `SiTrello` - Trello logo

To add more icons, import them in `/src/components/tools/tool-icon.tsx` and add them to the `iconMap` object.

### Fallback Behavior

If no `icon` is specified or the icon name is not found, the component falls back to category-based emojis.

## Styling

The website uses Tailwind CSS v4 with custom theme variables defined in `/src/styles/index.css`:

```css
@theme {
    --color-primary: #ffffff; /* Main text color */
    --color-secondary: #e5007d; /* Accent color (pink) */
    --color-secondary-text: #ff1493; /* Hover text color */
    --color-background: #37404c; /* Background color */
}
```

## Managing Products

Products are managed in `/src/data/products.json` and have their own validation system.

### Product Management Workflow

1. **Edit products.json** - Add or modify product entries
2. **Validate changes** - Run `npm run validate:products`
3. **Fix errors** - Address any validation issues reported
4. **Repeat** until validation passes

### Claude Code Skill

A dedicated Claude Code skill is available at `.claude/skills/manage-products.md` that provides:

- Complete schema documentation for all product fields
- Validation workflow guidance
- Priority guidelines for product ordering
- Examples and common tasks

To use the skill in Claude Code, simply mention keywords like "product", "products.json", "add product", or "validate products" in your conversation.

### Product Schema

- **Schema Definition**: `src/schemas/product.schema.ts` (Zod schema - source of truth)
- **TypeScript Types**: `src/types/product.ts` (keep in sync with schema)
- **Validation Script**: `scripts/validate-products.ts`

The Zod schema validates:

- Required fields (id, name, pricing, marketing copy, features, etc.)
- Enum values (type, priceTier, categories, status)
- URL formats (gumroadUrl, videoUrl, etc.)
- Array constraints (minimum items, valid content)
- Data types and structure

### Adding a New Product

See the Claude Code skill documentation in `.claude/skills/manage-products.md` for detailed instructions, or simply invoke the skill when working with products.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run tsc

# Validate products.json
npm run validate:products
```

## Deployment

The website is automatically deployed to GitHub Pages when a new tag is pushed:

```bash
# Create and push a new release tag
npm run release
# Follow the prompts to enter a tag name (e.g., v1.0.0)
```

The deployment workflow is defined in `.github/workflows/deploy.yml`.

### Automated Changelog

The `CHANGELOG.md` file is **automatically generated** by the release script and does not need to be manually maintained. The changelog is generated from conventional commits using `npm run release:changelog`, which is called during the release process.

## Key Components

### ToolCard (`/src/components/tools/tool-card.tsx`)

Displays individual tool cards in both grid and list view modes.

### ToolsFilter (`/src/components/tools/tools-filter.tsx`)

Contains the search box, category tabs, and advanced filter options.

### CommandPalette (`/src/components/tools/command-palette.tsx`)

Global search/command palette accessible via `/` or `Ctrl+K`.

### ToolDetailModal (`/src/components/tools/tool-detail-modal.tsx`)

Modal showing detailed tool information when a card is clicked.

## Accessibility Features

- Full keyboard navigation support
- ARIA labels on interactive elements
- Focus management in modals
- Command palette with keyboard shortcuts
- Semantic HTML structure

## Best Practices for Contributions

1. **Keep descriptions concise** - 1-2 sentences max
2. **Use consistent labels** - Check existing labels before creating new ones
3. **Add meaningful technologies** - Only list primary/notable technologies
4. **Update status promptly** - Keep tool statuses accurate
5. **Validate products** - Always run `npm run validate:products` after editing products.json
6. **Test locally** - Run `npm run build` before committing
7. **Follow commit conventions** - Use conventional commits (feat, fix, docs, etc.)
8. **Don't edit CHANGELOG.md** - It's automatically generated during releases

## Troubleshooting

### Build fails with type errors

Run `npm run tsc` to see detailed TypeScript errors.

### Styles not updating

Tailwind CSS v4 uses JIT compilation. Try restarting the dev server.

### New tool not appearing

Verify the JSON is valid and the tool has all required fields. Check browser console for errors.

### Command palette not opening

Ensure you're not focused on an input field when pressing `/`.
