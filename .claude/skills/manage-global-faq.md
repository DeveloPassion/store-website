---
skill: manage-global-faq
description: Manage global FAQ entries for the FAQ page with schema validation
triggerKeywords: [faq, global faq, add faq, edit faq, remove faq, faq-global.json, validate faq, faq questions]
---

# Global FAQ Management Skill

This skill helps you manage the global FAQ entries displayed on the `/faq` page. FAQs are stored in `src/data/faq-global.json` and validated against the Zod schema.

## File Locations

- **Data File**: `src/data/faq-global.json` (source of truth)
- **Zod Schema**: `src/schemas/global-faq.schema.ts` (validation)
- **Schema Tests**: `src/schemas/global-faq.schema.spec.ts`
- **Validation Script**: `scripts/validate-global-faq.ts`
- **FAQ Page**: `src/pages/faq.tsx`

## Schema Documentation

### GlobalFAQ Structure

```typescript
{
    id: string               // required, unique identifier (kebab-case)
    question: string         // required, the FAQ question
    answer: string           // required, the main answer text
    icon: string | null      // nullable - emoji, React icon name, or image URL
    order: number            // required, display order (0-based, lower = first)
    style: 'default' | 'highlight'  // visual style
    features: Feature[] | null      // sub-items with icons (for complex answers)
    steps: Step[] | null            // ordered steps (for process explanations)
    bullets: string[] | null        // bullet point list
    links: Link[] | null            // call-to-action links
    additionalText: string | null   // extra text after main content
}
```

### Icon Field

The `icon` field supports multiple formats (rendered via `DynamicIcon` component):
- **Emojis**: `"🛒"`, `"🔒"`, `"🌐"`
- **React Icons**: `"FaShoppingCart"`, `"FaLock"`, `"FaGlobe"`
- **Image URLs**: `"https://example.com/icon.png"`
- **Local paths**: `"/assets/images/icon.png"`

### Feature Sub-Items

For complex answers with multiple sub-points (like "Why do we use Gumroad?"):

```json
{
    "features": [
        {
            "icon": "FaLock",
            "title": "Bank-Level Security",
            "description": "Your data is protected with industry-leading standards."
        },
        {
            "icon": "FaCreditCard",
            "title": "Secure Payments",
            "description": "Processed through Stripe and PayPal."
        }
    ]
}
```

### Ordered Steps

For process explanations (like "How does shopping work?"):

```json
{
    "steps": [
        {
            "title": "Browse products",
            "description": "on this website and click 'Quick Open'"
        },
        {
            "title": "Click 'Buy Now'",
            "description": "to add items to your cart"
        }
    ]
}
```

### Bullet Points

For simple lists:

```json
{
    "bullets": [
        "256-bit SSL encryption",
        "PCI DSS Level 1 compliance",
        "Two-factor authentication support"
    ]
}
```

### Links

For call-to-action buttons:

```json
{
    "links": [
        {
            "label": "Contact Me",
            "url": "mailto:sebastien@developassion.be",
            "external": false,
            "primary": true
        },
        {
            "label": "Gumroad Help",
            "url": "https://help.gumroad.com",
            "external": true,
            "primary": false
        }
    ]
}
```

### Style Options

- `"default"`: Standard bordered card
- `"highlight"`: Background-highlighted card (use for important FAQs like refund policy)

## Complete FAQ Example

```json
{
    "id": "payment-security",
    "question": "Is my payment information secure?",
    "answer": "Absolutely. Your payment information is handled exclusively by trusted platforms:",
    "icon": "FaLock",
    "order": 3,
    "style": "default",
    "features": null,
    "steps": null,
    "bullets": [
        "256-bit SSL encryption for all data",
        "PCI DSS Level 1 compliance",
        "Tokenization to protect card numbers"
    ],
    "links": null,
    "additionalText": null
}
```

## Workflow

### Adding a New FAQ

1. **Edit the data file** at `src/data/faq-global.json`
2. **Add a new FAQ object** to the `data` array:

```json
{
    "id": "new-faq-id",
    "question": "Your question here?",
    "answer": "Your answer here.",
    "icon": "FaQuestionCircle",
    "order": 8,
    "style": "default",
    "features": null,
    "steps": null,
    "bullets": null,
    "links": null,
    "additionalText": null
}
```

3. **Validate** with `bun run validate:global-faq`
4. **Test locally** with `bun dev` and visit `/faq`

### Modifying an Existing FAQ

1. **Open** `src/data/faq-global.json`
2. **Find the FAQ** by its `id`
3. **Update the fields** as needed
4. **Validate** with `bun run validate:global-faq`

### Removing an FAQ

1. **Open** `src/data/faq-global.json`
2. **Remove the FAQ object** from the `data` array
3. **Update order values** if needed (optional, for clean ordering)
4. **Validate** with `bun run validate:global-faq`

### Reordering FAQs

FAQs are displayed sorted by the `order` field (ascending). To reorder:

1. **Change the `order` values** of affected FAQs
2. **Validate** with `bun run validate:global-faq`

## Commands

### Validate Global FAQ

```bash
bun run validate:global-faq
```

Validates:
- All FAQs against the Zod schema
- Required fields (id, question, answer)
- Valid order values (non-negative integers)
- Valid style enum values
- Valid sub-schema structures (features, steps, links)

Outputs:
- Summary with total count and breakdown by style
- Content breakdown (with icon, features, steps, bullets, links)
- List of all FAQ entries sorted by order

### Validate All

```bash
bun run validate:all
```

Validates global FAQ along with all other data files.

## Current FAQ Entries

The global FAQ currently contains 9 entries:

| Order | ID | Question | Style |
|-------|-----|----------|-------|
| 0 | cart-new-tab | Why does the shopping cart open in a new tab? | default |
| 1 | why-gumroad | Why do we use Gumroad? | default |
| 2 | how-shopping-works | How does shopping work? | default |
| 3 | payment-security | Is my payment information secure? | default |
| 4 | gumroad-account | Do I need a Gumroad account? | default |
| 5 | ratings-testimonials | Why do ratings and testimonials differ from Gumroad? | default |
| 6 | refunds-guarantees | What about refunds and guarantees? | highlight |
| 7 | mistake-purchase | What if I bought something by mistake? | default |
| 8 | student-discount | I'm a student with limited financial means... | default |

**Note**: The "Still have questions?" section is a static element in `faq.tsx`, not part of the JSON data. It always appears last with contact links.

## Writing Style

See [documentation/writing-style.md](/documentation/writing-style.md) for FAQ writing guidelines.

## Content Type Guidelines

Choose the right content type based on the answer structure:

| Answer Type | Use |
|-------------|-----|
| Simple text | Just `answer` field |
| List of points | `bullets` array |
| Sub-items with details | `features` array (with icon, title, description) |
| Ordered process | `steps` array (with title, description) |
| Call-to-action | `links` array |
| Extra context | `additionalText` field |

You can combine multiple content types in a single FAQ (e.g., `answer` + `bullets` + `additionalText`).

## Validation Rules

The schema enforces:

- **id**: Required, non-empty string
- **question**: Required, non-empty, no whitespace-only
- **answer**: Required, non-empty, no whitespace-only
- **icon**: Nullable string (emoji, React icon name, or URL)
- **order**: Non-negative integer (default: 0)
- **style**: Must be `"default"` or `"highlight"` (default: `"default"`)
- **features**: Nullable array, each item needs icon, title, description
- **steps**: Nullable array, each item needs title, description
- **bullets**: Nullable array of non-empty strings
- **links**: Nullable array, each item needs label, url (external/primary default to false)
- **additionalText**: Nullable string

## Error Messages

Common validation errors:

```
❌ data.0.question: Question cannot be only whitespace
❌ data.1.style: Invalid enum value. Expected 'default' | 'highlight'
❌ data.2.order: Number must be greater than or equal to 0
❌ data.3.features.0.icon: Feature icon is required
❌ data.4.bullets.1: String must contain at least 1 character(s)
```

## Schema Updates

When updating the global FAQ schema:

1. Update `src/schemas/global-faq.schema.ts` (Zod schema)
2. Update tests in `src/schemas/global-faq.schema.spec.ts`
3. Update this skill documentation
4. Run `bun run validate:global-faq` on existing data
5. Fix any validation errors in `faq-global.json`

## Integration

The FAQ page (`src/pages/faq.tsx`):
- Imports data from `faq-global.json`
- Sorts FAQs by `order` field
- Renders dynamic FAQs using `FAQItem` component
- Uses `DynamicIcon` for icon rendering (supports emojis and React icons)
- Applies different styles based on `style` field
- Renders a static "Still have questions?" section at the end (hardcoded in `faq.tsx`)

**Static Elements**: The "Still have questions?" section with contact links is hardcoded in `faq.tsx` and always appears after all dynamic FAQ entries. To modify it, edit the component directly.

The FAQ link appears in:
- Header hamburger menu (before "Official Website")
