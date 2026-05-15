# Social Card Customer Name Leak — Investigation & Fix Plan

## Problem

Social card previews for product pages (observed on Obsidian Starter Kit at
`https://www.store.dsebastien.net/product/obsidian-starter-kit/?variant=essentials`)
display a customer name — **"Dwayne Appleby"** — alongside the OG title/description.
The user expects social cards to advertise the product, not name individual customers.

## Root cause

The OG and Twitter `<meta>` tags themselves are clean. Verified by fetching the live
HTML with `facebookexternalhit/1.1`:

```
og:title       → "Obsidian Starter Kit - Stop Configuring, Start Thinking | Knowledge Forge"
og:description → "Complete Obsidian vault with 40+ auto-filing templates, ..."
og:image       → /assets/images/products/osk/osk-graph-view.webp
```

No customer name in any meta tag, `<title>`, or `<noscript>` block. Also not in
`product.salesCopy.metaTitle` / `metaDescription` / `description` / `tagline` /
`secondaryTagline` (broad scan across all products turned up zero name overlap with
testimonial authors in those fields).

**The leak is via JSON-LD.** Each product page embeds a `Product` schema with a
`review` array. Five `Review` entries are included, each with `author.name` and
`reviewBody`. Some link-preview/social-card consumers (LinkedIn especially, some
Slack/Discord embed flows, search-engine rich snippets, AI summarizers) read
JSON-LD as a fallback or supplement to OG tags and surface review author names
into the card preview area.

Live JSON-LD on the OSK page contains (in order):

1. Dwayne Appleby — "The Obsidian Starter Kit has been game changing for me…"
2. Michael Aaron
3. Blake Holder
4. Ghada
5. Lubos Kolouch

### How the order is produced

`generateReviewsSchema()` in `scripts/utils/generate-static-pages.ts:264-291`:

```ts
const testimonialsToUse = [...product.testimonials]
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    .slice(0, 5)
```

It puts featured testimonials first, then takes the first five. Dwayne Appleby is
the first featured testimonial in `obsidian-starter-kit-testimonials.json`, so his
name is the first author embedded in JSON-LD — and the one most consumers pick up.

### Where this is generated

- File: `scripts/utils/generate-static-pages.ts`
- Functions:
    - `generateProductSchema()` (lines ~569-667) — builds the per-product Product
      JSON-LD `@graph`. Adds the `review` field when reviews exist.
    - `generateReviewsSchema()` (lines ~264-291) — maps testimonials to Review
      objects including `author.name`, optional `jobTitle`, optional `worksFor`,
      rating, and full `reviewBody`.
- Output: written into `dist/product/<id>/index.html` as a
  `<script type="application/ld+json">` block.

### Confirmed scope

Any product with testimonials has the same leak. Build-time fix is sufficient —
the React client-side meta-tag code in `src/pages/product.tsx` doesn't touch
JSON-LD and is not part of the issue.

## Fix options

All options are SEO-vs-privacy tradeoffs. The on-page testimonials sections
remain fully visible to humans in all cases; only the structured JSON-LD
representation changes.

### Option 1 — Drop the `review` array, keep `aggregateRating` (recommended)

Remove the `review` field from the Product JSON-LD. Keep `aggregateRating` so
Google's star-rating rich snippets continue to work.

- Change site: `generateProductSchema()` — stop calling `generateReviewsSchema()`
  and stop adding `review` to the schema. `generateReviewsSchema()` becomes dead
  code and can be deleted.
- Pros: eliminates leak across every consumer (social cards, rich snippets,
  AI summaries, Bing previews). Simplest, lowest-risk change. Star ratings
  preserved via `aggregateRating`.
- Cons: loses individual-review rich snippets in Google. In practice
  `aggregateRating` carries most of the SEO weight; per-review snippets are
  rarely displayed in SERPs and require strict policy compliance.

### Option 2 — Anonymize author names

Keep `Review` entries but set `author.name` to "Verified Customer" (or strip the
author object entirely). Keep `reviewBody`.

- Change site: `generateReviewsSchema()` — replace `testimonial.author` with a
  generic string.
- Pros: preserves richer review structure for parsers that care.
- Cons: Google requires named authors for review rich snippets; anonymized
  reviews are typically ignored or flagged as low quality. Also looks odd to
  anyone inspecting the schema.

### Option 3 — First name + initial

Show "Dwayne A." instead of "Dwayne Appleby".

- Pros: less searchable, still feels human.
- Cons: leak is reduced but not eliminated — first names still appear. Doesn't
  meaningfully solve the user's concern.

### Option 4 — Investigate further first

Open questions worth answering before committing:

- Which platform showed "Dwayne Appleby"? (LinkedIn? Slack? Discord? An AI
  summarizer? Google rich result?) Knowing the consumer narrows whether the
  fix needs to target JSON-LD only, or also OG fallback patterns.
- Is the SEO loss from Option 1 measurable? Check current Google Search Console
  for review-snippet impressions on product pages.
- Are there other products with the same featured-first ordering that have
  particularly sensitive first names (job titles / companies)?

## Recommended next step

Go with **Option 1**. The implementation is small and reversible:

1. In `scripts/utils/generate-static-pages.ts`, inside `generateProductSchema()`,
   delete the block that pushes `productSchema['review'] = reviews` (and the
   call to `generateReviewsSchema(product)`).
2. Delete `generateReviewsSchema()` itself (or leave it unused if you want to
   keep the option open).
3. Rebuild (`bun run build`) and re-verify the JSON-LD on
   `dist/product/obsidian-starter-kit/index.html` has no `review` array, but
   still has `aggregateRating`.
4. Spot-check social card previews on LinkedIn / Slack / etc. once deployed to
   confirm the name no longer appears.

No schema changes, no data migration, no test updates needed (no existing tests
reference `generateReviewsSchema` or `generateProductSchema`).

## Files touched (if implementing Option 1)

- `scripts/utils/generate-static-pages.ts` — remove `generateReviewsSchema` and
  its call site in `generateProductSchema`.

## Files investigated and ruled out

- `src/lib/update-meta-tags.ts` — client-side only, doesn't touch JSON-LD.
- `src/pages/product.tsx` — uses clean `metaTitle` / `metaDescription`.
- `src/index.html` — no customer names.
- `src/data/products/obsidian-starter-kit-sales-copy-default.json` — meta
  fields clean. (Customer names exist in `storytelling.successStories.stories`
  but that field is rendered on-page only, not in any meta tag or JSON-LD.)
- `public/assets/images/products/osk/osk-graph-view.webp` — graph view
  screenshot; note labels too small to read at social-card resolution.
