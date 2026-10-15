---
title: "I Failed Every Colorblind Test, But I'm Not Exactly Colorblind"
description: "I built my own color vision test, ran 5,600 trials on myself, and drew a map of what I actually see. The results were... eye-opening."
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

Earlier this year, I started a project to build custom keycaps (more on that in its own post once the set is done). Dye-sublimated keycaps live or die on contrast: a texture or icon that looks fine on screen can vanish once it's printed on the actual plastic.
To predict which designs would survive printing, I had to get really intimate with color theory and I eventually stumbled onto the well-established concept of luminance[^lum], which is a measure of the way the human eye sees brightness. It turns out this was really useful for the keycaps - if the luminance gap between two colors was big enough, then the print would "work" in the sense that the legends and textures on the caps could be easily seen against the background. For instance, in the example below, the design reads fine on screen, but the luminance gap was too small to survive printing.

<picture>
  <source srcset="/images/2026/10/vision/flame_render_vs_print_lighttext.png" media="(prefers-color-scheme: dark)">
  <img src="/images/2026/10/vision/flame_render_vs_print_darktext.png" alt="An example of a keycap that renders just fine on a screen, but fails miserably after printing.">
</picture>

And this got me thinking - now that I could comfortably discuss hue, saturation, and luminance, and I also had a partner (Claude) who could see things that I couldn't, could I use that to learn a little more about my own vision?

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
- **Hue (color family):** still close to a coin flip at a 32° shift, the largest the test tried.

<figure>
  <img src="/images/2026/10/vision/hsv_swatch_test_mock.png" alt="The early swatch test: two dark olive squares and Same / Different buttons">
  <figcaption>Can you tell these apart? They differ by about 6° of hue. I answered "same."</figcaption>
</figure>

This was a huge revelation. The frustration of 30+ years of clinical uncertainty lifted in an instant. It was like suddenly having the strength to carry a boulder that was previously immovable - almost like magic - and the feeling hit very hard. I now had a way to describe what was "wrong" with me and I spent the next ten minutes in tears of relief.

## New info, new idea

And it gave me a new idea - what if I built a "Stephen's vision on a card" statement that would be understandable to anyone at a glance? I could carry it in my wallet and pull it out whenever someone asked. I started by creating some visuals that I thought would help explain my color discrimination, but I discovered two things pretty quickly:

1. It was hard to explain to other people in a way that was engaging and understandable.
2. I still didn't quite understand it well enough myself. For instance, when I showed an early card to a Reddit design group, someone reasonably said "that's just red-green colorblindness" which was fair because that's what the card showed, but I didn't know how to clarify.

So, I took the only sane and rational next step: I built a controlled study[^study] and recruited volunteers through a Facebook post. You know - things that normal people do on a Saturday.

It was also time to replace that tape measure. HSV is convenient for designers, but equal steps in HSV don't *look* equal to the eye, so a "5% shift" means something different depending on where you are on the wheel. Instead, I switched to a color space called CIELAB, which is built so that one unit is roughly the smallest difference a normal eye can see, anywhere. That makes it possible to say things like "my threshold is 4× normal" and have it mean something.

All told, I did about 5,600 trials on myself. Not all of them counted: the early HSV runs were exploratory, and one big run had a bug (a 3-second time limit that turned slow answers into wrong ones), so I threw it out. The map below is built on the roughly 2,000 clean trials that were left. My 9 volunteers, all with normal color vision, did a shorter version - only 540 trials each.

[^study]: **Color space:** CIELAB, where a distance of 1 (one ΔE) is roughly one just-noticeable difference for a normal observer. Lightness was held fixed so only color changed. **Task:** four patches, three identical, pick the odd one out. **Coverage:** six anchor colors around the wheel plus neutral gray, four directions at each.

Here's what the trials look like. It's a standard testing mechanism - it starts from an anchor color and then tests how far it can move away from that anchor before you can tell the difference. The test itself shows four color blocks, three of which are always the same, and you have to pick which one is different. If you can't tell, you have to guess. The test assumes and requires that you guess - the math already bakes that in. It also self-adjusts over time so it can really find the boundary precisely.

<figure>
  <img src="/images/2026/10/vision/odd-one-out.svg" alt="Four squares: three identical, one slightly different" width="264" height="264">
  <figcaption>Which one is different? (It's the top-right square.)</figcaption>
</figure>

## What the map shows

The short version: **my brightness discrimination is normal; color discrimination is about 4× worse than normal, and it almost always leans the same way.**[^results]

Start with brightness, because it explains a lot. My lightness threshold is dead normal - essentially identical to my volunteers. Most of what we use color for in daily life actually leans on brightness: reading text, judging shadows and edges, or tracking a basketball across a gym (I actually play about once a week, and can shoot just fine). So for a lot of everyday cases, nothing seems obviously wrong for me. It also explains the keycaps: when I learned to design by luminance, I was unknowingly designing around the one channel that works perfectly for me.

The word I settled on for the region of colors that look identical to me is a **smear**. Everyone has them, but mine are much, much bigger. The maps below show all seven anchor points, each with a shape drawn around it. Every color inside a shape looks the same - that's why each one is filled with a single flat color. Also, mine all lean in the same direction - see how they point along the yellow-green ↔ magenta axis? There is one weird anomaly - my green smear is nearly round, and points toward the center like a normal one instead of along my diagonal, although it is still much bigger than everyone else's. I did extra testing here just to make sure and the pattern really holds up - I just have no idea why yet.

<div class="pair">
  <figure>
    <img src="/images/2026/10/vision/MAP_normal.png" alt="Typical eye: small smears pointing toward gray" width="1520" height="1520">
    <figcaption><strong>Typical eye.</strong> Smears are tiny, and each one points toward or away from the gray center. (Modeled with CIEDE2000, fitted to my 9 volunteers.)</figcaption>
  </figure>
  <figure>
    <img src="/images/2026/10/vision/MAP_final.png" alt="My eye: large smears leaning along the same diagonal" width="1520" height="1520">
    <figcaption><strong>My eye, same scale.</strong> About 4× bigger, and nearly all lean along the same 142° diagonal (yellow-green ↔ magenta). Green is the exception.</figcaption>
  </figure>
</div>

[^results]: **Lightness:** my threshold is 0.70 ΔE. The volunteers averaged 0.69. Dead normal. **Color overall:** ~3.7× worse than my volunteers, ~4.3× worse than the standard normal-observer model. **Near gray:** 5–9× worse. Normal eyes are *most* sensitive near gray. Mine aren't, which is exactly why muted colors are my problem. **Direction:** at six of seven anchors, my smear stretches along the same diagonal, about 142° in CIELAB - roughly yellow-green ↔ magenta. The odds of that much alignment happening by chance are about 1 in 250. **The exception is green**, where my smear is nearly round, and points toward the center like a normal one - just about 4.6× bigger. I re-tested that on two screens; it's real, and I don't know why yet. I also used CIEDE2000 - a color-difference formula fitted to thousands of normal-observer judgments - as a "global control." It agrees with my 9 volunteers (r = 0.86) and with my results: about 4× normal.

## So what kind of colorblindness is it anyway?

Ordinary colorblindness is directional. If you're red-green colorblind, you confuse colors along one line across the wheel, running roughly from red to green, but colors in other directions are easy to tell apart. These are called *confusion lines*, and each type of colorblindness has its own. So if my smears came from a known type, they'd stretch along that type's line, usually within a few degrees.

Mine don't. My lean is off by 47° from protan (one type of red-green), 37° from deutan (the other type of red-green) and 24° from tritan (blue-yellow). Only tritan is closer than chance, and even that's a loose fit, so my angle really does appear to be its own unique animal.

<figure>
  <img src="/images/2026/10/vision/axis-comparison.png" alt="My measured lean at each anchor compared with the protan, deutan, and tritan confusion directions">
  <figcaption>White is my lean at each anchor. If I were red-green colorblind, the white line would sit on top of the red or orange one. It almost never does. The one exception is green (far left), where my smear is nearly round and points toward the center like a normal one - which at green happens to be the protan direction.</figcaption>
</figure>

So why do I fail Ishihara? The plates are built from fairly muted colors, and muted colors sit near the gray center of the wheel. That's exactly where my smears are worst - 5 to 9 times bigger than normal. So the plates' red-green differences fall *inside* my smears anyway.

<figure>
  <img src="/images/2026/10/vision/card-inset.png" alt="The gray center of the color wheel, magnified: a small oval labeled typical, a large blob labeled me, and a long dashed band labeled red-green colorblind running side to side through both" width="262" height="402">
  <figcaption>The gray center of the wheel, magnified. A typical smear is a small oval. A red-green colorblind smear is a long, thin band. Mine is a big blob, but it covers almost the entire red-green band - so we both fail, for different reasons.</figcaption>
</figure>

I fail the red-green test without having a red-green defect - not because my confusion *lines* are the same, but because my confusion *zones* are massive!

## The vision card

The wallet card idea went through 67 designs in 31 days, incorporating critiques from Reddit, Facebook, friends, family, myself, and of course, my thinking buddy, Claude. Eventually I created a design brief with the rule that it has to work in 2–3 seconds, or it fails, however clever it is. Here's the full progression of what that looked like.

<picture>
  <source srcset="/images/2026/10/vision/card_iterations_dark.png" media="(prefers-color-scheme: dark)">
  <img src="/images/2026/10/vision/card_iterations_light.png" alt="All iterations of the front and back of the card, organized by timeline.">
</picture>

These versions failed for different reasons. For instance, the cards built on September 5 (first row above) failed on almost all counts - they didn't mention brightness at all, it was hard to make the connection between the front and the back, and they were just plain ugly from a design perspective. By September 16, the ugliness was gone, but the card was still too busy. Eventually, I reintroduced the color wheel, but made it the background of the card, reduced the amount of unnecessary text and highlighted an important zone to contrast my vision differences at a glance.

Here's where it landed. Before you read on: **how many columns of stripes do you see on the front?**

![Card front: a purple-to-green panel in three columns, labeled with what I see: smooth, smooth, stripes](/images/2026/10/vision/card-front.png)

**Front:** columns of stripes. Most people see stripes in the middle column; I see a smooth block, because those steps are well within normal vision but inside my smear.

![Card back: my smears drawn on a color wheel, a magnified inset of the gray center comparing a typical smear, mine, and a red-green colorblind band, and a stepped brightness strip](/images/2026/10/vision/card-back.png)

**Back:** the gray center of color space, magnified, showing my smear vs. a typical one vs. a red-green one, with a stepped brightness strip to show that part is fine.

## What's next

There's one more piece I haven't mentioned. My central vision isn't blurry, it's missing entirely, replaced by a swirl of colors and patterns - like a kaleidoscope held wherever I look, eyes open or closed. It's most similar to the symptoms of Stargardt disease, which affects the macula (the center of the retina).

Taken together - normal lightness, a broad loss of color sensitivity, a lean that doesn't match any known type, childhood onset, central vision loss, stable for 35 years - the pattern points at the cones or the macula rather than the optics of the eye. I've sent a clinical summary to a few color vision researchers, asking about the tests that could actually find something: high-resolution macular OCT, multifocal and full-field ERG, fundus autofluorescence, and formal color testing (an anomaloscope would settle the red-green question in about ten minutes).

The goal isn't a cure. It's a real diagnosis, or at least a documented one. And in the meantime, I finally have a better answer than "I can't tell you what I am, but it's not red-green colorblind."

## Try it yourself

If you're interested in either of the tests I built, you can try them here. The threshold test draws your own smear chart at the end, and nothing leaves your device unless you choose to send it. If you're willing to join the comparison group, check "Yes, send my results to Stephen" at the end: that sends me your answers, thresholds, and screen and browser details, plus a name or note only if you add one. I'll use them as controls for further analysis.

<p><a class="try-it" href="/color-threshold-test/">Try it: map your own color smears →</a></p>
<p><a class="try-it" href="/color-swatch-test/">Try it: see my original swatch test →</a></p>
