# Store Website - Implementation Rules

**Last Updated**: 2026-01-13

## Critical Rules

### Pricing Currency Consistency

**Rule**: All prices MUST be displayed in EUR (€) as that's the Gumroad default. Gumroad handles automatic currency conversion.

**Implementation**:

- Display: `€49.99` (not $49.99)
- Data format: Store as number (49.99) + currency code ('EUR')
- Never hardcode $ unless explicitly a USD-only product

**Verification**: Double-check each product's actual Gumroad price before finalizing sales copy.

---

### Asset Organization

**Rule**: All product assets must be organized by product ID.

**Structure**:

```
public/assets/products
├── obsidian-starter-kit/     # Use ID (readable)
│   ├── ...
├── knowii-voice-ai/           # Use ID (readable)
│   ├── ...
└── [product-id]/
```

### Brand Consistency

**Rule**: Respect the styling rules below.

**Colors** (from tools-website):

- Background: `#37404c` (dark blue-gray)
- Primary: `#ffffff` (white text)
- Secondary: `#e5007d` (pink accent for CTAs)
- Secondary Text: `#ff1493` (deep pink)

**Fonts**:

- Sans: `'Noto Sans', sans-serif`

**DO NOT**: Create new color schemes or fonts.
