---
slug: how-sharing-works
title: How Sharing Works on powerlift.ing
description: Your whole program lives in the URL. Here is what that means for privacy, updates, and sending plans to athletes.
image: https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=630&fit=crop&q=80
alt: Coach reviewing training notes on a phone
published: 2026-05-20
created: 2026-05-20
updated: 2026-05-20
tags:
  - sharing
  - coaching
faq:
  - "Can anyone open my link? | Yes. Anyone with the full URL can load that program. Share only with people you trust."
  - "Does the link update when I edit? | Yes. The address bar updates as you type, so the latest version is always encoded in the link."
---

When you tap **Share** in the app, you copy a link that contains your program. There is no separate export step and no account required. The program is compressed into the path of the URL.

## What gets encoded

The builder stores your mesocycles, weeks, days, exercises, sets, reps, load, %1RM, RPE, rest, units, and saved maxes in a compact JSON payload. That payload is compressed and added to the path after `/app/`.

Legacy links using `/program/` or `/p/` still open correctly. New shares use `/app/…` by default.

## Why this is useful for coaches

You can text one link to an athlete and they see the same grid you use. When you change the plan, copy the link again if you want a fixed snapshot for a check-in. Many coaches keep the app open on their phone and refresh the share link after a weekly review.

## Limits to know

Very large programs produce very long URLs. Some chat apps truncate links. If a link fails to open, trim exercises or split the block into two programs.

Shared program pages are marked **noindex** so random shared links do not flood search results. Marketing pages like this blog and the homepage are indexed separately.

## Try it

[Launch the app](/app) with a blank week, add a day, then share. You will see the URL change as you edit.
