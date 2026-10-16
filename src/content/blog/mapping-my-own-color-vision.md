---
title: "I Failed Every Colorblind Test, But I'm Not Exactly Colorblind"
description: "I built my own color vision test, ran about 5,900 trials on myself, and drew a map of what I actually see. The results were... eye-opening."
pubDate: 2026-10-13
tags: [project, color, vision, data]
draft: true
cover: "/images/2026/10/vision/MAP_final.png"
coverFit: contain
demo: /color-threshold-test/
---

<figure>
  <img src="/images/2026/10/vision/Ishihara_9.svg" alt="An Ishihara color plate: a circle of colored dots hiding a number" width="255" height="255">
  <figcaption> What number do you see? Most people see 74. People with red-green colorblindness usually see 21. I don't see a number at all. </figcaption>
</figure>

You've probably seen one of these: a circle of colored dots with a number hidden inside. It's called an Ishihara plate and it's designed to test for red-green colorblindness. I've taken this test more times than I can count, starting around age ten, and I almost always fail it. The conclusion everyone reaches is "red-green colorblind," and that's usually where the conversation ends.

Except it never quite fit. Lots of colors are hard for me to tell apart, and yes, sometimes that runs along the red-green spectrum - but sometimes it's blue-yellow, and sometimes it's neither, which always seemed weird to me. I never had the vocabulary to discuss it, so it just remained a vaguely uneasy feeling until this fall, when I finally had an opportunity to explore it myself. I do fail the test, but not for the reason everyone assumes.

## It all started with keycaps

Earlier this year, I started a project to build custom keycaps (more on that in its own post once the set is done). Dye-sublimated keycaps live or die on contrast: a texture or icon that looks fine on screen can vanish once it's printed on the actual plastic. To predict which designs would survive printing, I had to get really intimate with color theory and I eventually stumbled onto the well-established concept of luminance[^lum], which is a measure of the way the human eye sees brightness. It turns out this was really useful for the keycaps - if the luminance gap between two colors was big enough, then the print would "work" in the sense that the letters and textures on the caps could be easily seen against the background. For instance, in the example below, the design reads fine on screen, but the luminance gap was too small to survive printing.

<picture>
  <source srcset="/images/2026/10/vision/flame_render_vs_print_lighttext.png" media="(prefers-color-scheme: dark)">
  <img src="/images/2026/10/vision/flame_render_vs_print_darktext.png" alt="An example of a keycap that renders just fine on a screen, but fails miserably after printing.">
</picture>

And this got me thinking - now that I could comfortably discuss hue, saturation, and luminance, and I also had a partner, Claude, who could measure things I couldn’t see, could I use that to learn a little more about my own vision?

[^lum]: The luminance formula is $L = 0.2126R + 0.7152G + 0.0722B$, where $R$, $G$, and $B$ are the red, green, and blue channels of that color. Note that red, and especially blue, get a huge discount relative to green, which is the strongest color channel for humans. Luminance is different from value (the V from HSV), which is simply the maximum of red, green, or blue and much less reliable for measuring brightness the way we actually see it.

## Self-testing

Designers describe every color with three numbers, called HSV:

- **Hue**: which color it is - red, blue, purple. It's an angle around the color wheel.[^hue]
- **Saturation**: how vivid it is. 0% is gray, at the middle of the wheel; 100% is full-strength color, at the edge.[^sat]
- **Value**: how bright it is, from 0% (black) to 100%.[^val]

It's the designer's tape measure, and it was good enough to show me *where* my problem was, but it turned out to be an imprecise tool for what I actually needed to measure.

[^hue]: Mathematically, hue splits the wheel into three $120^\circ$ sections, centered on the primary colors red, green, and blue. The function looks strange because it's piecewise. Given $M = \max(R,G,B)$, $m = \min(R,G,B)$ and $C = M - m$:

    $$
    H = 60^\circ \times
    \begin{cases}
    \dfrac{G - B}{C} \bmod 6 & \text{if } M = R \\[6pt]
    \dfrac{B - R}{C} + 2 & \text{if } M = G \\[6pt]
    \dfrac{R - G}{C} + 4 & \text{if } M = B
    \end{cases}
    $$

[^sat]: Saturation is the difference between the strongest and weakest RGB channels, normalized to the strongest: $S = \frac{\max(R,G,B) - \min(R,G,B)}{\max(R,G,B)}$.

[^val]: Value is just the strongest channel: $V = \max(R,G,B)$.

<picture>
  <source srcset="/images/2026/10/vision/hsv_explainer_dark.png" media="(prefers-color-scheme: dark)">
  <img src="/images/2026/10/vision/hsv_explainer_light.png" alt="HSV color space: a hue/saturation wheel seen from above, and a cone where height is value (brightness)">
</picture>

With that background, I generated an early, simple test: show two swatches, change one of hue, saturation or value (HSV), and record whether I could tell they were different. The results were imprecise, but really helpful:

- **Value (brightness):** I could see about a 5% shift.
- **Saturation (vividness):** I needed about an 18% shift.
- **Hue (color family):** still close to a coin flip at a 32° shift - roughly the gap between red and orange on the color wheel - and that was the largest shift the test tried.

<figure>
  <img src="/images/2026/10/vision/hsv_swatch_test_mock.png" alt="The early swatch test: two dark olive squares and Same / Different buttons">
  <figcaption>Can you tell these apart? They differ by about 6° of hue. I answered "same."</figcaption>
</figure>

So, I could see brightness just fine. It was my color vision - specifically *which* color and *how vivid* - that was broken.

After 30+ years of "I admit, it doesn't make sense to me either," I finally had a way to describe what was "wrong" with me - and I spent the next ten minutes in tears of relief.

## From a card to a real study

And it gave me a new idea - what if I built a "Stephen's vision on a card" statement that would be understandable to anyone at a glance? I could carry it in my wallet and pull it out whenever someone asked. I started by creating some visuals that I thought would help explain my color discrimination, but I discovered two things pretty quickly:

1. It was hard to explain to other people in a way that was engaging and understandable.
2. I still didn't quite understand it well enough myself. For instance, when I showed an early card to a Reddit design group, someone suggested "that's just red-green colorblindness," which was completely reasonable because that's what the card showed, but I didn't know how to clarify.

So, I took the only sane and rational next step: I built a controlled study[^study] and recruited volunteers through a Facebook post. You know - things that normal people do on a Saturday.

It was also time to replace that tape measure. HSV is convenient for designers, but equal steps in HSV don't *look* equal to the eye, so a "5% shift" means something different depending on where you are on the wheel. Instead, I switched to a color space called CIELAB, which is built so that one unit is roughly the smallest difference a normal eye can see, anywhere. That makes it possible to say things like "my threshold is 4× normal" and have it mean something.

Here's what the trials look like. It's a standard testing mechanism - it starts from an anchor color and then tests how far it can move away from that anchor before you can tell the difference. The test itself shows four color blocks, three of which are always the same, and you have to pick which one is different. If you can't tell, you have to guess. The test assumes and requires that you guess - the math already bakes that in. It also self-adjusts over time so it can really find the boundary precisely.

<figure>
  <img src="/images/2026/10/vision/odd-one-out.svg" alt="Four squares: three identical, one slightly different" width="264" height="264">
  <figcaption>Which one is different? (It's the top-right square.)</figcaption>
</figure>

All told, I did about 5,900 trials on myself. Not all of them counted: the early HSV runs were exploratory, and one big run had a bug (a 3-second time limit that turned slow answers into wrong ones), so I threw it out. The map below is built on the roughly 2,300 clean trials that were left. My 10 volunteers, all with normal color vision, did a shorter version - most ran about 540 trials.

[^study]: **Color space:** CIELAB, where a distance of 1 (one ΔE) is roughly one just-noticeable difference for a normal observer. Lightness was held fixed so only color changed. **Task:** four patches, three identical, pick the odd one out. **Coverage:** six anchor colors around the wheel plus neutral gray, at least four directions at each.

## What the map shows

The short version: **my brightness discrimination is normal; color discrimination is about 4× worse than normal, and it almost always leans the same way (more on that below).**[^results]

Let me start with brightness, because it turns out to be quite important. My lightness threshold is dead normal - essentially identical to my volunteers. And that explained a lot for me. Most of what we use color for in daily life actually leans on brightness: reading text, judging shadows and edges, or tracking a basketball across a gym (I actually play about once a week, and can shoot just fine). So for a lot of everyday cases, nothing seems obviously wrong for me. It also explains the keycaps: when I learned to design by luminance, I was unknowingly designing around the one channel that works perfectly for me.

Around every color there’s a region of nearby colors that look identical to it. I call that region a **confusion zone**.[^zones] Everyone has them, but mine are much, much bigger. The maps below show all seven anchor points (the dots), each with its zone outlined around it. To me, every color inside an outline looks the same as the color at its dot. Look how much color that is. Also, mine all lean in the same direction - see how they all tilt from top-left to bottom-right, roughly yellow-green to magenta? The one exception is green: still huge, but rounder than the others and stretched toward the center like a normal one, instead of along my diagonal. I re-tested it just to be sure and it's real, I just don't know why.

[^zones]: Color scientists call these *discrimination ellipses*, or MacAdam ellipses, after David MacAdam's 1942 study that first mapped them for normal eyes. I use "confusion zone" because it pairs with the *confusion lines* of ordinary colorblindness, which come up below.

<div class="pair">
  <figure>
    <img src="/images/2026/10/vision/MAP_normal.png" alt="Typical eye: small confusion zones pointing toward gray" width="1520" height="1520">
    <figcaption><strong>Typical eye.</strong> Zones are tiny, and each one points toward or away from the gray center. (Modeled with a standard normal-vision formula, fitted to my volunteers.)</figcaption>
  </figure>
  <figure>
    <img src="/images/2026/10/vision/MAP_final.png" alt="My eye: large confusion zones leaning along the same diagonal" width="1520" height="1520">
    <figcaption><strong>My eye, same scale.</strong> About 4× bigger, and nearly all lean along the same diagonal (yellow-green ↔ magenta). Green is the exception.</figcaption>
  </figure>
</div>

[^results]: **Who I'm compared with:** the 7 volunteers who ran the same quick version of the test. One more run was left out for too many timeouts, and two volunteers ran the diagonal-only version, which feeds the direction results. **Lightness:** my threshold is 0.70 ΔE. The volunteers averaged 0.68. Dead normal. **Color overall:** ~3.7× worse than my volunteers, ~4.2× worse than the standard normal-observer model. **Near gray:** 5–9.5× worse. Normal eyes are *most* sensitive near gray. Mine aren't, which is exactly why muted colors are my problem. **Direction:** at six of seven anchors, my zone stretches along the same diagonal, about 143° in CIELAB - roughly yellow-green ↔ magenta. The odds of that much alignment happening by chance are about 1 in 130. **The exception is green**, where my zone is rounder and stretched toward the center like a normal one - just about 4.7× bigger. I re-tested that on two screens; it's real, and I don't know why yet. I also used CIEDE2000 - a color-difference formula fitted to thousands of normal-observer judgments - as a "global control." It agrees with my volunteers (r = 0.87) and with my results: about 4× normal.

## So what kind of colorblindness is it anyway?

Ordinary colorblindness is directional. If you're red-green colorblind, you confuse colors along one line across the wheel, running roughly from red to green, but colors in other directions are easy to tell apart. These are called *confusion lines*, and each type of colorblindness has its own. So if my zones came from a known type, they'd stretch along that type's line, usually within a few degrees.

Mine don't. None of the known types line up. Blue-yellow comes closest, and even that's a loose fit, so my lean really does appear to be its own unique animal.[^angles]

[^angles]: My lean is off by 46° from protan (one type of red-green), 36° from deutan (the other type of red-green), and 25° from tritan (blue-yellow). Tritan is the only one that comes anywhere near significance (p = 0.022, versus 0.54 for protan and 0.19 for deutan) - and since I tested three types, correcting for that puts it closer to 0.07. Either way, 25° is still a loose fit.

<figure>
  <img src="/images/2026/10/vision/axis-comparison.png" alt="My measured lean at each anchor compared with the protan, deutan, and tritan confusion directions">
  <figcaption>White is my lean at each anchor. If I were red-green colorblind, the white line would sit on top of the red or orange one. It almost never does. The one exception is green (far left), where my zone stretches toward the center like a normal one - which at green happens to be the protan direction.</figcaption>
</figure>

So why do I fail Ishihara? The plates are built from fairly muted colors, and muted colors sit near the gray center of the wheel. That's exactly where my zones are worst - 5 to 10 times bigger than normal. So the plates' red-green differences fall *inside* my zones anyway.

<figure>
  <img src="/images/2026/10/vision/card-inset.png" alt="The gray center of the color wheel, magnified: a small oval labeled typical, a large blob labeled me, and a long dashed band labeled red-green colorblind running side to side through both" width="262" height="402">
  <figcaption>The gray center of the wheel, magnified. A typical confusion zone is a small oval. A red-green colorblind one is a long, thin band - its confusion line. Mine is a big blob, but it covers almost the entire red-green band - so we both fail, for different reasons.</figcaption>
</figure>

I fail the red-green test without having a red-green defect - not because my confusion *lines* are the same, but because my confusion *zones* are massive! So, to that Redditor: reasonable guess, but no.

## The vision card

The wallet card idea went through 75 designs in 42 days, incorporating critiques from Reddit, Facebook, friends, family, myself, and of course, my thinking buddy, Claude. Eventually I created a design brief with the rule that it has to work in 2–3 seconds, or it fails, however clever it is. Here's the full progression of what that looked like.

<picture>
  <source srcset="/images/2026/10/vision/card_iterations_dark.png" media="(prefers-color-scheme: dark)">
  <img src="/images/2026/10/vision/card_iterations_light.png" alt="All iterations of the front and back of the card, organized by timeline.">
</picture>

These versions failed for different reasons. For instance, the cards built on September 5 (first row above) failed on almost all counts - they didn't mention brightness at all, it was hard to make the connection between the front and the back, and they were just plain ugly from a design perspective. By September 16, the ugliness was gone, but the card was still too busy. Eventually, I reintroduced the color wheel, but made it the background of the card, reduced the amount of unnecessary text and highlighted an important zone to contrast my vision differences at a glance. The final change came while writing this post: I swapped the third column for brightness steps, because that’s the half of the story that everyone (including me) kept missing.

Here's where it landed. Before you read on: **how many columns of stripes do you see on the front?**

![Card front: three columns - a smooth purple-to-green gradient, the same gradient in fine steps, and a gray brightness ramp in steps of the same size - labeled with what I see: smooth, smooth, stripes](/images/2026/10/vision/card-front.png)

**Front:** Most people count two columns of stripes: the middle and the right. I count one. I see the middle column as a smooth gradient - same as the first column, because its steps are outside a normal confusion zone, but inside mine. (Those steps are subtle, so a dim or low-quality screen can hide them even from normal eyes. If you don't see them either, the test at the end of this post will tell you more than this card can.) The last column shows steps of exactly the same size, but in brightness only, and I can see them just fine. Because both columns are measured in CIELAB, "the same size" really means the same: each step is 4.5 units, about 5× what a typical eye needs near gray. In color, that's inside my confusion zone. In brightness, it's more than 6× my threshold.

![Card back: my confusion zones drawn on a color wheel, a magnified inset of the gray center comparing a typical zone, mine, and a red-green colorblind band, and a stepped brightness strip](/images/2026/10/vision/card-back.png)

**Back:** the gray center of color space, magnified, showing my confusion zone vs. a typical one vs. a red-green one, with a stepped brightness strip to show that part is fine.

## What's next

There's one more piece I haven't mentioned - my central vision, which is missing entirely, replaced by a swirl of colors and patterns - like a kaleidoscope held wherever I look, eyes open or closed. It's most similar to the symptoms of Stargardt disease, which affects the macula (the center of the retina). It's not the focus here (maybe a future post), but it's part of the same picture.

Taken together - normal lightness, a broad loss of color sensitivity, a lean that doesn't match any known type, childhood onset, central vision loss, stable for 35 years - the pattern points at the cones (the retina's color sensors) or the macula, rather than the optics of the eye. I've sent a clinical summary to a few color vision researchers, asking about the tests that could actually find something: detailed scans of the retina, tests that measure how the cones respond electrically, and formal color testing (an anomaloscope would settle the red-green question in about ten minutes).[^tests]

[^tests]: Specifically: high-resolution macular OCT, multifocal and full-field ERG, and fundus autofluorescence.

The goal isn't a cure. It's a real diagnosis, or at least a documented one. In the meantime, I finally have a better answer than "I can't tell you what I am, but it's not red-green colorblind." Here it is:

> My brightness vision is normal. My color vision isn't - every color sits inside a confusion zone about four times bigger than yours, where everything looks the same. And mine lean in a direction no known type of colorblindness does.

## Try it yourself

If you're interested in either of the tests I built, you can try them here. The threshold test draws a map of your own confusion zones at the end, and nothing leaves your device unless you choose to send it. If you're willing to join the comparison group, check "Yes, send my results to Stephen" at the end: that sends me your answers, thresholds, and screen and browser details, plus a name or note only if you add one. I'll use them as controls for further analysis.

<p><a class="try-it" href="/color-threshold-test/">Try it: map your own confusion zones →</a></p>
<p><a class="try-it" href="/color-swatch-test/">Try it: see my original swatch test →</a></p>
