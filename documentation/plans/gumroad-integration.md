# Gumroad Integration Research & Plan

## Executive Summary

This document evaluates the feasibility of integrating Gumroad API data into the store website's product stats system. The primary use case is fetching ratings data, with potential expansion to sales metrics.

## Gumroad API Deep Dive

### Authentication

**OAuth 2.0 Access Token**

1. Log into Gumroad account
2. Navigate to Settings → Advanced
3. Create new application (provide name, icon, redirect URI)
4. Generate access token
5. Store securely (treat like password)

**Token Usage**: Include in request header for all API calls.

### Base Configuration

```
Base URL: https://api.gumroad.com/v2/
Content-Type: application/json
```

### Available Endpoints

#### Products (`/products`)

```
GET /v2/products
GET /v2/products/:id
POST /v2/products
PUT /v2/products/:id
DELETE /v2/products/:id
```

**Response Fields** (with `view_sales` scope):

- `id`, `name`, `preview_url`, `description`
- `custom_permalink`, `custom_receipt`
- `custom_summary`, `price`
- `currency`, `short_url`, `formatted_price`
- `published`, `shown_on_profile`
- `sales_count` - Total sales count
- `sales_usd_cents` - Total revenue in USD cents
- `variants`, `tags`

#### Sales (`/sales`)

```
GET /v2/sales
GET /v2/sales/:id
```

**Parameters**:

- `after` (date) - Filter sales after this date
- `before` (date) - Filter sales before this date
- `product_id` - Filter by product
- `email` - Filter by customer email
- `order_id` - Filter by order
- `page` - Pagination

**Response** (per sale):

- `id`, `email`, `seller_id`, `timestamp`
- `daystamp`, `created_at`
- `product_name`, `product_id`, `product_permalink`
- `price`, `price_formatted`, `gumroad_fee`
- `currency`, `quantity`, `discover_fee_charged`
- `can_contact`, `referrer`, `card`
- `order_number`, `sale_id`, `sale_timestamp`
- `is_preorder_authorization`, `subscription_id`
- **`rating`** (likely - based on CSV export having Rating column)

#### Subscribers (`/subscribers`)

```
GET /v2/subscribers
GET /v2/subscribers/:id
```

Useful for subscription products (e.g., Knowii).

#### Resource Subscriptions (Webhooks)

Subscribe to events:

- `sale` - New sale notification
- `refund` - Refund processed
- `dispute` - Dispute filed
- `cancellation` - Subscription cancelled

### Rate Limits

**Not Publicly Documented**

Recommended approach:

- Implement exponential backoff
- Add delays between requests (e.g., 200ms)
- Monitor for HTTP 429 (Too Many Requests)
- Cache responses where appropriate

### API Limitations

**Not Available**:

- Aggregate rating scores (average, count)
- Review text content
- Dedicated reviews endpoint
- Public ratings (only your own sales)

## Product-to-API Mapping Strategy

### URL Structure Analysis

**Standard Product URLs**:

```
https://developassion.gumroad.com/l/ai-ghostwriter-guide
https://developassion.gumroad.com/l/knowii-ai-master-prompt
```

**Variant URLs** (encoded option parameter):

```
https://developassion.gumroad.com/l/DevConceptsStarter?option=mh1dCYM0cYuLJojqJNYE8w%3D%3D
```

### Extraction Strategy

```typescript
function extractProductSlug(gumroadUrl: string): string | null {
    // Pattern: https://[username].gumroad.com/l/[slug]
    const match = gumroadUrl.match(/gumroad\.com\/l\/([^?#/]+)/)
    return match ? match[1] : null
}
```

**Note**: The `option` parameter is for variant pre-selection, not product identification. The base slug identifies the product.

### Product Identification Flow

1. Load product JSON from `src/data/products/{id}.json`
2. Extract `gumroadUrl` field
3. Parse to get product slug (e.g., `ai-ghostwriter-guide`)
4. Use slug to filter API calls or match responses

## Implementation Options

### Option A: Local Bun Script (Recommended)

**Architecture**:

```
scripts/
├── fetch-gumroad-ratings.ts     # Main script
├── utils/
│   ├── gumroad-api.ts           # API client
│   └── gumroad-api.spec.ts      # Tests
└── .env.example                  # Template
```

**Advantages**:

- Follows existing script patterns
- No external costs
- Full control over execution
- Easy testing/debugging

**Disadvantages**:

- Manual execution required
- No automatic scheduling

**Usage**:

```bash
# Setup
cp .env.example .env
# Add GUMROAD_ACCESS_TOKEN to .env

# Run
bun run fetch:ratings
```

### Option B: Cloudflare Pages Function

**Architecture**:

```
functions/
└── api/
    └── gumroad-sync.ts          # Cron-triggered function
```

**Cloudflare Configuration**:

```toml
# wrangler.toml
[triggers]
crons = ["0 0 * * *"]  # Daily at midnight
```

**Advantages**:

- Automated scheduling
- Serverless (no server management)
- Could trigger automatic deploys

**Disadvantages**:

- Cloudflare Workers paid plan required for Cron
- More complex setup
- Git commit automation adds complexity
- Environment variable management

**Git Integration Flow**:

1. Worker fetches Gumroad data
2. Uses GitHub API to:
    - Fork/clone repo contents
    - Update stats files
    - Create commit
    - Push to branch
3. Optionally create PR or direct push
4. Cloudflare Pages auto-deploys on push

### Option C: Hybrid Approach

**Best of Both Worlds**:

- Local script for development/testing
- Cloudflare Worker for scheduled automation
- Shared utility code

## Ratings Data Flow

### Current Schema

**File**: `{product-id}-stats.json`

```json
{
    "data": {
        "userCount": "500+ users",
        "timeSaved": "10+ hours/week",
        "ratings": {
            "gumroad": [
                { "id": "sale-123abc", "rating": 5, "date": "2026-01-10" },
                { "id": "sale-456def", "rating": 4, "date": "2026-01-08" },
                { "id": "sale-789ghi", "rating": null, "date": "2026-01-05" }
            ],
            "trustpilot": [{ "id": "tp-review-1", "rating": 5, "date": "2026-01-01" }]
        }
    }
}
```

### Aggregation Computation

During build (`aggregate-products.ts`):

```typescript
function computeRatings(stats, testimonialCount) {
    const allRatings = []

    // Collect all non-null ratings from all sources
    if (stats?.ratings) {
        for (const source of Object.values(stats.ratings)) {
            for (const entry of source) {
                if (entry.rating !== null) {
                    allRatings.push(entry.rating)
                }
            }
        }
    }

    // Add testimonials as 5-star ratings
    for (let i = 0; i < testimonialCount; i++) {
        allRatings.push(5)
    }

    if (allRatings.length === 0) return {}

    return {
        ratingsCount: allRatings.length,
        averageRating: round(average(allRatings), 2)
    }
}
```

### Update Strategy

**Incremental Updates** (Recommended):

- Track last sync timestamp
- Fetch only new sales since last sync
- Merge with existing ratings (by sale ID)
- Preserve non-Gumroad ratings (e.g., Trustpilot)

**Full Refresh**:

- Fetch all sales
- Replace Gumroad ratings entirely
- Keep non-Gumroad sources

## Additional Use Cases

### 1. Sales Count Sync

Update `userCount` field in stats:

```typescript
// From Products API with view_sales scope
const salesCount = product.sales_count
stats.userCount = `${formatNumber(salesCount)}+ users`
```

### 2. Revenue Tracking (Internal)

Track revenue per product (not for public display):

```typescript
interface RevenueData {
    productId: string
    totalSales: number
    totalRevenue: number // USD cents
    lastUpdated: string
}
```

### 3. New Product Detection

Alert when Gumroad products exist but no local JSON:

```typescript
// Gumroad products
const gumroadProducts = await fetchGumroadProducts()

// Local products
const localProducts = loadLocalProducts()

// Find unmatched
const missing = gumroadProducts.filter(
    (gp) => !localProducts.some((lp) => matchesGumroadUrl(lp, gp))
)
```

### 4. Webhook Integration

Real-time updates via Gumroad webhooks:

```typescript
// POST /api/gumroad-webhook
app.post('/api/gumroad-webhook', (req, res) => {
    const { sale_id, product_id, rating } = req.body
    // Queue stats update
})
```

### 5. Price/Discount Sync

Keep local prices in sync with Gumroad:

```typescript
// Detect price mismatches
if (localProduct.price !== gumroadProduct.price / 100) {
    // Alert or auto-update
}
```

## Cloudflare Workers Evaluation

### Feasibility: YES

Cloudflare Workers can:

- Fetch from Gumroad API
- Process data
- Write to KV/R2 storage
- Trigger via Cron
- Call GitHub API

### Requirements

**Paid Plan Features Needed**:

- Cron Triggers (scheduled execution)
- Longer execution time (if many products)

**Free Tier Limitations**:

- No Cron Triggers
- 10ms CPU time limit (may be insufficient)
- 100,000 requests/day

### Recommended Cloudflare Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Cloudflare Worker                       │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────┐ │
│  │ Cron Trigger│───▶│ Gumroad Sync │───▶│ GitHub API │ │
│  │  (daily)    │    │    Logic     │    │   Commit   │ │
│  └─────────────┘    └──────────────┘    └────────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                GitHub Repository                         │
│  - Updated stats files                                   │
│  - Auto-triggers Cloudflare Pages deploy                │
└─────────────────────────────────────────────────────────┘
```

### GitHub API Integration

```typescript
// Create or update file via GitHub API
async function updateStatsFile(productId: string, stats: Stats) {
    const path = `src/data/products/${productId}-stats.json`

    // Get current file SHA (if exists)
    const current = await octokit.repos.getContent({ owner, repo, path })

    // Update file
    await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: `chore: update ${productId} stats from Gumroad`,
        content: btoa(JSON.stringify(stats, null, 2)),
        sha: current.sha
    })
}
```

## Risk Analysis

| Risk                      | Impact | Mitigation                              |
| ------------------------- | ------ | --------------------------------------- |
| API doesn't return rating | High   | Test API first; fallback to CSV parsing |
| Rate limiting             | Medium | Exponential backoff, request delays     |
| URL mapping failures      | Medium | Manual mapping config as fallback       |
| Schema mismatches         | Low    | Strict Zod validation                   |
| Token expiration          | Low    | Token refresh logic                     |
| Gumroad API changes       | Medium | Version monitoring, error alerts        |

## Recommendation

### Phase 1: Local Script (Week 1)

- Implement `scripts/fetch-gumroad-ratings.ts`
- Test with actual API token
- Verify rating data availability
- Manual execution via `bun run fetch:ratings`

### Phase 2: Expanded Data (Week 2)

- Add sales count sync
- Add price verification
- Improve error handling

### Phase 3: Automation Evaluation

- If manual updates become tedious
- Implement Cloudflare Worker
- Add GitHub API integration
- Set up Cron schedule

## Questions for User

1. **API Token**: Do you have a Gumroad API access token ready?
2. **Data Priority**: Just ratings, or also sales counts?
3. **Update Frequency**: How often should stats be refreshed?
4. **Automation Need**: Is manual execution acceptable initially?
5. **Error Handling**: Alert on failures or silent retry?

## Appendix: Environment Setup

### `.env.example`

```bash
# Gumroad API
GUMROAD_ACCESS_TOKEN=your_access_token_here

# Optional: GitHub API (for Cloudflare Worker)
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=dsebastien
GITHUB_REPO=store-website
```

### Gumroad API Token Creation

1. Go to https://app.gumroad.com/settings/advanced
2. Click "Create application"
3. Fill in application details
4. Click "Generate access token"
5. Copy token (shown only once)
