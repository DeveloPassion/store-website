---
skill: add-icons-to-taxonomy
description: Automatically add relevant icons and colors to tags or categories using generic icons
tags: [automation, taxonomy, icons, maintenance]
---

# Add Icons to Taxonomy Skill

This skill helps you automatically identify and update tags or categories that are using generic icons (like `FaTag`) with more relevant, distinctive icons and colors.

## When to Use This Skill

Use this skill when:
- Tags or categories are displaying generic icons (`FaTag`)
- You want to improve visual distinction between taxonomy items
- You need to bulk-update icons after adding new tags/categories
- You want to ensure all taxonomy items have meaningful visual representation

## Skill Behavior

This skill will:

1. **Scan** the tags.json or categories.json file for items using generic icons
2. **Analyze** each item's name and description to suggest appropriate icons
3. **Recommend** both an icon (from available react-icons) and a color
4. **Apply** the updates using the respective CLI tools (update-tags.ts or update-categories.ts)

## Available Icons

The skill can choose from the following icons (from `src/lib/icon-registry.ts`):

### General Purpose Icons
- `FaLightbulb` - Ideas, clarity, concepts, insights
- `FaRocket` - Launch, getting started, growth
- `FaStar` - Featured, important, goals, values
- `FaGift` - Free resources, bonuses, bundles

### Knowledge & Learning
- `FaBrain` - Knowledge, intelligence, PKM
- `FaBook` - Learning, reading, guides
- `FaBookOpen` - Note-taking, open knowledge
- `FaGraduationCap` - Courses, education, beginners
- `FaFileAlt` - Documents, templates, files
- `FaDatabase` - Storage, systems, organization

### Work & Productivity
- `FaCheckSquare` - Tasks, checklists, GTD
- `FaCalendarAlt` - Scheduling, habits, routines
- `FaTools` - Tools, utilities
- `FaWrench` - Automation, systems, fixing
- `FaTerminal` - CLI, technical, development
- `FaCode` - Programming, development

### Communication & Content
- `FaPen` - Writing, journaling, editing
- `FaNewspaper` - Content, publishing, articles
- `FaMicrophone` - Voice, audio, podcasts
- `FaVideo` - Video content, courses

### People & Community
- `FaUsers` - Community, teams, collaboration
- `FaUser` - Personal, individual, profile
- `FaChalkboardTeacher` - Teaching, coaching, mentoring
- `FaHandshake` - Partnership, collaboration

### Technology & AI
- `FaRobot` - AI, automation, assistants
- `FaGlobe` - Web, online, global

### Organization & Structure
- `FaBoxOpen` - Bundles, packages, kits
- `FaStickyNote` - Notes, quick capture
- `FaStore` - Shop, products

### Platform-Specific
- `SiObsidian` - Obsidian app
- `SiNotion` - Notion app
- `SiTrello` - Trello app
- `SiAngular` - Angular framework

## Color Palette

The skill uses a vibrant, accessible color palette:

- **Purple shades**: `#8B5CF6`, `#A855F7`, `#7C3AED` - AI, intelligence, premium
- **Blue shades**: `#3B82F6`, `#06B6D4`, `#6366F1` - Trust, learning, systems
- **Green shades**: `#10B981`, `#14B8A6`, `#6BCB77` - Growth, success, natural
- **Yellow/Orange shades**: `#F59E0B`, `#FBBF24`, `#EAB308`, `#F7B801` - Energy, ideas, highlights
- **Red/Pink shades**: `#EC4899`, `#F38181`, `#FF6B6B` - Passion, important, creative

## Process

### Step 1: Identify Generic Icons

```bash
# For tags
npm run update:tags -- --operation list

# For categories
npm run update:categories -- --operation list
```

Look for items with:
- `icon: "FaTag"` (tags)
- `color: "#999999"` (generic gray)

### Step 2: Analyze and Match

For each item with a generic icon:

1. **Read the name and description**
2. **Identify key concepts** (e.g., "AI", "writing", "learning")
3. **Match to appropriate icon** based on concept
4. **Choose contrasting color** to ensure visual distinction

### Step 3: Apply Updates

Use the CLI tools to update each item:

```bash
# Update a tag
npm run update:tags -- --operation modify --id "tag-id" --icon "IconName" --color "#HEX"

# Update a category
npm run update:categories -- --operation modify --id "category-id" --icon "IconName" --color "#HEX"
```

## Icon Selection Guidelines

### Matching Rules

1. **Direct Match**: If the name contains a keyword, use its specific icon
   - "AI" → `FaRobot`
   - "Writing" → `FaPen`
   - "Learning" → `FaBook`

2. **Conceptual Match**: Match based on the concept
   - "Clarity" → `FaLightbulb` (idea/insight)
   - "Community" → `FaUsers` (people)
   - "Automation" → `FaWrench` (tools/systems)

3. **Category Match**: Match based on category type
   - Courses → `FaGraduationCap`
   - Tools → `FaTools`
   - Templates → `FaFileAlt`

4. **Fallback**: If unclear, use a general purpose icon
   - Organization topics → `FaCheckSquare` or `FaDatabase`
   - Personal development → `FaStar` or `FaLightbulb`
   - Technical topics → `FaCode` or `FaTerminal`

### Color Selection Guidelines

1. **Avoid Duplicates**: Don't reuse the exact same color for nearby items
2. **Group by Theme**: Use similar hues for related concepts
   - AI/Tech topics: Purple/Blue range
   - Learning/Growth: Green/Blue range
   - Creative/Content: Pink/Orange range
3. **High Contrast**: Ensure colors work against the background
4. **Accessibility**: Use vibrant colors that are distinguishable

## Example Workflow

```bash
# Step 1: List all tags to find generic ones
npm run update:tags -- --operation list | grep "FaTag"

# Step 2: Update each one with appropriate icon and color
npm run update:tags -- --operation modify --id "ai-prompts" --icon "FaLightbulb" --color "#EC4899"
npm run update:tags -- --operation modify --id "automation" --icon "FaWrench" --color "#F59E0B"
npm run update:tags -- --operation modify --id "beginners" --icon "FaGraduationCap" --color "#10B981"

# Step 3: Validate the changes
npm run validate:tags
```

## Bulk Update Script Pattern

For updating many items at once, create a temporary bash script:

```bash
#!/bin/bash
# Bulk update taxonomy icons

npm run update:tags -- --operation modify --id "item-1" --icon "IconName" --color "#HEX"
npm run update:tags -- --operation modify --id "item-2" --icon "IconName" --color "#HEX"
# ... more updates ...

echo "✅ All items updated!"
```

Make it executable and run:
```bash
chmod +x update-icons.sh
./update-icons.sh
rm update-icons.sh
```

## Icon Mapping Reference

Common tag/category names and their recommended icons:

| Name/Keyword | Icon | Color | Notes |
|--------------|------|-------|-------|
| AI, Artificial Intelligence | `FaRobot` | `#8B5CF6` | Technology/Intelligence |
| Prompts, Prompt Engineering | `FaLightbulb` | `#EC4899` | Ideas/Creativity |
| Writing, Ghostwriting | `FaPen` | `#EC4899` | Content creation |
| Learning, Education | `FaBook` | `#3B82F6` | Knowledge acquisition |
| Courses, Training | `FaGraduationCap` | `#3B82F6` | Structured learning |
| Templates | `FaFileAlt` | `#4ECDC4` | Ready-to-use resources |
| Tools, Utilities | `FaTools` | `#3B82F6` | Practical applications |
| Automation, Systems | `FaWrench` | `#F59E0B` | Mechanical/automated |
| Community, Social | `FaUsers` | `#14B8A6` | People/groups |
| Goals, Values | `FaStar` | `#FBBF24` | Important/aspirational |
| Checklists, Tasks | `FaCheckSquare` | `#06B6D4` | Action items |
| Habits, Routines | `FaCalendarAlt` | `#06B6D4` | Time-based |
| Coaching, Teaching | `FaChalkboardTeacher` | `#8B5CF6` | Instruction/guidance |
| Bundles, Packages | `FaBoxOpen` | `#3B82F6` | Combined offerings |
| Free, Gifts | `FaGift` | `#10B981` | No-cost items |
| Getting Started, Launch | `FaRocket` | `#3B82F6` | Beginning/momentum |
| Knowledge, PKM | `FaBrain` | `#6BCB77` | Mental/cognitive |
| Notes, Note-taking | `FaBookOpen` | `#F38181` | Active documentation |
| Programming, Code | `FaCode` | `#8B5CF6` | Development |
| Voice, Speech | `FaMicrophone` | `#EC4899` | Audio/vocal |
| Database, Storage | `FaDatabase` | `#8B5CF6` | Data/organization |
| Productivity | `FaRocket` | `#F7B801` | Efficiency |
| Clarity, Ideas | `FaLightbulb` | `#FBBF24` | Insight/understanding |

## Validation

After updating icons, always validate:

```bash
# Validate tags
npm run validate:tags

# Validate categories
npm run validate:categories

# Validate all
npm run validate:all
```

## Tips

1. **Batch Similar Items**: Update related items together for consistency
2. **Preview First**: Check available icons in `src/lib/icon-registry.ts` before assigning
3. **Test Visually**: View the tags/categories page to ensure icons look good
4. **Document Decisions**: Keep notes on why certain icons were chosen for future reference
5. **Color Harmony**: Use a color palette tool to ensure good combinations

## Common Patterns

### AI & Technology Tags
- Base icon: `FaRobot`, `FaBrain`, `FaCode`
- Color range: Purple (`#8B5CF6` to `#A855F7`)

### Learning & Education Tags
- Base icon: `FaBook`, `FaGraduationCap`, `FaBookOpen`
- Color range: Blue (`#3B82F6` to `#06B6D4`)

### Personal Development Tags
- Base icon: `FaStar`, `FaLightbulb`, `FaUser`
- Color range: Yellow/Orange (`#F59E0B` to `#FBBF24`)

### Organization Tags
- Base icon: `FaCheckSquare`, `FaDatabase`, `FaCalendarAlt`
- Color range: Teal/Cyan (`#14B8A6` to `#06B6D4`)

### Content Creation Tags
- Base icon: `FaPen`, `FaNewspaper`, `FaMicrophone`
- Color range: Pink/Red (`#EC4899` to `#F38181`)

## Troubleshooting

**Problem**: Icon not displaying
- **Solution**: Verify icon name exists in `src/lib/icon-registry.ts`

**Problem**: Color looks wrong
- **Solution**: Ensure hex color format `#RRGGBB` (6 digits)

**Problem**: Update fails validation
- **Solution**: Check that icon name exactly matches registry (case-sensitive)

**Problem**: Too many similar colors
- **Solution**: Spread colors across spectrum, use color wheel for complementary colors

## Related Files

- `/src/data/tags.json` - Tag definitions
- `/src/data/categories.json` - Category definitions
- `/src/lib/icon-registry.ts` - Available icons
- `/src/components/tags/tag-card.tsx` - Tag card component
- `/src/components/categories/category-card.tsx` - Category card component
- `/scripts/update-tags.ts` - Tag update CLI
- `/scripts/update-categories.ts` - Category update CLI
