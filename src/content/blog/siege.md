---
title: "Siege!"
description: "Using a genetic algorithm to pick a troop allocation for FiveThirtyEight's Riddler castle-war puzzle."
pubDate: 2017-05-30
tags: [games, strategy, ai, simulation, project]
legacy: true
cover: "/images/2017/05/arith_overflow.png"
coverFit: contain
---

## Storming the Castles

The FiveThirtyEight blog runs a weekly column, called "The Riddler" which poses a problem each week for readers to solve. They're mathy, or nerdy, or both, and they usually have one, correct answer. Furthermore, the author only recognizes one of the many correct submissions. This week is a [little different](http://fivethirtyeight.com/features/the-battle-for-riddler-nation-round-2/). Here's the description of the problem taken from the website (reproduced here without permission – please don't be angry, Riddler).

> In a distant, war-torn land, there are 10 castles. There are two warlords: you and your archenemy, with whom you're competing to collect the most victory points. Each castle has its own strategic value for a would-be conqueror. Specifically, the castles are worth 1, 2, 3, …, 9, and 10 victory points. You and your enemy each have 100 soldiers to distribute, any way you like, to fight at any of the 10 castles. Whoever sends more soldiers to a given castle conquers that castle and wins its victory points. If you each send the same number of troops, you split the points. You don't know what distribution of forces your enemy has chosen until the battles begin. Whoever wins the most points wins the war.

So, each submission will battle against all the others and whichever wins the most battles wins the game. Barring a tie, there can only be one winner. Although probably still fairly small, I think this will be my best chance to actually win. Oh, and there's a twist – the [puzzle already ran](https://fivethirtyeight.com/features/can-you-save-the-drowning-swimmer/) back in February, and everyone's submissions and rationale were published ; ).

## Incomplete Information

Since we don't actually know what this round of submissions will look like, I started by seeing what it would take to just play every possible submission against every other one, however, there are a little over 6 million (!) partitions of the number 100 (the number of available troops), and since each castle counts differently, there are 10 factorial ~ 3.6 million permutations, totaling over 22 million possible solutions. I would have to play 22 million factorial games to exhaust all the possibilities and since I don't have access to a [quantum computer](http://rigetti.com/) yet, I need a different method.

![Arithmetic overflow](/images/2017/05/arith_overflow.png)

## Genetics – Again!

I need to search a space that's just way too big to search. Back in 2012, I solved a [similar problem](/blog/learning-to-play-mancala/) – trying to play through every possible position in a board game with way too many positions to consider – by using a genetic search, so I tried it again. The idea is actually fairly simple:

1. Begin by randomly selecting a bunch of candidates
2. Play them all against each other
3. Let the strong survive and pass on their traits to future generations
4. Repeat

That's it. Since this is a static environment (not like, say, a rainforest), eventually the algorithm will settle on a set of really good solutions. At least, that's the idea…

## Measuring "The Strong"

What does it mean to be "strong" here? I began by playing each candidate in my pool against all of the others, and allowing the ones which won the most to survive, however, after a day of processing, the algorithm had made a clear choice. Just out of curiosity, I ran this candidate against the February results and found out that it was, well, less good than I'd hoped – placing around 200th of about 1300 submissions. From the graphic below, you can see that it casts a pretty wide net for the mid-range castles, but really goes for number 10 hard, devoting fully one third of its available troops to that castle.

![Troop allocation evolved against a random pool](/images/2017/05/self_battling_pool.png)

But, apparently, humans aren't all that random – ¯\\\_(ツ)\_/¯ – so, I changed my strength measurement to score against the human entries instead of against the random pool. The algorithm very quickly settled on a set of candidates which all won enough matches to easily coast past the previous first place entry by more than 100 matches. They almost all looked something like the one below, which, I think, was my actual submission:

![Troop allocation evolved against human entries](/images/2017/05/human_entry_pool.png)

This result tells me that the humans tended to over-allocate troops to castles 1-4, 8, and 10. My submission happily grants them almost all of those points, focusing instead on the following group of castles: [5, 6, 7, 9], the sum of which is almost enough to claim victory, per se. This strategy, interestingly, didn't even find the token allocation of a single troop to defend castles 1 or 3 worth removing just one troop from the heavily fortified castle 9. Again, one third of the troops go to just one castle, essentially guaranteeing a win there. For the fatally curious, I've [posted all of the Python + SQL code](https://github.com/dawdawdo/riddler_battle) which generates the results above.

## Final Grade

I'm purposefully posting after the submission deadline (5/28/2017), but before the contest is scored (projected 6/2/2017). Afterwards, I'll conclude that:

As should have been obvious from the start, computers do a much better job of solving problems in the realm of game theory than humans, so only the computer generated solution could have won. Recognizing this, it's time to start accepting this approach in other domains (I'm looking at you, healthcare).

OR

Of course, all of this number-crunching failed to consider human groupthink and the variability of results on such a small data set. While this was a fun and interesting exercise, I never expected it to really come close to winning.

Just before posting this, I found at least one other computer-generated modeler who took a similar approach, and got a little bit better result on the sample set. In fact, his [rationale and write-up](https://ntguardian.wordpress.com/2017/05/29/winning-the-battle-for-riddler-nation-an-agent-based-modelling-approach/) are eerily similar to mine, so it will be fun to see which performs better on the real data.
