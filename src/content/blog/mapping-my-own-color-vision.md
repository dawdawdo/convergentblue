---
title: "Red-Green Colorblind Poser"
description: "I've failed every colorblind test since I was a kid, but I always knew it wasn't so simple, so recently I built my own test, and created a map of my vision. The results were... eye-opening, : )"
pubDate: 2026-10-13
tags: [project, color, vision, data]
draft: true
cover: "/images/2026/10/vision/MAP_final.png"
coverFit: contain
demo: /color-threshold-test/
---

<!-- TODO: Need an image to show what central vision loss looks like? Maybe show all three somehow?
Show an image of a keycap that looks good on the designer but bad in real print
A. Need a visual for HSV
B. Show an example of the early HSV swatch test 
C. Alter the 4-box odd man out test for hosting here 
D. Describe failures in the vision card in whatever detail makes the most sense.
Ask claude for help fixing the indentation problem after the piecewise function.
Font size forTex formulas is so big - can it be cut down by default?
-->

## Three different vision problems

I have three seperately describable vision problems:  
- **Central vision loss**: My central vision is not blurry, it's actually missing entirely. It's replaced with a swirl of colors and patterns. Imagine if someone were holding up a kaleidoscope right in the middle of your vision and rotating it all day, whether you have your eyes open or closed, exactly wherever you happen to be looking. That's what it's like for me. It's most similar to the symptoms of something called Stargardt's disease. I don't have a great visualization for it and it's not the focus of this post, so I'll let the description above do all the lifting on this topic.
- **Nearsightedness** (standard myopia): This is what most people my age have. It's blurry vision for anything outside of a given distance from my eyes. It's straightforward and it's correctible with presccription lenses, but it confuses people when they see that I'm wearing glasses and still can't see well, so it's worth mentioning here.
- **Color discrimination**: Lots of colors are difficult for me to tell apart. Yes, sometimes that runs along the red-green spectrum, but sometimes it's blue-yellow too, and sometimes it's different than both, which always seemed weird to me. This post is the result of a deep-dive into exactly why that is.
## It all started with keycaps

Earlier this year, I started a project to build custom keycaps (more on that in its own post once the set is done). Dye-sublimated keycaps live or die on contrast: a texture or icon that looks fine on screen can vanish once it's printed on the actual plastic. To predict which designs would survive printing, I had to get really intimate with color and design theory - hex, RGB, HSV, ink weight, and ink distribution measures, among others. Eventually, I stumbled onto the well-established concept of luminance[^1], which is a measure of the way the human eye sees brightness. It turns out this was really useful for the keycaps - if the luminance gap between two colors was big enough, then the print would "work" in the sense that the legends and textures on the caps could be easily seen against the background.

<picture>
  <source srcset="/images/2026/10/vision/flame_render_vs_print_lighttext.png" media="(prefers-color-scheme: dark)">
  <img src="/images/2026/10/vision/flame_render_vs_print_darktext.png" alt="An example of a keycap that renders just fine on a screen, but fails miserably after printing.">
</picture>


And this got me thinking - now that I could comfortably discuss  hue, saturation, and luminance, and I also had a partner (Claude) who could see things that I couldn't, could I use that to learn a little more about my own vision?


[^1]: Luminance formula is $$$$L = 0.2126R + 0.7152G + 0.0722B$$$$ where $$R$$, $$G$$, and $$B$$ are the red, green, and blue channels of that color. Note that red, and especially blue get a huge discount relative to green, which is the strongest color channel for humans. Luminance is different than value (the V from HSV), which is simply the maximum of red, green, or blue and much less reliable for measuring brightness the way we actually see it.

## Self-Testing

First, a little terminology. I need to define HSV - hue, saturation, and value. These are three numeric values which can easily be calculated from RGB, but they each have a physical interpretation that's a little more natural than RGB channels.
- **Hue**: This really just means the color family. It's represented by an angle on the color wheel and answers questions like "is this more like a blue or a purple?" Mathematically, it splits the wheel up into three $$120^\circ$$ sections, centered about the primary colors, red, green, and blue. The actual function looks strange because of the piecewise definition, but here it is in case you're interested: Given that $$M = \max(R,G,B)$$, $$m = \min(R,G,B)$$ and $$C = M - m$$:
$$
H = 60^\circ \times
\begin{cases}
\dfrac{G - B}{C} \bmod 6 & \text{if } M = R \\[6pt]
\dfrac{B - R}{C} + 2 & \text{if } M = G \\[6pt]
\dfrac{R - G}{C} + 4 & \text{if } M = B
\end{cases}
$$
The important thing to remember is that hue means color family and gives the "direction" where that familiy lives on the color wheel.

- **Saturation**: This represnets the degree of vividness. Low saturation tends to look more muted and grey, while high saturation looks really vivid. It's measured by a percentage - 0% means right in the middle of the color wheel, while 100% means all the way to the edge of the wheel (and very vivid). Mathematically, it's the difference between the strongest (max) RGB channel and the weakest (min) RGB channel, normalized to the max, or $$\frac{max(R,G,B) - min(R,G,B)}{max(R,G,B)}$$
- **Value**: This is a measure of brightness. It's also on a scale of 0%-100%. Mathematically, it's just the maximum of R, G, and B or $$max(R,G,B)$$   


<picture>
  <source srcset="/images/2026/10/vision/hsv_explainer_dark.png" media="(prefers-color-scheme: dark)">
  <img src="/images/2026/10/vision/hsv_explainer_light.png" alt="HSV color space: a hue/saturation wheel seen from above, and a cone where height is value (brightness)">
</picture>

With that background, I genreated an early, simple test: show two swatches, change one of hue, saturation or value (HSV), and record whether I could tell they were different. The results were imprecise, but really helpful:

- **Value (brightness):** I could see about a 5% shift.
- **Saturation (vividness):** I needed about an 18% shift.
- **Hue (color family):** still close to a coin flip at a $$32^\circ$$ shift, the largest the test tried.

![HSV wheel and value cone](/images/2026/10/vision/hsv_swatch_test_mock.png)

This was a huge revelation. The frustration of 30+ years of clinical uncertainty lifted in an instant. It was like suddenly having the strength to carry a boudler that was previously immovable - almost like magic - and the feeling hit very hard. I now had a way to describe what was "wrong" with me - I spent the next ten minutes in tears of relief.

## New Info, New Idea

And it gave me a new idea - what if I built a "Stephen's vision on a card" statement that would be understanable to anyone at a glance? I could carry it in my wallet and pull it out whenever someone asked. I started by creating some visuals that I thought would help explain my color discrimination, but I discovered two things pretty quickly:
1. It was hard to explain to other people in a way that was engaging and understandable.
2. I still didn't quite understand it well enough myself. For instnace, when I showed an early card to a Reddit design group, someone reasonably said "that's just red-green colorblindness" which was fair because that's what the card showed, but I didn't know how to clarify.

So, I took the only sane and rational next step: I built a controlled study[^2] and tested myself with 5.6k trials, then recruited as many volunteers as I could (eventually, I ended up with 10) to do the same, although I asked a little less of them - only 540 trials each. 

[^2]: **Color space:** CIELAB, which is designed so that a distance of 1 (one ΔE) is roughly one just-noticeable difference for a normal observer. Lightness held fixed so only color change. **Task:** four patches, three identical, pick the odd one out. **Coverage:** seven anchor colors around the wheel plus neutral gray, four directions at each. About 2,000 clean trials over two long sessions.

Here's what the trials look like. It's actually a standard testing mechansim - it starts from an anchor color and then tests how far it can move away from that anchor before you can tell the difference. The test itself shows four color blocks, three of which are always the same, and you have to pick which one is different. If you can't tell, you have to guess. The test assumes and requires that you guess - the math already bakes that in. It also self-adjusts over time so it can really find the boundary precisely.

![Four squares: three identical, one slightly different](/images/2026/10/vision/odd-one-out.svg)

# What the map shows

The short version: **brightness is normal; color is about 4× worse than normal, and it always leans the same way.** Each of these three statements is interesting and carries its own significance.

The word I settled on for the region of colors that look identical to me is a **smear**. Everyone has them, but mine are much, much bigger. The image below shows all seven anchor points, each with a shape drawn around them. I cannot reliably tell the difference between any two colors within that shape. Also, mine all lean in the same direction - see how they point along the yellow-green <-> magenta axis? There is one weird anomoly - my lean in the green region is actually normal (points toward the center of the circle) and doesn't match my other regions, although it is still bigger than everyone else's. I did extra testing here just to make sure and the pattern really holds up - I just have no idea why yet.

<div style="display:flex; gap:1rem; flex-wrap:wrap;">
  <img src="/images/2026/10/vision/MAP_normal.png" alt="Typical eye: small smears pointing toward gray" style="flex:1 1 280px; min-width:0;">
  <img src="/images/2026/10/vision/MAP_final.png" alt="My eye: large smears leaning the same diagonal" style="flex:1 1 280px; min-width:0;">
</div>

I found the longer version[^3] to be instructive too, but it's a bit of a bear - you can reed it if you're up for it, but it's also ok to skip the numerical analysis - you can still understand the result.

[^3]: **Lightness:** my threshold is 0.70 ΔE. The controls averaged 0.69. Dead normal. **Color overall:** ~3.7× worse than controls, ~4.3× worse than the standard normal-observer mode. **Near gray:** 5–9× worse. Normal eyes are *most* sensitive near gray. Mine aren't, which is exactly why muted colors are my problem. **Direction:** at six of seven anchors, my smear stretches along the same diagonal, about 142° in CIELAB — roughly yellow-green ↔ magenta. The odds of seven directions lining up that tightly by chance are about 1 in 250. **The exception is green**, where my smear is just a uniformly bigger version of a normal one, with no lean. I re-tested that on two screens; it's real, and I don't know why yet. I also used CIEDE2000 — a color-difference formula fitted to thousands of normal-observer judgments — as a "global control." It agrees with my nine controls (r = 0.86) and with my results: about 4× normal.

## So what kind of colorblindness is it anyway?

If the lean of my smear were caused by a known type of colorblindness, it would line up with that type’s direction, usually within a few degrees. Mine doesn’t. It’s off by 47° from protan (one type of red-green), 37° from deutan (the other type of red-green) and 24° from tritan (blue-yellow). Only tritan is closer than chance, and even that’s a loose fit, so my angle really does appear to be its own unique animal.

![My measured axis vs. the three classic types](/images/2026/10/vision/axis-comparison.png)

So why do I fail Ishihara? Because my smears are so big that the plates' muted red-green differences fall *inside* them anyway. I fail the red-green test without having a red-green defect not because my confusion *lines* are the same, but because my confusion *zones* are massive!

## The Vision Card

The wallet card idea went through more than a dozen rounds, incorporating critiques from Reddit, Facebook, friends, family, myself, and of course, my thinking buddy, Claude. Eventually I created a design brief with the rule that it has to work in 2–3 seconds, or it fails, however clever it is. Here's the full progression of what that actually looked like.

<picture>
  <source srcset="/images/2026/10/vision/card_iterations_dark.png" media="(prefers-color-scheme: dark)">
  <img src="/images/2026/10/vision/card_iterations_light.png" alt="All iterations of the front and back of the card, organized by timeline.">
</picture>

These versions failed for different reasons. For instance, the cards built on September 5 (first row above) failed on almost all counts - it didn't include any mention of brightness, it was hard to make the connection between the front and the back and it was just plain ugly from a design perspective. By September 16, the ugliness was gone, but the card was still too busy. Eventually, I reintroduced the color wheel, but made it the background of the card, reduced the amount of unnecessary text and highlihgted an important zone to constrast my vision differences at a glance.

Where it landed:
- **Front:** columns of stripes. Most people see stripes in the middle column; I see a smooth block, because those steps are well within normal vision but inside my smear.
- **Back:** the gray center of color space, magnified, showing my smear vs. a typical one vs. a red-green one, with a stepped brightness strip to show that part is fine.

![Card front](/images/2026/10/vision/card-front.png)
![Card back](/images/2026/10/vision/card-back.png)

## What's next

Taken together — normal lightness, a broad loss of color sensitivity, a blue-yellow lean, childhood onset, central vision loss, stable for 35 years — the pattern points at the cones or the macula rather than the optics of the eye. I've sent a clinical summary to a few color vision researchers, asking about the tests that could actually find something: high-resolution macular OCT, multifocal and full-field ERG, fundus autofluorescence, and formal color testing (an anomaloscope would settle the red-green question in about ten minutes).

The goal isn't a cure. It's a real diagnosis, or at least a documented one. And in the meantime, I finally have a better answer than "I can't tell you what I am, but it's not red-green colorblind."

## Try it yourself

If you're interested in looking at either of the tests I generated or how they work, you can see them here. If you want to see our own "smear" chart, just check the box and if you are ok participating in this experiment (this means I would keep your results as part of the control group for further analysis), then check the "include me in trials" box.

<p><a class="try-it" href="/color-threshold-test/">Try it: map your own color smears →</a></p>
<p><a class="try-it" href="/color-swatch-test/">Try it: see my original swatch test →</a></p>
