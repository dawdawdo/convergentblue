---
title: "Rage Faces and Math"
description: "A co-worker of mine recently emailed me a link to a rage face comic with the following: 'Is this always true??? I mean the math part... Stephen???' Knowing…"
pubDate: 2012-08-18
tags: [math, humor]
draft: false
legacy: true
cover: "/images/2012/08/bf_gf_math.jpg"
coverFit: contain
---

A co-worker of mine recently emailed me a link to a [rage face comic](http://www.videobash.com/photo_show/Boyfriend-And-Girlfriend-Discussing-Math-41541) with the following:

"Is this always true??? I mean the math part... Stephen???"

Knowing that I have an irrational love of rage faces as well as math, he knew I couldn't resist trying to prove or disprove the algorithm presented in the comic, which I've displayed below (without permission) in case you didn't follow the link.

[![](/images/2012/08/bf_gf_math.jpg "bf_gf_math")](/images/2012/08/bf_gf_math.jpg)

So, here goes:

In both examples, twenty-five is subtracted from the number to be squared (let's call it $x$) and the result is used as the first two digits of the answer. This can be represented by the expression $100(x - 25)$. The last two digits come from simply subtracting the number to be squared from fifty, then squaring it, $(50 - x)^{2}$. So the algorithm is simply:

$S = 100(x - 25) + (50 - x)^{2}$

where $S$ is the square of $x$.

The first question, and the one posed in the email is, does this really work? That is, does $S = x^{2}$? A few steps of algebra get us:

$100(x - 25) + (50 - x)^{2} = 100x - 2500 + 2500 -100x + x^2 = x^{2}$.[![](/images/2012/08/troll-troll-face-l-150x150.png "troll-troll-face-l")](/images/2012/08/troll-troll-face-l.png)

So, we can say that if the algorithm is performed according to the formula above, yes, this method always works, however, the comic does not directly use any formula, so let's see where the two methods diverge, if anywhere.

Consider a concrete example by letting $x = 4$. Certainly, we wouldn't want to resort to such a complicated algorithm for such a basic operation, but suppose we did use the formula, we'd get $100(4 - 25) + (50-4)^{2} = 100(-21) + 46^{2} = -2100 + 2116 = 16 = 4^{2}$, so the formula version checks out, but how about the mechanical algorithm? Well, $4 - 25 = -21$, so our first two digits are $-2$ and $1$. Of course, this is already problematic, and now consider that  $46^{2}$ has more than two digits. We might end up with something like $-212116$.

[![](/images/2012/08/angry-no-l-242x300.png "angry-no-l")](/images/2012/08/angry-no-l.png)This places a constraint on $x$, namely that it must be greater than or equal to twenty-five.

One might also suspect numbers larger than fifty to introduce the same sort of trouble, however, the parity of the square function saves us. For example, consider squaring the number fifty-one in this way. $51 - 25 = 26$, $50 - 51 = -1$, and $-1^{2} = 1 (= 01)$, so the comic boyfriend would get the correct answer of $2601$, provided he padded the single digit answer with a leading zero.[![](/images/2012/08/close-enough-l-300x234.png "close-enough-l")](/images/2012/08/close-enough-l.png)

The subtraction here does give us a constraint, however, because we need the square of the result to be less than $100$, otherwise, we'd have more than two digits. Imposing this limit, we get $(50 - x)^{2} < 100 \Rightarrow -10 < (50 - x) < 10 \Rightarrow -60 < -x < -40 \Rightarrow 40 < x < 60$. This is actually a subset of the previous boundary, and thus represents the complete set of possible values for $x$ for which this method will "work".

I was curious about the choices of twenty-five and fifty, so I wanted to see what other combinations might work. [![](/images/2012/08/determined-questioning-pondering-l-275x300.png "determined-questioning-pondering-l")](/images/2012/08/determined-questioning-pondering-l.png)As it turns out, there are none! Let's see why. Suppose we could choose any two numbers to perform this trick, call them $a$ and $b$. Then we'd write $x^{2} = 100(x - a) + (b - x)^2 = 100x -100a + b^{2} -2bx + x^{2}$. Since we require the sum of all terms other than the $x^{2}$ to be zero, it should be apparent that $100-2b = 0 \Rightarrow b = 50$ and $-100a + b^{2} = 0 \Rightarrow 100a = 2500 \Rightarrow a = 25$. That is, the algorithm uniquely determines the choice of the constants $a$ and $b$.

Although its proof can be reduced to a simple algebra problem, the algorithm is non-obvious, but simple. Whoever designed it had a very nice insight. [![](/images/2012/08/happy-i-see-what-you-did-there-l-300x295.png "happy-i-see-what-you-did-there-l")](/images/2012/08/happy-i-see-what-you-did-there-l.png)Feel free to post similar ones you may have found in your travels. Bonus points if your submission is in the form of a rage face comic. : ).
