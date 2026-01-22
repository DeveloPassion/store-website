# Deep Linking Guide

This document describes deep linking support for pages, including anchor IDs and URL parameters.

---

# Homepage Anchors

Link directly to specific sections on the homepage:

```
/#{anchor-id}
```

Example: `/#featured`

## Available Homepage Anchors

| Section      | Anchor ID       | Description                        |
| ------------ | --------------- | ---------------------------------- |
| Hero         | `#hero`         | Main hero with stats and CTA       |
| Trust Badges | `#trust-badges` | Guarantee, lifetime access, expert |
| Featured     | `#featured`     | Featured products section          |
| Best Value   | `#best-value`   | Best value products section        |
| Compare      | `#compare`      | Compare products CTA               |
| Categories   | `#categories`   | Shop by category grid              |
| Products     | `#products`     | All products listing               |
| Social Proof | `#social-proof` | Customer stats and testimonials    |

---

# Product Page Deep Linking

This document describes deep linking support for product pages, including anchor IDs and URL parameters.

## Anchor Links

Link directly to specific sections using anchor IDs:

```
/product/{product-id}#{anchor-id}
```

Example: `/product/obsidian-starter-kit#testimonials`

## URL Parameters

Product pages support URL parameters for pre-selecting variants and payment frequencies:

| Parameter   | Description                                                | Example             |
| ----------- | ---------------------------------------------------------- | ------------------- |
| `variant`   | Pre-select a product variant by `gumroadVariantId` or name | `?variant=pro`      |
| `frequency` | Pre-select payment frequency for subscriptions             | `?frequency=yearly` |

### Variant Parameter

The `variant` parameter matches against:

1. The variant's `gumroadVariantId` (exact match)
2. The variant's `name` (case-insensitive)

Example: `/product/knowii-community?variant=explorer`

### Frequency Parameter

Valid values for the `frequency` parameter:

- `monthly`
- `yearly`
- `biennial`

Only applies to subscription products. Example: `/product/knowii-community?variant=explorer&frequency=yearly`

### Combined Deep Links

You can combine anchor IDs with URL parameters:

```
/product/{product-id}?variant={variant}&frequency={frequency}#{anchor-id}
```

Example: `/product/knowii-community?variant=knowledge-master&frequency=yearly#features`

## Available Anchors

| Section          | Anchor ID           | Description                                      |
| ---------------- | ------------------- | ------------------------------------------------ |
| Hero             | `#hero`             | Product hero with title, tagline, and buy button |
| Problem          | `#problem`          | PAS framework - problem statement                |
| Agitate          | `#agitate`          | PAS framework - pain point amplification         |
| Solution         | `#solution`         | PAS framework - solution introduction            |
| Origin Story     | `#origin-story`     | Product origin story (if configured)             |
| Creator Journey  | `#creator-journey`  | Creator's journey narrative (if configured)      |
| How It Works     | `#how-it-works`     | Product walkthrough media (if configured)        |
| Features         | `#features`         | What's included, highlights, and target audience |
| Course Content   | `#course-content`   | Course modules and structure (courses only)      |
| Methodology      | `#methodology`      | Methodology explanation (if configured)          |
| Media            | `#media`            | Main media carousel with screenshots/videos      |
| Benefits         | `#benefits`         | Product benefits breakdown                       |
| Transformation   | `#transformation`   | Transformation arc visualization (if configured) |
| Timeline         | `#timeline`         | Implementation timeline (if configured)          |
| Media Secondary  | `#media-secondary`  | Secondary media carousel                         |
| Success Stories  | `#success-stories`  | Customer success stories (if configured)         |
| Testimonials     | `#testimonials`     | Customer testimonials                            |
| FAQ              | `#faq`              | Frequently asked questions                       |
| Vision           | `#vision`           | Product vision statement (if configured)         |
| Included In      | `#included-in`      | Bundles containing this product                  |
| CTA              | `#cta`              | Final call-to-action section                     |
| Media Bonus      | `#media-bonus`      | Bonus content media carousel                     |
| Related Products | `#related-products` | Related product recommendations                  |

## Notes

- Sections marked "(if configured)" only appear when the product has that content defined
- Anchor links use smooth scrolling behavior
- The scroll-to-anchor feature polls for up to 5 seconds to handle lazy-loaded content
- URL parameters are automatically updated when selections change on the page
- Invalid URL parameters fall back to product defaults
