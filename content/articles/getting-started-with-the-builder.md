---
slug: getting-started-with-the-builder
title: Getting Started With the Program Builder
description: A quick walkthrough of mesocycles, weeks, days, and rows so you can ship your first shareable powerlifting plan.
published: 2026-05-21
created: 2026-05-21
updated: 2026-05-21
tags:
  - programming
  - getting started
---

The builder at `/app` is a single-page editor. Everything saves in the URL as you type. This walkthrough assumes you are on a phone or laptop with JavaScript enabled.

## Mesocycles and weeks

Use the mesocycle dropdown to name blocks (hypertrophy, strength, peaking). Add weeks inside the active mesocycle. Each week has its own day list.

Switch weeks from the week picker. Add or remove weeks with the plus and trash icons in the week bar.

## Days and exercises

Each day is a collapsible section. Tap **Add Day** to extend the week up to seven days. Inside a day, **Add Exercise** creates a row with:

- Exercise name (free text, e.g. "Paused bench")
- Variation notes
- Sets, reps, load, %1RM, RPE, rest

## Units and maxes

Pick **lbs** or **kg** in the week bar. Open **Config** (sliders icon in the header) to enter squat, bench, and deadlift maxes plus custom lifts. When a max exists for an exercise, %1RM and load stay in sync on that row.

## Share

Tap the share icon in the header. The link is copied to your clipboard. Send it like any other URL.

## Next steps

Read [how sharing works](/blog/how-sharing-works/) for privacy and link length notes. When the free program library ships, you will be able to open classic templates from `/programs/` and edit them in the same editor.
