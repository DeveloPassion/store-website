# Store Website - Implementation Rules

**Last Updated**: 2026-01-05

## Critical Rules

### 1. Gumroad URL Preservation (HIGHEST PRIORITY)
**Rule**: All product permalinks MUST exactly match current Gumroad URLs for backward compatibility.

**Rationale**: Existing links from newsletters, social media, articles, and external sites point to Gumroad URLs. Breaking these would lose traffic and sales.

**Implementation**:
- **Product ID**: Human-readable slug (e.g., `obsidian-starter-kit`)
- **Permalink**: Exact Gumroad short code (e.g., `mghmmj`)
- **URL Structure**: `/l/{permalink}` where permalink is the Gumroad code
- **Example**:
  - ID: `obsidian-starter-kit`
  - Permalink: `mghmmj`
  - URL: `https://store.dsebastien.net/l/mghmmj`
  - Maps to: `https://www.store.dsebastien.net/l/mghmmj` (current Gumroad)

**Permalink Mapping** (ID → Gumroad Code):
```typescript
const PERMALINK_MAP = {
  'obsidian-starter-kit': 'mghmmj',
  'knowii-voice-ai': 'tbdlrt',
  'obsidian-starter-course': 'nolle',
  'knowledge-worker-kit': 'pyjrr',
  'knowledge-management-for-beginners': 'wazqkq',
  'knowii-complete-system': 'xjpgo',
  'journaling-deep-dive': 'cdwol',
  'personal-organization-101': 'zyuwjd',
  'clarity-101': 'uysik',
  'it-concepts-wall': 'mwdbm',
  'dev-concepts-starter-bundle': 'AwJYP',
  'dev-concepts-volume-1': 'lnPaD',
  'dev-concepts-volume-2': 'aQRvz',
  'ai-ghostwriter-guide': 'vsrnk',
  'ai-master-prompt': 'pabtlh',
  'mcp-guide': 'ilwexl',
  'pkm-coaching': 'mwldmd',
  'knowledge-system-checklist': 'qctpj',
  'beginners-guide-to-obsidian': 'imkjic',
  'buy-me-coffee': 'cbqxvp',
  'everything-knowledge-bundle': 'lbocum'
}
```

**Testing Requirement**: Before launch, manually verify ALL 21 URLs work and match Gumroad.

---

### 2. Pricing Currency Consistency
**Rule**: All prices MUST be displayed in EUR (€) as that's the Gumroad default. Gumroad handles automatic currency conversion.

**Implementation**:
- Display: `€49.99` (not $49.99)
- Data format: Store as number (49.99) + currency code ('EUR')
- Never hardcode $ unless explicitly a USD-only product

**Verification**: Double-check each product's actual Gumroad price before finalizing sales copy.

---

### 3. Asset Organization
**Rule**: All product assets must be organized by product ID, not permalink.

**Structure**:
```
documentation/assets/
├── obsidian-starter-kit/     # Use ID (readable)
│   ├── cover.png
│   └── screenshots/
├── knowii-voice-ai/           # Use ID (readable)
│   ├── logo.svg
│   └── screenshots/
└── [product-id]/
```

**Rationale**: IDs are human-readable. Permalinks are obfuscated codes for URLs only.

---

### 4. Sales Copy File Naming
**Rule**: Sales copy files use product ID with prefix.

**Format**: `product-sales-copy-{product-id}.md`

**Examples**:
- `product-sales-copy-obsidian-starter-kit.md` ✅
- `product-sales-copy-mghmmj.md` ❌ (don't use permalink)

---

### 5. Product Data Schema Consistency
**Rule**: Every product MUST have both ID and permalink fields.

**Required Fields**:
```typescript
{
  id: string,              // Human-readable: 'obsidian-starter-kit'
  permalink: string,       // Gumroad code: 'mghmmj'
  name: string,
  price: number,
  priceDisplay: string,
  gumroadUrl: string,
  // ... rest of schema
}
```

**Relationship**: `gumroadUrl = "https://www.store.dsebastien.net/l/" + permalink`

---

### 6. Cross-Sell Product References
**Rule**: When referencing other products in cross-sells, use product NAME for display, but link via permalink.

**Example**:
```markdown
### Knowledge Management for Beginners
Master the complete PKM methodology.
**€69.99** - [View Course →](/l/wazqkq)
```

**Never**: Link to `/l/knowledge-management-for-beginners` (doesn't exist, use permalink)

---

### 7. SEO Metadata
**Rule**: Use human-readable product names in SEO, not permalinks.

**Example**:
- **Meta Title**: "Obsidian Starter Kit - Transform Chaos Into Clarity" ✅
- **Meta Title**: "mghmmj - Product Page" ❌
- **URL Slug**: `/l/mghmmj` (for compatibility)
- **Canonical**: `https://store.dsebastien.net/l/mghmmj`

---

### 8. Static Generation Routes
**Rule**: Generate static pages using permalink, not ID.

**File Output**:
```
dist/
├── l/
│   ├── mghmmj/index.html              # OSK (use permalink)
│   ├── tbdlrt/index.html              # Voice AI
│   └── [permalink]/index.html
```

**Routing Logic**:
```typescript
// In React Router
<Route path="/l/:permalink" element={<ProductDetailPage />} />

// In component
const { permalink } = useParams()
const product = products.find(p => p.permalink === permalink)
```

---

### 9. Gumroad Overlay Integration
**Rule**: Use full Gumroad URL with overlay attributes.

**Implementation**:
```tsx
<a
  href={product.gumroadUrl}
  className="gumroad-button"
  data-gumroad-single-product="true"
  data-gumroad-overlay="true"
>
  {ctaText}
</a>

// Include in index.html:
<script src="https://gumroad.com/js/gumroad.js"></script>
```

---

### 10. Brand Consistency
**Rule**: Store website MUST use identical styling to tools-website.

**Colors** (from tools-website):
- Background: `#37404c` (dark blue-gray)
- Primary: `#ffffff` (white text)
- Secondary: `#e5007d` (pink accent for CTAs)
- Secondary Text: `#ff1493` (deep pink)

**Fonts**:
- Sans: `'Noto Sans', sans-serif`

**DO NOT**: Create new color schemes or fonts. Clone tools-website aesthetic exactly.

---

## Validation Checklist

Before deploying any product page:
- [ ] Permalink matches exact Gumroad URL
- [ ] Price is in EUR (€) and matches Gumroad
- [ ] Assets are in `assets/{product-id}/` folder
- [ ] Sales copy file is `product-sales-copy-{product-id}.md`
- [ ] Gumroad overlay script included
- [ ] All cross-sell links use permalinks, not IDs
- [ ] Meta tags use product name, not permalink
- [ ] Static page generated at `/l/{permalink}/index.html`
- [ ] Styling matches tools-website colors
- [ ] Mobile responsive (test on real device)

---

## Common Mistakes to Avoid

❌ **Using ID in URLs**: `/l/obsidian-starter-kit` (breaks Gumroad compatibility)
✅ **Using permalink in URLs**: `/l/mghmmj`

❌ **Hardcoding $USD**: `$49.99`
✅ **Using EUR**: `€49.99`

❌ **Permalink in asset folders**: `assets/mghmmj/`
✅ **ID in asset folders**: `assets/obsidian-starter-kit/`

❌ **Mixing currencies**: One product in $, another in €
✅ **Consistent EUR**: All products in €

❌ **Breaking links**: Changing permalinks after launch
✅ **Never change permalinks**: They're permanent for backward compatibility

---

## Emergency Permalink Changes

**If you MUST change a permalink** (avoid at all costs):
1. Add 301 redirect from old permalink to new
2. Update all internal cross-sell links
3. Notify via newsletter/social about URL change
4. Keep redirect in place permanently (never remove)

**Better approach**: Never change permalinks. They're locked once set.
