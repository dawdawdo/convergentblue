---
title: "Mapping My Own Color Vision"
description: "I've failed every colorblind test since I was a kid, but I'm not red-green colorblind. So I built my own test, ran 2,000 trials on myself, and mapped what I actually see."
pubDate: 2026-10-13
tags: [project, color, vision, data]
draft: true
cover: "/images/2026/10/vision/MAP_final.png"
coverFit: contain
---

<!-- DRAFTING NOTES (stripped at build):
- Drafted by Claude from Stephen's notes, worklog, results files and punch list in Vision_Investigation_20260904. All of it needs Stephen's voice pass; nothing here is his verbatim except the quoted "smear" line, which comes from his vocabulary decision.
- Images are in public/images/2026/10/vision/ (card = R16 previews; swap if a newer round wins).
- Left out on purpose: doctors' names/emails, controls' names, the ICD-10 table (could be a fun aside for the risk-adjustment crowd — your call), the cost/tiiny.host note.
-->

## I have always failed the dot test

You know the one. A circle full of colored dots, and somewhere in there is a number. I've taken the Ishihara plates more times than I can count, starting around age 10, and I almost never see the number. The usual conclusion is "red-green colorblind," everyone nods, and that's the end of it.

Except it never quite fit. I don't mix up reds and greens the way red-green colorblind people describe. What I *do* have trouble with is muted colors: grays, sage greens, dusty mauves. They tend to blend into each other. Brightness, on the other hand, I'm great at. Show me two grays a hair apart in lightness and I'll pick the darker one every time.

There's also a second thing going on, which I'll mention because it turns out to matter: my central vision isn't blurry, it's *replaced*. Right where I'm looking there's a moving, kaleidoscope-like pattern — a dark shape spinning about twice a second with a bright outline, surrounded by swirling colored texture. It's there with my eyes closed. Most days I don't notice it; paying attention to it is tiring. It showed up around the same time as the color problems and hasn't changed since. My retinas look normal on a dilated exam.

So: lifelong, stable, not quite any textbook thing, and nobody had ever looked past the dot test. This fall I decided to look myself.

## It started with keycaps

<!-- Keep short; the keycaps post comes later. -->

The real origin is a custom keycap project from earlier this year (more on that in its own post once it's done). Dye-sublimated keycaps live or die on contrast: a texture or icon that looks fine on screen can vanish once it's printed on the actual plastic. To predict which designs would survive, I had to learn how to move between hex, RGB, HSV and luminance, and I ended up with a working rule of thumb:

$$L = 0.2126R + 0.7152G + 0.0722B$$

Compute that for the base color and the design color, and if the gap is around 26 or more, it reads. Under about 19, it usually doesn't.

That rule worked, which was satisfying. But along the way I noticed something less satisfying: I could predict and judge *lightness* differences just fine, and I was nearly useless at judging hue and saturation by eye. I'd always known that vaguely. Now I had the vocabulary to actually measure it.

## Round one: HSV swatch pairs

The first tests (early September) were simple: show two swatches, change one of hue, saturation or value (HSV), and record whether I could tell they were different. The results were blunt:

- **Value (brightness):** reliable from about a 5-point shift.
- **Saturation:** reliable from around an 18-point shift.
- **Hue:** still close to a coin flip at a 32-point shift, the largest the test tried.

That was enough to put together a one-page summary for my eye doctor and a first "vision on a card" — a wallet card I could hand to someone to explain what I see. I posted an early version to a Stargardt's support group, because Stargardt's (a macular disease) is the closest match I'd found to my symptoms.

![The first swatch-pair test](/images/2026/10/vision/swatch-pairs-first-test.png)

I'll be honest: seeing my own vision written down as numbers for the first time hit harder than I expected. Forty-five years of "you're just colorblind," and here was something specific and measurable. <!-- Stephen: worklog mentions this was emotional; keep, expand, or cut. -->

## Round two: doing it properly

HSV is convenient for designers but terrible for measuring vision, because equal steps in HSV aren't equal steps to the eye. So I rebuilt the test properly:

- **Color space:** CIELAB, which is designed so that a distance of 1 (one ΔE) is roughly one just-noticeable difference for a normal observer. Lightness held fixed so only color changes.
- **Task:** four patches, three identical, pick the odd one out.
- **Adaptive staircase (QUEST):** every trial is placed at the current best guess of my threshold, so the test spends all its time at the edge of what I can see. It's supposed to feel like guessing. It did.
- **Coverage:** seven anchor colors around the wheel plus neutral gray, four directions at each.

About 2,000 clean trials over two long sessions. Along the way I caught and fixed a few things that would have quietly wrecked the results: a 3-second response cap that was turning slow answers into wrong ones, 8-bit display rounding, and a distance formula (ΔE76) that overstates saturated colors and briefly produced a fake "worse at high saturation" result.

## What the map shows

![My color discrimination map](/images/2026/10/vision/MAP_final.png)

The short version: **brightness is normal; color is about 4× worse than normal, and it always leans the same way.**

The word I settled on for the region of colors that look identical to me is a **smear**. Everyone has them — normal smears are about 1 ΔE across. Mine are much bigger:

> Everyone's color vision smears a little. Mine smears about 4× more, and always in the same direction.

A few specifics:

- **Lightness:** my threshold is 0.70 ΔE. The controls averaged 0.69. Dead normal.
- **Color overall:** ~3.7× worse than controls, ~4.3× worse than the standard normal-observer model.
- **Near gray:** 5–9× worse. Normal eyes are *most* sensitive near gray. Mine aren't, which is exactly why muted colors are my problem.
- **Direction:** at six of seven anchors, my smear stretches along the same diagonal, about 142° in CIELAB — roughly yellow-green ↔ magenta. The odds of seven directions lining up that tightly by chance are about 1 in 250.
- **The exception is green**, where my smear is just a uniformly bigger version of a normal one, with no lean. I re-tested that on two screens; it's real, and I don't know why yet.

## Controls

A map of one person doesn't mean much without a comparison, so I put a version of the test online and asked friends and family to take it. Nine people with no known color vision issues did, on phones, laptops, an iPad, and one (my wife, Liz) on my own monitor, which let me check that my screen wasn't skewing things. It wasn't — if anything, my multiples are slightly conservative.

![Controls vs. me](/images/2026/10/vision/strip-controls-vs-me.png)

I also used CIEDE2000 — a color-difference formula fitted to thousands of normal-observer judgments — as a "global control." It agrees with my nine controls (r = 0.86) and with my results: about 4× normal.

## So is it red-green or not?

When I showed an early card around, someone reasonably said "that's just red-green colorblindness." Fair: the card literally had a band labeled RED–GREEN on it. The card was wrong.

Real red-green deficiency (protan or deutan) has confusion lines that radiate from a specific point in color space, so you can calculate exactly which direction they *should* run at each of my test colors. Comparing that with my measured direction:

| type | predicted | my miss | better than chance? |
|---|---|---|---|
| protan (red-green) | ~7–15° | 47° | no |
| deutan (red-green) | ~178–179° | 37° | no |
| tritan (blue-yellow) | ~108–134° | 24° | yes (p = 0.015) |

A random direction would miss by about 45° on average. Protan is literally no better than random. The only classic type I lean toward is blue-yellow, and even that's a lean, not a match.

![My measured axis vs. the three classic types](/images/2026/10/vision/axis-comparison.png)

So why do I fail Ishihara? Because my smears are so big that the plates' muted red-green differences fall *inside* them anyway. I fail the red-green test without having a red-green defect.

## Vision on a card

![Card front](/images/2026/10/vision/card-front.png)

![Card back](/images/2026/10/vision/card-back.png)

The wallet card went through more than a dozen rounds, a harsh self-critique turned into a design brief, a Reddit critique, and a couple of test prints. The rule that finally stuck: it has to work in 2–3 seconds, or it fails, however clever it is.

Where it landed:

- **Front:** columns of stripes. Most people see stripes in the middle column; I see a smooth block, because those steps are well within normal vision but inside my smear.
- **Back:** the gray center of color space, magnified, showing my smear vs. a typical one vs. a red-green one, with a stepped brightness strip to show that part is fine.

<!-- Stephen: maybe a short note on what got cut (the ellipse diagram, data-derived backgrounds) — the "it needs a caption to explain it, so it fails" lesson is good. -->

## What's next

Taken together — normal lightness, a broad loss of color sensitivity, a blue-yellow lean, childhood onset, central vision loss, stable for 35 years — the pattern points at the cones or the macula rather than the optics of the eye. I've sent a clinical summary to a color vision researcher at UofL and to the Vanderbilt Vision Research Center, asking about the tests that could actually find something: high-resolution macular OCT, multifocal and full-field ERG, fundus autofluorescence, and formal color testing (an anomaloscope would settle the red-green question in about ten minutes).

The goal isn't a cure. It's a real diagnosis, or at least a documented one. And in the meantime, I finally have a better answer than "I'm colorblind, I guess."

<!-- Possible aside for the work crowd: none of the plausible ICD-10 codes map to a CMS-HCC, "clinically interesting and financially invisible." -->

<!-- Possible closer: link the online threshold test so readers can try it (would need hosting; the tiiny.host version may be gone). -->
