---
slug: how-sharing-works
title: How Sharing Works on bootybuild.ing
description: Your whole program lives in one open link. Send it to athletes, post it for lifters to learn from, and update it as you edit.
image: https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=630&fit=crop&q=80
alt: Coach reviewing training notes on a phone
published: 2026-05-20
created: 2026-05-20
updated: 2026-05-22
tags:
  - sharing
  - coaching
faq:
  - "Can anyone open my link? | Yes. Anyone with the full URL gets your whole program in bootybuild.ing — no login required. That open access is intentional so glute training programming can spread."
  - "Does the link update when I edit? | Yes. The address bar updates as you type, so the latest version is always encoded in the link."
---

When you tap **Share** in bootybuild.ing, you copy a link that contains your program. There is no separate export step and no account required. The program is compressed into the path of the URL.

## Open links by design

bootybuild.ing treats the share link as a feature, not a limitation. One URL opens the full grid for an athlete, a training partner, or a lifter you have never met who found your program in a forum or group chat. Coaches can pass along real blocks without paywalls or “request access” flows.

That matches what bootybuild.ing is for: **open glute training knowledge** — programs people can actually use, not hoard.

Paid plans later will add **private programs** for coaches who need them. Free bootybuild.ing will keep open one-link sharing at the center.

## What gets encoded

The builder stores your mesocycles, weeks, days, exercises, sets, reps, load, %1RM, RPE, rest, units, and saved maxes in a compact JSON payload. That payload is compressed and added to the path after `/app/`.

Legacy links using `/program/` or `/p/` still open correctly. New shares use `/app/…` by default.

## Why this is useful for coaches

You can text one link to an athlete and they see the same grid you use. Post a template publicly so other lifters can learn from your structure. When you change the plan, copy the link again if you want a fixed snapshot for a check-in. Many coaches keep bootybuild.ing open on their phone and refresh the share link after a weekly review.

## Limits to know

Very large programs produce very long URLs. Some chat apps truncate links. If a link fails to open, trim exercises or split the block into two programs.

Individual shared program URLs are marked **noindex** so they do not flood Google search results on their own. You can still share the link anywhere you want — social, email, forums — so people get the program directly.

## Try it

[Launch bootybuild.ing](/app) with a blank week, add a day, then share. You will see the URL change as you edit.
