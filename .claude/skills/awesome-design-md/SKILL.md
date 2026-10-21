---
name: awesome-design-md
description: Library of 84 ready-made DESIGN.md design-system files extracted from real brands (Apple, Stripe, Linear, Vercel, Notion, Airbnb, Spotify, Tesla, Nike, BMW, Ferrari, Revolut, Shopify, Figma, Framer, Supabase and more). Use when the user wants a page or UI that "looks like" a specific brand or site, needs a reference design language (tokens, type, color, spacing, components) to stay visually consistent, or wants a DESIGN.md to drop into a project root.
license: MIT
---

# Awesome DESIGN.md

A DESIGN.md is a plain-markdown design system that coding agents read to generate visually consistent UI (concept from Google Stitch). This skill bundles 84 of them, each extracted from a real website.

## Layout

```
design-md/<brand>/DESIGN.md   # the design system: tokens, typography, color, layout, components, rules
design-md/<brand>/README.md   # short summary of the source site
```

Available brands: 1win, airbnb, airtable, aljazeera, apple, binance, bmw, bmw-m, bugatti, cal, claude, clay, clickhouse, cohere, coinbase, composio, cursor, dell-1996, dji, elevenlabs, expo, ferrari, figma, framer, hashicorp, hp, ibm, intercom, jobright, kraken, lamborghini, linear.app, lovable, mastercard, mercury, meta, minimax, mintlify, miro, mistral.ai, mongodb, mydealz, nerdwallet, nike, nintendo-2001, notion, nvidia, ollama, opencode.ai, oracle, oura, pinterest, playstation, posthog, raycast, renault, replicate, resend, revolut, runwayml, sanity, sap, sentry, shopify, slack, spacex, spotify, starbucks, stripe, supabase, superhuman, tesla, theverge, together.ai, uber, vercel, vodafone, voltagent, warp, webflow, wired, wise, x.ai, zapier.

## How to use

1. Pick the brand(s) closest to the requested look. If the user names no brand, shortlist 2-3 that fit the product category and mood and say why.
2. Read `design-md/<brand>/DESIGN.md` (relative to this skill's directory) in full before writing UI.
3. Either copy it to the project root as `DESIGN.md`, or apply its tokens and rules directly to the code being built.
4. Treat it as a design language reference, not a clone target: reuse type scale, spacing, color logic, component patterns and tone, but never copy the brand's logo, name, trademarks or proprietary assets into another product.
5. When mixing references, take structure from one file and accents from another, and state which came from where.
