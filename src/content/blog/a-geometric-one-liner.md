---
title: "A Geometric One-Liner"
description: "Which boxes have a volume equal to their surface area? One line of Python finds them all, and a week of brute force can't find any more."
pubDate: 2019-12-14
tags: [math, geometry, riddler, python]
draft: true
legacy: true
---

<!-- DRAFT: reconstructed in 2026 from the code, logs, images and videos in Drive (538_Contests/rectangular_prism).
     The original text was lost. Edit freely, then remove `draft: true`. -->

## The Appetizer

This week's [Riddler Classic](https://web.archive.org/web/20191214152001/https://fivethirtyeight.com/features/can-you-solve-a-particularly-prismatic-puzzle/) starts with a warm-up: find a rectangle with whole-number sides whose area equals its perimeter. There are only two, 4×4 and 3×6, and the column gives them away for free.

The main course is the 3D version. Which rectangular prisms with whole-number sides have a volume (in cubic units) equal to their surface area (in square units)? The puzzle notes that a 6×6×6 cube works. How many others are there?

![A rectangular prism with length, width and height labeled](/images/2019/12/rectangular-prism.png)

In symbols, we want whole numbers $L$, $W$ and $H$ with

$$
LWH = 2(LW + WH + HL)
$$

## The One-Liner

I could do some algebra. Or I could make the computer do it. Python's `itertools` has a function that hands out every combination of three side lengths, with repeats allowed, and with each box listed only once (so 3×6×6 and 6×3×6 don't count twice). After that, it's one line:

```python
from itertools import combinations_with_replacement as c
[print((L,W,H)) for (L,W,H) in c(range(1, 100), 3) if L*W*H == 2*(L*W+W*H+H*L)]
```

Fine, two lines if you count the import. I don't.

## The Results

Checking every box with sides up to 99 turns up exactly ten:

| Length | Width | Height |
|---:|---:|---:|
| 3 | 7 | 42 |
| 3 | 8 | 24 |
| 3 | 9 | 18 |
| 3 | 10 | 15 |
| 3 | 12 | 12 |
| 4 | 5 | 20 |
| 4 | 6 | 12 |
| 4 | 8 | 8 |
| 5 | 5 | 10 |
| 6 | 6 | 6 |

Swap the plain list for a 3D scatter plot, and here's what they look like:

![3D scatter plot of the ten solutions](/images/2019/12/Rec_prism_results.png)

![The same ten solutions from another angle](/images/2019/12/Rec_prism_results_2.png)

## Are There Any More?

Ten seemed suspiciously tidy, so I raised the limit to 1,000, then 10,000, then 100,000, and logged progress along the way. The last run ground away for a week and checked more than 650 billion boxes. It never found an eleventh.

<!-- Suggested addition (Claude): the short proof of why it never will. Keep, cut or reword. -->
There's a reason. Divide both sides of the equation by $LWH$ and it becomes

$$
\frac{1}{L} + \frac{1}{W} + \frac{1}{H} = \frac{1}{2}
$$

If $L$ is the shortest side, then $\frac{3}{L} \ge \frac{1}{2}$, so $L \le 6$. And $L$ has to be at least 3, or $\frac{1}{L}$ alone would already be $\frac{1}{2}$ or more. With only four possible shortest sides, there are only finitely many boxes to check, and the one-liner already found all of them. A week of brute force, settled by one line of algebra. Sounds about right.

## Seeing the Surface

The one-liner finds the points, but I wanted to see the whole surface where volume equals surface area, not just the whole-number spots on it. Plotting it in 3D and dragging it around turned up a nice symmetry:

<video controls muted playsinline preload="metadata" poster="/videos/2019/12/surface-volume-visualization.jpg" src="/videos/2019/12/surface-volume-visualization.mp4"></video>

Zoom in on the positive corner (real boxes don't have negative sides) and all ten solutions sit together in one small region of the surface:

<video controls muted playsinline preload="metadata" poster="/videos/2019/12/surface-volume-curve-with-points.jpg" src="/videos/2019/12/surface-volume-curve-with-points.mp4"></video>
