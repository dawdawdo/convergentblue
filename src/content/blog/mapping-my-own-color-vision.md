---
title: "Not Red-Green: Mapping My Own Color Vision"
description: "I've failed every colorblind test since I was a kid, but I always knew it wasn't that simple. So I built my own test and mapped my vision. The results were... eye-opening."
pubDate: 2026-10-13
tags: [project, color, vision, data]
draft: true
cover: "/images/2026/10/vision/MAP_final.png"
coverFit: contain
demo: /color-threshold-test/
---

<!-- TITLE OPTIONS (Claude draft, pick one or write your own):
- Not Red-Green: Mapping My Own Color Vision   (current)
- Red-Green Colorblind Poser                   (your original)
- I Failed Every Colorblind Test. I'm Not Colorblind (Exactly).
- 5,600 Squares Later: What I Actually See
- My Color Smear
-->

<!-- TODO (remaining):
Need an image to show what central vision loss looks like? Maybe show all three somehow?
C. Alter the 4-box odd man out test for hosting here
-->

<!-- DRAFT (Claude): new hook. Edit freely. -->
<figure>
  <img src="/images/2026/10/vision/ishihara_red_green.png" alt="An Ishihara-style color plate: a circle of colored dots hiding a number" width="255" height="259">
  <figcaption>What number do you see? I've been asked that question my whole life, and I almost never know.</figcaption>
</figure>

You've probably seen one of these: a circle of colored dots with a number hidden inside. I've taken this test more times than I can count, starting around age ten, and I almost always fail it. The conclusion everyone reaches is "red-green colorblind," and that's usually where the conversation ends.

Except it never quite fit. This fall I finally decided to find out what's actually going on, and it turns out I've been a red-green colorblind poser my whole life. I fail the test, but not for the reason everyone assumes.
<!-- END DRAFT -->

<!-- Optional second plate, if you want it somewhere:
![A blue-yellow test plate](/images/2026/10/vision/ishihara_blue_yellow.png)
-->

## Three different vision problems

I have three separately describable vision problems:

- **Central vision loss**: My central vision is not blurry, it's actually missing entirely. It's replaced with a swirl of colors and patterns. Imagine if someone were holding up a kaleidoscope right in the middle of your vision and rotating it all day, whether you have your eyes open or closed, exactly wherever you happen to be looking. That's what it's like for me. It's most similar to the symptoms of something called Stargardt's disease. I don't have a great visualization for it and it's not the focus of this post, so I'll let the description above do all the lifting on this topic.
- **Nearsightedness** (standard myopia): This is what most people my age have. It's blurry vision for anything outside of a given distance from my eyes. It's straightforward and it's correctable with prescription lenses, but it confuses people when they see that I'm wearing glasses and still can't see well, so it's worth mentioning here.
- **Color discrimination**: Lots of colors are difficult for me to tell apart. Yes, sometimes that runs along the red-green spectrum, but sometimes it's blue-yellow too, and sometimes it's different than both, which always seemed weird to me. This post is the result of a deep-dive into exactly why that is.

## It all started with keycaps

Earlier this year, I started a project to build custom keycaps (more on that in its own post once the set is done). Dye-sublimated keycaps live or die on contrast: a texture or icon that looks fine on screen can vanish once it's printed on the actual plastic. To predict which designs would survive printing, I had to get really intimate with color and design theory - hex, RGB, HSV, ink weight, and ink distribution measures, among others. Eventually, I stumbled onto the well-established concept of luminance[^1], which is a measure of the way the human eye sees brightness. It turns out this was really useful for the keycaps - if the luminance gap between two colors was big enough, then the print would "work" in the sense that the legends and textures on the caps could be easily seen against the background.

<picture>
  <source srcset="/images/2026/10/vision/flame_render_vs_print_lighttext.png" media="(prefers-color-scheme: dark)">
  <img src="/images/2026/10/vision/flame_render_vs_print_darktext.png" alt="An example of a keycap that renders just fine on a screen, but fails miserably after printing.">
</picture>

And this got me thinking - now that I could comfortably discuss hue, saturation, and luminance, and I also had a partner (Claude) who could see things that I couldn't, could I use that to learn a little more about my own vision?

[^1]: The luminance formula is $L = 0.2126R + 0.7152G + 0.0722B$, where $R$, $G$, and $B$ are the red, green, and blue channels of that color. Note that red, and especially blue, get a huge discount relative to green, which is the strongest color channel for humans. Luminance is different than value (the V from HSV), which is simply the maximum of red, green, or blue and much less reliable for measuring brightness the way we actually see it.

## Self-Testing

First, a little terminology. I need to define HSV - hue, saturation, and value. These are three numbers which can easily be calculated from RGB, but they each have a physical interpretation that's a little more natural than RGB channels.

- **Hue**: This really just means the color family. It's an angle on the color wheel and answers questions like "is this more like a blue or a purple?"[^hue]
- **Saturation**: This represents the degree of vividness. Low saturation looks muted and gray, while high saturation looks really vivid. It's a percentage - 0% is the middle of the color wheel, 100% is the edge.[^sv]
- **Value**: This is a measure of brightness, also on a scale of 0%-100%.[^sv]

[^hue]: Mathematically, hue splits the wheel into three $120^\circ$ sections, centered on the primary colors red, green, and blue. The function looks strange because it's piecewise. Given $M = \max(R,G,B)$, $m = \min(R,G,B)$ and $C = M - m$:

    $$
    H = 60^\circ \times
    \begin{cases}
    \dfrac{G - B}{C} \bmod 6 & \text{if } M = R \\[6pt]
    \dfrac{B - R}{C} + 2 & \text{if } M = G \\[6pt]
    \dfrac{R - G}{C} + 4 & \text{if } M = B
    \end{cases}
    $$

[^sv]: Saturation is the difference between the strongest and weakest RGB channels, normalized to the strongest: $S = \frac{\max(R,G,B) - \min(R,G,B)}{\max(R,G,B)}$. Value is just the strongest channel: $V = \max(R,G,B)$.

<picture>
  <source srcset="/images/2026/10/vision/hsv_explainer_dark.png" media="(prefers-color-scheme: dark)">
  <img src="/images/2026/10/vision/hsv_explainer_light.png" alt="HSV color space: a hue/saturation wheel seen from above, and a cone where height is value (brightness)">
</picture>

With that background, I generated an early, simple test: show two swatches, change one of hue, saturation or value (HSV), and record whether I could tell they were different. The results were imprecise, but really helpful:

- **Value (brightness):** I could see about a 5% shift.
- **Saturation (vividness):** I needed about an 18% shift.
- **Hue (color family):** still close to a coin flip at a $32^\circ$ shift, the largest the test tried.

<figure>
  <img src="/images/2026/10/vision/hsv_swatch_test_mock.png" alt="The early swatch test: two dark olive squares and Same / Different buttons">
  <figcaption>Can you tell these apart? They differ by about 6° of hue. I answered "same."</figcaption>
</figure>

This was a huge revelation. The frustration of 30+ years of clinical uncertainty lifted in an instant. It was like suddenly having the strength to carry a boulder that was previously immovable - almost like magic - and the feeling hit very hard. I now had a way to describe what was "wrong" with me - I spent the next ten minutes in tears of relief.

## New Info, New Idea

And it gave me a new idea - what if I built a "Stephen's vision on a card" statement that would be understandable to anyone at a glance? I could carry it in my wallet and pull it out whenever someone asked. I started by creating some visuals that I thought would help explain my color discrimination, but I discovered two things pretty quickly:

1. It was hard to explain to other people in a way that was engaging and understandable.
2. I still didn't quite understand it well enough myself. For instance, when I showed an early card to a Reddit design group, someone reasonably said "that's just red-green colorblindness" which was fair because that's what the card showed, but I didn't know how to clarify.

<!-- DRAFT (Claude): CIELAB explanation + trial counts. Edit freely. -->
So, I took the only sane and rational next step: I built a controlled study[^2]. HSV turned out to be the wrong ruler for this. It's convenient for designers, but equal steps in HSV don't *look* equal to the eye, so a "5% shift" means something different depending on where you are on the wheel. Instead, I switched to a color space called CIELAB, which is built so that one unit is roughly the smallest difference a normal eye can see, anywhere. That makes it possible to say things like "my threshold is 4× normal" and have it mean something.

All told, I did about 5,600 trials on myself. Not all of them counted: the early HSV runs were exploratory, and one big run had a bug (a 3-second time limit that turned slow answers into wrong ones), so I threw it out. The map below is built on the roughly 2,000 clean trials that were left. Then I recruited 9 volunteers with normal color vision to do a shorter version - only 540 trials each.
<!-- END DRAFT -->

[^2]: **Color space:** CIELAB, where a distance of 1 (one ΔE) is roughly one just-noticeable difference for a normal observer. Lightness was held fixed so only color changed. **Task:** four patches, three identical, pick the odd one out. **Coverage:** seven anchor colors around the wheel plus neutral gray, four directions at each.

Here's what the trials look like. It's actually a standard testing mechanism - it starts from an anchor color and then tests how far it can move away from that anchor before you can tell the difference. The test itself shows four color blocks, three of which are always the same, and you have to pick which one is different. If you can't tell, you have to guess. The test assumes and requires that you guess - the math already bakes that in. It also self-adjusts over time so it can really find the boundary precisely.

<figure>
  <img src="/images/2026/10/vision/odd-one-out.svg" alt="Four squares: three identical, one slightly different" width="264" height="264">
  <figcaption>Which one is different? (It's the top-right square.)</figcaption>
</figure>

## What the map shows

The short version: **brightness is normal; color is about 4× worse than normal, and it always leans the same way.** Each of these three statements is interesting and carries its own significance.

<!-- DRAFT (Claude): brightness paragraph. Edit freely. -->
Start with brightness, because it explains a lot. My lightness threshold is dead normal - the same as my volunteers, to two decimal places. Most of what we use color for in daily life actually leans on brightness: text on a page, traffic lights (top, middle, bottom), the edge of a step. So for most of my life, nothing seemed obviously wrong. It also explains the keycaps: when I learned to design by luminance, I was unknowingly designing around the one channel that works perfectly for me.
<!-- END DRAFT -->

The word I settled on for the region of colors that look identical to me is a **smear**. Everyone has them, but mine are much, much bigger. The maps below show all seven anchor points, each with a shape drawn around it. Every color inside a shape looks the same - that's why each one is filled with a single flat color. Also, mine all lean in the same direction - see how they point along the yellow-green ↔ magenta axis? There is one weird anomaly - my lean in the green region is actually normal (points toward the center of the circle) and doesn't match my other regions, although it is still bigger than everyone else's. I did extra testing here just to make sure and the pattern really holds up - I just have no idea why yet.

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

I found the longer version[^3] to be instructive too, but it's a bit of a bear - you can read it if you're up for it, but it's also OK to skip the numerical analysis - you can still understand the result.

[^3]: **Lightness:** my threshold is 0.70 ΔE. The volunteers averaged 0.69. Dead normal. **Color overall:** ~3.7× worse than my volunteers, ~4.3× worse than the standard normal-observer model. **Near gray:** 5–9× worse. Normal eyes are *most* sensitive near gray. Mine aren't, which is exactly why muted colors are my problem. **Direction:** at six of seven anchors, my smear stretches along the same diagonal, about 142° in CIELAB — roughly yellow-green ↔ magenta. The odds of seven directions lining up that tightly by chance are about 1 in 250. **The exception is green**, where my smear is just a uniformly bigger version of a normal one, with no lean. I re-tested that on two screens; it's real, and I don't know why yet. I also used CIEDE2000 — a color-difference formula fitted to thousands of normal-observer judgments — as a "global control." It agrees with my 9 volunteers (r = 0.86) and with my results: about 4× normal.

## So what kind of colorblindness is it anyway?

If the lean of my smear were caused by a known type of colorblindness, it would line up with that type's direction, usually within a few degrees. Mine doesn't. It's off by 47° from protan (one type of red-green), 37° from deutan (the other type of red-green) and 24° from tritan (blue-yellow). Only tritan is closer than chance, and even that's a loose fit, so my angle really does appear to be its own unique animal.

<figure>
  <img src="/images/2026/10/vision/axis-comparison.png" alt="My measured lean at each anchor compared with the protan, deutan, and tritan confusion directions">
  <figcaption>White is my lean at each anchor. If I were red-green colorblind, the white line would sit on top of the red or orange one. It almost never does. The one exception is green (far left), where my lean happens to line up with protan, the same anchor where everything else about my smear is different too.</figcaption>
</figure>

So why do I fail Ishihara? Because my smears are so big that the plates' muted red-green differences fall *inside* them anyway. I fail the red-green test without having a red-green defect - not because my confusion *lines* are the same, but because my confusion *zones* are massive!

## The Vision Card

The wallet card idea went through more than a dozen rounds, incorporating critiques from Reddit, Facebook, friends, family, myself, and of course, my thinking buddy, Claude. Eventually I created a design brief with the rule that it has to work in 2–3 seconds, or it fails, however clever it is. Here's the full progression of what that actually looked like.

<picture>
  <source srcset="/images/2026/10/vision/card_iterations_dark.png" media="(prefers-color-scheme: dark)">
  <img src="/images/2026/10/vision/card_iterations_light.png" alt="All iterations of the front and back of the card, organized by timeline.">
</picture>

These versions failed for different reasons. For instance, the cards built on September 5 (first row above) failed on almost all counts - they didn't mention brightness at all, it was hard to make the connection between the front and the back, and they were just plain ugly from a design perspective. By September 16, the ugliness was gone, but the card was still too busy. Eventually, I reintroduced the color wheel, but made it the background of the card, reduced the amount of unnecessary text and highlighted an important zone to contrast my vision differences at a glance.

Here's where it landed. Before you read on: **how many columns of stripes do you see on the front?**

![Card front](/images/2026/10/vision/card-front.png)

- **Front:** columns of stripes. Most people see stripes in the middle column; I see a smooth block, because those steps are well within normal vision but inside my smear.
- **Back:** the gray center of color space, magnified, showing my smear vs. a typical one vs. a red-green one, with a stepped brightness strip to show that part is fine.

![Card back](/images/2026/10/vision/card-back.png)

## What's next

Taken together — normal lightness, a broad loss of color sensitivity, a blue-yellow lean, childhood onset, central vision loss, stable for 35 years — the pattern points at the cones or the macula rather than the optics of the eye. I've sent a clinical summary to a few color vision researchers, asking about the tests that could actually find something: high-resolution macular OCT, multifocal and full-field ERG, fundus autofluorescence, and formal color testing (an anomaloscope would settle the red-green question in about ten minutes).

The goal isn't a cure. It's a real diagnosis, or at least a documented one. And in the meantime, I finally have a better answer than "I can't tell you what I am, but it's not red-green colorblind."

## Try it yourself

If you're interested in either of the tests I built, you can try them here. The threshold test draws your own smear chart at the end, and nothing leaves your device unless you choose to send it. If you're willing to join the comparison group, check "Yes, send my results to Stephen" at the end: that sends me your answers, thresholds, and screen and browser details, plus a name or note only if you add one. I'll use them as controls for further analysis.

<p><a class="try-it" href="/color-threshold-test/">Try it: map your own color smears →</a></p>
<p><a class="try-it" href="/color-swatch-test/">Try it: see my original swatch test →</a></p>
