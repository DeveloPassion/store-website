---
skill: optimize-product-images
description: Generate marketing-optimized image prompts, cover image text overlays, and screenshot recommendations to maximize conversion rates and sales
keywords: [image, images, prompt, prompts, cover, banner, screenshot, screenshots, visual, visuals, marketing, conversion, optimize, imagery, copywriting, headline, cta, psychology, sales]
dependencies: [product data files, marketing psychology principles, conversion optimization]
examples:
  - "Optimize images for obsidian-starter-kit"
  - "Generate image prompts for knowii-voice-ai"
  - "What screenshots should I add to personal-knowledge-management-guide"
  - "Create cover image headlines for productivity-and-time-management"
  - "Help me improve product visuals for better conversion"
---

# Product Image Optimization Skill

This skill helps you create high-converting product images by generating:

1. **AI Image Prompts** - Detailed prompts for generating cover images, banners, and marketing visuals
2. **Cover Image Text Overlays** - Compelling headlines, subtitles, and CTAs for maximum impact
3. **Screenshot Recommendations** - Strategic screenshots to showcase value and drive conversions
4. **Marketing Strategy** - Psychology-based recommendations for visual storytelling

## Usage

Invoke this skill by mentioning keywords like:
- "optimize images for [product]"
- "generate image prompts for [product]"
- "what screenshots should I add to [product]"
- "improve product visuals"
- "marketing images for [product]"

## Process

When this skill is invoked, follow these steps:

### 1. Identify the Product

First, determine which product needs image optimization:

```bash
# List all products to help user choose
bun run update:products -- --operation list --format table
```

Ask the user which product they want to optimize images for, or use the product they mentioned.

### 2. Load Product Data

Read the product's JSON file to understand:
- Product name, tagline, and value proposition
- Problem-Agitate-Solution framework
- Features, benefits, and included items
- Target audience and positioning
- Price tier and positioning (free, budget, standard, premium, enterprise, subscription)
- Category and tags (for visual theme alignment)

```bash
# Load the product data
# Read from: src/data/products/{product-id}.json
```

### 3. Analyze Marketing Psychology

Based on the product data, analyze:

**Emotional Triggers:**
- Pain points (from `problem` and `problemPoints`)
- Desires and aspirations (from `solution` and `benefits`)
- Urgency and scarcity (from `agitate`)
- Trust and credibility (from `testimonials`, `trustBadges`, `guarantees`)

**Value Communication:**
- Primary benefit (the ONE thing that matters most)
- Proof elements (what shows it works)
- Differentiation (what makes it unique)

**Target Audience Psychology:**
- Technical level (beginner-friendly vs. advanced)
- Goals and aspirations
- Visual preferences for the niche

### 4. Generate AI Image Prompts

Create detailed image prompts for AI generation tools (Midjourney, DALL-E, Stable Diffusion, etc.).

#### Cover Image Prompts (16:9, 800x450px)

Generate 3-5 variations optimized for product cards:

**Template Structure:**
```
[Subject/Scene] + [Style] + [Mood/Atmosphere] + [Color Palette] + [Composition] + [Technical Details]
```

**Marketing Psychology Integration:**
- Use visual metaphors for the problem/solution
- Incorporate trust signals (professional, polished, credible)
- Match the emotional state of the target audience
- Create visual contrast to stand out

**Examples by Price Tier:**
- **Free/Budget**: Clean, simple, friendly, accessible
- **Standard**: Professional, polished, valuable
- **Premium**: Sophisticated, elegant, exclusive
- **Enterprise**: Powerful, scalable, authoritative
- **Subscription**: Ongoing, evolving, community-driven

#### Banner Image Prompts (16:9, 1920x1080px)

Generate 2-3 hero section variations:

**Focus Areas:**
- Emotional impact (awe, inspiration, relief, excitement)
- Storytelling (show the transformation)
- Brand alignment (colors, style, personality)
- Call-to-action readiness (space for text overlays)

#### Marketing Visual Prompts

Generate prompts for supporting visuals:
- Social proof graphics
- Feature highlight images
- Comparison visuals
- Process/workflow diagrams

### 5. Design Cover Image Text Overlays

Create compelling text overlay recommendations for cover images:

#### Headline Formulas (Choose 3-5)

**Problem-Aware Headlines:**
- "Stop [Pain Point] in [Timeframe]"
- "Finally, [Desired Outcome] Without [Common Obstacle]"
- "The [Adjective] Way to [Achieve Goal]"

**Benefit-Driven Headlines:**
- "[Number] [Unit] to [Desired Outcome]"
- "[Achieve Goal] Like [Aspirational Reference]"
- "Transform [Current State] Into [Desired State]"

**Curiosity-Based Headlines:**
- "The Secret to [Desired Outcome]"
- "What [Target Audience] Know About [Topic]"
- "Discover How to [Achieve Goal]"

**Social Proof Headlines:**
- "Join [Number]+ [Target Audience] Who [Achievement]"
- "Trusted by [Authority Figures] to [Achieve Goal]"

#### Subtitle Formulas (Choose 2-3)

- Clarify the promise: "A [product type] that [specific benefit]"
- Add specificity: "[Number] [resources] to [outcome] in [timeframe]"
- Remove risk: "No [common concern]. Guaranteed."
- Show ease: "[Achieve goal] in just [number] [time units]"

#### Trust Badge Text

- "[Number]+ Happy Customers"
- "30-Day Money-Back Guarantee"
- "Lifetime Updates Included"
- "Created by [Authority/Expert]"

#### CTA Text Options

Based on price tier and product type:
- **High-ticket**: "Schedule a Call", "Book a Demo", "Apply Now"
- **Standard**: "Get Started", "Buy Now", "Download Now"
- **Free**: "Access Free", "Download Free", "Join Free"
- **Subscription**: "Start Free Trial", "Subscribe Now", "Get Access"

### 6. Screenshot Strategy Recommendations

Recommend specific screenshots to capture, organized by media group:

#### Main Screenshots (3-5 critical shots)

**For Digital Products:**
1. **Dashboard/Overview** - Show the "home base" where users start
2. **Key Feature in Action** - The #1 feature that delivers core value
3. **Results/Output** - What users get/achieve (before/after)
4. **Workflow View** - How easy it is to use
5. **Mobile/Responsive** - If applicable

**For Courses/Training:**
1. **Course Dashboard** - Full curriculum overview
2. **Lesson Interface** - What learning looks like
3. **Resources/Downloads** - Show what's included
4. **Community/Support** - Social proof and support
5. **Completion Certificate** - End goal visualization

**For Services:**
1. **Onboarding Flow** - How it starts
2. **Service Delivery** - What the experience looks like
3. **Results Dashboard** - Tracking progress/outcomes
4. **Communication Interface** - How you stay connected
5. **Success Story** - Real client result

#### Secondary Screenshots (5-8 supporting shots)

- Feature deep-dives (one screenshot per major feature)
- Settings/customization options
- Integrations and connections
- Mobile experience
- Team/collaboration features
- Analytics and reporting

#### Bonus Screenshots (3-5 social proof shots)

- Testimonials (formatted beautifully)
- Community engagement (forum, chat, events)
- Media mentions (logos, quotes)
- Awards and recognition
- Creator credentials/expertise

### 7. Visual Storytelling Arc

Design a narrative flow through the images:

1. **Cover**: Grab attention (problem awareness or aspiration)
2. **Banner**: Create desire (transformation promise)
3. **Main**: Build belief (show it works)
4. **Secondary**: Remove objections (address concerns)
5. **Bonus**: Trigger action (social proof, urgency)

### 8. Marketing Optimization Tips

Provide specific recommendations:

#### Color Psychology
- Match colors to emotional goals (trust: blue, urgency: red, growth: green)
- Ensure brand consistency
- Use contrast for CTAs

#### Composition Rules
- Rule of thirds for focal points
- Negative space for text overlays
- Visual hierarchy (big → small = important → supporting)

#### Conversion Optimization
- Include faces (builds trust and connection)
- Show the product in use (not just screenshots)
- Use directional cues (arrows, eye gaze) toward CTAs
- Add movement/progress indicators (builds momentum)

#### A/B Testing Recommendations
Suggest specific elements to test:
- Headline variations
- Image styles (realistic vs. illustrative)
- With/without human elements
- Different emotional appeals

### 9. Writing Conversion-Focused Metadata

**CRITICAL: Never write literal descriptions of what's in an image. Always write for conversion.**

Image titles and alt text are marketing copy, not accessibility descriptions. They appear in the product gallery and should reinforce the value proposition.

#### Title Rules

**BAD (Literal/Descriptive):**
- "Screenshot of dashboard showing menu options"
- "Topics covered in the workshop including AI, LLMs, Prompt Engineering"
- "Guide content showing how to create a Writing Style document"

**GOOD (Conversion-Focused):**
- "Step-by-Step System with Ready-to-Use Prompts"
- "Your Voice, Amplified by AI"
- "Capture Your Unique Voice and Writing Quirks"
- "Configure Any AI as Your Personal Ghostwriter"

**Title Writing Formula:**
1. Read the sales copy (problem, solution, benefits)
2. Ask: "What value does this image demonstrate?"
3. Write a benefit-driven title that reinforces the purchase decision

**Examples by Image Type:**
- **Cover**: Product name or tagline
- **Hero/Illustration**: Transformation promise or emotional hook from sales copy
- **Screenshots**: The specific value/feature being demonstrated (not what's visible)
- **Process images**: The outcome or benefit of that step

#### Alt Text Rules

Alt text should be concise (under 125 chars) and conversion-focused:

**BAD:**
- "Image showing bullet points of workshop topics"
- "Screenshot of writing style document creation process"

**GOOD:**
- "Transform generic AI output into content that sounds like you"
- "Clear instructions showing exactly how to train AI on your writing style"
- "Ready-to-use prompts to set up ChatGPT, Claude, or any AI as your ghostwriter"

**Alt Text Formula:**
- For covers: "[Product Name] - [Core Benefit]"
- For screenshots: "[Specific benefit] - [What this enables]"
- For illustrations: "[Transformation or outcome shown]"

### 10. Technical Specifications Reminder

Include a checklist:
- [ ] Cover images: 800x450px (16:9), WebP, ~150KB
- [ ] Banner images: 1920x1080px (16:9), WebP, ~300KB
- [ ] Main screenshots: 1600x900px, WebP, ~200KB
- [ ] All images have conversion-focused titles (NOT literal descriptions)
- [ ] All images have benefit-driven alt text
- [ ] Text overlays are readable on mobile
- [ ] Brand colors and fonts are consistent

### 11. Deliverable Format

Present your recommendations in this structure:

```markdown
# Image Optimization Report: [Product Name]

## Product Analysis
- **Target Audience**: [who]
- **Core Problem**: [pain]
- **Key Benefit**: [transformation]
- **Emotional Trigger**: [primary emotion]
- **Price Positioning**: [tier]

## 1. AI Image Prompts

### Cover Image Variations
**Variation 1: [Theme Name]**
[Detailed prompt]

**Variation 2: [Theme Name]**
[Detailed prompt]

[Continue for 3-5 variations]

### Banner Image Variations
[2-3 hero variations]

## 2. Cover Image Text Overlays

### Recommended Headline
**Primary**: [headline]
**Alternative 1**: [headline]
**Alternative 2**: [headline]

### Recommended Subtitle
[subtitle]

### Trust Badges
- [badge 1]
- [badge 2]

### CTA Text
[call to action]

## 3. Screenshot Strategy

### Main Screenshots (Priority Order)
1. **[Screenshot Name]**: [Why it matters, what to show]
2. **[Screenshot Name]**: [Why it matters, what to show]
[Continue for 3-5]

### Secondary Screenshots
[5-8 detailed recommendations]

### Bonus Screenshots
[3-5 social proof shots]

## 4. Visual Storytelling Arc
[Explain the narrative flow]

## 5. Marketing Psychology Notes
- [Key insight 1]
- [Key insight 2]
- [Key insight 3]

## 6. A/B Testing Recommendations
- Test: [element] - [variation A] vs [variation B]
- Test: [element] - [variation A] vs [variation B]

## 7. Next Steps
1. [ ] Generate AI images using prompts
2. [ ] Capture recommended screenshots
3. [ ] Add text overlays to cover images
4. [ ] Upload to product media via CLI
5. [ ] Test on different devices
6. [ ] Monitor conversion rates
```

## Best Practices

1. **Always start with product data** - Don't make assumptions, read the actual JSON
2. **Psychology first** - Understand WHY before recommending WHAT
3. **Be specific** - Vague advice doesn't help; give exact prompts and examples
4. **Think mobile-first** - Most traffic is mobile, ensure readability
5. **Test everything** - Provide A/B test recommendations
6. **Match the brand** - Check category/tags to align visual style
7. **Focus on ROI** - Every recommendation should tie to conversion/sales goals

## Advanced Techniques

### For High-Converting Cover Images:
1. **Pattern Interrupt** - Break expectations to grab attention
2. **Benefit Stacking** - Show multiple benefits in one image
3. **Social Proof Integration** - Weave testimonials into visuals
4. **Scarcity/Urgency** - Visual cues of limited availability
5. **Before/After** - Split-screen transformation

### For Premium Products:
1. Use sophisticated, minimalist design
2. Emphasize exclusivity and prestige
3. Include subtle luxury cues (materials, space, lighting)
4. Show the aspirational lifestyle

### For Free/Budget Products:
1. Emphasize accessibility and ease
2. Use friendly, approachable visuals
3. Show immediate value and quick wins
4. Remove any perception of complexity

## Example Invocations

"Optimize images for obsidian-starter-kit"
"Generate image prompts for knowii-voice-ai"
"What screenshots should I add to personal-knowledge-management-guide"
"Improve cover image for productivity-and-time-management"

## Notes

- This skill works best when you have already created the product JSON file
- If the product doesn't have problem/solution/benefits filled in, recommend completing that first
- Always provide multiple options (3-5 variations) so the user can choose
- Tie every recommendation back to conversion optimization
- Use marketing psychology principles, not just aesthetics
