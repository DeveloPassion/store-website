# Gumroad to Shopify Migration Plan

**Status:** Planning Phase
**Timeline:** 12-16 Weeks
**Risk Level:** High (Active subscriptions, existing customer base)
**Last Updated:** 2026-01-08

---

## Executive Summary

This document outlines a complete migration strategy from Gumroad (developassion.gumroad.com / store.dsebastien.net) to Shopify, addressing critical challenges around active subscriptions, link preservation, customer data migration, and domain transition.

**Key Challenges:**

- Active subscriptions cannot be automatically transferred
- External links to Gumroad products exist across multiple platforms
- Customer data and purchase history must be preserved
- Domain transition must minimize downtime
- Digital product delivery must remain uninterrupted

**Recommended Approach:**

- **Subscription Strategy:** Dual-run (keep Gumroad subscriptions active while new ones go to Shopify)
- **Timeline:** 12-16 weeks for careful, low-risk migration
- **Domain Strategy:** Full DNS migration to Shopify with comprehensive redirects
- **Customer Impact:** Minimal disruption with proactive communication

---

## 1. Cost-Benefit Analysis

### What You'll GAIN

**Store Control & Branding:**

- Full control over design, UX, and customer journey
- Professional storefront that matches your brand
- Custom landing pages and marketing funnels
- Better mobile experience customization

**Marketing & Sales Tools:**

- Advanced email marketing and automation
- Abandoned cart recovery (typically recovers 10-15% of lost sales)
- Sophisticated discount codes and promotions
- Upsell/cross-sell capabilities
- A/B testing for product pages

**Analytics & Insights:**

- Deep customer behavior analytics
- Conversion funnel tracking
- Customer lifetime value metrics
- Custom reporting and dashboards
- Better integration with Google Analytics

**Scalability:**

- 8,000+ apps for any functionality needed
- Multi-channel selling (social media, marketplaces)
- Advanced inventory management
- Flexible subscription management
- API access for custom integrations

**SEO & Discovery:**

- Full control over URLs, meta tags, structured data
- Better site architecture for search engines
- Blog integration for content marketing
- Rich snippets and schema markup

### What You'll LOSE

**Simplicity:**

- Gumroad's dead-simple product setup vs Shopify's learning curve
- More complex admin interface
- Need to manage multiple apps instead of all-in-one

**Built-in Features:**

- Gumroad's native affiliate program (needs app)
- Simple license key generation (needs app)
- Pay-what-you-want pricing (needs app)
- One-click file hosting and delivery

**Cost Predictability:**

- Gumroad: Simple 10% fee
- Shopify: Fixed monthly + apps + transaction fees (more complex)

**Creator-Focused UX:**

- Gumroad designed specifically for creators
- Shopify designed for broader e-commerce

### Cost Comparison

**Gumroad Current Costs:**

- 10% of all sales (variable)
- Example: $5,000/mo revenue = $500/mo fees

**Shopify Projected Costs:**

**One-Time:**

- Theme: $0-300 (many good free options available)
- Migration tools (Matrixify): $30-50
- Setup time/consulting: $0-2,000 (depending on DIY vs hire)
- **Total one-time: $30-2,350**

**Monthly Recurring:**

- Shopify plan: $79/mo (Basic) or $299/mo (Advanced)
- Digital products app (Sky Pilot): $15/mo
- Subscription app (Appstle): $30/mo
- Email marketing (Klaviyo): $20-100/mo
- Redirect manager: $7/mo
- Other utilities: $20-50/mo
- **Total fixed: $171-501/mo**

**Transaction Fees:**

- Shopify Payments: 2.9% + $0.30 per transaction
- Example: $5,000/mo revenue = ~$170/mo in fees
- **Total monthly costs: $341-671/mo**

**Break-Even Analysis:**
| Monthly Revenue | Gumroad Fees | Shopify Total | Winner |
|----------------|--------------|---------------|---------|
| $2,000 | $200 | $280-440 | Gumroad (slightly) |
| $5,000 | $500 | $340-670 | Shopify |
| $10,000 | $1,000 | $460-890 | Shopify (significant) |
| $20,000 | $2,000 | $700-1,290 | Shopify (major) |

**Shopify becomes more cost-effective at ~$3,500+/mo in revenue.**

---

## 2. Subscription Migration Strategy

**CRITICAL RISK AREA:** This is your highest-risk component. Handle with extreme care.

### The Challenge

- Gumroad API doesn't allow subscription transfers
- Payment information stays with Gumroad (PCI compliance)
- Subscribers expect uninterrupted service
- Expected churn rate: 20-40% with forced migration

### Option A: Dual-Run Approach (RECOMMENDED)

**Strategy:** Keep existing Gumroad subscriptions running indefinitely while new subscriptions go to Shopify only.

**Implementation:**

1. Keep Gumroad account active (no cost for existing subscriptions)
2. All new subscribers join through Shopify
3. Gradually incentivize Gumroad subscribers to migrate:
    - Offer 1 month free when switching
    - Provide early access to new features
    - Give migration bonus (discount code, extra content)
4. Personal outreach to high-value subscribers
5. Natural attrition over 6-12 months

**Timeline:**

- Month 1-2: Launch Shopify, new customers only
- Month 3-6: Active migration campaign with incentives
- Month 6-12: Gradual transition, handle remaining subscribers
- Month 12+: Minimal Gumroad subscribers, decide whether to continue

**Pros:**

- ✅ Zero forced disruption
- ✅ Minimal customer friction
- ✅ Lowest churn risk (expect 5-10% vs 20-40%)
- ✅ Time to perfect Shopify setup
- ✅ Can rollback if Shopify issues arise

**Cons:**

- ❌ Manage two platforms for 6-12 months
- ❌ Split subscriber base temporarily
- ❌ Some operational overhead
- ❌ Delayed full migration completion

### Option B: Forced Migration with Grace Period

**Strategy:** Announce end date, require all subscribers to move to Shopify.

**Implementation:**

1. **T-90 days:** First announcement email
    - Explain migration and benefits
    - Provide clear migration instructions
    - Offer incentive (free month, 20% discount)
2. **T-60 days:** Reminder with deadline
3. **T-30 days:** Urgent reminder, personal outreach to non-responders
4. **T-7 days:** Final notice
5. **T-0 (Migration Day):**
    - Cancel all Gumroad subscriptions
    - Extend access grace period (2 weeks)
    - Send final email with Shopify signup link
6. **T+14 days:** Access ends for non-migrators

**Pros:**

- ✅ Clean cutover to single platform
- ✅ Faster complete migration (3 months vs 12 months)
- ✅ Clear deadline creates urgency
- ✅ Simpler operations post-migration

**Cons:**

- ❌ Expected 20-40% churn
- ❌ Customer frustration and friction
- ❌ High support load during transition
- ❌ Negative feedback risk
- ❌ Revenue impact

### Option C: White-Glove Manual Migration

**Strategy:** Contact each subscriber individually, personally help them migrate.

**Implementation:**

1. Export all active subscribers from Gumroad
2. Create custom 100%-off discount codes for each
3. Email/call each subscriber personally
4. Guide them through Shopify signup
5. Apply discount code (effectively free first month)
6. Verify they're set up correctly
7. Cancel old Gumroad subscription only after confirmation

**Pros:**

- ✅ Highest retention rate (60-80%+)
- ✅ Personal relationship building
- ✅ Opportunity to upsell/cross-sell
- ✅ Gather valuable feedback

**Cons:**

- ❌ Extremely time-intensive
- ❌ Only viable for <100 subscribers
- ❌ Doesn't scale

**Recommended for:** High-value subscribers (>$100/mo) regardless of primary strategy chosen.

### Recommended Apps for Shopify Subscriptions

1. **Recharge** - $99/mo
    - Most popular and robust
    - Best for high-volume subscriptions
    - Advanced features (gifting, prepaid, etc.)
    - Excellent support

2. **Appstle** - $10-30/mo
    - More affordable alternative
    - Very flexible customization
    - Good for starting out
    - Easy migration tools

3. **Seal Subscriptions** - $5-49/mo
    - Simplest option
    - Good for basic subscriptions
    - Budget-friendly

**Recommendation:** Start with Appstle for cost-effectiveness, upgrade to Recharge if you scale significantly.

---

## 2A. CUSTOMIZED STRATEGY: 10-30 Subscribers with 100% Retention Requirement

**YOUR SPECIFIC SCENARIO:**

- 10-30 active subscribers
- Subscriptions = ~20% of revenue (~$200-600/mo)
- 100% retention is non-negotiable
- Multiple critical reasons (high-value customers, early supporters, core to business growth, financial constraints)
- No time pressure for migration
- Technically comfortable with setup

### Why Standard Migration Won't Work for You

Standard subscription migration approaches (forced migration, dual-run with aggressive timeline) typically result in 20-40% churn. With your 100% retention requirement, you need a completely different strategy.

### Your Custom Strategy: "Zero-Pressure Indefinite Dual-Run"

**Core Principle:** Never force subscribers to migrate. Ever.

**Phase 1: Months 0-6 (Protection Phase)**

**Goal:** Migrate everything EXCEPT existing subscribers

**Month 1-4: Build & Test Shopify**

- [ ] Set up Shopify on temporary domain
- [ ] Install all apps (Sky Pilot, Appstle, UpPromote for affiliates, etc.)
- [ ] Create all products
- [ ] Design branded store (address your customization frustration!)
- [ ] Beta test with 5-10 non-subscriber customers
- [ ] Fix all issues
- [ ] **DO NOT mention migration to existing subscribers yet**

**Month 4: DNS Migration (One-Time Sales Only)**

- [ ] Point store.dsebastien.net to Shopify
- [ ] Set up all product redirects
- [ ] **Keep Gumroad account active** for existing subscriptions
- [ ] All NEW one-time purchases → Shopify
- [ ] All NEW subscriptions → Shopify
- [ ] Existing 10-30 subscribers → Still on Gumroad (zero disruption!)

**Month 5-6: Prove Shopify Works**

- [ ] Monitor new customer experience closely
- [ ] Ensure digital delivery is flawless
- [ ] Track new Shopify subscriptions (if any)
- [ ] Verify subscription billing works perfectly
- [ ] Build confidence in platform stability
- [ ] **Existing subscribers still unaware, still happy**

**Phase 2: Months 7-12 (Soft Introduction Phase)**

**Goal:** Introduce Shopify option with zero pressure

**Month 7: Create Migration Path**

- [ ] Build dedicated migration landing page:
    - "Interested in trying the new store? Here's what's better..."
    - Showcase new features, better UX, improved downloads
    - Show testimonials from NEW subscribers loving Shopify
    - Clear migration instructions with video walkthrough
    - Support contact prominently displayed

- [ ] Create irresistible migration incentive (choose one):
    - **Option A:** 3 months completely free (worth $X)
    - **Option B:** Lifetime 50% discount when you migrate
    - **Option C:** Exclusive bonus product bundle ($X value)
    - **Option D:** Combination of above

- [ ] Set up personal migration tracking spreadsheet:
    ```
    | Name | Email | Current Plan | MRR | Status | Contact Date | Migrated Date | Notes |
    |------|-------|--------------|-----|--------|--------------|---------------|-------|
    | John | john@... | Pro | $50 | Not contacted | - | - | VIP, early supporter |
    ```

**Month 8: First Soft Outreach (Email Campaign)**

- [ ] Send "Update: I've Moved to a New Platform" email (see Template 6A below)
- [ ] Make it 100% informational, zero pressure
- [ ] Include migration landing page link
- [ ] Mention incentive briefly
- [ ] Emphasize: "No need to do anything, your subscription continues as normal"
- [ ] Track who clicks, who responds

**Month 9-10: Monitor & Support**

- [ ] Wait for natural interest
- [ ] Respond immediately to anyone asking about migration
- [ ] Provide white-glove support to any migrator
- [ ] Track migration rate: Target 10-20% (1-3 people) = success!
- [ ] Continue providing excellent service on both platforms

**Month 11-12: Identify VIPs for Personal Outreach**

- [ ] Segment your 10-30 subscribers by:
    - Revenue: High ($50+/mo), Medium ($20-50/mo), Low (<$20/mo)
    - Tenure: Long-term (12+ months), Medium (6-12mo), Recent (<6mo)
    - Engagement: Active (uses product), Passive (subscribed but quiet)

- [ ] Start with top 5 VIPs (high revenue + long tenure)
- [ ] Personal email or phone call (see Template 6B below)
- [ ] Offer to help them migrate personally
- [ ] Screen share session if needed
- [ ] Premium incentive for VIPs (4 months free + bonus)

**Phase 3: Months 13-24 (Gradual Migration Phase)**

**Goal:** Achieve 50-70% voluntary migration through personal touch

**Month 13-15: Systematic Personal Outreach**

- [ ] Contact subscribers in waves:
    - **Wave 1:** Remaining high-value (not yet migrated)
    - **Wave 2:** Medium-value + long tenure
    - **Wave 3:** Everyone else

- [ ] For each subscriber:
    - [ ] Personal email (not automated)
    - [ ] Reference their specific situation/history
    - [ ] Explain benefits specific to them
    - [ ] Offer personalized help
    - [ ] Give them custom migration code (100% off first month)
    - [ ] Follow up once if no response

**Month 16-18: Migration Support Phase**

- [ ] Provide exceptional support to migrating subscribers:
    - [ ] Screen share setup calls if needed
    - [ ] Test their access personally before canceling Gumroad
    - [ ] Give 1 month overlap (access to both platforms)
    - [ ] Check in after 1 week: "How's the new platform?"
    - [ ] Only cancel Gumroad after they confirm satisfaction

- [ ] Document migration process for each person
- [ ] Refine approach based on feedback

**Month 19-24: Acceptance & Natural Attrition**

- [ ] Accept that some subscribers want to stay on Gumroad (and that's OK!)
- [ ] Continue providing excellent service on both platforms
- [ ] As Gumroad subscribers naturally cancel over time:
    - Don't replace them on Gumroad
    - New subscriptions only go to Shopify
    - Gradually reduce Gumroad percentage

- [ ] Expected result by Month 24:
    - 40-60% voluntarily migrated to Shopify
    - 30-50% still happily on Gumroad
    - 10% natural churn (unavoidable, not migration-related)
    - **Actual migration-related churn: <5% (nearly 100% retention!)**

**Phase 4: Months 25+ (Long-Term Dual-Run)**

**Goal:** Maintain both platforms until natural convergence

**Ongoing Strategy:**

- [ ] Continue accepting both platforms indefinitely
- [ ] Gumroad subscribers slowly decrease through natural churn
- [ ] All new subscriptions → Shopify only
- [ ] Maybe 1-3 "forever Gumroad" loyalists (and that's fine!)

**Cost of Dual-Run:**

- Gumroad: $0/mo (free for existing subscriptions, only charges on new sales)
- Shopify: $140/mo fixed costs (as calculated earlier)
- Time: ~30min/month managing Gumroad subscribers
- **Total incremental cost: Minimal**

**Benefit of Dual-Run:**

- ✅ 100% subscriber retention achieved
- ✅ Zero forced migration stress
- ✅ Subscribers feel respected and valued
- ✅ You sleep well at night knowing no one was forced out

### Detailed Checklist: Month-by-Month

**MONTH 1-2: Foundation**

- [ ] Sign up for Shopify trial
- [ ] Choose Shopify Basic plan ($79/mo)
- [ ] Install essential apps:
    - [ ] Sky Pilot ($15/mo) - digital delivery
    - [ ] Appstle ($10/mo) - subscriptions
    - [ ] UpPromote ($29/mo) - affiliates
    - [ ] Easy Redirects ($7/mo)
    - [ ] Klaviyo (free <250 contacts)
- [ ] Choose and customize theme (Dawn recommended for speed)
- [ ] Set up payment gateway (Shopify Payments)
- [ ] Configure tax settings
- [ ] Create legal pages (privacy, terms, refunds)

**MONTH 2-3: Product Setup**

- [ ] Create all products in Shopify (match Gumroad offerings)
- [ ] Upload digital files to Sky Pilot
- [ ] Set up affiliate program in UpPromote:
    - [ ] Match commission structure from Gumroad
    - [ ] Create affiliate dashboard
    - [ ] Test affiliate tracking
- [ ] Create subscription products in Appstle:
    - [ ] Match Gumroad pricing
    - [ ] Set billing frequencies
    - [ ] Configure cancellation policies
- [ ] Set up URL mapping spreadsheet (Gumroad URLs → Shopify URLs)
- [ ] Configure all redirect rules (don't activate yet)

**MONTH 3-4: Testing**

- [ ] Complete 10+ test purchases (different scenarios)
- [ ] Test digital delivery for all product types
- [ ] Test subscription signup and billing
- [ ] Test affiliate tracking and commission calculation
- [ ] Beta test with 5-10 trusted non-subscriber customers
- [ ] Collect feedback and fix issues
- [ ] Test mobile experience thoroughly
- [ ] Run Google PageSpeed test (target >80 mobile)

**MONTH 4: DNS Migration (One-Time Products Only)**

- [ ] Week 1: Final preparation
    - [ ] Verify all tests passed
    - [ ] Set up Google Analytics tracking
    - [ ] Prepare DNS change documentation
    - [ ] Create rollback procedure

- [ ] Week 2: DNS change (Wednesday 2 AM)
    - [ ] Change DNS: store.dsebastien.net → Shopify
    - [ ] Monitor DNS propagation (24-48h)
    - [ ] Verify SSL certificate provisions
    - [ ] Test all redirects live

- [ ] Week 3: Monitor new Shopify customers
    - [ ] Check digital delivery success rate
    - [ ] Monitor any 404 errors
    - [ ] Address customer issues immediately
    - [ ] Verify analytics tracking

- [ ] Week 4: First review
    - [ ] Compare conversion rates (Shopify vs Gumroad baseline)
    - [ ] Check customer feedback
    - [ ] Identify any issues
    - [ ] **Confirm existing subscribers unaffected**

**MONTH 5-6: Prove Stability**

- [ ] Accumulate 10+ new Shopify customers
- [ ] Achieve 100% digital delivery success rate
- [ ] Get 2-3 new Shopify subscriptions (if possible)
- [ ] Verify subscription billing works flawlessly
- [ ] Set up abandoned cart recovery (Klaviyo)
- [ ] Implement email marketing automations
- [ ] Optimize product pages based on analytics
- [ ] **Continue zero communication to existing subscribers**

**MONTH 7: Prepare Migration Path**

- [ ] Create migration landing page:
    - [ ] Write compelling copy about benefits
    - [ ] Showcase new features/improvements
    - [ ] Include testimonials from new Shopify customers
    - [ ] Embed 3-minute video walkthrough
    - [ ] Show before/after comparison
    - [ ] FAQ section
    - [ ] Live chat widget for questions

- [ ] Create irresistible incentive offer
- [ ] Generate custom discount codes for each subscriber
- [ ] Set up tracking spreadsheet for migration campaign
- [ ] Prepare email templates (see Section 13A)
- [ ] Create supporting materials (PDF guide, video tutorials)

**MONTH 8: Soft Introduction**

- [ ] Send first informational email (Template 6A)
- [ ] Post update on social media (if relevant)
- [ ] Add subtle banner to Gumroad product pages
- [ ] Monitor responses and clicks
- [ ] Track who visits migration landing page
- [ ] Respond to any questions within 2 hours

**MONTH 9-10: Support Early Adopters**

- [ ] Provide white-glove support to anyone who shows interest
- [ ] Personally help each migrator through process:
    - [ ] Send custom discount code
    - [ ] Offer screen share setup call
    - [ ] Verify they can access all their content
    - [ ] Keep their Gumroad active for 1 month (overlap)
    - [ ] Check in after 1 week
    - [ ] Only cancel Gumroad after they confirm satisfaction

- [ ] Document lessons learned from early migrators
- [ ] Refine migration process based on feedback
- [ ] Target: 2-4 successful migrations (20-40% of 10-30)

**MONTH 11-12: VIP Personal Outreach**

- [ ] Create VIP list (top 5 by revenue/tenure)
- [ ] Research each VIP:
    - [ ] When they subscribed
    - [ ] What products they've purchased
    - [ ] Any support interactions
    - [ ] Engagement level

- [ ] Contact each VIP personally:
    - [ ] Personal email (Template 6B) or phone call
    - [ ] Reference their specific history
    - [ ] Explain why new platform is better for them specifically
    - [ ] Offer premium incentive (4 months free + bonus)
    - [ ] Schedule call if interested

- [ ] For VIPs who migrate:
    - [ ] Full white-glove service
    - [ ] Priority support going forward
    - [ ] Ask for feedback on migration experience
    - [ ] Send thank you note + surprise bonus

**MONTH 13-18: Systematic Outreach**

- [ ] Contact remaining subscribers in waves:

    **Wave 1 (Month 13): High-value non-VIPs**
    - [ ] Personal emails to high-value subscribers
    - [ ] Offer 3 months free
    - [ ] Provide personal support

    **Wave 2 (Month 14-15): Medium-value + long-tenure**
    - [ ] Semi-personal emails (reference their tenure)
    - [ ] Offer 2 months free
    - [ ] Provide dedicated migration support

    **Wave 3 (Month 16-17): Everyone else**
    - [ ] Personalized emails (use their name and history)
    - [ ] Offer 1 month free
    - [ ] Provide standard migration support

- [ ] For each wave:
    - [ ] Send initial email
    - [ ] Wait 7 days
    - [ ] Send follow-up to non-responders (once only)
    - [ ] Track responses and migrations
    - [ ] Provide promised support to migrators

**MONTH 19-24: Natural Attrition Phase**

- [ ] Accept that 30-50% may prefer to stay on Gumroad
- [ ] Continue excellent service on both platforms
- [ ] Don't send any more migration prompts (they know it's available)
- [ ] As Gumroad subscribers naturally cancel:
    - [ ] Don't try to keep them on Gumroad
    - [ ] Offer Shopify as re-subscribe option
    - [ ] Track natural churn rate

- [ ] Monthly monitoring:
    - [ ] Gumroad subscriber count
    - [ ] Shopify subscriber count
    - [ ] Total subscriber count (should remain stable!)
    - [ ] Churn rate (should be low <5%)

**MONTH 25+: Long-Term Maintenance**

- [ ] Accept 1-5 "forever Gumroad" subscribers
- [ ] Maintain both platforms with minimal overhead
- [ ] All new subscriptions → Shopify only
- [ ] Eventually (year 2-3), 90%+ will be on Shopify through natural turnover

### Success Metrics for Your Scenario

**Primary Metric: Total Subscriber Retention**

- Target: >95% (lose <5% across entire migration period)
- Measure: (Current subscribers + new - churned) / Current subscribers
- Track monthly

**Secondary Metrics:**

**Migration Rate (Voluntary):**

- Month 8: 0-10% (1-3 people showing interest)
- Month 12: 20-40% (2-12 people migrated)
- Month 18: 40-60% (4-18 people migrated)
- Month 24: 50-70% (5-21 people migrated)

**Customer Satisfaction:**

- Survey after migration: >4.5/5 stars
- Zero negative feedback about forced migration
- Testimonials from successful migrators

**Platform Performance:**

- Shopify digital delivery success: 100%
- Shopify subscription billing success: 100%
- Support response time: <2 hours
- Customer issue resolution: <24 hours

### Red Flags & When to Pause

**STOP migration campaign if:**

- ⚠️ Any subscriber expresses frustration about migration talk
- ⚠️ You see ANY migration-related churn (even 1 person)
- ⚠️ Shopify subscription billing fails for new subscribers
- ⚠️ Digital delivery has ANY failures
- ⚠️ You're feeling rushed or pressured

**What to do if you see red flags:**

- Pause all outreach immediately
- Fix underlying issues first
- Return to "prove stability" phase
- Wait 2-3 months before trying again
- Consider if migration is truly necessary

### White-Glove Migration Protocol (for each subscriber)

**Step 1: Pre-Migration (Before They Commit)**

- [ ] Personal email or call
- [ ] Explain benefits specific to them
- [ ] Answer all questions
- [ ] Show them the new platform (screen share demo)
- [ ] Explain incentive clearly
- [ ] Give them time to decide (no pressure)

**Step 2: Migration Setup (Once They Agree)**

- [ ] Send custom discount code (100% off first month)
- [ ] Send detailed written instructions with screenshots
- [ ] Offer screen share setup call
- [ ] Schedule call at their convenience
- [ ] During call:
    - [ ] Guide them through signup
    - [ ] Apply discount code
    - [ ] Set up payment method
    - [ ] Verify they can access all content
    - [ ] Show them how to download products
    - [ ] Answer any questions
    - [ ] Bookmark new store

**Step 3: Overlap Period (1 Month)**

- [ ] Keep both subscriptions active for 1 month
- [ ] They have access to both platforms
- [ ] They can use whichever they prefer
- [ ] This removes risk and anxiety
- [ ] Cost to you: 1 month of duplicate subscription (~$20-50)
- [ ] Value: Peace of mind for subscriber = priceless

**Step 4: Verification (End of Overlap)**

- [ ] Email: "How's the new platform working for you?"
- [ ] Check if they've used it
- [ ] Address any issues
- [ ] Ask: "Are you comfortable canceling the old subscription?"
- [ ] Only proceed if they confirm yes

**Step 5: Gumroad Cancellation**

- [ ] Cancel their Gumroad subscription
- [ ] Send confirmation email
- [ ] Remind them: "You're now on Shopify, here's your login..."
- [ ] Provide support contact prominently

**Step 6: Follow-Up (1 Week Later)**

- [ ] Check-in email: "Just making sure everything's working well!"
- [ ] Quick survey: "How was the migration experience?" (1-5 stars)
- [ ] Ask for feedback/suggestions
- [ ] Thank them for migrating
- [ ] Consider small surprise bonus (e.g., extra month free)

**Time Investment Per Subscriber:**

- Pre-migration: 15-30 minutes
- Setup call: 30-45 minutes
- Follow-up: 10-15 minutes
- **Total: ~1-1.5 hours per subscriber**
- **For 10-30 subscribers: 10-45 hours total over 18 months**

**Worth it?** Absolutely. 100% retention = ~$200-600/mo preserved revenue = $2,400-7,200/year value = $20,000-60,000 over 10 years. Your time investment of 10-45 hours has an ROI of 100-1000x.

---

## 3. Link Preservation Strategy

**CRITICAL FOR:** SEO, user experience, existing marketing materials, email campaigns, social posts

### Current Link Structure

- **Gumroad subdomain:** `developassion.gumroad.com/l/[product-slug]`
- **Custom domain:** `store.dsebastien.net/l/[product-slug]`

### The Challenge

- You control `store.dsebastien.net` (can redirect)
- You DON'T control `developassion.gumroad.com` (cannot redirect directly)
- Unknown number of external backlinks pointing to both domains
- Broken links hurt SEO and lose sales

### Strategy A: Custom Domain Links (Full Control)

**store.dsebastien.net - YOU CONTROL THIS**

**Implementation:**

1. **Map old → new URL structure:**

    ```
    OLD: store.dsebastien.net/l/knowii-community
    NEW: store.dsebastien.net/products/knowii-community

    OLD: store.dsebastien.net/l/obsidian-starter-kit
    NEW: store.dsebastien.net/products/obsidian-starter-kit
    ```

2. **Set up 301 redirects in Shopify:**
    - Use Shopify's built-in redirect manager OR
    - Install "Easy Redirects" app ($7/mo)
    - Create redirect for EVERY product:
        ```
        /l/product-name → /products/product-name (301 permanent)
        ```

3. **Preserve URL slugs where possible:**
    - Use identical slugs in Shopify as you had in Gumroad
    - Example: If Gumroad slug was "pkm-library", use "pkm-library" in Shopify
    - This allows simple pattern-based redirects

4. **Test all redirects:**
    - Create spreadsheet with all old URLs
    - Test each one manually or with automated tool
    - Verify 301 status code (not 302)
    - Check redirect chain (should be direct, not multiple hops)

**Expected Result:** 100% of custom domain links will work seamlessly.

### Strategy B: Gumroad Subdomain Links (Partial Control)

**developassion.gumroad.com - GUMROAD CONTROLS THIS**

**Option 1: Use Gumroad's Product Redirect Feature**

1. Keep Gumroad account active (free)
2. For each product in Gumroad dashboard:
    - Edit product settings
    - Find "Redirect URL" field
    - Enter corresponding Shopify URL: `https://store.dsebastien.net/products/[slug]`
    - Set product as "Unavailable" or "Archived"
3. When users visit old Gumroad link, they're automatically redirected

**Pros:**

- ✅ Automatic redirect
- ✅ No broken links
- ✅ SEO link juice preserved (301 redirect)

**Cons:**

- ❌ Requires keeping Gumroad account active
- ❌ Must configure for each product individually
- ❌ Dependent on Gumroad maintaining this feature

**Option 2: Landing Page Approach**

1. Keep Gumroad products live but unavailable
2. Edit each product description with prominent notice:

    ```
    🚀 THIS PRODUCT HAS MOVED!

    Find it at the new store:
    👉 store.dsebastien.net/products/[name]

    All existing customers: Your purchases are still accessible
    at the new location.
    ```

3. Add big "Visit New Store" button
4. Set product as unavailable for purchase

**Pros:**

- ✅ Full control over messaging
- ✅ Can explain migration to visitors

**Cons:**

- ❌ Not a true redirect (requires user click)
- ❌ Worse user experience
- ❌ May lose some visitors

**RECOMMENDED:** Use Option 1 (redirect feature) wherever available.

### Strategy C: Link Replacement Campaign

**Systematic update of all links you control:**

**Phase 1: Audit (Week 1-2)**

1. **Google Search Console:**
    - Find pages with most external links
    - Identify which products get most traffic
    - Export backlink data

2. **Manual Content Audit:**
    - Blog posts (your own site)
    - YouTube video descriptions
    - Social media bios (Twitter, LinkedIn, etc.)
    - Email signature
    - Course platforms (Gumroad, Teachable, etc.)
    - Newsletter footers
    - GitHub repos
    - Reddit/forum posts

3. **Create tracking spreadsheet:**
    ```
    | Location | Old URL | New URL | Priority | Status | Updated Date |
    |----------|---------|---------|----------|--------|--------------|
    | Blog post: "PKM Guide" | gumroad.com/l/pkm | store.dsebastien.net/products/pkm | High | Pending | - |
    ```

**Phase 2: Prioritized Updates (Week 3-8)**

**Priority 1 (Week 3-4): High-traffic owned content**

- Blog posts with most views
- Pinned social media posts
- Email signature
- Primary landing pages
- Newsletter templates

**Priority 2 (Week 5-6): Medium-traffic owned content**

- Older blog posts
- YouTube descriptions (recent videos)
- Course materials
- GitHub READMEs

**Priority 3 (Week 7-8): Low-traffic and external**

- Old YouTube videos
- Forum posts
- Social media comments
- Guest posts on other sites (reach out to authors)

**Phase 3: Monitor (Ongoing)**

- Track 404 errors in Shopify/Google Search Console
- Set up alerts for broken links
- Create new redirects as needed

### Link Preservation Checklist

**Before DNS Migration:**

- [ ] Export complete product list from Gumroad
- [ ] Create URL mapping spreadsheet (old → new)
- [ ] Set up all redirects in Shopify
- [ ] Test redirects on temporary Shopify domain
- [ ] Configure Gumroad product redirects
- [ ] Audit top 20 owned content pieces

**After DNS Migration:**

- [ ] Verify all redirects work on live domain
- [ ] Monitor Google Search Console for 404s
- [ ] Begin systematic link replacement
- [ ] Track redirect traffic in analytics
- [ ] Set up alerts for broken links

**Expected Results:**

- 95%+ of traffic successfully redirected
- Minimal SEO ranking loss (temporary dip normal)
- <1% of users experience broken links
- Recovery to baseline traffic within 4-8 weeks

---

## 4. Customer Data Migration

### Data Inventory

**What Needs Migration:**

- Customer emails, names, addresses
- Purchase history (products, dates, amounts)
- Product access/licenses
- Subscription status (if migrating)
- Customer tags/segments
- Purchase frequency data
- Lifetime value metrics

**What CANNOT Be Migrated:**

- Payment methods (PCI compliance)
- Gumroad account passwords
- Login sessions

### Migration Process

#### Step 1: Export from Gumroad (Week 4)

**Actions:**

1. Login to Gumroad → Settings → Advanced → Export Data
2. Download customer CSV (includes):
    - Email addresses
    - Names
    - Product purchased
    - Purchase date
    - Amount paid
    - Affiliate info (if applicable)
3. Download sales history report
4. Export subscriber list separately (if migrating subscriptions)
5. Create secure backup (password-protected)

**Data Cleaning Checklist:**

- [ ] Remove duplicate emails
- [ ] Standardize name formats
- [ ] Validate email addresses (remove bounced)
- [ ] Identify test purchases (remove)
- [ ] Tag VIP/high-value customers

#### Step 2: Transform Data for Shopify (Week 5)

**Mapping Required:**

**Customer Fields:**

```
Gumroad → Shopify
-----------------
email → email
name → first_name + last_name (split)
purchase_date → created_at
total_spent → total_spent
product_id → tags (for access control)
```

**Product Access Mapping:**

```
Create tags based on products purchased:
- purchased:knowii-community
- purchased:obsidian-starter-kit
- purchased:pkm-library
- subscriber:active (for subscription customers)
- subscriber:gumroad (to track migration source)
```

**Shopify CSV Format:**

```csv
First Name,Last Name,Email,Tags,Total Spent,Orders Count,Note
John,Doe,john@example.com,"purchased:pkm-library,customer:vip",297,3,"Migrated from Gumroad 2026-01-15"
```

#### Step 3: Import to Shopify (Week 6)

**Option A: Native Shopify Import (Simple, Limited)**

**Process:**

1. Shopify Admin → Customers → Import
2. Download Shopify's customer CSV template
3. Map your data to template format
4. Upload CSV
5. Review import errors
6. Fix and re-upload if needed

**Limitations:**

- Imports customers only (NOT order history)
- No historical purchase data
- Loses customer lifetime value metrics
- Cannot track purchase frequency

**Use when:** You only need email list and basic info.

**Option B: Matrixify (Recommended - Full Migration)**

**Process:**

1. Install Matrixify app ($30/mo, can cancel after migration)
2. Export existing Shopify format template
3. Transform Gumroad data to match template
4. Import customers with historical orders:
    ```
    - Creates customer records
    - Creates "historical" orders (marked as fulfilled)
    - Preserves purchase dates
    - Maintains customer lifetime value
    - Tracks product purchase history
    ```
5. Verify import success
6. Spot-check 10-20 customer records

**Benefits:**

- ✅ Complete purchase history
- ✅ Accurate customer analytics
- ✅ Lifetime value preserved
- ✅ Order history visible to customers
- ✅ Better segmentation for marketing

**Use when:** You want complete historical data (recommended).

**Option C: API-Based Custom Migration (Advanced)**

**Process:**

1. Use Shopify Admin API
2. Write script to:
    - Create customer records
    - Create historical orders
    - Apply tags
    - Set up customer accounts
3. Run in batches to avoid rate limits
4. Log all operations for verification

**Requirements:**

- Development skills (Node.js, Python, etc.)
- API access (requires Shopify app or custom app)
- 2-5 hours development time

**Use when:** You need custom logic or have complex data requirements.

**Recommendation:** Use Matrixify (Option B) for best balance of completeness and simplicity.

#### Step 4: Grant Product Access (Week 6-7)

**Challenge:** Shopify doesn't natively link customer purchases to digital product access.

**Solution: Digital Products App Configuration**

**Using Sky Pilot (recommended):**

1. **Install and configure Sky Pilot**
    - $15/mo
    - Upload all digital products (courses, PDFs, files)
    - Create product SKU mappings

2. **Link products to Shopify store:**
    - Each Shopify product → corresponding digital file(s)
    - Configure access rules

3. **Grant access to existing customers:**

    **Method 1: Create historical orders (if using Matrixify)**
    - Orders automatically grant access
    - Sky Pilot detects fulfilled orders
    - Customers can download immediately

    **Method 2: Manual tag-based access**
    - Use customer tags: `access:product-name`
    - Sky Pilot can grant access based on tags
    - Bulk apply tags via CSV import

    **Method 3: Generate discount codes**
    - Create 100% discount codes
    - Email to existing customers
    - They "purchase" for $0
    - System grants access automatically

4. **Set up customer portal:**
    - Sky Pilot provides download dashboard
    - Customers login → see all their products
    - Can re-download anytime

**Alternative Apps:**

- **SendOwl** ($9-39/mo): Good for simple digital delivery
- **Digital Downloads** (Free): Basic file delivery, limited features
- **FetchApp** ($5-50/mo): Robust digital delivery with licensing

#### Step 5: Customer Communication (Week 8-9)

**Email Sequence:**

**Email 1: Pre-Migration Announcement (T-14 days)**

```
Subject: Important: Your dSebastien Store is Moving to a New Platform

Hi [First Name],

I'm excited to share that I'm upgrading my store to provide you with a better experience!

What's changing:
• New store platform (same great products)
• Better download experience
• Easier access to your purchases
• New features coming soon

What's NOT changing:
• All your purchased products remain accessible
• Same pricing and quality
• Same support (me!)

Timeline:
• January 15: New store goes live
• You'll receive new login instructions
• All your products will be waiting for you

No action needed from you right now. I'll send detailed instructions next week.

Questions? Just reply to this email.

Thanks for your support!
- dSebastien
```

**Email 2: Migration Day - Access Instructions (T-0)**

```
Subject: Action Required: Access Your Products on the New Store

Hi [First Name],

The new store is live! Here's how to access your products:

Step 1: Visit https://store.dsebastien.net
Step 2: Click "Create Account" (top right)
Step 3: Use THIS email address: [their email]
Step 4: Create a password
Step 5: Access your products in "My Account" → "Downloads"

Your Products:
✅ [Product 1]
✅ [Product 2]
✅ [Product 3]

All your purchases are ready to download immediately.

Having trouble? Watch this 2-minute video: [link]

Or reply to this email for personal help.

Welcome to the new store!
- dSebastien

P.S. Old Gumroad links will redirect automatically, but bookmark the new URL!
```

**Email 3: Follow-Up for Non-Actives (T+7 days)**

```
Subject: Haven't accessed your products yet? Here's help

Hi [First Name],

I noticed you haven't logged into the new store yet.

Quick reminder: All your purchased products are waiting for you at:
👉 https://store.dsebastien.net

Need help? Common issues:
• "Can't find my products" → Make sure you used [their email]
• "Forgot my password" → Use the password reset link
• "Having trouble" → Reply to this email, I'll help personally

Your products aren't going anywhere, but I want to make sure you can access them!

- dSebastien
```

**Communication Channels:**

- Email (primary)
- Social media announcement
- Blog post explaining migration
- YouTube community post (if you have channel)
- Discord/Slack announcement (if you have community)

#### Step 6: Verification & Support (Week 9-10)

**Verification Checklist:**

- [ ] All customers imported successfully
- [ ] Customer count matches Gumroad export
- [ ] Tags applied correctly
- [ ] High-value customers verified manually (top 10%)
- [ ] Test accounts can access products
- [ ] Download links work for all product types
- [ ] Customer portal is functional

**Support Preparation:**

- [ ] Create FAQ document for common issues
- [ ] Set up support email/chat system
- [ ] Prepare video tutorial for accessing products
- [ ] Have customer database ready for lookups
- [ ] Block calendar time for support tickets

**Expected Support Volume:**

- Week 1: High (expect 10-30 tickets)
- Week 2: Medium (5-15 tickets)
- Week 3+: Low (2-5 tickets)

---

## 5. Domain & DNS Migration

### Current Setup

```
Domain: store.dsebastien.net
DNS Record: CNAME → domains.gumroad.com
Result: Points to Gumroad-hosted store
```

### Target Setup

```
Domain: store.dsebastien.net
DNS Records: A record → Shopify IP (23.227.38.65)
            CNAME → shops.myshopify.com
Result: Points to Shopify-hosted store
```

### Migration Process

#### Phase 1: Shopify Setup (Before DNS Change)

**Week 1-7: Build on Temporary Domain**

1. **Create Shopify store:**
    - Sign up: shopify.com
    - Choose plan: Shopify Basic ($79/mo) recommended
    - Temporary URL: `yourname.myshopify.com`

2. **Complete setup on temp domain:**
    - Install theme
    - Create all products
    - Configure apps
    - Import customers
    - Set up payment gateway
    - Configure shipping/tax settings
    - Test all functionality

3. **Full testing cycle:**
    - [ ] Complete test purchase (all payment methods)
    - [ ] Verify digital product delivery
    - [ ] Test email notifications
    - [ ] Check mobile responsiveness
    - [ ] Verify customer account creation
    - [ ] Test subscription signup (if applicable)
    - [ ] Confirm analytics tracking
    - [ ] Speed test (aim for <3 second load time)

**DO NOT change DNS until everything is perfect on temp domain.**

#### Phase 2: Domain Connection (Week 8)

**Step 1: Add Domain to Shopify (Tuesday)**

1. Shopify Admin → Settings → Domains
2. Click "Connect existing domain"
3. Enter: `store.dsebastien.net`
4. Shopify provides DNS instructions:
    ```
    A record: 23.227.38.65
    CNAME: shops.myshopify.com
    ```
5. **DO NOT verify yet** - just note the instructions

**Step 2: Prepare DNS Records (Tuesday Evening)**

1. Login to your DNS provider (where store.dsebastien.net is managed):
    - Could be: Cloudflare, Namecheap, GoDaddy, etc.
2. Locate current DNS records
3. **Document current settings** (for rollback):
    ```
    Current:
    Type: CNAME
    Name: store
    Value: domains.gumroad.com
    TTL: 3600
    ```
4. **Prepare new settings** (don't save yet):
    ```
    New:
    Type: A
    Name: store
    Value: 23.227.38.65
    TTL: 3600
    ```

**Step 3: Change DNS (Wednesday 2 AM - Low Traffic Time)**

**Why 2 AM?**

- Lowest traffic period
- DNS propagation happens while most customers sleep
- Issues discovered before business hours

**Actions:**

1. **2:00 AM:** Delete old CNAME record pointing to Gumroad
2. **2:01 AM:** Add new A record pointing to Shopify
3. **2:05 AM:** Clear your DNS cache locally

    ```bash
    # Mac/Linux
    sudo dscacheutil -flushcache

    # Windows
    ipconfig /flushdns
    ```

4. **2:10 AM:** Test store.dsebastien.net
    - May still show Gumroad (normal - DNS propagation)
    - Use https://dnschecker.org to monitor propagation

#### Phase 3: Monitoring (Wednesday-Friday)

**DNS Propagation Timeline:**

- 0-2 hours: 20% of users see new site
- 2-6 hours: 50% of users see new site
- 6-12 hours: 80% of users see new site
- 12-24 hours: 95% of users see new site
- 24-48 hours: 99%+ of users see new site

**Monitoring Checklist (Every 2 hours, first 24h):**

**Hour 0-2:**

- [ ] Check https://store.dsebastien.net from multiple devices
- [ ] Verify SSL certificate status (may be pending)
- [ ] Check analytics for traffic (may be split)
- [ ] Test checkout flow
- [ ] Monitor support channels

**Hour 2-6:**

- [ ] SSL should be active now (green padlock)
- [ ] More traffic shifting to Shopify
- [ ] Test from mobile device
- [ ] Check all product pages load

**Hour 6-24:**

- [ ] Verify analytics shows full traffic on Shopify
- [ ] Confirm no 404 errors in logs
- [ ] Test all redirect rules
- [ ] Monitor page load speed

**Hour 24-48:**

- [ ] 99% of traffic should be on Shopify
- [ ] Review first day sales data
- [ ] Check for any support issues
- [ ] Verify email delivery working

**Tools for Monitoring:**

- **DNS Propagation:** https://dnschecker.org
- **SSL Status:** https://www.ssllabs.com/ssltest/
- **Site Status:** https://uptimerobot.com (set up beforehand)
- **Analytics:** Shopify Admin + Google Analytics

#### Phase 4: SSL Certificate (Automatic)

**Shopify's SSL Process:**

- Shopify uses Let's Encrypt (free, automatic)
- Certificate provisions within 24-48 hours of DNS propagation
- No action required from you
- Auto-renews every 90 days

**Potential Issues:**

- **"Not Secure" warning first 24h:** Normal during provisioning
- **Mixed content warnings:** Ensure all assets use HTTPS
- **Certificate delay >48h:** Contact Shopify support

**Forcing HTTPS:**

- Shopify Admin → Online Store → Preferences
- Check "Redirect all traffic to HTTPS"
- Wait until SSL is active before enabling

#### Phase 5: Rollback Plan (If Needed)

**When to Rollback:**

- Site down for >2 hours
- Critical functionality broken (checkout not working)
- SSL certificate won't provision after 48h
- Major bug discovered affecting all customers

**Rollback Process (15 minutes):**

1. Login to DNS provider
2. Delete A record pointing to Shopify:
    ```
    Delete: A record, 23.227.38.65
    ```
3. Re-add CNAME pointing to Gumroad:
    ```
    Add: CNAME, domains.gumroad.com
    ```
4. Wait 10-30 minutes for propagation
5. Verify store.dsebastien.net shows Gumroad again
6. Investigate Shopify issues
7. Fix and try again later

**After Rollback:**

- Communicate with customers about temporary issue
- Fix root cause on Shopify temp domain
- Plan second migration attempt (1-2 weeks later)

### Domain Migration Checklist

**2 Weeks Before:**

- [ ] Complete Shopify store on temp domain
- [ ] Test everything thoroughly
- [ ] Set up all redirects
- [ ] Install SSL-required apps
- [ ] Document current DNS settings

**1 Week Before:**

- [ ] Announce migration to customers
- [ ] Prepare support team/docs
- [ ] Set up monitoring tools
- [ ] Schedule low-traffic window
- [ ] Create rollback procedure doc

**Day Before:**

- [ ] Final test on temp domain
- [ ] Verify redirect rules
- [ ] Prepare DNS changes (don't apply)
- [ ] Set up DNS monitoring
- [ ] Clear schedule for monitoring period

**Migration Day:**

- [ ] 2 AM: Change DNS records
- [ ] 2-4 AM: Monitor propagation
- [ ] 6 AM: Verify SSL provisioning started
- [ ] Throughout day: Monitor traffic/errors
- [ ] Evening: Review first day results

**Week After:**

- [ ] Daily monitoring of analytics
- [ ] Address any customer issues
- [ ] Verify all features working
- [ ] Check redirect traffic
- [ ] Confirm SSL fully active

**Expected Results:**

- 0-4 hours: Some users see old site, some see new (normal)
- 4-12 hours: Majority on new site
- 24 hours: 95%+ on new site
- 48 hours: 99%+ on new site, SSL active
- 1 week: Complete migration, full traffic on Shopify

---

## 6. Complete Migration Timeline

**Total Duration:** 12-16 weeks
**Effort Required:** 40-80 hours total (5-10 hours/week)

### Phase 1: Planning & Setup (Weeks 1-3)

#### Week 1: Research & Decision

**Goals:** Validate Shopify choice, create foundation

**Tasks:**

- [ ] Sign up for Shopify trial (3 days free)
- [ ] Explore Shopify admin interface
- [ ] Choose Shopify plan (Basic $79/mo recommended)
- [ ] Document all current Gumroad products
    - Export product list
    - Screenshot all product pages
    - Note pricing, features, descriptions
- [ ] Create comprehensive link audit spreadsheet
    - All blog posts with store links
    - YouTube descriptions
    - Social media bios
    - Email signature
    - Course materials
- [ ] Export customer data from Gumroad
    - Customer CSV
    - Sales history
    - Subscriber list (if applicable)
- [ ] Decide on subscription migration approach
    - **Recommendation:** Dual-run for safety
    - Document reasoning
    - Calculate expected churn
- [ ] Calculate cost comparison
    - Current Gumroad fees (last 6 months average)
    - Projected Shopify costs (fixed + variable)
    - Break-even analysis

**Deliverables:**

- Shopify account created
- Complete product inventory
- Customer data exported
- Link audit spreadsheet
- Cost analysis document
- Migration approach decision

**Time Estimate:** 8-10 hours

#### Week 2: App Research & Theme Selection

**Goals:** Choose and install essential apps, set up store foundation

**Tasks:**

- [ ] Research and select apps:

    **Essential Apps:**
    - Digital products: Sky Pilot ($15/mo) vs SendOwl ($9/mo) vs Digital Downloads (free)
    - Subscriptions: Appstle ($10-30/mo) vs Recharge ($99/mo) - only if migrating subscriptions
    - Redirects: Easy Redirects ($7/mo) vs Shopify native
    - Email marketing: Klaviyo (free <250 contacts) vs Shopify Email

    **Nice-to-Have Apps:**
    - Reviews: Judge.me (free plan)
    - SEO: Plug in SEO (free)
    - Analytics: Google Analytics integration
    - Live chat: Tidio (free plan) or Gorgias

- [ ] Install chosen apps on Shopify store
- [ ] Configure basic app settings
- [ ] Choose and install Shopify theme:

    **Free Themes (Recommended for Start):**
    - Dawn (Shopify's default, fast, clean)
    - Sense (modern, minimalist)
    - Craft (creator-focused)

    **Premium Themes ($180-350):**
    - Empire (if you have many products)
    - Pipeline (if you want modern aesthetic)
    - Impulse (if you want rich imagery)

- [ ] Customize theme basics:
    - Upload logo
    - Set brand colors
    - Configure fonts
    - Set up basic layout

- [ ] Configure store settings:
    - Payment gateway (Shopify Payments or Stripe)
    - Tax settings
    - Checkout settings
    - Legal pages (privacy policy, terms of service, refund policy)

**Deliverables:**

- All essential apps installed and configured
- Theme chosen and basic customization complete
- Payment processing configured
- Legal foundation in place

**Time Estimate:** 6-8 hours

#### Week 3: Product Creation

**Goals:** Recreate all Gumroad products in Shopify

**Tasks:**

- [ ] Create URL mapping spreadsheet:

    ```
    | Gumroad Product | Gumroad Slug | Shopify Product | Shopify Slug | Old URL | New URL |
    |-----------------|--------------|-----------------|--------------|---------|---------|
    | Knowii Community | knowii-community | Knowii Community | knowii-community | store.dsebastien.net/l/knowii-community | store.dsebastien.net/products/knowii-community |
    ```

- [ ] For each product, create in Shopify:
    1. **Basic Info:**
        - Product name (match Gumroad exactly or rebrand)
        - Description (copy from Gumroad, enhance if needed)
        - Images (use same or upgrade)
        - URL handle (match Gumroad slug for easier redirects)

    2. **Pricing:**
        - Price (match current or adjust)
        - Compare-at price (if showing discount)
        - Variants (if multiple tiers)

    3. **Digital Files (via chosen app):**
        - Upload files to Sky Pilot/SendOwl
        - Link files to product
        - Configure download limits/expiry if needed

    4. **SEO:**
        - Meta title (optimize for search)
        - Meta description
        - URL handle (keep consistent with Gumroad)

    5. **Organization:**
        - Collections (e.g., "Courses", "Starter Kits", "Templates")
        - Tags (for filtering)
        - Product type

- [ ] Create subscription products (if applicable):
    - Configure in Appstle/Recharge
    - Set billing frequency
    - Set up subscription discounts
    - Configure cancellation policy

- [ ] Set up product redirects (prepare, don't activate yet):
    - `/l/product-1` → `/products/product-1`
    - `/l/product-2` → `/products/product-2`
    - Create in Easy Redirects app or native Shopify

**Deliverables:**

- All products created in Shopify
- Digital files uploaded and linked
- URL mapping complete
- Redirect rules prepared
- Collections organized

**Time Estimate:** 8-12 hours (depends on number of products)

---

### Phase 2: Testing & Preparation (Weeks 4-6)

#### Week 4: Functionality Testing

**Goals:** Ensure everything works perfectly before launch

**Tasks:**

- [ ] **Complete purchase flow testing:**
    1. Add product to cart
    2. Proceed to checkout
    3. Enter test payment info (Shopify provides test card numbers)
    4. Complete purchase
    5. Verify order confirmation email arrives
    6. Check digital download link in email works
    7. Verify product access in customer account
    8. Test re-download functionality

- [ ] **Test multiple scenarios:**
    - [ ] Different payment methods (card, PayPal, etc.)
    - [ ] Different product types (single, bundle, subscription)
    - [ ] Mobile checkout flow (iOS and Android)
    - [ ] Tablet checkout flow
    - [ ] Guest checkout
    - [ ] Returning customer checkout
    - [ ] Apply discount code
    - [ ] Failed payment handling

- [ ] **Test digital delivery system:**
    - [ ] Files download correctly
    - [ ] Download page is user-friendly
    - [ ] Files are correct version/type
    - [ ] Large files don't timeout
    - [ ] Download limit enforcement (if applicable)
    - [ ] Expiry system works (if applicable)

- [ ] **Test email notifications:**
    - [ ] Order confirmation (format, branding, links)
    - [ ] Download delivery email
    - [ ] Shipping confirmation (if applicable)
    - [ ] Welcome email for new customers
    - [ ] Password reset email
    - [ ] Subscription confirmation (if applicable)

- [ ] **Test customer account features:**
    - [ ] Account creation
    - [ ] Login/logout
    - [ ] Password reset
    - [ ] Order history display
    - [ ] Product download access
    - [ ] Profile editing
    - [ ] Email preference management

- [ ] **Mobile responsiveness check:**
    - [ ] Homepage renders correctly
    - [ ] Product pages readable
    - [ ] Cart functions properly
    - [ ] Checkout mobile-optimized
    - [ ] Menu navigation works
    - [ ] Touch targets appropriately sized

- [ ] **Performance testing:**
    - Use Google PageSpeed Insights
    - Target: >80 score on mobile, >90 on desktop
    - Optimize images if needed (compress, use WebP)
    - Minimize app scripts if possible

- [ ] **Browser compatibility:**
    - [ ] Chrome/Edge (Chromium)
    - [ ] Safari (macOS and iOS)
    - [ ] Firefox
    - [ ] Test on older browser versions if relevant audience

**Deliverables:**

- All tests passed
- Issues documented and fixed
- Performance optimized
- Test purchase records for reference

**Time Estimate:** 6-8 hours

#### Week 5: Customer Data Import & Access Setup

**Goals:** Import all customers and grant product access

**Tasks:**

- [ ] **Prepare customer data:**
    - Clean Gumroad export CSV
    - Remove duplicates
    - Standardize formatting
    - Create tags for purchased products
    - Flag VIP/high-value customers
    - Add migration notes

- [ ] **Import customers using Matrixify:**
    1. Install Matrixify app ($30/mo)
    2. Download Shopify import template
    3. Map Gumroad data to Shopify format:
        ```csv
        First Name,Last Name,Email,Tags,Total Spent,Orders Count,Note
        ```
    4. Import customers
    5. Import historical orders (mark as fulfilled)
    6. Verify import success
    7. Spot-check 20 random customer records

- [ ] **Grant product access:**
    - If using historical orders: Access auto-granted by Sky Pilot
    - If using tags: Configure Sky Pilot to grant access based on tags
    - Alternative: Generate 100% discount codes for existing customers

- [ ] **Set up customer segments for marketing:**
    - All customers (migrated from Gumroad)
    - High-value customers (>$500 LTV)
    - Recent purchasers (last 90 days)
    - Inactive customers (no purchase in 12+ months)
    - Subscribers (if applicable)

- [ ] **Create customer welcome materials:**
    - Account access instructions (PDF or webpage)
    - FAQ document
    - Video tutorial (2-3 minutes)
    - Troubleshooting guide

- [ ] **Test customer accounts:**
    - Create test account with typical purchased products
    - Verify can login
    - Verify can see order history
    - Verify can access downloads
    - Test password reset flow
    - Test from customer perspective

**Deliverables:**

- All customers imported with historical data
- Product access configured and verified
- Customer segments created
- Welcome materials prepared
- Test accounts validated

**Time Estimate:** 8-10 hours

#### Week 6: Email Templates & Communication Prep

**Goals:** Prepare all customer communication materials

**Tasks:**

- [ ] **Configure Shopify email templates:**
    - Order confirmation
    - Order delivery (digital products)
    - Shipping confirmation
    - Welcome email
    - Password reset
    - Abandoned cart (if using)

- [ ] **Customize email branding:**
    - Add logo
    - Set brand colors
    - Customize footer
    - Add social media links
    - Include support contact info

- [ ] **Draft migration announcement emails:**

    **Email 1: Pre-migration announcement (T-14 days)**
    - Subject line
    - Body copy
    - Call-to-action
    - FAQ links

    **Email 2: Migration day - access instructions (T-0)**
    - Subject line
    - Step-by-step access instructions
    - Video tutorial link
    - Support contact

    **Email 3: Follow-up for non-actives (T+7 days)**
    - Subject line
    - Gentle reminder
    - Troubleshooting help
    - Personal support offer

- [ ] **Create migration landing page (optional but recommended):**
    - Explain why you're migrating
    - What's better in new store
    - How to access products
    - FAQs
    - Video walkthrough
    - Live chat or support form

- [ ] **Prepare social media announcements:**
    - Twitter/X thread
    - LinkedIn post
    - Instagram story/post
    - YouTube community post (if applicable)
    - Discord/Slack announcement (if applicable)

- [ ] **Set up support systems:**
    - Install live chat widget (Tidio, Gorgias, etc.)
    - Create support email: support@dsebastien.net
    - Set up help center (Shopify built-in or app)
    - Prepare canned responses for common questions
    - Block calendar time for migration support

- [ ] **Create internal migration checklist:**
    - Day-of timeline
    - Emergency contacts (Shopify support, DNS provider)
    - Rollback procedure
    - Monitoring checklist

**Deliverables:**

- All email templates customized
- Migration emails drafted and scheduled
- Social media content prepared
- Support systems configured
- Landing page live (if creating)

**Time Estimate:** 6-8 hours

---

### Phase 3: Soft Launch (Weeks 7-8)

#### Week 7: Private Beta Test

**Goals:** Test with real users before public launch

**Tasks:**

- [ ] **Select beta testers:**
    - 10-20 trusted customers/friends
    - Mix of technical and non-technical
    - Include both new and existing customers
    - Variety of devices/browsers

- [ ] **Send beta invitation:**

    ```
    Subject: Help me test my new store (+ get a free product)

    Hi [Name],

    I'm launching a new store and would love your feedback before going public.

    What I need:
    - Try making a test purchase (you won't be charged)
    - Access your products as an existing customer
    - Tell me what's confusing or broken
    - 15-20 minutes of your time

    What you get:
    - Early access to [new product/feature]
    - 50% off your next purchase
    - My eternal gratitude

    Interested? Reply and I'll send instructions.

    - dSebastien
    ```

- [ ] **Provide beta testing instructions:**
    - What to test (purchase flow, product access, etc.)
    - How to report issues (Google Form, email, etc.)
    - Test account credentials (if needed)
    - Timeline (complete by X date)

- [ ] **Set up feedback collection:**
    - Google Form with structured questions
    - Or Typeform for better UX
    - Questions to include:
        - How easy was checkout? (1-5)
        - Could you access products easily? (yes/no)
        - Did you encounter any errors? (describe)
        - How does this compare to old store? (better/same/worse)
        - Would you recommend to others? (1-10 NPS)
        - Any suggestions for improvement?

- [ ] **Monitor beta testing:**
    - Track who completed testing
    - Follow up with non-responders
    - Review feedback daily
    - Prioritize critical issues
    - Document all reported issues

- [ ] **Fix critical issues:**
    - Broken checkout flows
    - Failed digital delivery
    - Access problems
    - Mobile layout issues
    - Email delivery problems

- [ ] **Iterate based on feedback:**
    - Confusing navigation? Improve.
    - Unclear instructions? Clarify.
    - Slow page load? Optimize.
    - Missing information? Add.

**Deliverables:**

- Beta test completed with 10-20 users
- Feedback collected and analyzed
- Critical issues fixed
- Nice-to-have improvements documented for later

**Time Estimate:** 6-8 hours

#### Week 8: Final Preparations

**Goals:** Prepare everything for public launch

**Tasks:**

- [ ] **Final comprehensive review:**
    - Re-test all fixed issues
    - Verify all products are live
    - Check all images load correctly
    - Test all internal links
    - Verify footer links (privacy, terms, etc.)
    - Check spelling/grammar on all pages
    - Ensure contact information is correct

- [ ] **Set up analytics:**
    - Connect Google Analytics 4
    - Configure conversion tracking
    - Set up e-commerce tracking
    - Create custom events (product downloads, etc.)
    - Test data is flowing correctly
    - Set up Google Search Console
    - Submit sitemap to Google

- [ ] **Configure all redirects:**
    - Test EVERY redirect manually:
        ```
        store.dsebastien.net/l/product-1 → verify redirects to → store.dsebastien.net/products/product-1
        ```
    - Use redirect checker tool
    - Verify 301 status (permanent redirect)
    - Check no redirect chains (A→B→C bad, A→C good)
    - Document any redirects that can't be created yet (domain not migrated)

- [ ] **Set up Gumroad product redirects:**
    - For each product in Gumroad:
        - Edit product settings
        - Add redirect URL to Shopify equivalent
        - Set as unavailable/archived
        - Save and test redirect

- [ ] **Prepare launch day checklist:**

    ```
    LAUNCH DAY TIMELINE:

    2:00 AM: Change DNS records
    2:05 AM: Clear local DNS cache
    2:15 AM: Test store.dsebastien.net from multiple locations
    2:30 AM: Monitor DNS propagation (dnschecker.org)
    3:00 AM: Check every 30 min for SSL provisioning
    6:00 AM: Verify SSL active, test HTTPS
    8:00 AM: Test full purchase flow
    9:00 AM: Monitor analytics and error logs
    10:00 AM: Send "we're live" email to customers
    Throughout day: Monitor support channels
    6:00 PM: Review first day analytics
    ```

- [ ] **Prepare rollback procedure:**
    - Document current DNS settings
    - Save screenshots
    - Write step-by-step rollback instructions
    - Identify decision criteria (when to rollback)
    - Prepare rollback communication to customers

- [ ] **Schedule migration announcement emails:**
    - Email 1 (T-14 days): Pre-announcement
    - Email 2 (T-0, launch day 10 AM): "We're live!"
    - Email 3 (T+7 days): Follow-up for non-actives
    - Schedule in Klaviyo or Shopify Email

- [ ] **Finalize support preparation:**
    - Review FAQ document
    - Test live chat widget
    - Ensure support email monitored
    - Prepare out-of-office if needed
    - Clear calendar for launch day support

- [ ] **Create launch day monitoring dashboard:**
    - Shopify Admin (sales, traffic)
    - Google Analytics (real-time)
    - DNS checker (propagation status)
    - SSL checker (certificate status)
    - Support inbox
    - Social media mentions

**Deliverables:**

- All redirects configured and tested
- Analytics tracking verified
- Launch checklist finalized
- Emails scheduled
- Support ready
- Monitoring dashboard prepared

**Time Estimate:** 6-8 hours

---

### Phase 4: DNS Migration (Week 9)

#### Day 1-2 (Monday-Tuesday): Pre-Migration

**Tasks:**

- [ ] **Monday morning: Final announcement:**
    - Send pre-migration email (T-2 days)
    - Post on social media
    - Update website banner (if applicable)
    - Pin message in Discord/Slack (if applicable)

- [ ] **Monday afternoon: Final system check:**
    - [ ] All products visible and purchasable on temp domain
    - [ ] Digital delivery working 100%
    - [ ] Email notifications sending
    - [ ] Analytics tracking correctly
    - [ ] All redirects ready (not active yet)
    - [ ] Customer data imported
    - [ ] Support systems online

- [ ] **Tuesday: Final preparations:**
    - [ ] Document current DNS settings (screenshot)
    - [ ] Prepare new DNS records (don't apply)
    - [ ] Test on yourname.myshopify.com one last time
    - [ ] Set alarms for 1:45 AM Wednesday
    - [ ] Ensure laptop charged, reliable internet
    - [ ] Have DNS provider login ready
    - [ ] Have Shopify support number saved
    - [ ] Prepare coffee ☕

- [ ] **Tuesday evening: Communication:**
    - Send reminder email about migration tomorrow
    - Post on social media: "Big day tomorrow!"
    - Prepare monitoring tools

**Time Estimate:** 2-3 hours

#### Day 3 (Wednesday): MIGRATION DAY

**1:45 AM: Wake up and prepare**

- [ ] Boot computer
- [ ] Test internet connection
- [ ] Open DNS provider dashboard
- [ ] Open Shopify admin
- [ ] Open monitoring tools
- [ ] Have rollback procedure ready

**2:00 AM: Execute DNS change**

- [ ] Login to DNS provider (Cloudflare, Namecheap, etc.)
- [ ] Locate store.dsebastien.net DNS records
- [ ] Screenshot current settings (backup)
- [ ] Delete CNAME record pointing to domains.gumroad.com
- [ ] Add A record pointing to 23.227.38.65 (Shopify)
- [ ] Set TTL to 3600 (1 hour)
- [ ] Save changes
- [ ] Note exact time of change

**2:05 AM: Clear cache and initial test**

- [ ] Clear local DNS cache:

    ```bash
    # Mac
    sudo dscacheutil -flushcache
    sudo killall -HUP mDNSResponder

    # Linux
    sudo systemd-resolve --flush-caches

    # Windows
    ipconfig /flushdns
    ```

- [ ] Wait 2 minutes
- [ ] Test store.dsebastien.net in incognito browser
- [ ] Expect: May still show Gumroad (DNS not propagated yet)

**2:15 AM: Begin monitoring**

- [ ] Check DNS propagation: https://dnschecker.org
    - Enter: store.dsebastien.net
    - Look for: Some servers showing new IP (23.227.38.65)
- [ ] Test from mobile device (uses different DNS)
- [ ] Test using VPN (different geographic location)

**2:30 AM - 6:00 AM: Monitoring period**

- [ ] Check every 30 minutes:
    - DNS propagation status (aim for 80%+ green)
    - Can access store.dsebastien.net
    - Test page loads correctly
    - Check for SSL warnings (expected initially)

**6:00 AM: SSL verification**

- [ ] Check https://store.dsebastien.net
- [ ] Look for green padlock (SSL active)
- [ ] If still "Not Secure": Normal, wait until 10 AM
- [ ] Test SSL status: https://www.ssllabs.com/ssltest/
- [ ] Goal: A or B rating

**8:00 AM: Comprehensive functionality test**

- [ ] Test complete purchase flow:
    - Add product to cart
    - Checkout
    - Complete test purchase
    - Verify confirmation email
    - Check digital download works
- [ ] Test from mobile device
- [ ] Verify analytics tracking
- [ ] Check all redirect rules working:
    - Test /l/product-1 → /products/product-1
    - Test 5-10 most important redirects
- [ ] Monitor Shopify analytics dashboard

**9:00 AM - 5:00 PM: Active monitoring**

- [ ] Check analytics every hour:
    - Traffic volume (compare to normal)
    - Conversion rate
    - Any errors or issues
- [ ] Monitor support channels:
    - Email support inbox
    - Live chat
    - Social media mentions
- [ ] Respond to any customer issues ASAP
- [ ] Track issues in spreadsheet

**10:00 AM: Send "We're Live" email**

- [ ] Verify SSL is 100% active first
- [ ] Send migration day email to all customers
- [ ] Post on social media
- [ ] Monitor for confusion/questions

**5:00 PM: Day 1 review**

- [ ] Review analytics:
    - Total visits
    - Sales (compare to typical Wednesday)
    - Conversion rate
    - Top landing pages
    - Any 404 errors
- [ ] Count support tickets received
- [ ] Document any issues encountered
- [ ] Plan fixes for tomorrow

**Time Estimate:** 6-8 hours (spread throughout day)

#### Day 4-5 (Thursday-Friday): Post-Migration Monitoring

**Thursday Tasks:**

- [ ] **Morning check (9 AM):**
    - DNS propagation should be 95%+ now
    - SSL fully active
    - No "Not Secure" warnings
    - Analytics showing normal traffic patterns

- [ ] **Verify all core functionality:**
    - [ ] Purchase flow working
    - [ ] Digital delivery working
    - [ ] Email notifications sending
    - [ ] Customer accounts accessible
    - [ ] All redirect rules working
    - [ ] Mobile experience good

- [ ] **Address any Wednesday issues:**
    - Fix reported bugs
    - Add missing redirects
    - Clarify confusing elements
    - Improve documentation if needed

- [ ] **Monitor analytics:**
    - Compare Thursday to typical Thursday
    - Look for traffic drops (investigate if >20% down)
    - Check conversion rates
    - Review top exit pages (where people leave)

- [ ] **Support follow-up:**
    - Respond to all open tickets
    - Create FAQ from common questions
    - Update help docs based on real issues

**Friday Tasks:**

- [ ] **48-hour verification:**
    - DNS should be 99%+ propagated
    - SSL fully mature (A rating)
    - All systems stable

- [ ] **Week 1 analytics review:**
    - Total sales vs previous week
    - Traffic sources
    - Conversion rate changes
    - Any anomalies
    - Customer feedback sentiment

- [ ] **Support summary:**
    - Total tickets received
    - Common issues (fix proactively)
    - Customer satisfaction
    - Response time metrics

- [ ] **Plan for Week 2:**
    - Any remaining fixes
    - Optimization opportunities
    - Link replacement priorities

**Deliverables:**

- DNS fully migrated
- SSL active and secure
- Store fully functional on store.dsebastien.net
- All customer issues addressed
- Week 1 analytics report
- Lessons learned documented

**Time Estimate:** 4-6 hours (Thursday-Friday combined)

---

### Phase 5: Subscription Migration (Weeks 10-14)

_Only if migrating subscriptions. Skip if using dual-run indefinitely._

#### Week 10: Initial Outreach

**Goals:** Inform subscribers, offer migration incentive

**Tasks:**

- [ ] **Segment subscription customers:**
    - Export active Gumroad subscribers
    - Segment by:
        - Subscription value (high/medium/low)
        - Tenure (long-term vs recent)
        - Engagement level
    - Flag VIPs for personal outreach

- [ ] **Craft migration offer:**
    - Example: "Move to new store, get 1 month free"
    - Or: "Migrate now, get 20% off forever"
    - Or: "First 50 to migrate get [bonus product]"
    - Make it compelling but sustainable

- [ ] **Create migration landing page:**
    - Explain why migration is beneficial
    - Step-by-step migration instructions
    - FAQ for subscribers
    - Video walkthrough
    - Support contact

- [ ] **Send initial migration email:**

    ```
    Subject: [Action Needed] Move your [Subscription Name] to the new store

    Hi [Name],

    Great news! The new store is live and I'd love to migrate your subscription.

    Why migrate?
    ✅ Better download experience
    ✅ More features coming (exclusive to new platform)
    ✅ Easier subscription management

    MIGRATION BONUS:
    Move by [date] and get [incentive]

    How to migrate:
    1. Visit: [migration landing page]
    2. Sign up on new platform
    3. Use code: MIGRATE2024 (1 month free)
    4. Reply to this email to cancel old subscription

    Questions? Reply to this email or watch this video: [link]

    - dSebastien

    P.S. Old subscription will keep working until you migrate. No rush, but don't miss the bonus!
    ```

- [ ] **Set up tracking:**
    - Spreadsheet with all subscribers
    - Columns: Name, Email, Status (Not Started/In Progress/Migrated)
    - Track daily migration count
    - Monitor response rate

- [ ] **Personal outreach to VIPs:**
    - Email or DM high-value subscribers personally
    - Offer to help them migrate
    - Ask for feedback on new platform
    - Provide special bonus if appropriate

**Deliverables:**

- Migration offer defined
- Landing page live
- Initial email sent to all subscribers
- VIPs contacted personally
- Tracking system set up

**Time Estimate:** 4-6 hours

#### Week 11-12: Follow-Up & Support

**Goals:** Help stragglers migrate, provide excellent support

**Week 11 Tasks:**

- [ ] **Monitor migration rate:**
    - Target: 40-60% migrated in first 2 weeks
    - Calculate: (migrated / total subscribers) × 100
    - If below target, investigate barriers

- [ ] **Send reminder email (T+7 days):**

    ```
    Subject: Haven't migrated yet? Here's help + your bonus code

    Hi [Name],

    Just checking in - wanted to make sure you saw the migration email.

    Quick reminder of your bonus:
    🎁 [Incentive] - expires [date]

    Common questions I'm getting:
    • "Will my payment info transfer?" - No, you'll re-enter securely
    • "What happens to my downloads?" - All accessible on new platform
    • "When does my old sub end?" - After you confirm migration

    Need help? I'm here:
    - Reply to this email
    - Book a 10-min call: [calendly link]
    - Watch walkthrough: [video link]

    - dSebastien
    ```

- [ ] **Provide migration support:**
    - Respond to all migration questions within 24h
    - Offer screen share help if needed
    - Create video answers to common questions
    - Update FAQ based on real questions

- [ ] **Track common issues:**
    - Payment method confusion
    - Can't find migration page
    - Don't understand steps
    - Want to cancel instead
    - Fix or clarify proactively

**Week 12 Tasks:**

- [ ] **Send final reminder (T+14 days):**

    ```
    Subject: Final reminder: Migrate by [date] for bonus

    Hi [Name],

    This is the last reminder about migrating your subscription.

    Bonus expires: [date] (3 days from now)

    Haven't migrated because...?

    • Too complicated? Let me help personally (reply to this)
    • Don't see the value? Here's what's better: [list benefits]
    • Having technical issues? I'll walk you through it
    • Want to cancel instead? I understand - reply and I'll help

    After [date], you can still migrate but without the bonus.

    Thanks for being a subscriber!
    - dSebastien
    ```

- [ ] **Evaluate migration success:**
    - Calculate final migration rate
    - Identify why some didn't migrate (survey non-migrators)
    - Decide next steps:
        - Extend deadline?
        - Better offer?
        - Accept lower rate?

- [ ] **Decide on deadline extension:**
    - If <50% migrated: Consider extending with new incentive
    - If 50-70% migrated: Proceed as planned
    - If >70% migrated: Huge success, proceed

**Deliverables:**

- 50-70% of subscribers migrated (target)
- All migration support requests handled
- Common issues documented and resolved
- Decision made on next phase

**Time Estimate:** 6-8 hours (across 2 weeks)

#### Week 13-14: Final Migration or Dual-Run Decision

**Option A: If Doing Forced Migration**

**Week 13: Final Notice**

- [ ] Send 7-day warning email:

    ```
    Subject: [Important] Your subscription ends in 7 days

    Hi [Name],

    This is the final notice about your [Product] subscription on the old platform.

    What's happening:
    📅 [Date]: Old platform subscriptions will be cancelled
    ✅ Grace period: 14 days of continued access
    🔄 New platform: Ready for you whenever you want

    Your options:

    1. MIGRATE NOW (recommended)
       - Keep your subscription active
       - No interruption in service
       - Use code: FINALMIGRATE

    2. DO NOTHING
       - Access continues for 14 days
       - Then access ends
       - Can re-subscribe anytime (at current price)

    3. CANCEL
       - Reply "CANCEL" and I'll process immediately
       - Receive refund for unused time

    Questions? Reply to this email.

    - dSebastien
    ```

- [ ] Reach out personally to remaining high-value subscribers
- [ ] Offer special assistance
- [ ] Document who wants to cancel vs who's just slow to migrate

**Week 14: Cancellation Day**

- [ ] **Cancel remaining Gumroad subscriptions:**
    - Login to Gumroad
    - For each non-migrated subscriber: Cancel subscription
    - Send cancellation confirmation
    - Note end of billing period

- [ ] **Send final access email:**

    ```
    Subject: Your subscription has been cancelled (access until [date])

    Hi [Name],

    As announced, your subscription on the old platform has been cancelled.

    Your access continues until: [date + 14 days grace]

    To continue without interruption:
    👉 Visit: [migration link]
    👉 Sign up anytime before [grace period end]

    If you don't want to continue:
    - No action needed
    - Access automatically ends [date]
    - No further charges

    Thanks for being a subscriber!
    - dSebastien
    ```

- [ ] **Monitor for confused/angry customers:**
    - Respond empathetically
    - Offer to help migrate
    - Consider case-by-case exceptions
    - Track sentiment

- [ ] **Week 2 of grace period: Final final reminder**
    - Email those who haven't migrated
    - Access ending in 7 days
    - Last chance to migrate
    - Offer continued support

**Option B: If Doing Dual-Run Indefinitely**

**Week 13-14: Optimization**

- [ ] Optimize Shopify for conversions:
    - A/B test product pages
    - Improve checkout flow
    - Add social proof (reviews)
    - Create bundles/upsells

- [ ] Continue gentle migration prompts:
    - Occasional email to Gumroad subscribers
    - In-product messaging
    - Incentive campaigns (e.g., Black Friday bonus)

- [ ] Monitor both platforms:
    - Track revenue split (Gumroad vs Shopify)
    - Calculate when Gumroad <10% of revenue
    - Plan eventual deprecation (6-12 months)

- [ ] Natural attrition:
    - As Gumroad subscribers cancel naturally
    - Don't replace them on Gumroad
    - Slowly reduce Gumroad percentage

**Deliverables:**

- Forced migration: All subscribers migrated or cancelled
- Dual-run: Ongoing monitoring and optimization plan
- Customer satisfaction maintained
- Support load manageable

**Time Estimate:** 4-6 hours (Week 13-14 combined)

---

### Phase 6: Cleanup & Optimization (Weeks 15-16)

#### Week 15: Link Replacement Campaign

**Goals:** Update all external links to point to Shopify

**Tasks:**

- [ ] **Prioritize link updates (use audit from Week 1):**

    **Priority 1: High-traffic owned properties**
    - [ ] Personal website/blog (all store links)
    - [ ] Email signature
    - [ ] Social media bios (Twitter, LinkedIn, Instagram)
    - [ ] YouTube channel description
    - [ ] Newsletter footer
    - [ ] Course platform profiles

    **Priority 2: Content with store links**
    - [ ] Blog posts mentioning products (edit one by one)
    - [ ] YouTube video descriptions (edit most popular)
    - [ ] Medium/Dev.to/Hashnode articles
    - [ ] GitHub repos with store links

    **Priority 3: External properties**
    - [ ] Guest posts on other sites (reach out to editors)
    - [ ] Podcast show notes (contact hosts)
    - [ ] Interview articles
    - [ ] Directory listings

    **Priority 4: Low-priority links**
    - [ ] Old YouTube videos (low views)
    - [ ] Forum posts/comments
    - [ ] Social media old posts

- [ ] **Use find-and-replace tools:**
    - For blog: Use CMS find/replace feature
    - For YouTube: Edit in bulk if possible
    - For social: Manual updates

- [ ] **Track progress:**
    - Update spreadsheet as links are fixed
    - Mark completion date
    - Verify new link works

- [ ] **Monitor referral traffic:**
    - Check which old Gumroad URLs still getting traffic
    - Prioritize updating those sources
    - Ensure redirects are working

**Deliverables:**

- 80%+ of owned links updated to Shopify
- High-traffic sources 100% updated
- Redirect traffic decreasing
- Backlink profile improving

**Time Estimate:** 6-8 hours

#### Week 16: Optimization & Review

**Goals:** Optimize store performance, review migration success

**Tasks:**

- [ ] **Analyze migration results:**

    **Traffic & Sales:**
    - Compare Shopify sales to Gumroad baseline
    - Calculate conversion rate (target: >2%)
    - Identify any drop-offs (where and why)
    - Review traffic sources (organic, direct, referral)

    **Customer Metrics:**
    - New customer acquisition rate
    - Repeat purchase rate
    - Average order value
    - Customer lifetime value
    - Subscription retention (if applicable)

    **Financial:**
    - Total Shopify costs vs Gumroad costs
    - Revenue comparison (month over month)
    - Calculate actual ROI
    - Projected break-even timeline

- [ ] **Set up conversion optimization:**

    **Abandoned Cart Recovery:**
    - Configure automated emails
    - Send 1 hour, 24 hours, 7 days after abandonment
    - Offer small incentive (5-10% discount)

    **Upsells/Cross-sells:**
    - Add "Frequently bought together"
    - Create product bundles
    - Offer complementary products at checkout

    **Email Marketing:**
    - Welcome series for new subscribers
    - Post-purchase follow-up
    - Re-engagement for inactive customers
    - Product launch announcements

- [ ] **Optimize based on data:**

    **If conversion rate is low:**
    - Simplify checkout process
    - Add trust badges
    - Improve product images/descriptions
    - Add customer reviews/testimonials
    - Check mobile experience

    **If traffic is down:**
    - Investigate SEO (rankings dropped?)
    - Check redirect rules (traffic lost in redirects?)
    - Increase content marketing
    - Run promotional campaign

    **If costs are higher than expected:**
    - Audit app subscriptions (remove unused)
    - Negotiate with payment processor
    - Optimize ad spend if running ads

- [ ] **Set up ongoing monitoring:**
    - Weekly analytics review (30 minutes)
    - Monthly deep dive (2 hours)
    - Quarterly strategic review
    - Set up automated reports (Shopify + Google Analytics)

- [ ] **Document migration learnings:**
    - What went well
    - What was harder than expected
    - What you'd do differently
    - Tips for others migrating
    - Create case study (optional, for marketing)

- [ ] **Decide on Gumroad account:**

    **Option 1: Keep active for redirects**
    - Maintain all product redirects
    - Cost: $0 (free Gumroad account)
    - Benefit: Links continue working

    **Option 2: Archive/close account**
    - Close Gumroad account
    - Remove all products
    - Risk: Gumroad links break (redirects gone)
    - Only do if all links updated

    **Recommendation:** Keep Gumroad active for 6-12 months for redirects

- [ ] **Plan for future:**
    - Set growth goals for next quarter
    - Plan new product launches on Shopify
    - Consider new features (memberships, courses, etc.)
    - Explore Shopify ecosystem (apps, integrations)

- [ ] **Celebrate! 🎉**
    - You successfully migrated!
    - Migration complete
    - Share success with audience (optional)
    - Reflect on achievement

**Deliverables:**

- Complete analytics review
- Optimization strategies implemented
- Ongoing monitoring established
- Migration documented
- Future plan created
- Celebration earned!

**Time Estimate:** 4-6 hours

---

## 7. Risk Mitigation Matrix

| Risk                                    | Probability | Impact   | Mitigation Strategy                                                                          | Contingency Plan                                                                                         |
| --------------------------------------- | ----------- | -------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Subscription churn >40%**             | Medium      | High     | Use dual-run approach; offer strong incentive; personal VIP outreach                         | Accept some churn; focus on new subscriber acquisition; improve product to offset                        |
| **Broken links hurt SEO**               | Medium      | High     | Comprehensive redirect strategy; systematic link replacement; monitor 404s                   | Create redirect rules retroactively; outreach to high-authority sites for link updates                   |
| **DNS migration downtime >4 hours**     | Low         | High     | Test thoroughly on temp domain; migrate during low traffic; have rollback ready              | Execute rollback to Gumroad; fix issues; retry migration next week                                       |
| **SSL certificate fails to provision**  | Low         | Medium   | Wait 48h before escalating; use Shopify support; ensure DNS correct                          | Contact Shopify support; manually verify DNS settings; wait for auto-renewal                             |
| **Digital product delivery failures**   | Low         | High     | Extensive testing with beta users; use reliable app (Sky Pilot); have backup delivery method | Manually email product files; investigate app issue; use alternative delivery method temporarily         |
| **Customer data loss during import**    | Low         | Critical | Multiple backups before import; verify import success; spot-check records                    | Restore from backup; re-import using alternative method; manually grant access if needed                 |
| **Costs >50% higher than projected**    | Medium      | Medium   | Calculate accurately; use free/cheap apps initially; monitor monthly spend                   | Remove unnecessary apps; switch to cheaper alternatives; consider returning to Gumroad if unsustainable  |
| **Conversion rate drops >30%**          | Medium      | High     | A/B test checkout; optimize product pages; improve mobile UX; add social proof               | Investigate with analytics; survey customers; optimize based on data; consider design changes            |
| **Support overwhelm (>50 tickets/day)** | Low         | Medium   | Comprehensive FAQ; video tutorials; proactive communication; gradual migration               | Hire temporary support help; extend response time; create canned responses; prioritize critical issues   |
| **Payment processor issues**            | Low         | High     | Use Shopify Payments (reliable); test thoroughly; have backup processor                      | Switch to backup processor (Stripe/PayPal); contact Shopify support; manual payment processing if needed |
| **App incompatibility/conflicts**       | Medium      | Low      | Research apps carefully; test in staging; read reviews; use popular apps                     | Remove conflicting app; find alternative; contact app support; custom development if needed              |
| **Shopify policy violation**            | Very Low    | Critical | Read Shopify terms; ensure digital products allowed; stay compliant; monitor policy changes  | Appeal decision; migrate to alternative platform; maintain Gumroad as backup                             |

**Critical Success Factors:**

1. Thorough testing before DNS migration
2. Clear, proactive customer communication
3. Reliable digital product delivery
4. Comprehensive redirect strategy
5. Responsive customer support
6. Realistic timeline (don't rush)

---

## 8. Decision Framework

### Should You Migrate? Decision Tree

**START: Why are you considering migration?**

→ "I want more control over branding/UX"
→ Current revenue >$3,500/mo?
→ YES: ✅ Shopify makes sense
→ NO: Consider Podia or Lemon Squeezy (simpler, cheaper)

→ "I need better marketing tools"
→ Are you willing to learn Shopify ecosystem?
→ YES: ✅ Shopify makes sense
→ NO: Stick with Gumroad or try Podia

→ "Gumroad fees are too high"
→ Current revenue >$5,000/mo?
→ YES: ✅ Shopify will save money
→ NO: Costs likely similar or higher

→ "I want to scale significantly"
→ Plan to reach >$10,000/mo?
→ YES: ✅ Shopify is best long-term platform
→ NO: Gumroad may be sufficient

→ "I'm not happy with Gumroad's limitations"
→ What specific limitations?
→ Customization: ✅ Shopify better
→ Subscriptions: ✅ Shopify better (with app)
→ Analytics: ✅ Shopify much better
→ Simplicity: ❌ Gumroad better

**FINAL DECISION CRITERIA:**

✅ **Migrate to Shopify if:**

- Revenue >$3,500/mo (cost-effective)
- Want professional branded store
- Need advanced marketing tools
- Plan to scale significantly
- Comfortable with technical setup
- Can dedicate 40-80 hours to migration
- Budget allows $300-600/mo

❌ **Stay on Gumroad if:**

- Revenue <$3,000/mo (Gumroad cheaper)
- Value simplicity over customization
- Don't want to manage multiple apps
- Limited technical skills
- Can't dedicate time to migration
- Current setup is working well

🤔 **Consider Alternatives if:**

- Want simpler than Shopify but better than Gumroad: **Podia** or **Lemon Squeezy**
- Focused on courses: **Teachable** or **Kajabi**
- Want community + products: **Circle** or **Mighty Networks**
- Selling high-ticket coaching: **ThriveCart** or **SamCart**

---

## 8A. ALTERNATIVE PLATFORMS: Detailed Comparison

Before committing to Shopify, you should evaluate alternatives that may better fit your specific needs. Here's a comprehensive comparison of viable alternatives for digital product creators.

### Overview Table

| Platform               | Best For                                | Monthly Cost      | Transaction Fees  | Complexity       | Migration Ease  |
| ---------------------- | --------------------------------------- | ----------------- | ----------------- | ---------------- | --------------- |
| **Lemon Squeezy**      | Digital products, subscriptions, MoR    | $0-$50            | 5% + payment fees | ⭐⭐ Simple      | ⭐⭐⭐⭐ Easy   |
| **Podia**              | Courses + digital products + community  | $39-89            | 0% (!)            | ⭐⭐ Simple      | ⭐⭐⭐⭐ Easy   |
| **Shopify**            | Full e-commerce, scaling, customization | $79-299           | 2.9% + $0.30      | ⭐⭐⭐⭐ Complex | ⭐⭐ Moderate   |
| **Gumroad** (baseline) | Simple digital sales                    | $0                | 10%               | ⭐ Very simple   | N/A             |
| **ThriveCart**         | High-ticket funnels, one-time payment   | $495-690 one-time | 0%                | ⭐⭐⭐ Moderate  | ⭐⭐⭐ Moderate |
| **Teachable**          | Online courses primarily                | $59-249           | 0%                | ⭐⭐ Simple      | ⭐⭐⭐ Moderate |
| **Kajabi**             | All-in-one course + marketing platform  | $149-399          | 0%                | ⭐⭐⭐ Moderate  | ⭐⭐ Moderate   |

### 1. Lemon Squeezy (Top Alternative for Your Situation)

**Website:** lemonsqueezy.com

**What It Is:**
A modern Gumroad alternative specifically designed for software and digital product creators. Acts as "Merchant of Record" (handles all tax compliance automatically).

**Pricing:**

- Free plan: $0/mo + 5% transaction fee
- $50k/year revenue: Free
- Above $50k: Contact for pricing (still lower than Gumroad at scale)
- Payment processing: Stripe fees (2.9% + 30¢)

**Key Features:**

- ✅ Built-in tax compliance (VAT, sales tax globally) - HUGE benefit
- ✅ Native subscription management
- ✅ Native affiliate system
- ✅ License key generation for software
- ✅ Webhook system for automation
- ✅ Embeddable checkout (works on any website)
- ✅ No apps needed - everything built-in
- ✅ API access for customization
- ✅ Multi-currency support
- ✅ Customer portal built-in

**Pros for Your Situation:**

- ✅ Much simpler than Shopify (closer to Gumroad UX)
- ✅ Cheaper than Shopify below $50k/year revenue
- ✅ Handles tax compliance automatically (save hours of work)
- ✅ Built-in affiliate program (no extra app needed)
- ✅ Easy subscription migration (can import from Gumroad)
- ✅ Better analytics than Gumroad, simpler than Shopify
- ✅ 100% digital-product focused (unlike Shopify's e-commerce focus)
- ✅ Modern, creator-friendly interface

**Cons:**

- ❌ Less customization than Shopify (can't fully customize storefront)
- ❌ Smaller ecosystem (fewer integrations vs Shopify's 8,000+ apps)
- ❌ Newer platform (founded 2021, less mature than Shopify)
- ❌ Merchant of Record means they control customer data (vs you owning it)
- ❌ Limited email marketing (need external tool like ConvertKit)

**Subscription Migration:**

- Import subscribers via API or CSV
- Can replicate subscription plans exactly
- Manual payment method re-entry required (unavoidable with any platform)
- Less risky than Shopify due to simpler process

**Best if:**

- You want simpler than Shopify but more powerful than Gumroad
- You sell primarily digital products (not physical goods)
- You're under $50k/year revenue (free!)
- You want tax compliance handled automatically
- You value simplicity over maximum customization

**Your Verdict:** ⭐⭐⭐⭐⭐ **Top recommendation** - Better fit than Shopify for your needs. Simpler migration, built-in features you need, cheaper at your revenue level.

---

### 2. Podia

**Website:** podia.com

**What It Is:**
All-in-one platform for courses, digital downloads, community, and subscriptions. Think "Teachable + Gumroad + Circle combined."

**Pricing:**

- Mover: $39/mo - Basic features
- Shaker: $89/mo - Full features (affiliates, coupons, drip content)
- Earthquaker: $199/mo - Advanced features
- **0% transaction fees** on all plans

**Key Features:**

- ✅ Unlimited products and courses
- ✅ Unlimited students/customers
- ✅ Built-in email marketing (basic)
- ✅ Built-in community/membership area
- ✅ Native affiliates ($89+ plan)
- ✅ Drip content for courses
- ✅ Webinar hosting
- ✅ Coaching/booking integration
- ✅ 24/7 live chat support
- ✅ Custom domain
- ✅ Zero transaction fees (huge!)

**Pros for Your Situation:**

- ✅ All-in-one (no apps to juggle like Shopify)
- ✅ Zero transaction fees (vs 2.9% on Shopify)
- ✅ Simple migration (easier than Shopify)
- ✅ Built-in email marketing (saves $20-100/mo)
- ✅ Built-in community (if you want to add this later)
- ✅ Beautiful templates (good customization without coding)
- ✅ Focus on creator economy (vs Shopify's e-commerce focus)

**Cons:**

- ❌ Less customization than Shopify (template-based)
- ❌ No subscription import tool (manual migration)
- ❌ Analytics less powerful than Shopify
- ❌ Smaller integration ecosystem
- ❌ $39-89/mo fixed cost even at low revenue

**Subscription Migration:**

- No automated import
- Manual migration process: export from Gumroad, recreate on Podia
- Offer existing subscribers discount code to migrate
- Similar difficulty to Shopify migration

**Best if:**

- You plan to create online courses (not just selling products)
- You want an all-in-one solution (vs managing multiple tools)
- You value zero transaction fees
- You want to add community features later
- You prefer simplicity over maximum flexibility

**Your Verdict:** ⭐⭐⭐⭐ Good alternative - More expensive than Lemon Squeezy at your revenue level ($39-89/mo vs $0), but all-in-one value is strong. Great if you plan to expand into courses/community.

---

### 3. ThriveCart

**Website:** thrivecart.com

**What It Is:**
One-time payment software focused on cart abandonment recovery and high-converting checkout funnels. Popular with high-ticket digital product sellers.

**Pricing:**

- Standard: $495 one-time (lifetime access)
- Pro: $690 one-time (includes affiliate platform, automation)
- **0% transaction fees forever**

**Key Features:**

- ✅ One-time payment (no monthly fees!)
- ✅ Cart abandonment recovery built-in
- ✅ A/B testing for checkout pages
- ✅ Bump offers and upsells
- ✅ Subscription management
- ✅ Affiliate management (Pro plan)
- ✅ Integration with major email platforms
- ✅ Course delivery integration
- ✅ Dunning management for failed payments

**Pros for Your Situation:**

- ✅ One-time payment = massive long-term savings
- ✅ Zero monthly fees (vs $79-140/mo Shopify)
- ✅ Built-in affiliate platform (Pro plan)
- ✅ Excellent for digital products
- ✅ High-converting checkout (better than Shopify default)
- ✅ Automatic cart abandonment recovery

**Cons:**

- ❌ No storefront (you need separate website/landing pages)
- ❌ High upfront cost ($495-690)
- ❌ Not a full platform (it's just the cart/checkout)
- ❌ Requires external course hosting if selling courses
- ❌ Subscription migration complex (no import tools)
- ❌ Less suitable if you want branded storefront

**Subscription Migration:**

- No automated import
- Complex manual process
- Would need to recreate all subscription products
- Requires customers to re-subscribe

**Best if:**

- You have high-ticket products ($200+)
- You already have a website (just need checkout)
- You want to avoid monthly fees long-term
- You're focused on conversion optimization
- You plan to run sales funnels

**Your Verdict:** ⭐⭐⭐ Not ideal for your situation - Better for sellers with existing websites who need just the checkout. You want a complete platform with storefront. High upfront cost also risky.

---

### 4. Teachable

**Website:** teachable.com

**What It Is:**
Leading platform specifically for creating and selling online courses. Increasingly supporting digital downloads and memberships.

**Pricing:**

- Basic: $59/mo - $1 + 10% per transaction
- Pro: $159/mo - 5% transaction fee
- Pro+: $249/mo - 0% transaction fee
- Business: $665/mo - Enterprise features

**Key Features:**

- ✅ Unlimited courses and students
- ✅ Drag-and-drop course builder
- ✅ Quizzes and certificates
- ✅ Drip content scheduling
- ✅ Student comments and community
- ✅ Basic email marketing
- ✅ Coupons and promotions
- ✅ Affiliate reporting
- ✅ Custom domain
- ✅ Compliance (GDPR, CCPA)

**Pros:**

- ✅ Best course creation tools
- ✅ Student engagement features
- ✅ Polished course delivery experience
- ✅ Strong brand (trusted by students)
- ✅ Good analytics for courses

**Cons for Your Situation:**

- ❌ **Course-first platform** (not ideal for diverse digital products)
- ❌ Transaction fees on lower plans (Basic = 10%!)
- ❌ Less flexible for non-course products
- ❌ $59-249/mo costs higher than alternatives
- ❌ Not designed for simple digital downloads
- ❌ Subscription migration complex

**Best if:**

- Your primary product is online courses
- You need robust course delivery (videos, quizzes, certificates)
- You want student community features
- You're willing to pay for course-specific features

**Your Verdict:** ⭐⭐ Not recommended - Too course-focused. You have diverse digital products, not just courses. Lemon Squeezy or Podia better fit.

---

### 5. Kajabi

**Website:** kajabi.com

**What It Is:**
Premium all-in-one platform for knowledge commerce. Combines courses, marketing, email, funnels, and community in one expensive package.

**Pricing:**

- Basic: $149/mo (3 products, 1,000 members)
- Growth: $199/mo (15 products, 10,000 members)
- Pro: $399/mo (Unlimited)
- **0% transaction fees**

**Key Features:**

- ✅ Complete marketing suite (email, automations, pipelines)
- ✅ Course and membership platform
- ✅ Landing page and funnel builder
- ✅ Built-in CRM
- ✅ Webinar hosting
- ✅ Podcast hosting
- ✅ Assessment and quiz tools
- ✅ Analytics and reporting
- ✅ Mobile app for students
- ✅ 24/7 support

**Pros:**

- ✅ Truly all-in-one (replace 10+ tools)
- ✅ Powerful marketing automation
- ✅ Beautiful templates and themes
- ✅ Enterprise-grade features
- ✅ Excellent customer support

**Cons for Your Situation:**

- ❌ **Extremely expensive** ($149-399/mo!)
- ❌ Overkill for your needs (you don't need all features)
- ❌ Steep learning curve
- ❌ Product limits on lower plans
- ❌ Designed for larger course creators ($100k+/year)

**Best if:**

- You're making $100k+/year already
- You want to replace all your tools (email, CRM, courses, website)
- You're building a knowledge empire
- Budget isn't a concern

**Your Verdict:** ⭐ **Not recommended** - Way too expensive ($149/mo minimum) for your revenue level ($1-3k/mo). Massive overkill.

---

### 6. Stan Store

**Website:** stan.store

**What It Is:**
Mobile-first platform popular with influencers and content creators. Think "Link in bio that's also a store."

**Pricing:**

- Creator: $29/mo
- Creator Pro: $99/mo
- **0% transaction fees**

**Key Features:**

- ✅ Mobile-optimized storefront
- ✅ Link-in-bio functionality
- ✅ Digital product sales
- ✅ Calendar/booking
- ✅ Courses and memberships
- ✅ Email capture
- ✅ Upsells and cross-sells
- ✅ Instagram/TikTok integration

**Pros:**

- ✅ Very affordable ($29/mo)
- ✅ Zero transaction fees
- ✅ Perfect for social media creators
- ✅ Quick setup (minutes)
- ✅ Mobile-first design

**Cons for Your Situation:**

- ❌ Limited customization
- ❌ Very basic analytics
- ❌ No custom domain on basic plan
- ❌ Designed for influencers (not traditional businesses)
- ❌ Limited features vs alternatives
- ❌ No affiliate program

**Your Verdict:** ⭐⭐ Not recommended - Too basic for your needs. Better for Instagram influencers selling simple digital products.

---

### RECOMMENDATION MATRIX: Which Platform for Your Situation?

**Your Requirements:**

- Revenue: $1-3k/mo
- Subscriptions: 20% of revenue, 10-30 subscribers, 100% retention required
- Pain points: Customization, analytics, email marketing, costs
- Technical: Comfortable with setup
- Uses: Affiliate program

**Platform Rankings:**

**1. 🥇 Lemon Squeezy** - 95/100

- ✅ Free at your revenue level
- ✅ Built-in affiliate program
- ✅ Tax compliance handled
- ✅ Easy subscription migration
- ✅ Better analytics than Gumroad
- ✅ Digital-product focused
- ✅ Simple enough (learning curve < Shopify)
- ❌ Less customization than Shopify (but more than Gumroad)
- **Best for:** Your exact situation. Perfect middle ground.

**2. 🥈 Podia** - 88/100

- ✅ All-in-one platform
- ✅ Zero transaction fees
- ✅ Built-in email marketing
- ✅ Community features (future-proof)
- ❌ $39-89/mo fixed cost
- ❌ No automated subscription import
- **Best for:** If you plan to add courses/community later.

**3. 🥉 Shopify** - 82/100

- ✅ Maximum customization
- ✅ Best analytics
- ✅ Scales to infinity
- ❌ Most complex
- ❌ Requires multiple apps
- ❌ $79/mo + apps = $140/mo total
- ❌ Harder subscription migration
- **Best for:** If you value customization above all else and plan to scale past $10k/mo.

**4. ThriveCart** - 68/100

- ✅ One-time payment
- ✅ Great for high-ticket
- ❌ No storefront
- ❌ High upfront cost
- ❌ Not a complete platform
- **Best for:** High-ticket sellers with existing website.

**5. Teachable** - 55/100

- ✅ Best for courses
- ❌ Course-focused (not versatile)
- ❌ Transaction fees
- ❌ Expensive
- **Best for:** Pure course creators.

**6. Kajabi** - 45/100

- ✅ All-in-one powerhouse
- ❌ Extremely expensive
- ❌ Massive overkill
- **Best for:** Established course creators ($100k+/year).

---

### MIGRATION COMPLEXITY COMPARISON

**Easiest → Hardest:**

1. **Lemon Squeezy** ⭐⭐⭐⭐⭐
    - Time: 2-4 weeks
    - Subscription migration: API import available, relatively smooth
    - Effort: Low-moderate

2. **Podia** ⭐⭐⭐⭐
    - Time: 3-6 weeks
    - Subscription migration: Manual, but simpler than Shopify
    - Effort: Moderate

3. **Shopify** ⭐⭐⭐
    - Time: 12-16 weeks (your customized plan)
    - Subscription migration: Complex, requires dual-run
    - Effort: High

4. **ThriveCart** ⭐⭐
    - Time: 4-8 weeks
    - Subscription migration: Complex manual process
    - Effort: Moderate-high

5. **Teachable/Kajabi** ⭐⭐
    - Time: 6-10 weeks
    - Subscription migration: Manual, course-specific challenges
    - Effort: Moderate-high

---

### FINAL RECOMMENDATION

**For your specific situation (10-30 subscribers, $1-3k/mo revenue, 100% retention requirement, need for customization/analytics):**

**PRIMARY RECOMMENDATION: Lemon Squeezy**

**Why:**

1. **FREE at your revenue level** (vs $79-140/mo Shopify)
2. **Easier subscription migration** (less risky for your 100% retention goal)
3. **Built-in affiliate program** (no extra app needed)
4. **Tax compliance automated** (saves hours of work)
5. **Better analytics than Gumroad** (addresses your pain point)
6. **More customization than Gumroad** (addresses your pain point)
7. **Simpler than Shopify** (less setup time, easier to manage)
8. **Digital-product focused** (vs Shopify's broader e-commerce focus)

**SECONDARY RECOMMENDATION: Podia** ($39-89/mo)

**Why:**

- All-in-one value
- Zero transaction fees
- Future-proof if you add courses/community
- Simpler than Shopify, more features than Lemon Squeezy

**THIRD OPTION: Shopify** ($140/mo total)

**Why:**

- Maximum customization (if this is your top priority)
- Best-in-class analytics
- Scales infinitely
- Worth it if you expect to grow past $3,500/mo soon

---

### ACTION STEP

**Before committing to Shopify, I recommend:**

1. **Try Lemon Squeezy first** (it's FREE at your revenue level!)
    - Sign up today
    - Import 2-3 products
    - Test the checkout flow
    - Compare to Shopify
    - Time investment: 2-3 hours
    - Cost: $0

2. **Try Podia** (14-day free trial)
    - Test the platform
    - See if all-in-one value appeals to you
    - Compare to Lemon Squeezy and Shopify
    - Time investment: 2-3 hours
    - Cost: $0

3. **Then decide:**
    - If Lemon Squeezy feels right: **Migrate there** (saves $140/mo, easier migration)
    - If Podia feels right: **Migrate there** (saves $51-101/mo, all-in-one value)
    - If neither feels right: **Proceed with Shopify** (maximum power, worth the cost/complexity)

**Expected outcome:** 70% chance you'll prefer Lemon Squeezy over Shopify for your specific needs. Test before committing!

---

## 8B. CUSTOM STORE WEBSITE APPROACH: Gumroad + Custom Frontend

**Status:** Alternative Strategy
**Complexity:** Low-Medium
**Risk Level:** Low
**Timeline:** 2-4 Weeks

### Overview

This approach combines the best of both worlds: keep Gumroad as your payment processor and digital delivery platform while using your custom store website (store.dsebastien.net) as the main storefront and marketing platform.

**Key Concept:**

- **Custom website:** Primary public-facing store (React-based, full control)
- **Gumroad:** Backend payment processor and digital delivery
- **User flow:** Browse on your site → Click "Buy Now" → Redirect to Gumroad checkout → Purchase completes on Gumroad

### What This Looks Like

1. Customer visits `store.dsebastien.net` (your custom website)
2. Browses products with your custom design, filtering, search, etc.
3. Clicks "Buy Now" or "Purchase" button
4. Gets redirected to `developassion.gumroad.com/l/product-name`
5. Completes purchase on Gumroad's checkout page
6. Receives product via Gumroad's delivery system

### Architecture Changes Required

**Domain Configuration:**

1. Remove custom domain from Gumroad (no more store.dsebastien.net → Gumroad)
2. Point store.dsebastien.net to your custom website hosting
3. All Gumroad links revert to `developassion.gumroad.com/l/*`

**Website Updates:**

1. Update all "Buy" buttons to link to Gumroad product URLs
2. Add clear messaging that checkout happens on Gumroad
3. Implement Gumroad API integration for dynamic pricing/availability (optional)
4. Add analytics tracking for buy button clicks

---

### Cost-Benefit Analysis

#### What You GAIN

**Complete Frontend Control:**

- ✅ Full design freedom (React + Tailwind CSS)
- ✅ Custom product browsing experience
- ✅ Advanced filtering, search, and categorization
- ✅ Command palette and keyboard shortcuts
- ✅ Responsive design exactly as you want it
- ✅ Custom landing pages and marketing funnels
- ✅ Blog integration for content marketing

**Gumroad Benefits Retained:**

- ✅ Simple payment processing (10% fee, no monthly cost)
- ✅ Built-in affiliate program
- ✅ License key generation
- ✅ Digital file hosting and delivery
- ✅ Automatic VAT/tax handling
- ✅ Customer support for payment issues
- ✅ Existing subscriber base stays intact
- ✅ Zero subscription migration risk
- ✅ EU VAT MOSS compliance

**Technical Advantages:**

- ✅ Version control for your store (Git)
- ✅ Modern development workflow
- ✅ Static site performance (fast loading)
- ✅ Full SEO control
- ✅ Custom analytics implementation
- ✅ A/B testing capabilities
- ✅ Progressive Web App potential

**Marketing & Analytics:**

- ✅ Google Analytics/Plausible integration
- ✅ Heatmaps and user behavior tracking
- ✅ Custom conversion funnels
- ✅ Email capture before checkout
- ✅ Content marketing integration
- ✅ Social proof and testimonials placement

**Cost Savings:**

- ✅ No monthly platform fees (vs $79-299/mo for Shopify)
- ✅ No app subscription costs (vs $50-150/mo for Shopify apps)
- ✅ Minimal hosting costs ($0-20/mo for static hosting)
- ✅ Keep Gumroad's simple 10% transaction fee

#### What You LOSE

**Limited E-Commerce Features:**

- ❌ No native shopping cart (single-item purchases only, unless custom built)
- ❌ No abandoned cart recovery
- ❌ No native discount codes (must use Gumroad's discount system)
- ❌ No built-in email marketing automation
- ❌ No native upsell/cross-sell (must implement manually)

**Checkout Experience:**

- ❌ Redirect to different domain for checkout (slight friction)
- ❌ Gumroad branding on checkout page (not fully white-labeled)
- ❌ Less control over checkout flow and fields
- ❌ Payment page design controlled by Gumroad

**Technical Limitations:**

- ❌ Manual product data management (no admin panel, edit JSON/config files)
- ❌ No real-time inventory sync (not relevant for digital products)
- ❌ Limited customer account features (Gumroad Library provides this)
- ❌ Need to sync product data manually between your site and Gumroad

**Analytics Gaps:**

- ❌ Checkout funnel analytics split across two domains
- ❌ No automatic conversion tracking (requires UTM parameters and Gumroad webhooks)
- ❌ Customer data lives in Gumroad, not your system

**Support Complexity:**

- ❌ Need to support two systems (your site + Gumroad)
- ❌ Customer confusion about two different domains
- ❌ Payment issues require Gumroad support

---

### Cost Comparison

#### Current Gumroad Setup

- **Monthly cost:** $0 fixed
- **Transaction fees:** 10% of sales
- **Example at $2,000/mo revenue:** $200/mo total cost

#### Custom Website + Gumroad

**One-Time Costs:**

- Domain: $0 (already owned)
- Development time: $0 (DIY) or $500-2,000 (if hiring)
- **Total one-time: $0-2,000**

**Monthly Recurring:**

- Hosting (GitHub Pages/Netlify/Vercel): $0-20/mo
- Gumroad transaction fees: 10% of sales (same as before)
- Email service (optional, Mailchimp/ConvertKit): $0-50/mo
- Analytics (optional, beyond free tier): $0-20/mo
- **Total monthly: $0-90/mo + 10% transaction fees**

**Example at $2,000/mo revenue:**

- Transaction fees: $200/mo (10%)
- Fixed costs: $0-90/mo
- **Total: $200-290/mo**

#### Shopify Setup (for comparison)

- **Monthly cost:** $171-501/mo fixed
- **Transaction fees:** ~$60/mo at $2,000 revenue (2.9% + $0.30)
- **Total at $2,000/mo revenue: $231-561/mo**

**Conclusion:** Custom website + Gumroad is the cheapest option at any revenue level, while maintaining most of Gumroad's simplicity.

---

### Implementation Plan

#### Phase 1: Website Preparation (Week 1)

**1. Update Product Data**

- [ ] Ensure all products in `/src/data/products.json` have correct Gumroad URLs
- [ ] Add `gumroadUrl` field to all products if not present
- [ ] Validate URLs point to `developassion.gumroad.com/l/*` format
- [ ] Run validation: `npm run validate:products`

**2. Update Buy Button Behavior**

- [ ] Modify buy button component to open Gumroad URLs
- [ ] Add external link icon/indicator
- [ ] Add analytics tracking for button clicks
- [ ] Implement UTM parameters for conversion tracking
    ```typescript
    const gumroadUrl = `${product.gumroadUrl}?wanted=true&referrer=store`
    ```

**3. Add Checkout Messaging**

- [ ] Add notice: "Secure checkout powered by Gumroad"
- [ ] Add trust badges/security icons
- [ ] Create FAQ section explaining the checkout process
- [ ] Add customer testimonials to build trust

**4. Implement Analytics**

- [ ] Set up Google Analytics 4 or Plausible
- [ ] Track "Buy" button clicks as events
- [ ] Set up conversion goals for Gumroad traffic
- [ ] Add UTM parameters to all Gumroad links

#### Phase 2: Domain Migration (Week 2)

**1. Remove Gumroad Custom Domain**

- [ ] Go to Gumroad settings → Custom Domain
- [ ] Remove `store.dsebastien.net` custom domain
- [ ] Confirm all product links revert to `developassion.gumroad.com/l/*`
- [ ] Test all product URLs are accessible

**2. Point Domain to Custom Website**

- [ ] Update DNS A/CNAME records to point to your hosting provider
    - GitHub Pages: `185.199.108.153` (and other IPs)
    - Netlify: CNAME to `your-site.netlify.app`
    - Vercel: CNAME to `cname.vercel-dns.com`
- [ ] Wait for DNS propagation (usually 1-24 hours)
- [ ] Verify SSL certificate is active

**3. Test End-to-End Flow**

- [ ] Visit `store.dsebastien.net` → Should load your custom website
- [ ] Click "Buy" on several products → Should redirect to Gumroad
- [ ] Test checkout flow on Gumroad
- [ ] Verify purchase confirmation and digital delivery work

#### Phase 3: Communication & Launch (Week 3)

**1. Update External Links**

- [ ] Update links on your main website (dsebastien.net)
- [ ] Update social media profiles (Twitter, LinkedIn, etc.)
- [ ] Update email signatures
- [ ] Update newsletter links
- [ ] Update YouTube video descriptions
- [ ] Update course platforms (if applicable)

**2. Customer Communication**

- [ ] Send email to existing customers announcing new store
- [ ] Explain the improved browsing experience
- [ ] Reassure them checkout/subscriptions unchanged
- [ ] Provide support contact for questions

**3. SEO Updates**

- [ ] Submit new sitemap to Google Search Console
- [ ] Update meta descriptions and titles
- [ ] Implement structured data (schema.org) for products
- [ ] Set up 301 redirects if needed (old blog posts linking to store)

#### Phase 4: Optimization (Week 4+)

**1. Analytics & Tracking**

- [ ] Monitor buy button click-through rates
- [ ] Track conversion rates (visitors → Gumroad clicks → purchases)
- [ ] Identify drop-off points
- [ ] A/B test different button text/placement

**2. Content Enhancement**

- [ ] Add detailed product comparison pages
- [ ] Create buying guides and blog content
- [ ] Add video demos/previews
- [ ] Implement social proof (customer counts, testimonials)

**3. Conversion Optimization**

- [ ] Test different call-to-action button designs
- [ ] Optimize product page layouts
- [ ] Add exit-intent popups (optional)
- [ ] Implement email capture (lead magnets)

**4. Gumroad Integration (Optional Advanced)**

- [ ] Use Gumroad API to fetch product data dynamically
- [ ] Display real-time purchase counts
- [ ] Show dynamic pricing based on sales/discounts
- [ ] Sync product availability status

---

### Technical Requirements

#### Frontend (Already Built)

- ✅ React 19+ with TypeScript
- ✅ Vite for building
- ✅ Tailwind CSS v4
- ✅ React Router (HashRouter for GitHub Pages)
- ✅ Product data structure in JSON
- ✅ Responsive design
- ✅ Command palette
- ✅ Search and filtering

#### Hosting Options

**Option A: GitHub Pages (Current Setup)**

- **Cost:** Free
- **Pros:** Simple, integrated with GitHub, free SSL
- **Cons:** Static only, uses HashRouter (#/ URLs)
- **Setup:** Already configured via `.github/workflows/deploy.yml`

**Option B: Netlify**

- **Cost:** Free tier available
- **Pros:** Better build process, clean URLs (no #), form handling, edge functions
- **Cons:** Need to migrate from GitHub Pages
- **Setup:** Connect GitHub repo, configure build command

**Option C: Vercel**

- **Cost:** Free tier available
- **Pros:** Excellent performance, clean URLs, serverless functions, great DX
- **Cons:** Need to migrate from GitHub Pages
- **Setup:** Connect GitHub repo, auto-detects Vite config

**Recommendation:** Start with GitHub Pages (already working), migrate to Netlify or Vercel later if you need clean URLs or serverless features.

#### Gumroad Product URL Format

All product URLs should follow this pattern:

```
https://developassion.gumroad.com/l/product-slug
```

**With tracking parameters:**

```
https://developassion.gumroad.com/l/product-slug?wanted=true&referrer=custom-store
```

**Available Gumroad URL parameters:**

- `wanted=true` - Pre-fills quantity
- `referrer=source` - Tracks referral source
- Custom parameters for analytics

---

### Migration Checklist

#### Pre-Migration

- [ ] Review all products in `products.json`
- [ ] Verify all Gumroad URLs are correct and working
- [ ] Back up current Gumroad domain settings
- [ ] Set up analytics tracking on custom website
- [ ] Test website build and deployment process
- [ ] Create staging environment for testing (optional)

#### Domain Migration

- [ ] Remove custom domain from Gumroad settings
- [ ] Update DNS records to point to hosting provider
- [ ] Wait for DNS propagation (check with `dig store.dsebastien.net`)
- [ ] Verify SSL certificate is working
- [ ] Test HTTPS redirect
- [ ] Test www redirect (if applicable)

#### Website Updates

- [ ] Update all buy buttons to link to Gumroad URLs
- [ ] Add checkout messaging and trust indicators
- [ ] Implement analytics event tracking
- [ ] Add UTM parameters to Gumroad links
- [ ] Test responsive design on mobile devices
- [ ] Test all navigation and internal links

#### External Links Update

- [ ] Update main website links
- [ ] Update social media profiles
- [ ] Update email signatures
- [ ] Update newsletter templates
- [ ] Update video descriptions
- [ ] Update any affiliate links (if applicable)

#### Communication

- [ ] Draft customer announcement email
- [ ] Announce on social media
- [ ] Update support documentation
- [ ] Add FAQ section about checkout process
- [ ] Monitor support channels for questions

#### Post-Launch

- [ ] Monitor analytics for 7 days
- [ ] Track buy button click-through rates
- [ ] Monitor customer support tickets
- [ ] Check for broken links or errors
- [ ] Gather customer feedback
- [ ] Optimize based on data

---

### Risk Assessment

**Very Low Risk:**

- ✅ No payment system migration
- ✅ No subscription disruption
- ✅ No customer data migration
- ✅ Reversible changes (can add custom domain back to Gumroad)

**Potential Issues:**

| Risk                                    | Likelihood | Impact | Mitigation                                         |
| --------------------------------------- | ---------- | ------ | -------------------------------------------------- |
| DNS propagation delay                   | Medium     | Low    | Plan for 24-48 hour buffer, announce in advance    |
| Customers confused by checkout redirect | Medium     | Low    | Clear messaging, FAQ section, trust indicators     |
| Broken Gumroad URLs                     | Low        | Medium | Validate all URLs before launch, monitor 404s      |
| Analytics tracking gaps                 | Medium     | Low    | Implement UTM parameters, test tracking thoroughly |
| SEO ranking fluctuation                 | Low        | Medium | Set up proper redirects, submit new sitemap        |
| Hosting downtime                        | Very Low   | Medium | Use reliable hosting (GitHub Pages/Netlify/Vercel) |

---

### Success Metrics

**Week 1-2 (Baseline):**

- [ ] Store website loads < 2 seconds
- [ ] Zero broken Gumroad links
- [ ] Analytics tracking works for 100% of buy button clicks
- [ ] Zero critical customer support issues

**Month 1:**

- [ ] Buy button click-through rate: Track baseline
- [ ] Conversion rate (clicks → purchases): Compare to previous Gumroad-only
- [ ] Page load time: < 2 seconds on mobile
- [ ] Bounce rate: < 60%

**Month 3:**

- [ ] Organic search traffic: +20% (from SEO improvements)
- [ ] Direct traffic: +30% (from improved branding)
- [ ] Customer satisfaction: No complaints about checkout process
- [ ] Site performance: 90+ Lighthouse score

---

### When This Approach Makes Sense

**This is IDEAL if you:**

- ✅ Want full control over store design and user experience
- ✅ Are comfortable with basic web development (or have a developer)
- ✅ Want to keep Gumroad's simplicity for payments/delivery
- ✅ Have low/medium revenue ($0-5k/mo) where Gumroad's 10% is reasonable
- ✅ Don't need advanced e-commerce features (cart, abandoned cart recovery, etc.)
- ✅ Want to minimize migration risk and complexity
- ✅ Want to keep costs very low (no monthly platform fees)
- ✅ Value development flexibility and version control

**This is NOT ideal if you:**

- ❌ Need a fully white-labeled checkout experience
- ❌ Want all-in-one analytics (checkout + storefront)
- ❌ Need advanced subscription management features
- ❌ Want abandoned cart recovery and email automation
- ❌ Prefer a no-code/low-code solution
- ❌ Have high revenue (>$10k/mo) where Gumroad's 10% becomes expensive
- ❌ Need multi-item shopping cart functionality
- ❌ Want built-in CRM and customer management tools

---

### Comparison: Custom Website + Gumroad vs Full Migration

| Factor                      | Custom Website + Gumroad | Shopify           | Lemon Squeezy |
| --------------------------- | ------------------------ | ----------------- | ------------- |
| **Monthly Cost**            | $0-90                    | $171-501          | $0-100        |
| **Transaction Fees**        | 10%                      | 2.9% + $0.30      | 5% + $0.50    |
| **Setup Complexity**        | Low                      | High              | Medium        |
| **Migration Risk**          | Very Low                 | High              | Medium        |
| **Design Control**          | Full                     | High              | Medium        |
| **Checkout Control**        | Low (Gumroad)            | Full              | Medium        |
| **Development Required**    | Medium                   | Low (apps)        | Low           |
| **SEO Control**             | Full                     | High              | Medium        |
| **Analytics Control**       | High                     | High              | Medium        |
| **Subscription Management** | Basic (Gumroad)          | Advanced          | Advanced      |
| **Email Marketing**         | External tool needed     | Integrated (apps) | Integrated    |
| **Time to Launch**          | 2-4 weeks                | 8-12 weeks        | 4-6 weeks     |

---

### Recommended Next Steps

**If you choose this approach:**

1. **Week 1: Preparation**
    - Review and validate all product data in `products.json`
    - Ensure all Gumroad URLs are correct
    - Set up analytics (Google Analytics or Plausible)
    - Test the current website locally

2. **Week 2: Domain Migration**
    - Remove custom domain from Gumroad
    - Update DNS to point to hosting provider
    - Wait for DNS propagation
    - Test end-to-end flow

3. **Week 3: Communication**
    - Update all external links
    - Send announcement email
    - Monitor support channels
    - Gather initial feedback

4. **Week 4+: Optimization**
    - Analyze conversion data
    - A/B test buy button placement/design
    - Add content marketing (blog posts, guides)
    - Implement advanced features (email capture, etc.)

**Decision Point:**

This approach is **strongly recommended** if:

- You already have the custom website built (you do!)
- You want to minimize risk and costs
- You're comfortable with the two-domain checkout flow
- You value design control and technical flexibility

**Cost savings over 12 months:**

- vs Shopify: Save $2,052 - $6,012/year in platform costs
- vs Lemon Squeezy: Save $0 - $1,200/year (but less features)

---

### Advanced: Optional Gumroad API Integration

**For more sophisticated integration, you can use the Gumroad API to:**

1. **Fetch Product Data Dynamically**

    ```javascript
    // Fetch all products from Gumroad API
    fetch('https://api.gumroad.com/v2/products', {
        headers: { Authorization: 'Bearer YOUR_ACCESS_TOKEN' }
    })
    ```

2. **Display Real-Time Sales Data**
    - Show "X people bought this today"
    - Display current discount information
    - Show stock status (for physical products)

3. **Webhook Integration**
    - Listen for purchase events
    - Trigger custom automations (email sequences, Discord notifications, etc.)
    - Update your own analytics database

4. **Custom Checkout Overlays**
    - Use Gumroad's overlay checkout instead of redirect
    - Keeps user on your domain (feels more seamless)
    ```javascript
    <a href="https://gum.co/product" class="gumroad-button">Buy</a>
    <script src="https://gumroad.com/js/gumroad.js"></script>
    ```

**Resources:**

- Gumroad API Documentation: https://app.gumroad.com/api
- Gumroad Overlay Checkout: https://help.gumroad.com/article/106-using-the-overlay
- Webhooks Setup: https://help.gumroad.com/article/269-webhooks

---

### Conclusion: Custom Website + Gumroad Approach

**Summary:**

This hybrid approach offers the best balance of control, cost, and simplicity for your situation. You get:

- Full design and UX control via your custom React website
- Continued use of Gumroad's proven payment and delivery infrastructure
- Minimal migration risk (no subscription transfers, no payment system changes)
- Very low costs ($0-90/mo vs $171-501/mo for Shopify)
- Fast implementation timeline (2-4 weeks vs 12-16 weeks for Shopify)

**Trade-offs:**

You sacrifice some e-commerce conveniences (abandoned cart recovery, all-in-one analytics, white-labeled checkout) in exchange for simplicity, lower cost, and reduced risk.

**Recommendation for Your Situation:**

Given that:

1. You already have a custom store website built
2. You have 10-30 subscribers (high retention requirement)
3. Your revenue is $1-3k/mo (Gumroad's 10% is cost-effective)
4. You value design control and technical flexibility
5. You want to minimize migration complexity

**This approach is likely your best option.** Consider it before committing to a full platform migration.

---

## 9. Recommended Tools & Apps

### Essential Shopify Apps

| App                       | Purpose                                  | Cost                                | Priority                |
| ------------------------- | ---------------------------------------- | ----------------------------------- | ----------------------- |
| **Sky Pilot**             | Digital product delivery                 | $15/mo                              | Critical                |
| **Appstle Subscriptions** | Subscription management                  | $10-30/mo                           | High (if subscriptions) |
| **Easy Redirects**        | URL redirect management                  | $7/mo                               | High                    |
| **Klaviyo**               | Email marketing                          | Free <250 contacts, then $20-100/mo | High                    |
| **Judge.me**              | Product reviews                          | Free plan available                 | Medium                  |
| **Plug in SEO**           | SEO optimization                         | Free plan available                 | Medium                  |
| **Tidio**                 | Live chat support                        | Free plan available                 | Medium                  |
| **Google Analytics 4**    | Analytics (Shopify built-in integration) | Free                                | High                    |

### Alternative Digital Delivery Apps

- **SendOwl** ($9-39/mo): Good for simple digital delivery, less expensive
- **Digital Downloads** (Free): Basic file delivery, very limited features
- **FetchApp** ($5-50/mo): Robust digital delivery with licensing and API

### Alternative Subscription Apps

- **Recharge** ($99/mo): Most popular, enterprise-grade, best for high volume
- **Seal Subscriptions** ($5-49/mo): Simple and affordable, good for starting out
- **Bold Subscriptions** ($50/mo): Flexible, mid-tier option

### Development/Migration Tools

- **Matrixify** ($30/mo): Customer and order import, can cancel after migration
- **Shopify Admin API**: Free, for custom migration scripts
- **Bulk Product Edit by MITS**: Free, for managing many products

### Monitoring & Analytics

- **Google Search Console**: Free, monitor SEO and backlinks
- **Google PageSpeed Insights**: Free, test site performance
- **UptimeRobot**: Free, monitor site uptime
- **Hotjar** or **Lucky Orange**: User behavior tracking (heatmaps, recordings)

### DNS & Domain Tools

- **Cloudflare**: Free DNS management (if not using registrar's DNS)
- **DNSChecker.org**: Free tool to monitor DNS propagation
- **SSL Labs**: Free SSL certificate testing

---

## 10. Key Questions to Answer

Before proceeding with migration, answer these questions:

### Strategic Questions

1. **What's my current monthly revenue?** \***\*\_\*\***
    - If <$3,000: Consider if migration is worth it
    - If $3,000-5,000: Break-even zone
    - If >$5,000: Shopify likely more cost-effective

2. **How many active subscribers do I have?** \***\*\_\*\***
    - If <20: White-glove migration viable
    - If 20-100: Dual-run recommended
    - If >100: Dual-run strongly recommended

3. **Can I dedicate 40-80 hours over 12-16 weeks?** [ ] Yes [ ] No
    - If No: Consider hiring Shopify expert ($500-2,000)

4. **What's my budget for monthly recurring costs?** $\***\*\_\*\***/mo
    - Minimum viable: $150/mo (Basic plan + essential apps)
    - Recommended: $250-400/mo (better apps, flexibility)
    - Premium: $500+/mo (advanced features, scale)

5. **What's my primary motivation for migrating?**
    - [ ] Cost savings
    - [ ] Better marketing tools
    - [ ] Brand control
    - [ ] Scaling limitations
    - [ ] Customer experience
    - [ ] Other: **\*\***\_\_\_**\*\***

### Technical Questions

6. **Who manages my DNS?** **\*\***\_\_\_**\*\***
    - [ ] I know how to change DNS records
    - [ ] I need to learn this
    - [ ] I need help with this

7. **Do I have technical skills for Shopify setup?**
    - [ ] Yes, comfortable with e-commerce platforms
    - [ ] Somewhat, willing to learn
    - [ ] No, will need help

8. **What's my current monthly traffic?** \***\*\_\*\*** visits/mo
    - Helps estimate Shopify bandwidth needs (usually not a concern)

### Customer Impact Questions

9. **How many external links point to my store?** (rough estimate)
    - [ ] <50 (low risk, easy to manage)
    - [ ] 50-200 (medium risk, manageable)
    - [ ] 200+ (high risk, systematic approach needed)

10. **What's my customer base's technical savviness?**
    - [ ] Very technical (low support burden)
    - [ ] Mixed (moderate support burden)
    - [ ] Non-technical (high support burden)

11. **How critical is uninterrupted access?**
    - [ ] Not critical, customers are patient
    - [ ] Important, minimize disruption
    - [ ] Critical, zero downtime required

### Timeline Questions

12. **When can I realistically start?** **\*\***\_\_\_**\*\***

13. **Any time constraints (product launches, holidays, etc.)?**
    - [ ] No constraints
    - [ ] Yes: **\*\***\_\_\_**\*\*** (plan around this)

14. **How urgently do I need to migrate?**
    - [ ] Not urgent, can take time to do it right
    - [ ] Somewhat urgent, within 3 months
    - [ ] Very urgent, need to migrate ASAP (⚠️ high risk)

---

## 11. Next Steps

### Immediate Actions (This Week)

1. **[ ] Validate decision using decision framework above**
2. **[ ] Answer all key questions in Section 10**
3. **[ ] Calculate actual costs based on your revenue**
4. **[ ] Sign up for Shopify trial (3 days free)**
5. **[ ] Export customer data from Gumroad (backup)**

### Short-Term (Next 2 Weeks)

6. **[ ] Explore Shopify admin interface**
7. **[ ] Research and select apps**
8. **[ ] Create product inventory spreadsheet**
9. **[ ] Audit all store links (blog, social, YouTube, etc.)**
10. **[ ] Decide on subscription migration approach**

### Commit Point

After completing the above, make final decision:

**[ ] GO: Commit to migration** → Proceed with Week 1 of timeline
**[ ] NO-GO: Stay with Gumroad** → Focus on optimizing current setup
**[ ] ALTERNATIVE: Consider other platform** → Research Podia, Lemon Squeezy, etc.

---

## 12. Support & Resources

### Shopify Resources

- **Shopify Help Center**: https://help.shopify.com
- **Shopify Community Forums**: https://community.shopify.com
- **Shopify YouTube**: Video tutorials for all features
- **Shopify Support**: 24/7 chat and phone support (all plans)

### Migration Assistance

- **Hire Shopify Expert**: https://experts.shopify.com
    - Cost: $500-5,000 depending on scope
    - Can handle entire migration or specific parts

- **Matrixify Support**: Excellent support for data migration
- **App Support**: Most apps have responsive support teams

### Learning Resources

- **Shopify Academy**: Free courses on e-commerce
- **Shopify Blog**: Best practices, case studies
- **YouTube Channels**: Coding with Jan, Wholesale Ted, others

### Community

- **r/shopify** on Reddit: Active community, helpful advice
- **Shopify Facebook Groups**: Various groups for different niches
- **Digital Product Seller Communities**: Find others who've migrated

---

## 13. Appendix: Email Templates

### Template 1: Pre-Migration Announcement (T-14 days)

```
Subject: Important update: Your dSebastien Store is moving!

Hi [First Name],

I have exciting news to share: I'm upgrading my store to a better platform!

WHAT'S CHANGING:
• New store platform (Shopify)
• Better download experience
• Easier access to your products
• More features coming soon

WHAT'S NOT CHANGING:
• All your purchased products (still accessible)
• Product quality and support (still me!)
• Pricing (same or better)

TIMELINE:
• January 15: New store goes live at store.dsebastien.net
• January 16: You'll receive access instructions
• Old links will redirect automatically

NO ACTION NEEDED RIGHT NOW
I'll send detailed instructions next week on how to access your products on the new platform.

WHY THE CHANGE?
Gumroad has been great, but I want to provide you with:
→ Faster downloads
→ Better customer portal
→ More payment options
→ Enhanced shopping experience

QUESTIONS?
Reply to this email anytime. I'm here to help make this transition smooth.

Thanks for your support!
- dSebastien

P.S. Bookmark the new URL: https://store.dsebastien.net
```

### Template 2: Migration Day - Access Instructions (T-0)

```
Subject: [Action Required] Access your products on the new store

Hi [First Name],

The new store is LIVE! 🎉

Here's how to access your products:

STEP-BY-STEP INSTRUCTIONS:

1. Visit: https://store.dsebastien.net

2. Click "Create Account" (top right corner)

3. Sign up using THIS email: [their email address]

4. Create a password (you'll use this to login)

5. Check your email for confirmation

6. Login and go to "My Account" → "Downloads"

7. All your products are waiting for you!

YOUR PRODUCTS:
✅ [Product 1 Name]
✅ [Product 2 Name]
✅ [Product 3 Name]

NEED HELP?

Watch this 2-minute tutorial: [Video Link]

Common issues:
• "Can't find my products?" → Make sure you used [their email]
• "Forgot password?" → Use the reset link on login page
• "Download not working?" → Try a different browser

Still stuck? Reply to this email and I'll help you personally.

WHAT ABOUT OLD LINKS?

Good news: All your old Gumroad links automatically redirect to the new store. Your bookmarks will still work!

Welcome to the new store!
- dSebastien

P.S. Explore the new store - there are some new products you might like! 😉
```

### Template 3: Follow-Up for Non-Actives (T+7 days)

```
Subject: Haven't accessed the new store yet? Here's help

Hi [First Name],

I noticed you haven't logged into the new store yet. I want to make sure you can access your products!

QUICK REMINDER:
All your purchased products are waiting at:
👉 https://store.dsebastien.net

Having trouble? Common issues & solutions:

❓ "I created an account but don't see my products"
→ Make sure you used this email: [their email]
→ Try logging out and back in
→ Check spam folder for confirmation email

❓ "I forgot my password"
→ Use the "Reset Password" link on the login page
→ Check your email for reset instructions

❓ "The download link doesn't work"
→ Try a different browser (Chrome recommended)
→ Check that popup blockers aren't interfering
→ Contact me for direct download link

❓ "I don't want to create another account"
→ I understand! But this gives you easier access long-term
→ Takes just 2 minutes to set up
→ Watch this quick tutorial: [Video Link]

NEED PERSONAL HELP?

Reply to this email and I'll:
• Walk you through the process
• Send you direct download links
• Answer any questions

Your products aren't going anywhere - I just want to make sure you can access them easily!

Thanks for your patience during this transition.
- dSebastien
```

### Template 4: Subscription Migration Invitation

```
Subject: [Action Needed] Migrate your [Subscription Name] to the new platform

Hi [First Name],

Great news! I'd love to migrate your subscription to the new store platform.

WHY MIGRATE?

✅ Better product download experience
✅ Easier subscription management (pause, update, cancel)
✅ More features coming (exclusive to new platform)
✅ Same great content, better delivery

YOUR MIGRATION BONUS:

Migrate by [Date] and get:
🎁 1 month completely FREE
🎁 Early access to [upcoming feature/product]
🎁 My eternal gratitude 😊

HOW TO MIGRATE (takes 5 minutes):

1. Visit: https://store.dsebastien.net/pages/migrate

2. Sign up with your email: [their email]

3. Subscribe using code: MIGRATE2024 (first month free)

4. Reply "MIGRATED" to this email

5. I'll cancel your old subscription (no double-billing)

IMPORTANT DETAILS:

• Old subscription keeps working until you confirm migration
• No rush - deadline is [Date]
• Payment info doesn't transfer (you'll re-enter securely)
• All your past downloads still accessible

QUESTIONS?

Watch this walkthrough video: [Link]

Or reply with any questions:
• "What happens to my payment info?" → You'll re-enter on new platform (secure)
• "Will I be double-charged?" → No, I cancel old sub after confirming new one
• "Can I keep old subscription?" → For now yes, but new features only on new platform
• "What if I want to cancel instead?" → Reply "CANCEL" and I'll process a refund

Need help? I'm here!

Just reply to this email or book a quick call: [Calendly Link]

Thanks for being a subscriber!
- dSebastien

P.S. First 50 to migrate get [extra bonus] - don't miss out!
```

### Template 5: Final Notice (Forced Migration - T-7 days)

```
Subject: [Final Notice] Your subscription ends in 7 days

Hi [First Name],

This is the final reminder about your [Product Name] subscription on the old platform.

WHAT'S HAPPENING:

📅 [Date in 7 days]: All subscriptions on old platform will be cancelled

✅ Grace period: 14 days of continued access after cancellation

🔄 New platform: Ready for you at store.dsebastien.net

YOUR OPTIONS:

OPTION 1: MIGRATE NOW ✅ (Recommended)
→ Keep your subscription active seamlessly
→ No interruption in service
→ Use code: FINALMIGRATE for 1 month free
→ Takes 5 minutes: [Migration Link]

OPTION 2: DO NOTHING
→ Access continues for 14 days after [Date]
→ Then access ends
→ Can re-subscribe anytime (current price honored for 30 days)

OPTION 3: CANCEL & REFUND
→ Reply "CANCEL" to this email
→ I'll process a refund for any unused time
→ Access ends immediately

WHY AM I DOING THIS?

The old platform (Gumroad) is being phased out for subscriptions. The new platform gives you:
• Better download speeds
• Easier subscription management
• More features and content
• Same price, better experience

I'VE TRIED TO MAKE THIS EASY:

✅ 90 days advance notice
✅ Free month for migrating
✅ 14-day grace period
✅ Personal support (just reply)
✅ Video tutorials and help docs

NEED HELP MIGRATING?

I'm here personally to help:
• Reply to this email
• Book a call: [Calendly]
• Watch tutorial: [Video]

I value your subscription and want to make this smooth!

Thanks for understanding.
- dSebastien

P.S. If you have any concerns or feedback about this change, I genuinely want to hear it. Reply anytime.
```

### Template 6A: Soft Introduction for 10-30 Subscriber Scenario (Month 8)

**Purpose:** Zero-pressure informational update about new platform
**Audience:** All 10-30 existing subscribers
**Tone:** Casual, informational, no urgency

```
Subject: Update: I've moved to a new store platform (no action needed!)

Hi [First Name],

Quick update I wanted to share with you:

I've moved my store to a new platform at https://store.dsebastien.net

IMPORTANT: Your subscription continues exactly as it is. Nothing changes for you unless you want it to.

WHY I MOVED:

After a lot of thought, I migrated to Shopify because:
✅ Better customization and branding (finally looks professional!)
✅ Deeper analytics to understand what you all actually want
✅ Better email tools to share updates and new content
✅ Faster downloads and improved customer experience

THE NEW EXPERIENCE:

Here's what's different on Shopify:
• Cleaner, more professional design
• Better download speeds
• Easier subscription management (pause, update billing, etc.)
• Improved mobile experience
• More features coming soon

WHAT THIS MEANS FOR YOU:

Right now? Absolutely nothing.

Your Gumroad subscription continues working perfectly. You don't need to do anything.

BUT... if you're curious or interested in trying the new platform:

🎁 SPECIAL OFFER FOR EXISTING SUBSCRIBERS:
- Migrate to Shopify: Get 3 MONTHS FREE
- Same great content, better delivery
- I'll help you personally with setup
- No rush - offer doesn't expire

Interested? Check out this page: https://store.dsebastien.net/pages/migrate-subscribers

You'll find:
• What's better about the new platform
• Video walkthrough showing the difference
• Step-by-step migration guide
• My personal support contact

Again, this is 100% optional. I'm not forcing anyone to migrate. Your Gumroad subscription will keep working for as long as you want.

I just wanted to make sure you knew about the new platform in case you're interested in a better experience.

Questions? Just hit reply. I read every email personally.

Thanks for being a subscriber!
- dSebastien

P.S. I'm migrating gradually, so if you prefer to stick with Gumroad for now (or forever), that's totally fine! I'll support both platforms for the foreseeable future.
```

### Template 6B: VIP Personal Outreach (Month 11-12)

**Purpose:** Personal invitation for high-value/long-term subscribers
**Audience:** Top 5 VIPs by revenue/tenure
**Tone:** Personal, warm, appreciative

```
Subject: [First Name], can I help you upgrade to the new platform?

Hi [First Name],

I hope this finds you well!

I wanted to reach out personally because you've been a [Product Name] subscriber for [X months/years] now, and I genuinely appreciate your support.

You might have seen my email a few months ago about moving to a new platform. I've been migrating customers gradually, and I'd love to help YOU specifically make the switch if you're interested.

WHY I'M REACHING OUT TO YOU SPECIFICALLY:

As one of my longest-standing subscribers (since [Date]!), you deserve the best experience possible. The new Shopify platform has some significant improvements I think you'll love:

1. **Better Downloads:** Faster, more reliable file delivery
2. **Easier Management:** One-click subscription management, update billing, pause/resume
3. **New Features Coming:** I'm building features exclusive to Shopify (can't do them on Gumroad)
4. **Priority Support:** As a migrated VIP, you get priority access to me for any questions

Plus, I'm working on [upcoming feature/product] which will be Shopify-only.

SPECIAL VIP OFFER (just for you):

Since you've been such a valued subscriber, I want to make this extra worth your while:

🎁 4 MONTHS COMPLETELY FREE when you migrate
🎁 Exclusive bonus: [Bonus product/content worth $X]
🎁 Priority access to [upcoming feature]
🎁 My personal phone/calendar link for setup help

I'LL PERSONALLY HELP YOU:

I know switching platforms can feel like a hassle, so I want to make this completely painless:

• I'll send you a custom link that sets everything up automatically
• We can jump on a 20-minute call and I'll walk you through it (screen share)
• You'll have access to BOTH platforms for a month (zero risk!)
• I'll personally verify everything works before we cancel Gumroad
• If anything doesn't work perfectly, we can keep you on Gumroad (no problem!)

Honestly, the whole process takes about 5 minutes once we're on a call together.

INTERESTED?

If this sounds good, just reply with:
• "Yes, let's schedule a call" (I'll send my Calendly)
• "Tell me more first" (I'll answer any questions)
• "Maybe later" (totally fine, no pressure!)

Or if you prefer to stay on Gumroad, that's completely okay too. I'll keep supporting both platforms, and you're welcome to stay where you are for as long as you like.

Either way, I wanted to extend this personal invitation because I value you as one of my core supporters.

Thanks for being awesome!
- dSebastien

P.S. No pressure at all - I mean it. This offer doesn't expire. If you want to wait 6 months and then migrate, the offer still stands. I respect whatever works best for you!

P.P.S. Seriously, thank you for being a subscriber for [X months/years]. It means more than you know! 🙏
```

### Template 6C: Migration Support Follow-Up (After Migration)

**Purpose:** Check-in after subscriber completes migration
**Audience:** Any subscriber who successfully migrated
**Tone:** Appreciative, supportive, helpful

```
Subject: How's the new platform working for you?

Hi [First Name],

Quick check-in: it's been about a week since you migrated to the new Shopify store, and I wanted to make sure everything is working smoothly for you!

A few quick questions:

1. Are you able to access all your content easily? ✅/❌
2. Have you tried downloading anything yet? Any issues? ✅/❌
3. Is the new platform better/same/worse than Gumroad?

If you encountered ANY issues - even small ones - please let me know and I'll fix them immediately!

READY TO CANCEL GUMROAD?

Since you've been using Shopify for a week now, we can cancel your old Gumroad subscription to avoid any confusion.

Just confirm:
• "Yes, cancel my Gumroad subscription"
• "Not yet, let me use both for another week"

Either way is fine! I just want to make sure you're comfortable before we turn off the old platform.

YOUR FEEDBACK HELPS:

I'd love to hear your honest thoughts about the migration experience:

Quick 1-minute survey: [Link to survey]
Or just reply with:
• What went well?
• What was confusing or annoying?
• What could I improve for others?

THANK YOU!

Seriously, thank you for being willing to migrate. I know switching platforms is never fun, but it helps me provide a better experience going forward.

As a thank you, I'm adding an extra month free to your subscription (you now have [X+1 months] total free). You should see this reflected in your billing.

Let me know if you need anything at all!
- dSebastien

P.S. If you're happy with the migration, I'd love a quick testimonial I can share with other subscribers who are on the fence. Something like: "The migration was easy because [reason]" - but no pressure!
```

### Template 6D: Non-Migrator Acceptance (Month 24+)

**Purpose:** Acknowledge and validate subscribers who prefer Gumroad
**Audience:** Subscribers who haven't migrated after 18+ months
**Tone:** Accepting, appreciative, supportive

```
Subject: You're staying on Gumroad - and that's totally okay!

Hi [First Name],

Quick note: I've noticed you're still happily on Gumroad, and I wanted to reach out to say:

**That's completely fine! 🙂**

I know I've mentioned the new Shopify platform a few times over the past year, but I want to be crystal clear:

✅ You can stay on Gumroad indefinitely
✅ I'm not going to bug you about migrating anymore
✅ Your subscription will continue working exactly as it does now
✅ You'll still get all the same content and support

Some people prefer Gumroad's simplicity, and I respect that.

THE ONLY THING I ASK:

If you ever have ANY issues with Gumroad (downloads not working, billing problems, anything), please let me know immediately and I'll fix it or help you migrate if needed.

And if you ever change your mind and want to try Shopify, the offer still stands:
• 3 months free
• I'll help you personally
• No pressure, no rush

But again - no pressure to migrate. Stay on whichever platform works best for you!

Thanks for being a subscriber all this time. I appreciate you!
- dSebastien

P.S. Out of curiosity (no pressure to answer), is there a specific reason you prefer Gumroad? Just trying to understand if there's something about Shopify that doesn't work for you. If you have 30 seconds to reply, I'd love to know - but totally optional!
```

### Template 6E: Overlap Period Reminder (During White-Glove Migration)

**Purpose:** Remind subscriber they have both platforms active
**Audience:** Subscribers in the 1-month overlap period
**Tone:** Helpful, reassuring, informative

```
Subject: You have access to both platforms - use whichever you prefer!

Hi [First Name],

Quick reminder: you currently have access to BOTH platforms for the next [X days]:

🔵 **Gumroad** (old platform): Still active
🟢 **Shopify** (new platform): Also active

This means:
• You can download from either one
• You can use whichever feels easier
• No rush to choose - take your time!
• Both work perfectly

WHY BOTH?

I wanted to give you time to get comfortable with Shopify before turning off Gumroad. This way, there's zero risk - if anything doesn't work on Shopify, you still have Gumroad as backup.

WHAT TO DO:

For the next [X days]:
1. Try downloading something from Shopify
2. Explore the new interface
3. See if you like it better
4. Let me know if you encounter ANY issues

At the end of [X days], I'll check in and ask:
"Ready to cancel Gumroad, or want to extend the overlap?"

No wrong answer! I just want you to be comfortable.

WHICH ONE SHOULD YOU USE?

Honestly? Try Shopify for new downloads. It should be faster and easier.

But if you ever have trouble, Gumroad is still there as backup.

QUESTIONS?

Reply anytime! I'm here to help.

- dSebastien

P.S. This overlap period is free - you're not being double-charged. It's my way of making sure you have a smooth transition with zero risk!
```

---

## Document Version History

- **v1.0** - 2026-01-08 - Initial comprehensive migration plan created
- Future updates will be tracked here

---

## Conclusion

This migration from Gumroad to Shopify is a significant undertaking that requires careful planning, systematic execution, and proactive customer communication.

**Key Takeaways:**

1. **Timeline Matters**: Don't rush - 12-16 weeks allows for proper testing and minimal customer disruption
2. **Subscriptions Are Critical**: Handle with extreme care - dual-run approach recommended
3. **Links Need Attention**: Comprehensive redirect strategy + systematic link replacement essential
4. **Communication Is Key**: Over-communicate with customers - multiple touchpoints, clear instructions
5. **Test Everything**: Thoroughly test on temp domain before DNS migration
6. **Monitor Closely**: First week post-migration requires active monitoring and quick issue resolution
7. **Calculate Costs**: Ensure Shopify is financially viable for your revenue level
8. **Have Rollback Plan**: Be prepared to revert if critical issues arise

**This migration is worth it if:**

- You want full control over your brand and customer experience
- You're ready to invest time in setup and optimization
- Your revenue justifies the increased complexity
- You see Shopify as a long-term growth platform

**Final Recommendation:**

If you've read this entire document and still feel excited about migrating - go for it! The benefits of a professional, branded store with advanced features are significant for creators who are scaling.

If you're feeling overwhelmed - that's normal. Consider:

1. Starting with Shopify trial to explore
2. Hiring a Shopify expert for parts you're not comfortable with
3. Taking the full 16 weeks to do it right (no need to rush)
4. Joining Shopify communities for support

Good luck with your migration! 🚀
