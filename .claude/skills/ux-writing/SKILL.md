---
name: ux-writing
description: Create user-centered, accessible interface copy (microcopy) for digital products including buttons, labels, error messages, notifications, forms, onboarding, empty states, success messages, and help text. Use when writing or editing any text that appears in apps, websites, or software interfaces, designing conversational flows, establishing voice and tone guidelines, auditing product content for consistency and usability, reviewing UI strings, or improving existing interface copy. Applies UX writing best practices based on four quality standards — purposeful, concise, conversational, and clear. Includes accessibility guidelines, research-backed benchmarks (sentence length, comprehension rates, reading levels), expanded error patterns, tone adaptation frameworks, and comprehensive reference materials.
---

<!--
  VENDORED from content-designer/ux-writing-skill (MIT, © 2026 Christopher Greer)
  https://github.com/content-designer/ux-writing-skill — see .claude/THIRD_PARTY.md.
  This is the self-contained SKILL.md (the general, language-agnostic craft layer).
  For THIS project's Romanian, donation-specific copy, use the `microcopy-ro` skill,
  which builds on these principles. Upstream ships deeper references/templates/examples
  (accessibility-guidelines, voice-chart-template, content-usability-checklist,
  patterns-detailed) — pull them from the repo above if you need them.
-->

# UX Writing

Write clear, concise, user-centered interface copy (UX text/microcopy) for digital products and experiences. This skill provides frameworks, patterns, and best practices for creating text that helps users accomplish their goals.

> **Project note:** for `donatie.despreadhd.ro`, all user-facing copy is **Romanian** and lives in
> `lib/content.ts` / `lib/projects.ts`. Apply the principles below, then apply the Romanian voice,
> diacritics, gender-inclusive forms, and donation patterns in the **`microcopy-ro`** skill.

## When to Use This Skill

Use this skill when:
- Writing interface copy (buttons, labels, titles, messages, forms)
- Editing existing UX text for clarity and effectiveness
- Creating error messages, notifications, or success messages
- Designing conversational flows or onboarding experiences
- Establishing voice and tone for a product
- Auditing product content for consistency and usability

## Core UX Writing Principles

### The Four Quality Standards

Every piece of UX text should be:

1. **Purposeful** — Helps users or the business achieve goals
2. **Concise** — Uses the fewest words possible without losing meaning
3. **Conversational** — Sounds natural and human, not robotic
4. **Clear** — Unambiguous, accurate, and easy to understand

### Key Best Practices

**Conciseness** — 40–60 characters per line max; every word has a job; break dense text into scannable chunks; front-load important information.

**Clarity** — plain language (7th–8th grade for general, 10th for professional); avoid jargon, idioms, technical terms; consistent terminology; meaningful, specific verbs.

**Conversational Tone** — write how you speak; active voice ~85% of the time; include prepositions and articles; avoid robotic phrasing.

**User-Centered** — focus on user benefits, not features; anticipate and answer user questions; use second-person ("you"); match the user's mental models.

## UX Text Patterns

### Titles
- **Purpose**: orient users. **Format**: noun phrases, sentence case. **Examples**: "Account settings", "Your library".

### Buttons and Links
- **Purpose**: enable action. **Format**: active imperative verbs, sentence case. **Pattern**: `[Verb] [object]` — "Save changes", "Delete account", "View details".
- **Avoid**: generic labels like "OK", "Submit", "Click here".

### Error Messages
- **Pattern**: `[What failed]. [Why/context]. [What to do].`

**Validation errors (inline)** — show on blur/as user types; brief, specific. "Email must include @", "Password must be at least 8 characters".

**System errors (modal/banner)** — `[Action failed]. [Likely cause]. [Recovery step].` "Payment failed. Your card was declined. Try a different payment method."

**Blocking errors (full-screen)** — `[What's blocked]. [Why]. [Specific action needed].`

**Permission errors** — benefit before request: `[User benefit]. [Permission needed].`

**Avoid**: technical codes without explanation ("Error 403"), blame language, robotic tone, dead ends, vague causes ("Something went wrong").

### Success Messages
- Past tense, specific, encouraging: "Changes saved", "Email sent".

### Empty States
- Explanation + CTA to populate: "No messages yet. Start a conversation to connect with your team."

### Form Fields
- **Labels**: clear noun phrases. **Instructions**: verb-first, explain why. **Placeholder**: sparingly. **Helper text**: static/on-demand based on importance.

### Notifications
- Verb-first title + contextual description: "Update required. Install the latest version to continue."

## Voice and Tone

**Voice** = consistent brand personality (3–5 concepts → adjectives → do/don't examples).
**Tone** = how voice adapts to context (purpose, context, emotional state, stakes).

**By emotional state:** Frustrated → empathetic, solution-focused. Confused → patient, explanatory. Confident → efficient, direct. Cautious → serious, transparent consequences. Successful → positive, brief celebration.

**By content type:** Errors → empathetic/solution-focused (never blame). Success → positive/specific. Instructions → clear/direct. Onboarding → inviting/concise. Confirmations → transparent (no manipulation). Empty states → hopeful/actionable.

## Editing Process (4 phases)
1. **Purposeful** — does it help the user's goal and serve the business? Is the value clear?
2. **Concise** — remove unnecessary words; combine redundancy; front-load.
3. **Conversational** — read aloud; active voice; natural connectors; no corporate jargon.
4. **Clear** — specific verbs; consistent terminology; test readability; unambiguous.

## Accessibility in UX Writing
- **Screen readers**: label interactive elements explicitly ("Submit application" not "Submit"); descriptive link text ("Read our privacy policy" not "Click here"); errors structured to read with the field label; ARIA labels when visual context isn't enough.
- **Cognitive**: 8–14 words/sentence (8 = 100% comprehension, 14 = 90%); scannable chunks; predictable patterns.
- **Multi-modal**: don't rely on color alone; pair icon + text; text alternatives; contrast WCAG AA ≥4.5:1.
- **Plain language**: 7th–8th grade; define terms; avoid idioms/metaphors/cultural references.

## UX Text Benchmarks
- **Length by type**: Buttons/CTAs 2–4 words (max 6); Titles 3–6 words (≤40 chars); Error messages 12–18 words (incl. solution); Instructions ≤20 words (14 ideal); Body 15–20 words/sentence.
- **Comprehension**: ≤8 words = 100%, ≤14 = 90%, 25 = comprehension drop.
- **Line length**: 40–60 chars. **Reading level**: general 7th–8th, professional 9th–10th, technical 10th–11th.
- **Tools**: Hemingway Editor, Flesch-Kincaid.

## Common Mistakes to Avoid
Passive voice excess · generic button labels · blaming users · clever humor in serious contexts · inconsistent terminology · hidden instructions · system-oriented language · too many words · robotic tone · color-only meaning · "click here" link text.

## Quick Reference
- **Sentence case**: "Save your changes" (not Title Case)
- **Active imperative for buttons**: "Delete account" (not "Account deletion")
- **User-focused**: "Save time with shortcuts" (not "We offer shortcuts")
- **Specific verbs**: "Delete" (permanent) vs "Remove"
- **Front-loaded**: "Password must be 8 characters" (not "Must be 8 characters for your password")

## Resources
The full upstream skill (MIT) ships extended references — pull from
`github.com/content-designer/ux-writing-skill` if needed:
`references/accessibility-guidelines.md`, `references/voice-chart-template.md`,
`references/content-usability-checklist.md`, `references/patterns-detailed.md`.
For this project's Romanian + donation specifics, use the **`microcopy-ro`** skill.
