---
title: "Excel Dice Rolling Simulator"
description: "Probability distributions have a way of yielding unexpected and counter-intuitive results, so I thought it might be fun and instructive to build a…"
pubDate: 2012-07-15
tags: [probability, simulation, excel]
draft: false
legacy: true
---

Probability distributions have a way of yielding unexpected and counter-intuitive results, so I thought it might be fun and instructive to build a "practical" example to illustrate some of the most often protested facts about them. Since speed and visual feedback are important, I decided to try to build a [dice-rolling simulation in Excel](/images/2012/07/dice_roller.xls).

## Setup
I created two cells, each of which invokes the random number generator to give a number between one and six. Next, I set up a column to keep a tally of every roll of each die, as well as their sum. This was a little tricky, but was ultimately made possible by using recursion set to go one level deep. You can see this in the worksheet linked above. Finally, I graph the result for each die and the sum of the dice in a histogram. Below are the results for ten thousand rolls:

[![](/images/2012/07/IndividualDice.png "IndividualDice")](/images/2012/07/IndividualDice.png)

[![](/images/2012/07/TwoDiceTenThousandRolls.png "TwoDiceTenThousandRolls")](/images/2012/07/TwoDiceTenThousandRolls.png)

## The Sum of Uniform Random Variables is Not Uniform Random
Even though each die has a uniform distribution (the graph is flat), the sum of the dice does not. It's much more like a normal distribution. The reason for this is just counting. For a single die, there is only one way to roll a five, or a four, or any other number, but with two dice, there are six ways to roll a seven and only three ways to get a four:

[![](/images/2012/07/DiceRollingSevensAndFours.png "DiceRollingSevensAndFours")](/images/2012/07/DiceRollingSevensAndFours.png)

This means we should expect to see seven rolled more often than four, and indeed our simulation confirms this.

## These Dice Are Not Due
Another often misunderstood feature of a probability distribution is the catch-up feature, or really the lack thereof. For instance, if one observed two sevens in a row, one might expect that the next roll would be less likely to yield a seven. Since the long term distribution is eventually a bell curve, we can't just keep getting sevens forever, right?

Perhaps counter-intuitively, this is not the case. In fact, even if we only observe rolls after two sevens in a row, the distribution is the same. Seven gets rolled with probability one-sixth, no matter what was rolled before. In the simulation of ten thousand rolls, I counted the number of times seven was rolled twice in a row (224) For each of these, I made a new graph of the distribution of the roll *after* the double sevens.

[![](/images/2012/07/DoubleSevensDistro.png "DoubleSevensDistro")](/images/2012/07/DoubleSevensDistro.png)Does the seven look like it's suffering here? It doesn't, and we could have argued this on the simple basis that we know that dice have no memory! Beware any gambler who mentions dice (or a game board, etc) being "due". It's just not true.\*

For those curious, the Excel logic for this was a bit tricky as well, but it's all there in the sample worksheet.

## Infinity Is Relentless
The previous result is an example of the fact that the long term distribution isn't affected by short term results, or even purposeful deviations from the distribution. To help illustrate, let's give the tally for a roll of two a head start of, say fifty. We expect this head start to skew the results for a few rolls, but in the long run, we won't even know the difference. How long is that? Let's find out. After ten rolls:

[![](/images/2012/07/HeadStartWithTenRolls.png "HeadStartWithTenRolls")](/images/2012/07/HeadStartWithTenRolls.png)

That looks pretty bad. Let's try 100 rolls:

[![](/images/2012/07/HeadStartWith100Rolls1.png "HeadStartWith100Rolls")](/images/2012/07/HeadStartWith100Rolls1.png)

A normal distribution is forming, but it's still dwarfed by the head start. After 1000:

[![](/images/2012/07/HeadStartWith1000Rolls.png "HeadStartWith1000Rolls")](/images/2012/07/HeadStartWith1000Rolls.png)

Almost all of the other numbers have overtaken the 2 now. We could almost believe that this happened legitimately by chance. Let's go one order of magnitude higher. Onward to 10,000:

[![](/images/2012/07/HeadStartWith10000Rolls.png "HeadStartWith10000Rolls")](/images/2012/07/HeadStartWith10000Rolls.png)

Our normal distribution is back. The 2 does look a little off, but then again, so does the 6. Which one had the head start again? In the limiting case (infinite rolls) we would never be able to tell whether any result had a head start, no matter how large.

I will describe the Excel trick to achieve the head start, because it's not in the workbook. I simply created a cell with a value of 50, then added that cell to my formula which calculates the tally for a roll of 2. After the first iteration, I changed that 50 to a zero so it no longer had any effect.

It Doesn't End There

Did you know that if you rolled two dice forever, you could guarantee an arbitrarily long string of snake eyes. That's right, you could guarantee yourself 1000 rolls of two ones in a row, if you just roll long enough. Again, we're talking infinitely many rolls, but it is guaranteed! I won't run that simulation here, but proofs of all of these claims can be found in any introductory textbook on probability. It's just more fun to see them in action.

\* It might be the case that a slot machine is "due" depending on how it was programmed. It is conceivable that some slot machines guarantee a hit after every so many spins, perhaps as a marketing tactic, but this breaks the assumptions of a probability distribution.
